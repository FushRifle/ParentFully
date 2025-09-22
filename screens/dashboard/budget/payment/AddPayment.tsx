import { currencyOptions } from "@/constants/Currency";
import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { CheckCircle2 } from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Alert, Modal, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Avatar, Button, Card, H4, H6, Input, Text, XStack, YStack } from "tamagui";

type AddPaymentRouteProp = RouteProp<RootStackParamList, "AddPayment">;

const AddPaymentScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<AddPaymentRouteProp>();
    const { expense } = route.params;

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState(expense.amount.toString());
    const [currency, setCurrency] = useState(expense.currency);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [successVisible, setSuccessVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // for displaying payer full_name
    const [payerName, setPayerName] = useState<string>("");

    // fetch full_name of payer_id
    useEffect(() => {
        const fetchPayerName = async () => {
            if (!expense.payer_id) return;
            const { data, error } = await supabase
                .from("users")
                .select("full_name")
                .eq("id", expense.payer_id)
                .single();

            if (error) {
                console.error("Failed to fetch payer name:", error.message);
                return;
            }

            setPayerName(data?.full_name || "Unknown User");
        };

        fetchPayerName();
    }, [expense.payer_id]);

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate);
    };

    const handleFilePick = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true
            });

            if (!res.canceled && res.assets.length > 0) {
                setFile(res.assets[0]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to select file. Please try again.");
        }
    };

    const handleSavePayment = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        setIsLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not logged in");

            const { data: paymentData, error: paymentError } = await supabase
                .from("payments")
                .insert({
                    expense_id: expense.id,
                    amount: parseFloat(amount),
                    currency,
                    description,
                    paid_at: date.toISOString(),
                    payer_id: user.id,
                    paid_to: expense.payer_id,
                    status: "completed",
                })
                .select("id")
                .single();

            if (paymentError) {
                throw new Error(`Payment creation failed: ${paymentError.message}`);
            }

            if (file) {
                const ext = file.name.split(".").pop();
                const fileName = `${Date.now()}.${ext}`;
                const filePath = `payment_receipts/${paymentData.id}/${fileName}`;

                const response = await fetch(file.uri);
                const blob = await response.blob();

                const { error: uploadError } = await supabase.storage
                    .from("payment_receipts")
                    .upload(filePath, blob, {
                        contentType: file.mimeType || "application/octet-stream",
                    });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from("payment_receipts")
                        .getPublicUrl(filePath);

                    await supabase.from("payment_attachments").insert({
                        payment_id: paymentData.id,
                        file_url: urlData.publicUrl,
                    });
                }
            }

            setSuccessVisible(true);

        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to save payment");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <GoalBackground>
            <KeyboardAwareScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <XStack space="$4" alignItems="center" mb="$6" mt='$6'>
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />
                    <Text color={colors.text} fontWeight="900" fontSize="$7" flex={1}>
                        Add Payment
                    </Text>
                </XStack>

                <H4 mb="$3" fontWeight="600">Payment To</H4>

                <Card br="$8" bg="transparent" space='$3'>
                    {/* Payment To (payer full_name from users) */}
                    <YStack mb="$4" bg="white" p="$3" br="$4">
                        <XStack alignItems="center" space="$3">
                            <Avatar size="$6" br="$10">
                                <Avatar.Fallback>
                                    <Text
                                        fontSize="$10"
                                        fontWeight="700"
                                        color="white"
                                        textAlign="center"
                                        style={{
                                            backgroundColor: "#FF8C01",
                                            width: "100%",
                                            height: "100%",
                                            lineHeight: 68,
                                            borderRadius: 999,
                                        }}
                                    >
                                        {payerName?.[0]?.toUpperCase() || "?"}
                                    </Text>
                                </Avatar.Fallback>
                            </Avatar>

                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {payerName || "Unknown User"}
                            </Text>
                        </XStack>
                    </YStack>

                    {/* Description */}
                    <YStack mb="$3">
                        <H6 mb="$2">Description</H6>
                        <Input
                            placeholder="Payment description"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </YStack>

                    {/* Amount */}
                    <YStack mb="$3">
                        <H6 mb="$2">Amount</H6>
                        <XStack bg="white" bc="white" br="$6" ai="center" p="$2" space="$3">
                            <Picker
                                selectedValue={currency}
                                style={{ width: 110, height: 50 }}
                                onValueChange={setCurrency}
                            >
                                {currencyOptions.map((curr) => (
                                    <Picker.Item key={curr} label={curr} value={curr} />
                                ))}
                            </Picker>
                            <Input
                                flex={1}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={(text) => {
                                    const formattedText = text.replace(/[^0-9.]/g, '');
                                    if ((formattedText.match(/\./g) || []).length <= 1) {
                                        setAmount(formattedText);
                                    }
                                }}
                                bw={0}
                                fontSize="$6"
                                fontWeight="700"
                            />
                        </XStack>
                    </YStack>

                    {/* Date */}
                    <YStack mb="$3">
                        <H6 mb="$2">Date</H6>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                            <Card p="$3" bg="white" br="$4">
                                <Text>{date.toLocaleDateString()}</Text>
                            </Card>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                            />
                        )}
                    </YStack>

                    {/* Receipt */}
                    <YStack mb="$3">
                        <H6 mb="$2">Receipt (Optional)</H6>
                        <Button
                            bg="white"
                            bc="white"
                            br="$2"
                            onPress={handleFilePick}
                            icon={file ? <Feather name="check" size={16} /> : undefined}
                        >
                            <Text>{file ? file.name : "Upload receipt"}</Text>
                        </Button>
                        {file && (
                            <Text mt="$2" fontSize="$2" color="$gray10">
                                Tap to change receipt
                            </Text>
                        )}
                    </YStack>

                    {/* Action Buttons */}
                    <XStack jc='space-between' mt='$6'>
                        <Button
                            size='$5'
                            width='40%'
                            variant="outlined"
                            borderColor={colors.primary}
                            color={colors.primary}
                            borderWidth={1}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>

                        <Button
                            size='$5'
                            width='48%'
                            bg={colors.primary}
                            color={colors.onPrimary}
                            onPress={handleSavePayment}
                            disabled={isLoading}
                            opacity={isLoading ? 0.7 : 1}
                        >
                            {isLoading ? "Processing..." : "Add Payment"}
                        </Button>
                    </XStack>
                </Card>
            </KeyboardAwareScrollView>

            <SuccessModal
                visible={successVisible}
                onClose={() => {
                    setSuccessVisible(false);
                    navigation.goBack();
                }}
                expense={expense}
            />
        </GoalBackground>
    );
};

type SuccessModalProps = {
    visible: boolean;
    message?: string;
    onClose: () => void;
    expense: any;
}

const SuccessModal = ({ visible, message = "Payment Added Successfully!", onClose }: SuccessModalProps) => {
    const navigation = useNavigation();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <YStack f={1} jc="center" ai="center" bg="rgba(0,0,0,0.4)">
                <Card w={350} h='50%'
                    p="$6"
                    br="$6"
                    ai="center"
                    jc="center"
                    bg="white"
                >
                    <CheckCircle2 size={60} color="#FF8C01" />
                    <Text mt="$4" fontSize="$6" fontWeight="700" textAlign="center">
                        {message}
                    </Text>
                    <Text mt="$2" fontSize="$4" color="$gray10" textAlign="center">
                        Expense status updated to Paid
                    </Text>

                    <Button
                        size='$5'
                        mt="$9"
                        w="100%"
                        bg="#FF8C01"
                        color="white"
                        br="$4"
                        onPress={() =>
                            (navigation as any).navigate("ExpenseRecords", {
                                screen: "Payment"
                            })
                        }
                    >
                        View Payment
                    </Button>

                    <Button
                        size='$5'
                        mt="$5"
                        variant='outlined'
                        borderColor='#FF8C01'
                        w="100%"
                        color='#FF8C01'
                        br="$4"
                        onPress={onClose}
                    >
                        Done
                    </Button>
                </Card>
            </YStack>
        </Modal>
    )
}

export default AddPaymentScreen;
