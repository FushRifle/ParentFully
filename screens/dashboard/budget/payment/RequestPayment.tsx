import { currencyOptions } from "@/constants/Currency";
import { GoalBackground } from "@/constants/GoalBackground";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";
import { CheckCircle2 } from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState } from "react";
import { Alert, Modal, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Avatar, Button, Card, Input, Text, XStack, YStack } from "tamagui";

const RequestPaymentScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("0.00");
    const [currency, setCurrency] = useState(currencyOptions[0]);
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [requestedFrom, setRequestedFrom] = useState<string | null>(null);
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [successVisible, setSuccessVisible] = useState(false);
    const [contacts, setContacts] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser({
                    name: user.user_metadata?.name || user.email?.split('@')[0] || "You",
                    email: user.email || ""
                });
            }

            const { data, error } = await supabase
                .from('family_contacts')
                .select('id, name, user_id')
                .order('name');

            if (error) {
                console.log('Error fetching contacts:', error.message);
                Alert.alert("Error", "Failed to fetch contacts.");
            } else if (data) {
                setContacts(data);
            }
        };

        fetchData();
    }, []);

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
        } catch {
            Alert.alert("Error", "Failed to select file. Please try again.");
        }
    };

    const handleSavePaymentRequest = async () => {
        if (!requestedFrom) {
            Alert.alert("Error", "Please select who should make the payment");
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            Alert.alert("Error", "Please enter a valid amount");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Error", "Please enter a title for the payment request");
            return;
        }

        setIsLoading(true);

        try {
            // create payment request
            const { data: requestData, error: requestError } = await supabase
                .from("payment_requests")
                .insert({
                    amount: parseFloat(amount),
                    currency,
                    title: title.trim(),
                    due_date: date.toISOString(),
                    requested_from_id: requestedFrom,
                    status: "pending",
                    requester_id: (await supabase.auth.getUser()).data.user?.id
                })
                .select("id")
                .single();

            if (requestError) {
                throw new Error(`Failed to create payment request: ${requestError.message}`);
            }

            // upload attachment
            if (file) {
                const ext = file.name.split(".").pop();
                const fileName = `${Date.now()}.${ext}`;
                const filePath = `request_attachments/${requestData.id}/${fileName}`;

                const response = await fetch(file.uri);
                const blob = await response.blob();

                const { error: uploadError } = await supabase.storage
                    .from("request_attachments")
                    .upload(filePath, blob, {
                        contentType: file.mimeType || "application/octet-stream",
                        upsert: true,
                    });

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from("request_attachments")
                        .getPublicUrl(filePath);

                    await supabase.from("request_attachments").insert({
                        request_id: requestData.id,
                        file_url: urlData.publicUrl,
                    });
                }
            }

            setSuccessVisible(true);
        } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to create payment request");
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
                        Request Payment
                    </Text>
                </XStack>

                {/* Requesting From (You) */}
                <YStack mb="$4" bg="white" p="$3" br="$4">
                    <Text mb="$2" fontSize='$5' fontWeight="600">Requesting From</Text>
                    <XStack ai="center" space="$3">
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
                                    {currentUser?.name?.[0]?.toUpperCase() || "Y"}
                                </Text>
                            </Avatar.Fallback>
                        </Avatar>
                        <YStack>
                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                {currentUser?.name || "You"}
                            </Text>
                            <Text fontSize="$3" color="$gray10">
                                {currentUser?.email || ""}
                            </Text>
                        </YStack>
                    </XStack>
                </YStack>

                <Text mb="$3" fontSize='$5' fontWeight="600">Who should make the payment?</Text>

                {/* Contacts */}
                <Card br="$8" bg="transparent" space='$3'>
                    <YStack mb="$4" bg='white' p="$3" br="$4">
                        <XStack space="$3" flexWrap="wrap">
                            {contacts.map((contact) => {
                                const isActive = requestedFrom === contact.id;
                                const initials = contact.name?.[0]?.toUpperCase() || "?";
                                return (
                                    <TouchableOpacity
                                        key={contact.id}
                                        onPress={() => setRequestedFrom(contact.id)}
                                        style={{
                                            alignItems: "center",
                                            marginBottom: 12,
                                            marginRight: 16,
                                            padding: 14,
                                            borderRadius: 12,
                                            borderWidth: isActive ? 2 : 1,
                                            borderColor: isActive ? "#FF8C01" : colors.border as any,
                                            backgroundColor: isActive ? "#FEF4EC" : "transparent",
                                        }}
                                    >
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
                                                    {initials}
                                                </Text>
                                            </Avatar.Fallback>
                                        </Avatar>
                                        <Text
                                            fontSize="$4"
                                            fontWeight={isActive ? "700" : "400"}
                                            color={isActive ? "#FF8C01" : "$gray12"}
                                            mt="$2"
                                            textAlign="center"
                                        >
                                            {contact.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </XStack>
                    </YStack>

                    {/* Amount */}
                    <YStack mb="$3">
                        <Text mb="$3" fontSize='$5' fontWeight="600">How much do you need?</Text>
                        <XStack bg="white" br="$6" ai="center" p="$2" space="$3">
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

                    {/* Title */}
                    <YStack mb="$3">
                        <Text mb="$3" fontSize='$5' fontWeight="600">Title</Text>
                        <Input
                            placeholder="Enter request title"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </YStack>

                    {/* Due Date */}
                    <YStack mb="$3">
                        <Text mb="$3" fontSize='$5' fontWeight="600">Payment due date?</Text>
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
                                minimumDate={new Date()}
                            />
                        )}
                    </YStack>

                    {/* Attachment (Optional) */}
                    <YStack mb="$3">
                        <Text mb="$3" fontSize='$5' fontWeight="600">Attachment (Optional)</Text>
                        <Button
                            bg="white"
                            bc="white"
                            br="$2"
                            onPress={handleFilePick}
                            icon={file ? <Feather name="check" size={16} /> : undefined}
                        >
                            <Text>{file ? file.name : "Upload attachment"}</Text>
                        </Button>
                        {file && (
                            <Text mt="$2" fontSize="$2" color="$gray10">
                                Tap to change file
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
                            onPress={handleSavePaymentRequest}
                            disabled={isLoading}
                            opacity={isLoading ? 0.7 : 1}
                        >
                            {isLoading ? "Creating..." : "Request Payment"}
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
                title={title}
                amount={amount}
                currency={currency}
                requestedFromId={requestedFrom}
                contacts={contacts}
                date={date}
                fileName={file?.name}
                currentUserName={currentUser?.name || "You"}
            />
        </GoalBackground>
    );
};

type SuccessModalProps = {
    visible: boolean;
    onClose: () => void;
    message?: string;
    title: string;
    amount: string | number;
    currency: string;
    requestedFromId: string | null;
    contacts: { id: string; name: string }[];
    date: Date;
    fileName?: string;
    currentUserName: string;
};

const SuccessModal = ({
    visible,
    onClose,
    message = "Payment Request Sent Successfully!",
    title,
    amount,
    currency,
    requestedFromId,
    contacts,
    date,
    fileName,
    currentUserName,
}: SuccessModalProps) => {
    const navigation = useNavigation();
    const requestedFromName = contacts.find(c => c.id === requestedFromId)?.name || "";

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <YStack f={1} jc="center" ai="center" bg="rgba(0,0,0,0.4)">
                <Card w={350} h="50%"
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
                        {currentUserName} → {requestedFromName}
                    </Text>

                    <Button
                        size="$5"
                        mt="$6"
                        w="100%"
                        bg="#FF8C01"
                        color="white"
                        br="$4"
                        onPress={() =>
                            (navigation as any).navigate("ExpenseRecords", {
                                screen: "Request"
                            })
                        }
                    >
                        View Requests
                    </Button>

                    <Button
                        size="$5"
                        mt="$3"
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
    );
};

export default RequestPaymentScreen;
