import { SuccessModal } from '@/components/expenses/SuccessModal'
import { currencyOptions } from '@/constants/Currency'
import { GoalBackground } from '@/constants/GoalBackground'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { Feather } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import {
    Activity, Baby, BookOpen, Shirt, StepForward, Stethoscope, Utensils
} from '@tamagui/lucide-icons'
import * as DocumentPicker from "expo-document-picker"
import { useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, TouchableOpacity } from 'react-native'
import {
    Avatar, Button, Card, Circle, H5, H6, Input,
    ScrollView, Separator, Switch, Text, XStack, YStack
} from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'

type Child = { id: string; name: string; photo?: string; age?: number }
type Contact = { id: string; name: string; photo?: string | null; user_id?: string }
type Category = { name: string; icon: React.ComponentType<any> }

export const AddExpenseScreen = () => {
    const { colors } = useTheme()
    const { user } = useAuth()
    const navigation = useNavigation()

    // core state
    const [date, setDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [successVisible, setSuccessVisible] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // data from db
    const [children, setChildren] = useState<Child[]>([])
    const [contacts, setContacts] = useState<Contact[]>([])

    // form state
    const [selectedChild, setSelectedChild] = useState<string>("")
    const [description, setDescription] = useState("")
    const [reimburser, setReimburser] = useState<string>("")
    const [selectedCategory, setSelectedCategory] = useState('Food')
    const [showReimbursement, setShowReimbursement] = useState(false)
    const [amount, setAmount] = useState('')
    const [currency, setCurrency] = useState("USD")
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null)

    // split state
    const [splitMethod, setSplitMethod] = useState<"split" | "custom">("split")
    const [presetOption, setPresetOption] = useState("50-50")
    const [customSplit, setCustomSplit] = useState({ you: "", coParent: "" })

    /** ─────────────── FETCHING ─────────────── **/
    useEffect(() => {
        if (!user?.id) return
        const fetchChildren = async () => {
            const { data } = await supabase
                .from("children")
                .select("*")
                .eq("user_id", user.id)
                .order("name")
            if (data) {
                setChildren(data)
                if (data.length > 0) setSelectedChild(data[0].id)
            }
        }
        fetchChildren()
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return
        const fetchContacts = async () => {
            const { data } = await supabase
                .from("family_contacts")
                .select("*")
                .eq("user_id", user.id)
                .order("name")
            if (data) setContacts(data)
        }
        fetchContacts()
    }, [user?.id])

    /** ─────────────── SPLIT LOGIC ─────────────── **/
    const splitOptions = useMemo(
        () => ["50-50", "25-75", "75-25", "70-30", "30-70", "90-10"],
        []
    )

    const getSplitNumbers = useCallback((opt: string) => {
        const [you, coParent] = opt.split("-").map(Number)
        return { you, coParent }
    }, [])

    const getTotalAmount = useCallback(() => parseFloat(amount) || 0, [amount])

    const getSplitAmounts = useMemo(() => {
        const total = getTotalAmount()
        if (splitMethod === "split") {
            const { you, coParent } = getSplitNumbers(presetOption)
            return { you: (total * you) / 100, coParent: (total * coParent) / 100 }
        }
        const youPercent = parseFloat(customSplit.you) || 0
        const coParentPercent = parseFloat(customSplit.coParent) || 0
        if (youPercent + coParentPercent !== 100) {
            return { you: 0, coParent: 0, invalid: true }
        }
        return {
            you: (total * youPercent) / 100,
            coParent: (total * coParentPercent) / 100,
            invalid: false,
        }
    }, [amount, splitMethod, presetOption, customSplit, getSplitNumbers, getTotalAmount])

    /** ─────────────── HELPERS ─────────────── **/
    const handleFilePick = useCallback(async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "application/pdf"],
                copyToCacheDirectory: true,
            })
            if (!res.canceled && res.assets.length > 0) setFile(res.assets[0])
        } catch {
            Alert.alert("Error", "Failed to select file. Please try again.")
        }
    }, [])

    const validateForm = useCallback(() => {
        if (!selectedChild) return Alert.alert("Error", "Please select a child"), false
        if (!amount || parseFloat(amount) <= 0) return Alert.alert("Error", "Enter a valid amount"), false
        if (splitMethod === "custom") {
            const youPercent = parseFloat(customSplit.you) || 0
            const coParentPercent = parseFloat(customSplit.coParent) || 0
            if (youPercent + coParentPercent !== 100) {
                return Alert.alert("Error", "Split percentages must add up to 100%"), false
            }
        }
        if (showReimbursement && !reimburser) {
            return Alert.alert("Error", "Please select who reimburses"), false
        }
        return true
    }, [selectedChild, amount, splitMethod, customSplit, showReimbursement, reimburser])

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowDatePicker(false)
        if (selectedDate) setDate(selectedDate)
    }

    /** ─────────────── SAVE ─────────────── **/
    const handleSave = useCallback(async () => {
        if (!validateForm()) return
        setIsLoading(true)

        try {
            const totalAmount = getTotalAmount()
            let yourPercentage = 0, coParentPercentage = 0
            let yourShare = 0, coParentShare = 0

            if (splitMethod === "split") {
                const { you, coParent } = getSplitNumbers(presetOption)
                yourPercentage = you; coParentPercentage = coParent
                yourShare = (totalAmount * you) / 100
                coParentShare = (totalAmount * coParent) / 100
            } else {
                yourPercentage = parseFloat(customSplit.you) || 0
                coParentPercentage = parseFloat(customSplit.coParent) || 0
                yourShare = (totalAmount * yourPercentage) / 100
                coParentShare = (totalAmount * coParentPercentage) / 100
            }

            // insert expense
            const { data: expenseData, error: expenseError } = await supabase
                .from("expenses")
                .insert({
                    title: description,
                    amount: totalAmount,
                    currency,
                    category: selectedCategory,
                    date: date.toISOString(),
                    payer_id: user?.id,
                    child_id: selectedChild,
                    reimburser: showReimbursement ? reimburser : null,
                    is_reimbursable: !!showReimbursement,
                    split_type: splitMethod,
                    your_share: yourShare,
                    co_parent_share: coParentShare,
                    your_percentage: yourPercentage,
                    co_parent_percentage: coParentPercentage,
                })
                .select("id")
                .single()

            if (expenseError || !expenseData) return Alert.alert("Error", "Failed to save expense.")

            const expenseId = expenseData.id

            // upload file
            if (file) {
                const ext = file.name.split(".").pop()
                const fileName = `${Date.now()}.${ext}`
                const filePath = `receipts/${user?.id}/${fileName}`

                const blob = await (await fetch(file.uri)).blob()
                const { error: uploadError } = await supabase.storage
                    .from("receipts")
                    .upload(filePath, blob, { contentType: file.mimeType || "application/octet-stream" })

                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(filePath)
                    await supabase.from("expense_attachments").insert({
                        expense_id: expenseId,
                        file_url: urlData.publicUrl,
                    })
                }
            }

            // add reimburser
            if (showReimbursement && reimburser) {
                const contact = contacts.find(c => c.name === reimburser)
                if (contact?.user_id) {
                    await supabase.from("expense_participants").insert({
                        expense_id: expenseId,
                        user_id: contact.user_id,
                        share_amount: totalAmount,
                        percentage: 100,
                        is_reimburser: true,
                    })
                }
            }

            setSuccessVisible(true)
        } catch {
            Alert.alert("Error", "Unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }, [
        validateForm, getTotalAmount, splitMethod, getSplitNumbers,
        presetOption, customSplit, description, currency,
        selectedCategory, date, user?.id, selectedChild,
        showReimbursement, reimburser, file, contacts
    ])

    /** ─────────────── CATEGORIES ─────────────── **/
    const categories = useMemo<Category[]>(() => [
        { name: 'Food', icon: Utensils },
        { name: 'Education', icon: BookOpen },
        { name: 'Child care', icon: Baby },
        { name: 'Clothing', icon: Shirt },
        { name: 'Medical', icon: Stethoscope },
        { name: 'Activities', icon: Activity },
        { name: 'Other', icon: StepForward },
    ], [])

    return (
        <GoalBackground>
            <ScrollView
                p="$3"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <XStack space="$4" padding="$2" mt="$5" jc="flex-start" ai="flex-start">
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />
                    <Text color={colors.text} fontWeight="700" fontSize="$6" flex={1} mx="$2">
                        Add Expense
                    </Text>
                </XStack>

                {/* Select Child */}
                <YStack mt="$4" mb='$3'>
                    <H6 mb="$2">Select Child Concerned</H6>
                    <Card bc="white" p="$3" br="$4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {children.map((child) => {
                                const active = selectedChild === child.id
                                const initials = child.name?.[0]?.toUpperCase() || "?"

                                return (
                                    <TouchableOpacity
                                        key={child.id}
                                        onPress={() => setSelectedChild(child.id)}
                                        style={{
                                            alignItems: "center",
                                            marginRight: 16,
                                            padding: 14,
                                            borderRadius: 12,
                                            borderWidth: active ? 2 : 1,
                                            borderColor: active ? "#FF8C01" : colors.border as any,
                                            backgroundColor: active ? "#FEF4EC" : "transparent",
                                        }}
                                    >
                                        <Avatar size="$6" br="$10">
                                            {child.photo ? (
                                                <Avatar.Image src={child.photo} />
                                            ) : null}
                                            <Avatar.Fallback bc="#FF8C01">
                                                <Text
                                                    fontSize="$10"
                                                    fontWeight="700"
                                                    color="white"
                                                    textAlign="center"
                                                    lineHeight={68}
                                                >
                                                    {initials}
                                                </Text>
                                            </Avatar.Fallback>
                                        </Avatar>
                                        <Text
                                            mt="$2"
                                            fontSize="$4"
                                            fontWeight={active ? "700" : "400"}
                                            color={colors.text}
                                        >
                                            {child.name}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </Card>
                </YStack>

                {/* Description */}
                <YStack mb="$3">
                    <H6 mb="$2">Description</H6>
                    <Input
                        placeholder="Description"
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
                                // Allow only numbers and decimal point
                                const formattedText = text.replace(/[^0-9.]/g, '');
                                // Ensure only one decimal point
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

                {/* Category */}
                <YStack mb="$3">
                    <H6 mb="$2">Category</H6>
                    <XStack flexWrap="wrap" jc="space-between">
                        {categories.map(({ name, icon: Icon }) => {
                            const active = selectedCategory === name;
                            return (
                                <TouchableOpacity
                                    key={name}
                                    style={{
                                        height: 80,
                                        margin: 4,
                                        flexBasis: '30%',
                                        borderRadius: 12
                                    }}
                                    onPress={() => setSelectedCategory(name)}
                                >
                                    {active ? (
                                        <LinearGradient
                                            colors={['#FF8C01', '#CFAC0C']}
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 12
                                            }}
                                        >
                                            <YStack ai="center" space="$2">
                                                <Icon size={20} color="white" />
                                                <Text color="white" fontSize="$3" textAlign="center">
                                                    {name}
                                                </Text>
                                            </YStack>
                                        </LinearGradient>
                                    ) : (
                                        <YStack
                                            f={1}
                                            ai="center"
                                            jc="center"
                                            bg="white"
                                            br={12}
                                            borderWidth={1}
                                            borderColor="$gray5"
                                        >
                                            <Icon size={20} color="$gray10" />
                                            <Text color="$gray10" fontSize="$3" textAlign="center" mt="$1">
                                                {name}
                                            </Text>
                                        </YStack>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </XStack>
                </YStack>

                {/* Expense Split Section */}
                <YStack mb="$3">
                    {/* Preset Split */}
                    <YStack mb="$3">
                        <XStack
                            ai="center"
                            jc="space-between"
                            onPress={() => setSplitMethod("split")}
                            asChild
                        >
                            <TouchableOpacity>
                                <XStack ai="center" space="$2">
                                    <Circle
                                        size={20}
                                        borderWidth={2}
                                        borderColor="#FF8C01"
                                        ai="center"
                                        jc="center"
                                    >
                                        {splitMethod === "split" && <Circle size={10} bg="#FF8C01" />}
                                    </Circle>
                                    <H5 fontSize="$5">Preset Split Percentage</H5>
                                </XStack>
                            </TouchableOpacity>
                        </XStack>

                        {splitMethod === "split" && (
                            <Card mt="$3" mb='$2' p="$4" br="$3" bg="white">
                                {/* Options */}
                                <XStack flexWrap="wrap" jc="space-between" mb="$4">
                                    {splitOptions.map((opt) => (
                                        <Button
                                            key={opt}
                                            m="$1"
                                            flexBasis="30%"
                                            onPress={() => setPresetOption(opt)}
                                            borderRadius="$6"
                                            borderWidth={1}
                                            borderColor={presetOption === opt ? "#FF8C01" : "$gray6"}
                                            bg={presetOption === opt ? "#FFF6DF" : "white"}
                                            hoverStyle={{ bg: presetOption === opt ? "#FFF6DF" : "$gray2" }}
                                        >
                                            <Text color={presetOption === opt ? "#FF8C01" : "$color"}>{opt}</Text>
                                        </Button>
                                    ))}
                                </XStack>

                                {/* Calculated amounts */}
                                {presetOption && (
                                    <YStack space="$3">
                                        <XStack jc="space-between" ai="center">
                                            <Text>You ({getSplitNumbers(presetOption).you}%)</Text>
                                            <Text fontWeight="700">
                                                {currency} {getSplitAmounts.you.toFixed(2)}
                                            </Text>
                                        </XStack>
                                        <XStack jc="space-between" ai="center">
                                            <Text>Co-parent ({getSplitNumbers(presetOption).coParent}%)</Text>
                                            <Text fontWeight="700">
                                                {currency} {getSplitAmounts.coParent.toFixed(2)}
                                            </Text>
                                        </XStack>
                                    </YStack>
                                )}
                            </Card>
                        )}
                    </YStack>

                    {/* Custom Split */}
                    <YStack>
                        <XStack
                            ai="center"
                            jc="space-between"
                            onPress={() => setSplitMethod("custom")}
                            asChild
                        >
                            <TouchableOpacity>
                                <XStack ai="center" space="$2">
                                    <Circle
                                        size={20}
                                        borderWidth={2}
                                        borderColor="#FF8C01"
                                        ai="center"
                                        jc="center"
                                    >
                                        {splitMethod === "custom" && <Circle size={10} bg="#FF8C01" />}
                                    </Circle>
                                    <H5 fontSize="$5">Custom Split Percentage</H5>
                                </XStack>
                            </TouchableOpacity>
                        </XStack>

                        {splitMethod === "custom" && (
                            <Card mt="$3" p="$4" br="$3" bg="white">
                                {/* Inputs */}
                                <XStack space="$4" jc="space-evenly" mb="$4">
                                    <YStack ai="center" space="$2">
                                        <Text>You</Text>
                                        <Input
                                            width={80}
                                            textAlign="center"
                                            keyboardType="numeric"
                                            placeholder="%"
                                            value={customSplit.you}
                                            onChangeText={(val) => setCustomSplit({ ...customSplit, you: val.replace(/[^0-9]/g, '') })}
                                            maxLength={3}
                                        />
                                    </YStack>
                                    <YStack ai="center" space="$2">
                                        <Text>Co-parent</Text>
                                        <Input
                                            width={80}
                                            textAlign="center"
                                            keyboardType="numeric"
                                            placeholder="%"
                                            value={customSplit.coParent}
                                            onChangeText={(val) => setCustomSplit({ ...customSplit, coParent: val.replace(/[^0-9]/g, '') })}
                                            maxLength={3}
                                        />
                                    </YStack>
                                </XStack>

                                {/* Validation message */}
                                {getSplitAmounts.invalid && (
                                    <Text color="red" fontSize="$2" textAlign="center" mb="$3">
                                        Percentages must add up to 100%
                                    </Text>
                                )}

                                {/* Calculated amounts */}
                                {!!customSplit.you && !!customSplit.coParent && !getSplitAmounts.invalid && (
                                    <YStack space="$3">
                                        <XStack jc="space-between" ai="center">
                                            <Text>You ({customSplit.you}%)</Text>
                                            <Text fontWeight="700">
                                                {currency} {getSplitAmounts.you.toFixed(2)}
                                            </Text>
                                        </XStack>
                                        <XStack jc="space-between" ai="center">
                                            <Text>Co-parent ({customSplit.coParent}%)</Text>
                                            <Text fontWeight="700">
                                                {currency} {getSplitAmounts.coParent.toFixed(2)}
                                            </Text>
                                        </XStack>
                                    </YStack>
                                )}
                            </Card>
                        )}
                    </YStack>
                </YStack>

                <Separator mb="$4" />

                {/* Reimbursement */}
                <YStack mb="$4">
                    <XStack
                        ai="center"
                        jc="space-between"
                        mb="$3"
                        px="$4"
                        py="$4"
                        bg="white"
                        br="$4"
                    >
                        <Text fontSize="$5" fontWeight="600">Reimbursement</Text>
                        <Switch
                            checked={showReimbursement}
                            onCheckedChange={setShowReimbursement}
                            size="$3"
                            bc={showReimbursement ? "#FF8C01" : "$gray6"}
                        >
                            <Switch.Thumb animation="quick" bg="white" />
                        </Switch>
                    </XStack>

                    {showReimbursement && (
                        <YStack mt="$2">
                            <Text color="$gray10" mb="$3">Select who reimburses this expense</Text>
                            <XStack space="$3" jc="space-between" flexWrap="wrap">
                                {contacts.map((contact) => {
                                    const isActive = reimburser === contact.name;
                                    const initials = contact.name?.[0]?.toUpperCase() || "?";
                                    return (
                                        <TouchableOpacity
                                            key={contact.id}
                                            onPress={() => setReimburser(contact.name)}
                                            style={{
                                                alignItems: "center",
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
                                                            height: "100%", lineHeight: 68,
                                                            borderRadius: 999
                                                        }}
                                                    >
                                                        {initials || "?"}
                                                    </Text>
                                                </Avatar.Fallback>
                                            </Avatar>
                                            <Text
                                                fontSize="$4"
                                                fontWeight={isActive ? "700" : "400"}
                                                color={colors.text}
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
                    )}
                </YStack>

                {/* Action Row */}
                <XStack jc="space-between" ai="center" px="$3" space='$2' mt='$8'>
                    <Button
                        flex={1}
                        mr="$2"
                        size='$5'
                        variant='outlined'
                        color={colors.text}
                        borderColor={colors.primary}
                        br="$3"
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        flex={1}
                        ml="$2"
                        size='$5'
                        bc={colors.primary}
                        color={colors.onPrimary}
                        br="$3"
                        onPress={handleSave}
                        disabled={isLoading}
                        opacity={isLoading ? 0.7 : 1}
                    >
                        {isLoading ? "Adding..." : "Add Expense"}
                    </Button>
                </XStack>

            </ScrollView>
            < SuccessModal visible={successVisible} onClose={() => setSuccessVisible(false)} />
        </GoalBackground>
    );
};

export default AddExpenseScreen;