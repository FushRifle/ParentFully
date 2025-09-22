import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Check, X } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Card, H3, Text, XStack, YStack } from "tamagui";

type ConfirmRequestRouteProp = RouteProp<RootStackParamList, "ConfirmRequest">;

type RequestData = {
    requestId?: string;
    description: string;
    amount: number;
    currency: string;
    requestedFromId: string;
    requestedFromName: string;
    dueDate: string;
    fileName?: string;
};

const ConfirmRequestScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const route = useRoute<ConfirmRequestRouteProp>();
    const [isLoading, setIsLoading] = useState(false);
    const [payer, setPayer] = useState<{ id: string; full_name: string } | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalAction, setModalAction] = useState<"now" | "later" | "reject" | null>(null);

    const handleStatusUpdate = async (status: "approved" | "rejected") => {
        const { error } = await supabase
            .from("payment_requests")
            .update({ status })
            .eq("id", requestId);

        if (error) {
            console.error("Error updating status:", error);
        }
    };

    const {
        requestId,
        description,
        amount,
        currency,
        requestedFromId,
        requestedFromName,
        dueDate,
        fileName,
    } = route.params as RequestData;

    useEffect(() => {
        const fetchPayer = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("users")
                .select("id, full_name")
                .eq("id", user.id)
                .single();

            if (!error && data) {
                setPayer({ id: data.id, full_name: data.full_name });
            }
        };

        fetchPayer();
    }, []);

    const handleConfirmRequest = async () => {
        setIsLoading(true);

        try {
            if (requestId) {
                const { error } = await supabase
                    .from("payment_requests")
                    .update({
                        status: "approved",
                        approved_at: new Date().toISOString()
                    })
                    .eq("id", requestId);

                if (error) {
                    throw new Error(`Failed to approve request: ${error.message}`);
                }

                Alert.alert("Success", "Payment request approved successfully!");
            } else {
                const { data: requestData, error } = await supabase
                    .from("payment_requests")
                    .insert({
                        amount: amount,
                        currency: currency,
                        description: description,
                        due_date: dueDate,
                        requested_from_id: requestedFromId,
                        status: "pending",
                        requester_id: (await supabase.auth.getUser()).data.user?.id
                    })
                    .select("id")
                    .single();

                if (error) {
                    throw new Error(`Failed to create payment request: ${error.message}`);
                }

                Alert.alert("Success", "Payment request created successfully!");
            }

            navigation.goBack();

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to process payment request");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        if (!requestId) {
            navigation.goBack();
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await supabase
                .from("payment_requests")
                .update({
                    status: "rejected",
                    rejected_at: new Date().toISOString()
                })
                .eq("id", requestId);

            if (error) {
                throw new Error(`Failed to reject request: ${error.message}`);
            }

            Alert.alert("Request Rejected", "The payment request has been rejected.");
            navigation.goBack();

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to reject payment request");
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
                        {requestId ? "Payment Request" : "Confirm Request"}
                    </Text>
                </XStack>

                {/* Main Card */}
                <Card
                    br="$6"
                    p="$5"
                    jc="center"
                    bg={colors.card}
                    borderTopWidth={50}
                    borderTopColor="#9B4CAF"
                >
                    {/* Header Section */}
                    <YStack ai="center" jc="center" mb="$4">
                        <Text mt="$1" fontWeight="900" color={colors.text}>
                            {requestId ? "PAYMENT REQUEST" : "REQUEST CONFIRMATION"}
                        </Text>
                        <H3 mt="$3" fontWeight="900" color={colors.secondary}>
                            {currency}
                            {Number(amount).toLocaleString()}.00
                        </H3>
                    </YStack>

                    {/* Info Section */}
                    <YStack space="$3" bg='#F9F8F8'>
                        <Text fontWeight="600" color={colors.text}>
                            Payer
                        </Text>
                        {/* Payer */}
                        <YStack
                            bg="#F9F8F8"
                            px="$3"
                            py="$3"
                            br="$4"
                        >
                            <YStack bg="white" p="$3" br="$4">
                                <Text fontSize="$5" fontWeight="600" color={colors.text}>
                                    {payer?.full_name || "Unknown"}
                                </Text>
                                <Text fontSize="$3" fontWeight="600" color={colors.textSecondary}>
                                    Co-Parent
                                </Text>
                            </YStack>
                        </YStack>

                        {/* Purpose */}
                        <YStack>
                            <Text fontWeight="600" mb="$1" color={colors.text}>
                                Purpose
                            </Text>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {description}
                            </Text>
                        </YStack>

                        {/* Requested From */}
                        <YStack>
                            <Text fontWeight="600" mb="$1" color={colors.text}>
                                Requested From
                            </Text>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {requestedFromName}
                            </Text>
                        </YStack>

                        {/* Due Date */}
                        <YStack>
                            <Text fontWeight="600" mb="$1" color={colors.text}>
                                Due Date
                            </Text>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {dueDate}
                            </Text>
                        </YStack >
                    </YStack >

                    {/* Details Section 
                    < YStack
                        space="$3"
                        bg="#F9F8F8"
                        px="$3"
                        py="$3"
                        br="$4"
                    >
                        {
                            fileName && (
                                <YStack>
                                    <Text fontWeight="600" mb="$1" color={colors.text}>
                                        Attachment
                                    </Text>
                                    <Card bg="$gray3" br="$4" p="$3">
                                        <XStack space="$3" ai="center">
                                            <Paperclip color={colors.text as any} />
                                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                                {fileName}
                                            </Text>
                                        </XStack>
                                    </Card>
                                </YStack >
                            )
                        }
            </YStack >
            */}
                </Card >


                {/* Action Buttons */}
                < YStack jc='center' ai='center' mt="$6" space='$%' >
                    <Button
                        size="$5"
                        width="88%"
                        bg={colors.success}
                        color={colors.onPrimary}
                        onPress={handleConfirmRequest}
                        disabled={isLoading}
                        icon={<Check size={20} color={colors.onPrimary as any} />}
                    >
                        {isLoading ? "Processing..." : (requestId ? "Approve and Pay Now ?" : "Confirm")}
                    </Button>
                    <Button
                        mt="$3"
                        size="$5"
                        width="88%"
                        variant="outlined"
                        bg={colors.secondary}
                        color={colors.onPrimary}
                        onPress={handleRejectRequest}
                        disabled={isLoading}
                        icon={<X size={20} />}
                    >
                        {isLoading ? "Processing..." : (requestId ? "Approve and Pay Later ?" : "Confirm")}
                    </Button>

                    <Button
                        mt="$3"
                        size="$5"
                        width="88%"
                        variant="outlined"
                        borderColor={colors.error}
                        color={colors.error}
                        onPress={handleRejectRequest}
                        disabled={isLoading}
                        icon={<X size={20} />}
                    >
                        {requestId ? "Ignore" : "Cancel"}
                    </Button>
                </YStack >
            </YStack >
        </GoalBackground >
    );
};

export default ConfirmRequestScreen;