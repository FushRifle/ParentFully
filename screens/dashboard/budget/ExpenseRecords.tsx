import ExpenseCard from "@/components/expenses/ExpenseCard";
import PaymentCard from "@/components/expenses/PaymentCard";
import RequestCard from "@/components/expenses/RequestCard";

import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Plus } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Button, H6, ScrollView, XStack, YStack } from "tamagui";


type ExpenseStatus = "Pending Approval" | "Approved" | "Rejected" | "Reimburser" | "Pending";

type ExpenseType = {
    expenseId: string;
    id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    categoryColor: string;
    date: string;
    childName: string;
    status: ExpenseStatus;
    statusBg: string;
    splitInfo: string;
    reimbursedBy: string;
    reimburser?: string;
};

type PaymentType = {
    id: string;
    expense_id: string;
    amount: number;
    currency: string;
    description: string;
    paid_at: string | null;
    paid_to: string;
    status: string;
    expense: {
        id: string;
        title: string;
        amount: number;
        currency: string;
        category: string;
        date: string;
        status: string;
        your_share?: number;
        co_parent_share?: number;
        your_percentage?: number;
        co_parent_percentage?: number;
        reimburser?: string;
        paid_at?: string | null;
        childName?: string;
        children?: { name?: string } | null;
    } | null;
    contactName: string;
};

export type RequestType = {
    id: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    due_date: string | null;
    raw_due_date: string | null;
    requesterEmail: string;
    requestedFromName: string;
};

const ExpenseRecordsScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();

    const [activeTab, setActiveTab] = useState<"Expense" | "Payment" | "Request">("Expense");
    const tabs: ("Expense" | "Payment" | "Request")[] = ["Expense", "Payment", "Request"];

    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [payments, setPayments] = useState<PaymentType[]>([]);
    const [requests, setRequests] = useState<RequestType[]>([]);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // fetched flags so we don't re-fetch on every tab switch
    const [fetchedExpenses, setFetchedExpenses] = useState(false);
    const [fetchedPayments, setFetchedPayments] = useState(false);
    const [fetchedRequests, setFetchedRequests] = useState(false);

    // --- helpers ---
    const formatDate = (d?: string | null) => {
        if (!d) return "";
        try {
            return new Date(d).toLocaleDateString();
        } catch {
            return String(d);
        }
    };

    const getStatusBackground = (status: ExpenseStatus): string => {
        switch (status) {
            case "Pending Approval":
                return "#FFFBEB";
            case "Approved":
                return "#F0FDF4";
            case "Rejected":
                return "#FEF2F2";
            case "Reimburser":
                return "#EFF6FF";
            case "Pending":
                return "#FFFBEB";
            default:
                return "#F3F4F6";
        }
    };

    const fetchExpenses = useCallback(async (): Promise<ExpenseType[]> => {
        const { data, error } = await supabase
            .from("expenses")
            .select(`
            id,
            title,
            amount,
            currency,
            category,
            date,
            status,
            your_percentage,
            co_parent_percentage,
            reimburser,
            children(name)
        `)
            .order("date", { ascending: false });

        if (error) throw error;

        return (data || []).map((exp: any) => {
            // Simply use stored percentages
            const splitInfo = `${exp.your_percentage ?? 50}% - ${exp.co_parent_percentage ?? 50}% Split`;
            const reimbursedBy = exp.reimburser || "";

            return {
                expenseId: exp.id,
                id: exp.id,
                title: exp.title,
                amount: Number(exp.amount ?? 0),
                currency: exp.currency ?? "₦",
                category: exp.category ?? "Misc",
                categoryColor: "#f97316",
                date: exp.date ?? "",
                childName: exp.children?.name ?? "Unknown",
                status: (exp.status as ExpenseStatus) ?? "Pending Approval",
                statusBg: getStatusBackground((exp.status as ExpenseStatus) ?? "Pending Approval"),
                splitInfo,
                reimbursedBy,
                reimburser: exp.reimburser,
            } as ExpenseType;
        });
    }, []);

    const fetchPayments = useCallback(async (): Promise<PaymentType[]> => {
        const { data, error } = await supabase
            .from("payments")
            .select(`*, expense:expenses (
        id,
        title,
        amount,
        currency,
        category,
        date,
        status,
        your_share,
        co_parent_share,
        your_percentage,
        co_parent_percentage,
        reimburser,
        paid_at,
        children(name)
      )`)
            .order("paid_at", { ascending: false });

        if (error) throw error;

        return (data || []).map((payment: any) => ({
            id: payment.id,
            expense_id: payment.expense_id,
            amount: Number(payment.amount ?? 0),
            currency: payment.currency ?? (payment.expense?.currency ?? "₦"),
            description: payment.description ?? "",
            paid_at: payment.paid_at ?? null,
            paid_to: payment.paid_to ?? "",
            status: payment.status ?? "Pending",
            expense: payment.expense
                ? {
                    id: payment.expense.id,
                    title: payment.expense.title,
                    amount: payment.expense.amount,
                    currency: payment.expense.currency,
                    category: payment.expense.category,
                    date: payment.expense.date,
                    status: payment.expense.status,
                    your_share: payment.expense.your_share,
                    co_parent_share: payment.expense.co_parent_share,
                    your_percentage: payment.expense.your_percentage,
                    co_parent_percentage: payment.expense.co_parent_percentage,
                    reimburser: payment.expense.reimburser,
                    paid_at: payment.expense.paid_at,
                    childName: payment.expense.children?.name ?? "Unknown",
                    children: payment.expense.children,
                }
                : null,
            contactName: payment.contact?.name ?? "Unknown",
        })) as PaymentType[];
    }, []);

    const fetchRequests = useCallback(async (): Promise<RequestType[]> => {
        const { data, error } = await supabase
            .from("payment_requests")
            .select(`
    id,
    title,
    description,
    amount,
    currency,
    status,
    due_date,
    requester_id,
    requested_from:family_contacts!payment_requests_requested_from_id_fkey (
      id,
      name
    )
  `);

        if (error) {
            console.error("Error fetching requests:", error);
            return [];
        }

        if (!data) return [];

        const formattedRequests: RequestType[] = data.map((req: any) => ({
            id: req.id,
            title: req.title,
            description: req.description,
            amount: req.amount,
            currency: req.currency || "₦",
            status: req.status,
            due_date: req.due_date
                ? new Date(req.due_date).toLocaleDateString()
                : "N/A",
            raw_due_date: req.due_date,
            requesterEmail: req.requester?.email || "Unknown",
            requestedFromName: req.requested_from?.name || "Unknown",
        }));

        return formattedRequests;
    }, []);

    useEffect(() => {
        const fetchTabData = async () => {
            if (loading) return;

            setLoading(true);
            try {
                switch (activeTab) {
                    case "Expense":
                        if (!fetchedExpenses) {
                            const exps = await fetchExpenses();
                            setExpenses(exps);
                            setFetchedExpenses(true);
                        }
                        break;
                    case "Payment":
                        if (!fetchedPayments) {
                            const pays = await fetchPayments();
                            setPayments(pays);
                            setFetchedPayments(true);
                        }
                        break;
                    case "Request":
                        if (!fetchedRequests) {
                            const reqs = await fetchRequests();
                            setRequests(reqs);
                            setFetchedRequests(true);
                        }
                        break;
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab} data:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchTabData();
    }, [activeTab, fetchedExpenses, fetchedPayments, fetchedRequests, fetchExpenses, fetchPayments, fetchRequests, loading]);

    const refresh = async () => {
        setRefreshing(true);
        try {
            // Reset fetched flags to force re-fetching
            setFetchedExpenses(false);
            setFetchedPayments(false);
            setFetchedRequests(false);

            // Fetch data for the current tab
            switch (activeTab) {
                case "Expense":
                    const exps = await fetchExpenses();
                    setExpenses(exps);
                    setFetchedExpenses(true);
                    break;
                case "Payment":
                    const pays = await fetchPayments();
                    setPayments(pays);
                    setFetchedPayments(true);
                    break;
                case "Request":
                    const reqs = await fetchRequests();
                    setRequests(reqs);
                    setFetchedRequests(true);
                    break;
            }
        } catch (err) {
            console.error("Refresh failed:", err);
        } finally {
            setRefreshing(false);
        }
    };

    const renderContent = () => {
        if (loading) return <Text color="$gray10">Loading...</Text>;

        switch (activeTab) {
            case "Expense":
                return (
                    <ScrollView>
                        <YStack space="$3" mt="$3">
                            {expenses.length > 0 ? (
                                expenses.map((exp) => (
                                    <ExpenseCard
                                        key={exp.id}
                                        expenseId={exp.expenseId}
                                        title={exp.title}
                                        amount={exp.amount}
                                        currency={exp.currency}
                                        childName={exp.childName}
                                        date={exp.date}
                                        category={exp.category}
                                        categoryColor={exp.categoryColor}
                                        status={exp.status}
                                        splitInfo={exp.splitInfo}
                                        reimbursedBy={exp.reimbursedBy}
                                    />
                                ))
                            ) : (
                                <YStack
                                    ai="center"
                                    jc="center"
                                    mt="$6"
                                    space="$4"
                                    width="100%"
                                >
                                    <Text fontWeight="600" color={colors.text} textAlign="center">
                                        No Expense Found
                                    </Text>
                                    <Text>
                                        No expense has been logged, start by making one below
                                    </Text>
                                    <Button
                                        size="$4"
                                        bg={colors.primary}
                                        color='white'
                                        width="80%"
                                        onPress={() => navigation.navigate('AddExpense' as never)}
                                    >
                                        <Plus color='white' /> Add Expense
                                    </Button>
                                </YStack>
                            )}
                        </YStack>
                    </ScrollView>
                );

            case "Payment":
                return (
                    <ScrollView>
                        <YStack space="$3" mt="$3">
                            {payments.length > 0 ? (
                                payments.map((payment) => (
                                    <PaymentCard
                                        key={payment.id}
                                        expenseId={payment.expense?.id || payment.expense_id}
                                        title={payment.expense?.title || payment.description || "Payment"}
                                        amount={Number(payment.amount)}
                                        currency={payment.currency || payment.expense?.currency || "$"}
                                        childName={payment.expense?.childName || "Unknown"}
                                        date={
                                            payment.paid_at
                                                ? new Date(payment.paid_at).toLocaleDateString()
                                                : ""
                                        }
                                        category={payment.expense?.category || "Payment"}
                                        categoryColor="#3b82f6"
                                        status={payment.status as any}
                                        splitInfo={`Payment to ${payment.contactName || payment.expense?.reimburser || ""}`}
                                        reimbursedBy={payment.contactName || payment.expense?.reimburser || ""}
                                        paymentData={payment}
                                    />
                                ))
                            ) : (
                                <YStack
                                    ai="center"
                                    jc="center"
                                    mt="$6"
                                    space="$4"
                                    width="100%"
                                >
                                    <Text fontWeight="600" color={colors.text} textAlign="center">
                                        No Payments Found
                                    </Text>
                                    <Text>
                                        No payment has been made, check the Expense tab
                                    </Text>
                                </YStack>
                            )}
                        </YStack>
                    </ScrollView>
                );

            case "Request":
                return (
                    <ScrollView>
                        <YStack space="$3" mt="$3">
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <RequestCard
                                        key={req.id}
                                        expenseId={req.id}
                                        title={req.title}
                                        amount={req.amount}
                                        currency={req.currency}
                                        childName={req.requesterEmail}
                                        date={req.due_date || "N/A"}
                                        category="Request"
                                        categoryColor="#8b5cf6"
                                        status={req.status as any}
                                        splitInfo={`Requested from ${req.requestedFromName}`}
                                        reimbursedBy={req.requestedFromName}
                                        requestData={req}
                                    />
                                ))
                            ) : (
                                <YStack
                                    ai="center"
                                    jc="center"
                                    mt="$6"
                                    space="$4"
                                    width="100%"
                                >
                                    <Text fontWeight="600" color={colors.text} textAlign="center">
                                        No Request Found
                                    </Text>
                                    <Text>
                                        No request has been made, start by making one below
                                    </Text>
                                    <Button
                                        size="$4"
                                        bg={colors.primary}
                                        color='white'
                                        width="80%"
                                        onPress={() => navigation.navigate('RequestPayment' as never)}
                                    >
                                        <Plus color='white' /> Make Request
                                    </Button>
                                </YStack>
                            )}
                        </YStack>
                    </ScrollView>
                );


            default:
                return null;
        }
    };

    return (
        <GoalBackground>
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                <YStack f={1} bg="transparent" p="$4" space="$5">
                    <XStack space="$4" padding="$2" paddingTop="$7" justifyContent="flex-start" alignItems="flex-start">
                        <Button
                            unstyled
                            circular
                            pressStyle={{ opacity: 0.6 }}
                            onPress={() => (navigation as any).goBack?.()}
                            icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                        />
                        <H6 color={colors.text} fontWeight="600" flex={1} marginHorizontal="$2">
                            Records
                        </H6>

                        {/* 
                        <Button onPress={refresh} size="$3" br="$3" disabled={refreshing}>
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                        */}
                    </XStack>

                    {/* Tab Selector */}
                    <XStack jc="space-around" ai="center" bg="white" br="$3" p="$2">
                        {tabs.map((tab) => (
                            <Button
                                key={tab}
                                size="$3"
                                flex={1}
                                bc={activeTab === tab ? colors.secondary : "white"}
                                onPress={() => setActiveTab(tab)}
                                br="$4"
                            >
                                <Text color={activeTab === tab ? colors.onPrimary : "alt2"}>{tab}</Text>
                            </Button>
                        ))}
                    </XStack>

                    <YStack f={1}>{renderContent()}</YStack>
                </YStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default ExpenseRecordsScreen;