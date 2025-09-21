import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Check, X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Alert } from "react-native";
import { Button, Card, H3, Text, XStack, YStack } from "tamagui";

type ConfirmPaymentRouteProp = RouteProp<RootStackParamList, "ConfirmPayment">;

type PaymentData = {
    expense: any;
    payment: {
        amount: number;
        currency: string;
        description: string;
        paid_at: string;
        paid_to: string;
        contactName: string;
    };
};

const ConfirmPaymentScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const route = useRoute<ConfirmPaymentRouteProp>();
    const { expense, payment } = route.params as PaymentData;
    const [isLoading, setIsLoading] = useState(false);

    const {
        title,
        amount: expenseAmount,
        currency: expenseCurrency,
        children,
        date,
        category,
        categoryColor = "#f97316",
        reimburser,
        id: expenseId,
    } = expense || {};

    const {
        amount: paymentAmount,
        currency: paymentCurrency,
        description,
        paid_at,
        paid_to,
        contactName,
    } = payment || {};

    const handleConfirmPayment = async () => {
        setIsLoading(true);

        try {
            // 1. Update the payment status to "completed"
            const { error: paymentError } = await supabase
                .from("payments")
                .update({
                    status: "completed",
                    confirmed_at: new Date().toISOString()
                })
                .eq("expense_id", expenseId);

            if (paymentError) {
                throw new Error(`Failed to update payment status: ${paymentError.message}`);
            }

            // 2. Update the expense status to "paid" and set paid_at timestamp
            const { error: expenseError } = await supabase
                .from("expenses")
                .update({
                    status: "paid",
                    paid_at: new Date().toISOString()
                })
                .eq("id", expenseId);

            if (expenseError) {
                throw new Error(`Failed to update expense status: ${expenseError.message}`);
            }

            // 3. Show success message and navigate back
            Alert.alert("Success", "Payment confirmed successfully!");
            navigation.goBack();

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to confirm payment");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectPayment = async () => {
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("payments")
                .update({
                    status: "rejected",
                    rejected_at: new Date().toISOString()
                })
                .eq("expense_id", expenseId);

            if (error) {
                throw new Error(`Failed to reject payment: ${error.message}`);
            }

            Alert.alert("Payment Rejected", "The payment has been marked as rejected.");
            navigation.goBack();

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to reject payment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GoalBackground>
            <YStack f={1} space="$4" p="$5">
                {/* Header */}
                <XStack space="$4" alignItems="center" mb="$6" mt="$6">
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />
                    <Text color={colors.text} fontWeight="900" fontSize="$7" flex={1}>
                        Payment Confirmation
                    </Text>
                </XStack>

                {/* Main Card */}
                <Card br="$6" p="$5" jc="center" bg="white"
                    borderTopWidth={50}
                    borderTopColor={colors.success as any}>

                    {/* Status & Amount */}
                    <YStack ai="center" jc="center" mb="$4">
                        <Text mt="$1" fontWeight="900" color={colors.text}>
                            CONFIRM PAYMENT
                        </Text>
                        <H3 mt="$3" fontWeight="900" color={colors.secondary}>
                            {paymentCurrency || expenseCurrency || "USD"}
                            {paymentAmount?.toLocaleString() || expenseAmount?.toLocaleString()}
                        </H3>
                    </YStack>

                    {/* Payee */}
                    <YStack mb="$3">
                        <Text fontWeight="600" mb="$2" color="$gray9">
                            Payee
                        </Text>
                        <Text fontSize="$5" fontWeight="600" color="$gray12">
                            {contactName || reimburser || paid_to || "Unknown"}
                        </Text>
                    </YStack>

                    {/* Description */}
                    <YStack mb="$3">
                        <Text fontWeight="600" mb="$2" color="$gray9">
                            Description
                        </Text>
                        <Text fontSize="$5" fontWeight="600" color="$gray12">
                            {description || title || "Payment"}
                        </Text>
                    </YStack>

                    {/* Details Section */}
                    <YStack space="$3" bg="#F9F8F8" px="$3" py="$3" br="$4" mb="$4">
                        {/* Category */}
                        {category && (
                            <YStack>
                                <Text fontWeight="600" mb="$2" color="$gray9">
                                    Category
                                </Text>
                                <Text fontSize="$5" fontWeight="700" color={categoryColor}>
                                    {category}
                                </Text>
                            </YStack>
                        )}

                        {/* Payment Date */}
                        <YStack>
                            <Text fontWeight="600" mb="$2" color="$gray9">
                                Made On
                            </Text>
                            <Text color="$gray10">{date}</Text>
                        </YStack>

                        {/* Child */}
                        {children?.name && (
                            <YStack>
                                <Text fontWeight="600" mb="$2" color="$gray9">
                                    For Child
                                </Text>
                                <Text fontSize="$5" fontWeight="600" color="$gray12">
                                    {children.name}
                                </Text>
                            </YStack>
                        )}

                        <XStack height={1} bg="$gray5" my="$2" />
                    </YStack>
                </Card>

                {/* Action Buttons */}
                <XStack jc='space-between' mt='$6'>
                    <Button
                        size='$5'
                        width='48%'
                        variant="outlined"
                        borderColor={colors.error}
                        color={colors.error}
                        onPress={handleRejectPayment}
                        disabled={isLoading}
                        icon={<X size={20} />}
                    >
                        {isLoading ? "..." : "Reject"}
                    </Button>

                    <Button
                        size='$5'
                        width='48%'
                        bg={colors.success}
                        color={colors.onPrimary}
                        onPress={handleConfirmPayment}
                        disabled={isLoading}
                        icon={<Check size={20} color={colors.onPrimary as any} />}
                    >
                        {isLoading ? "Processing..." : "Confirm"}
                    </Button>
                </XStack>
            </YStack>
        </GoalBackground>
    );
};

export default ConfirmPaymentScreen;