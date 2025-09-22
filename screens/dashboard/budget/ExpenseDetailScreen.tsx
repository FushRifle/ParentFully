import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Check, Paperclip, Trash2, X } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Modal, TouchableOpacity } from "react-native";
import {
    Avatar,
    Button,
    Card,
    H3,
    H5,
    ScrollView,
    Text,
    XStack,
    YStack,
} from "tamagui";

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetails">;

const ExpenseDetailScreen = () => {
    const { colors } = useTheme();
    const route = useRoute<ExpenseDetailRouteProp>();
    const navigation = useNavigation();

    const [expense, setExpense] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState<"now" | "later" | "reject" | null>(null);

    useEffect(() => {
        const fetchExpense = async () => {
            setLoading(true);

            const { data: expenseData, error: expenseError } = await supabase
                .from("expenses")
                .select(`
                    *,
                    children(name)
                `)
                .eq("id", route.params.expenseId)
                .single();

            if (expenseError) {
                console.error("Error fetching expense:", expenseError);
                setLoading(false);
                return;
            }

            setExpense(expenseData);
            setLoading(false);
        };

        fetchExpense();
    }, [route.params.expenseId]);

    const handleActionPress = (action: "now" | "later" | "reject") => {
        setModalAction(action);
        setModalVisible(true);
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const { error } = await supabase
                .from("expenses")
                .update({ status: newStatus })
                .eq("id", expense.id);

            if (error) {
                console.error("Error updating status:", error);
                return;
            }

            // Update local state
            setExpense({ ...expense, status: newStatus });
            setModalVisible(false);
        } catch (error) {
            console.error("Error updating expense status:", error);
        }
    };

    if (loading || !expense) {
        return (
            <GoalBackground>
                <YStack f={1} jc="center" ai="center">
                    <Text color={colors.text}>Loading...</Text>
                </YStack>
            </GoalBackground>
        );
    }

    const yourShare = expense.your_share || (expense.amount * (expense.your_percentage || 50)) / 100;
    const coParentShare = expense.co_parent_share || (expense.amount * (expense.co_parent_percentage || 50)) / 100;

    return (
        <GoalBackground>
            <ScrollView p="$3" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <XStack space="$4" padding="$2" mt="$5" mb="$5" justifyContent="flex-start" alignItems="center">
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />
                    <Text color={colors.text} fontWeight="700" fontSize="$6" flex={1} marginHorizontal="$2">
                        Expense Details
                    </Text>
                    <TouchableOpacity style={{ padding: 8 }}>
                        <Trash2 size={24} color={colors.error as any} />
                    </TouchableOpacity>
                </XStack>

                {/* Main Card */}
                <Card br="$6" p="$5" bg="white" borderWidth={1} borderColor={colors.border as any}>
                    <YStack ai="center" jc="center" mb="$4">
                        <Text bg="#FFFBEB" color="black" px="$3" py="$1.5" br="$6" fontWeight="600">
                            {expense.status?.toUpperCase() || "PENDING"}
                        </Text>
                        <H3 mt="$3" fontWeight="900" color={colors.secondary}>
                            {expense.currency}{expense.amount.toLocaleString()}.00
                        </H3>
                        <Text mt="$1" fontWeight="900" color={colors.textSecondary}>
                            {expense.title}
                        </Text>
                    </YStack>

                    <YStack space="$5" bg="#F9F8F8" px="$2" py="$3" br="$4">
                        <YStack>
                            <Text color={colors.text} fontWeight="600" mb="$2">Category</Text>
                            <Text fontSize="$6" fontWeight="700" color="#f97316">{expense.category}</Text>
                        </YStack>

                        <YStack>
                            <Text color={colors.text} fontWeight="600" mb="$2">Child</Text>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">{expense.children?.name}</Text>
                        </YStack>

                        <YStack>
                            <Text color={colors.text} fontWeight="600" mb="$2">Receipt</Text>
                            <Card bg="$gray3" br="$4" p="$3">
                                <XStack space="$3">
                                    <Paperclip color={colors.text as any} />
                                    <Text fontSize="$5" fontWeight="600" color="$gray12">{expense.title}</Text>
                                </XStack>
                            </Card>
                        </YStack>

                        <YStack>
                            <Text color={colors.text} fontWeight="600" mb="$2">Reimbursed by</Text>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {expense.reimburser || "—"}
                            </Text>
                        </YStack>

                        <YStack>
                            <Text color={colors.text} fontWeight="600" mb="$2">Created on</Text>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {new Date(expense.date).toLocaleDateString()}
                            </Text>
                        </YStack>

                        <XStack height={1} bg="$gray5" my="$2" />
                    </YStack>

                    {/* Cost Sharing */}
                    <YStack mt="$4">
                        <H5 color={colors.text} fontWeight="600" mb="$3">Cost Sharing</H5>
                        <Card bg="#F4FFF8" width="100%">
                            <YStack space="$3">
                                <XStack ai="center" jc="space-between" p="$2">
                                    <XStack ai="center" space="$3">
                                        <Avatar size="$6" br="$10">
                                            <Avatar.Fallback>
                                                <Text fontSize="$10" fontWeight="700" color="white" textAlign="center"
                                                    style={{
                                                        backgroundColor: "#FF8C01",
                                                        width: "100%",
                                                        height: "100%",
                                                        lineHeight: 68,
                                                        borderRadius: 999,
                                                    }}>
                                                    Y
                                                </Text>
                                            </Avatar.Fallback>
                                        </Avatar>
                                        <YStack>
                                            <Text fontSize="$4" fontWeight="400" color="$gray12">
                                                You
                                            </Text>
                                            <Text fontSize="$4" fontWeight="700" color={colors.textSecondary}>
                                                {expense.your_percentage || 50}% share
                                            </Text>
                                        </YStack>
                                    </XStack>
                                    <Text fontSize="$5" fontWeight="700" color={colors.secondary}>
                                        {expense.currency}{yourShare.toFixed(2)}
                                    </Text>
                                </XStack>

                                <XStack ai="center" jc="space-between" p="$2">
                                    <XStack ai="center" space="$3">
                                        <Avatar size="$6" br="$10">
                                            <Avatar.Fallback>
                                                <Text fontSize="$10" fontWeight="700" color="white" textAlign="center"
                                                    style={{
                                                        backgroundColor: "#FF8C01",
                                                        width: "100%",
                                                        height: "100%",
                                                        lineHeight: 68,
                                                        borderRadius: 999,
                                                    }}>
                                                    C
                                                </Text>
                                            </Avatar.Fallback>
                                        </Avatar>
                                        <YStack>
                                            <Text fontSize="$4" fontWeight="400" color="$gray12">
                                                {expense.reimburser || "—"}
                                            </Text>
                                            <Text fontSize="$4" fontWeight="700" color={colors.textSecondary}>
                                                {expense.co_parent_percentage || 50}% share
                                            </Text>
                                        </YStack>
                                    </XStack>
                                    <Text fontSize="$5" fontWeight="700" color={colors.secondary}>
                                        {expense.currency}{coParentShare.toFixed(2)}
                                    </Text>
                                </XStack>
                            </YStack>
                        </Card>
                    </YStack>

                    {/* Action Buttons - Only show for pending expenses */}
                    {expense.status === "pending" && (
                        <YStack mt="$8" space="$3" jc="center">
                            <Button
                                f={1}
                                size="$4"
                                bg={colors.success}
                                color={colors.onPrimary}
                                br="$5"
                                icon={<Check size={20} color="white" />}
                                onPress={() => handleActionPress("now")}
                            >
                                Approve and Pay Now
                            </Button>

                            <Button
                                f={1}
                                size="$4"
                                bg={colors.secondary}
                                color="white"
                                br="$5"
                                icon={<Check size={20} color="white" />}
                                onPress={() => handleActionPress("later")}
                            >
                                Approve and Pay Later
                            </Button>

                            <Button
                                f={1}
                                size="$4"
                                variant="outlined"
                                color={colors.error}
                                borderColor={colors.error as any}
                                br="$5"
                                icon={<X size={20} color={colors.error as any} />}
                                onPress={() => handleActionPress("reject")}
                            >
                                Reject
                            </Button>
                        </YStack>
                    )}

                    {/* Show message if already processed */}
                    {expense.status !== "pending" && (
                        <YStack mt="$8" ai="center" jc="center">
                            <Text color="$gray10" fontWeight="600">
                                This expense has been {expense.status}
                            </Text>
                        </YStack>
                    )}
                </Card>
            </ScrollView>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <YStack f={1} jc="center" ai="center" bg="rgba(0,0,0,0.5)" px="$4">
                    <Card p="$5" br="$6" bg="white" width="100%" height={320} ai="center" space="$4">
                        <H3 fontSize="$8" fontWeight="700" textAlign="center">
                            {modalAction === "now" ? "Approve and Pay Now?" :
                                modalAction === "later" ? "Approve and Pay Later?" :
                                    "Reject this expense?"}
                        </H3>

                        <Text fontSize="$5" color="$gray11" textAlign="center">
                            {modalAction === "now" && `This will take you to Add Payment to record ${expense.currency}${expense.amount}.`}
                            {modalAction === "later" && `This will approve the expense and add ${expense.currency}${expense.amount} to pending payments.`}
                            {modalAction === "reject" && "This will reject the expense. The amount will not be added to pending payments."}
                        </Text>

                        <YStack space="$6" mt="$6" width="100%">
                            <Button
                                size="$5"
                                bg={colors.primary}
                                color={colors.onPrimary}
                                onPress={() => {
                                    if (modalAction === "now") {
                                        // @ts-ignore
                                        navigation.navigate("AddPayment" as never, { expense } as never);
                                    } else if (modalAction === "later") {
                                        handleStatusUpdate("approved");
                                    } else if (modalAction === "reject") {
                                        handleStatusUpdate("rejected");
                                    }
                                    setModalVisible(false);
                                }}
                            >
                                {modalAction === "now" ? "Add Payment" :
                                    modalAction === "later" ? "Pay Later" : "Reject"}
                            </Button>

                            <Button size="$5" variant="outlined" borderColor={colors.primary} color={colors.primary} onPress={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                        </YStack>
                    </Card>
                </YStack>
            </Modal>
        </GoalBackground>
    );
};

export default ExpenseDetailScreen;