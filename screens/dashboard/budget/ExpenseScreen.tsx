import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { ExpensesByCategory } from '@/components/expenses/ExpenseActionCard';
import { PaymentRequestCard } from '@/components/expenses/PendingActionCard';
import { GoalBackground } from '@/constants/GoalBackground';
import { Text } from '@/context/GlobalText';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from "@/supabase/client";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import uuid from 'react-native-uuid';
import {
    Button, Card,
    H6,
    ScrollView,
    View,
    XStack,
    YStack
} from 'tamagui';

type ExpenseStatus = 'pending' | 'verified' | 'paid';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    receipt_url?: string;
    split_percentage: number;
    status: ExpenseStatus;
}

const STATUS_COLORS: Record<ExpenseStatus, string> = {
    pending: '#FFA726',
    verified: '#66BB6A',
    paid: '#42A5F5',
};

const MOCK_EXPENSES: Expense[] = [
    {
        id: uuid.v4().toString(),
        description: 'School Books',
        amount: 120.0,
        category: 'Education',
        date: '2025-06-08',
        split_percentage: 50,
        status: 'pending',
        receipt_url: 'https://example.com/receipt1.jpg',
    },
    {
        id: uuid.v4().toString(),
        description: 'Pediatric Visit',
        amount: 200.0,
        category: 'Medical',
        date: '2025-06-06',
        split_percentage: 50,
        status: 'verified',
        receipt_url: 'https://example.com/receipt2.jpg',
    },
    {
        id: uuid.v4().toString(),
        description: 'Extracurricular Activity',
        amount: 85.0,
        category: 'Activities',
        date: '2025-06-05',
        split_percentage: 50,
        status: 'paid',
    },
];

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

export const ExpenseScreen = ({ navigation }: { navigation: StackNavigationProp<any> }) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES);
    const [showModal, setShowModal] = useState(false);
    const [requests, setRequests] = useState<RequestType[]>([]);

    // Add these to your ExpenseScreen component
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [totalPayments, setTotalPayments] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);

    const fetchTotals = useCallback(async () => {
        try {
            // Total Expenses
            const { data: expensesData, error: expError } = await supabase
                .from("expenses")
                .select("amount");
            if (expError) throw expError;
            const totalExp = (expensesData || []).reduce((sum, e: any) => sum + Number(e.amount), 0);
            setTotalExpenses(totalExp);

            // Total Payments
            const { data: paymentsData, error: payError } = await supabase
                .from("payments")
                .select("amount");
            if (payError) throw payError;
            const totalPay = (paymentsData || []).reduce((sum, p: any) => sum + Number(p.amount), 0);
            setTotalPayments(totalPay);

            // Total Payment Requests
            const { data: requestsData, error: reqError } = await supabase
                .from("payment_requests")
                .select("amount");
            if (reqError) throw reqError;
            const totalReq = (requestsData || []).reduce((sum, r: any) => sum + Number(r.amount), 0);
            setTotalRequests(totalReq);

        } catch (err) {
            console.error("Error fetching totals:", err);
        }
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
        fetchTotals(); fetchRequests();
    }, [fetchTotals, fetchRequests]);

    const { totalAmount, yourShare } = useMemo(() => {
        const total = expenses.reduce((sum, e) => sum + e.amount, 0);
        const share = expenses.reduce((sum, e) => sum + (e.amount * e.split_percentage) / 100, 0);
        return { totalAmount: total, yourShare: share };
    }, [expenses]);

    const handleAddExpense = useCallback((expense: Expense) => {
        setExpenses(prev => [expense, ...prev]);
    }, []);

    const navigateToDetail = useCallback((expense: Expense) => {
        navigation.navigate('ExpenseDetail', { expense });
    }, [navigation]);

    const navigateToRecords = useCallback(() => {
        navigation.navigate('ExpenseRecords');
    }, [navigation]);

    const navigateToAddExpense = useCallback(() => {
        navigation.navigate('AddExpense');
    }, [navigation]);

    const navigateToRequest = useCallback(() => {
        navigation.navigate('PaymentRequest');
    }, [navigation]);


    return (
        <GoalBackground>
            <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                <YStack flex={1}>
                    {/* Header */}

                    <XStack padding="$4" paddingTop="$7"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Button
                            unstyled
                            circular
                            pressStyle={{ opacity: 0.6 }}
                            onPress={navigation.goBack}
                            icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                        />
                        <H6 color={colors.text} fontWeight={600}
                            textAlign="center"
                            flex={1} marginHorizontal="$2">
                            Budget Overview
                        </H6>
                    </XStack>

                    <XStack ai="center" jc="space-between"
                        space="$5" px='$5' mt="$5" mb='$3'>
                        <Button
                            size='$4'
                            variant='outlined'
                            br='$4'
                            backgroundColor="transparent"
                            borderColor={colors.border as any}
                            px="$3"
                        >
                            <XStack ai="center" space="$3">
                                <Feather name="download" size={20} color={colors.text} />
                                <Text color={colors.text}>
                                    Export
                                </Text>
                            </XStack>
                        </Button>

                        <Button
                            size='$4'
                            variant='outlined'
                            backgroundColor="transparent"
                            borderColor={colors.primary as any}
                            onPress={navigateToRecords}
                            px="$3"
                            br='$4'
                        >
                            <XStack ai="center" space="$3">
                                <Feather name="printer" size={20} color={colors.primary} />
                                <Text color={colors.primary}>
                                    View Records
                                </Text>
                            </XStack>
                        </Button>
                    </XStack>

                    <Card bc="transparent" br='$9' p="$2" px='$5' space="$3" mt='$2'>
                        <YStack space="$3">
                            {/* Category Dropdown */}
                            <YStack space="$1">
                                <Picker
                                    style={{ backgroundColor: colors.card, color: colors.text }}
                                >
                                    <Picker.Item label="Last 3 Months" value=""
                                        style={{ color: colors.text }}
                                    />
                                </Picker>
                            </YStack>
                        </YStack>
                    </Card>

                    {/* Summary Cards */}
                    <YStack justifyContent="space-between" paddingHorizontal={16} mt="$4" space={8}>
                        <XStack>
                            <SummaryCard
                                label="Pending Amount"
                                value={totalRequests}
                                colors={colors}
                                icon="clock"
                                iconBg="#FFEBE1"
                                IconColor='#B35D00'
                            />
                            <SummaryCard
                                label="Total Expenses"
                                value={totalExpenses}
                                colors={colors}
                                icon="cart-outline"
                                iconBg="#FFEBE1"
                                IconColor='#E65A5A'
                            />

                        </XStack>
                        <XStack>
                            <SummaryCard
                                label="Aprroved Actions"
                                value={360}
                                colors={colors}
                                icon="check"
                                iconBg="#E1FFE4"
                                IconColor='#4CAF50'
                            />
                            <SummaryCard
                                label="Total Payments"
                                value={totalPayments}
                                colors={colors}
                                icon="wallet-outline"
                                iconBg="#E1F0FF"
                                IconColor='#005EFF'
                            />
                        </XStack>
                    </YStack>

                    <YStack ai='center' jc='center' mt='$6'>
                        <Button
                            size='$4'
                            width='58%'
                            br='$5'
                            px="$3"
                            backgroundColor={colors.primary}
                            onPress={() => setShowModal(true)}
                        >
                            <XStack ai="center" space="$2">
                                <Feather name="plus" size={20} color={colors.onPrimary} />
                                <Text color={colors.onPrimary} >
                                    Add
                                </Text>
                            </XStack>
                        </Button>
                    </YStack>

                    <YStack jc="flex-start" space="$1" mt="$5">
                        <H6
                            fontWeight={600}
                            color={colors.text}
                            px="$3"
                        >
                            Expense by Category
                        </H6>
                        <ExpensesByCategory />
                    </YStack>

                    <YStack jc="flex-start" space="$1" mt="$5">
                        <H6
                            fontWeight={600}
                            color={colors.text}
                            px="$3"
                        >
                            Pending Actions
                        </H6>
                        <PaymentRequestCard />
                    </YStack>

                    <ActionModal visible={showModal} onClose={() => setShowModal(false)} />

                    <AddExpenseModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        onAdd={handleAddExpense}
                    />
                </YStack>
            </ScrollView>

        </GoalBackground>

    );
};

type SummaryCardProps = {
    label: string;
    value: number;
    colors: any;
    icon: string;
    iconBg: string;
    IconColor: string;
};

const SummaryCard = ({ label, value, colors, icon, iconBg, IconColor }: SummaryCardProps) => (
    <YStack
        backgroundColor={colors.card}
        borderWidth={1}
        borderColor={colors.border as any}
        borderRadius={12}
        padding={16}
        flex={1}
        mr={8}
    >
        <XStack ai="center" jc="space-between">
            <View
                style={{
                    backgroundColor: iconBg,
                    borderRadius: 9999,
                    padding: 5,
                }}
            >
                <MaterialCommunityIcons name={icon as any} size={20} color={IconColor} />
            </View>

            <YStack ai='flex-start' jc='flex-start'>
                <Text color={colors.text}>
                    {label}
                </Text>
                <Text fontWeight={600} marginTop={4} color={colors.text}>
                    ${value.toFixed(2)}
                </Text>
            </YStack>
        </XStack>
    </YStack>
);

type Option = {
    title: string;
    description: string;
    icon: string;
    iconBg: string;
    IconColor: string;
    route: string;
};

const OPTIONS: Option[] = [
    {
        title: "Add Expense",
        description: "Record a new expense entry",
        icon: "wallet-outline",
        iconBg: "#FFE6E6",
        IconColor: "#E65A5A",
        route: "AddExpense",
    },
    {
        title: "Add Payment",
        description: "Record a payment made",
        icon: "plus",
        iconBg: "#E3FFE0",
        IconColor: "#4CAF50",
        route: "ExpenseRecords",
    },
    {
        title: "Payment Request",
        description: "Request a payment from someone",
        icon: "wallet",
        iconBg: "#E0EBFF",
        IconColor: "#005EFF",
        route: "RequestPayment",
    },
];

export const ActionModal = ({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) => {
    const navigation = useNavigation<any>();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: "flex-end",
                    backgroundColor: "rgba(0,0,0,0.5)",
                }}
            >
                <Card
                    backgroundColor="white"
                    borderTopLeftRadius={16}
                    borderTopRightRadius={16}
                    padding={20}
                    space="$4"
                >
                    {OPTIONS.map((opt, idx) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => {
                                onClose();
                                navigation.navigate(opt.route);
                            }}
                        >
                            <XStack
                                ai="flex-start"
                                jc="flex-start"
                                py="$3"
                                space="$5"
                                borderBottomWidth={idx !== OPTIONS.length - 1 ? 1 : 0}
                                borderColor="#eee"
                            >
                                <View
                                    style={{
                                        backgroundColor: opt.iconBg,
                                        borderRadius: 9999,
                                        padding: 8,
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={opt.icon as any}
                                        size={26}
                                        color={opt.IconColor}
                                    />
                                </View>

                                <YStack>
                                    <Text fontWeight={600}>
                                        {opt.title}
                                    </Text>
                                    <Text color='gray'>
                                        {opt.description}
                                    </Text>
                                </YStack>
                            </XStack>
                        </TouchableOpacity>
                    ))}

                    {/* Cancel Button */}
                    <Button
                        size="$4"
                        onPress={onClose}
                        fontWeight={600}
                        variant="outlined"
                        color="red"
                        borderWidth={1}
                        textAlign="center"
                        borderColor="red"
                        mt="$4"
                    >
                        Cancel
                    </Button>
                </Card>
            </View>
        </Modal>
    );
};
