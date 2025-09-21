{/* Filter Chips 
            <XStack paddingHorizontal={16} marginTop={16} space={8} ac={'center'}>
                <FilterChip icon="🔍" label="Filter" onPress={() => console.log('Filter pressed')} />
                <FilterChip icon="📅" label="This Month" onPress={() => console.log('Date pressed')} />
            </XStack>
            */}

{/* Heade
                <XStack space="$6">
                    <MaterialIcons name="search" size={27} color={colors.primary} />
                    <MaterialIcons name="more-vert" size={27} color={colors.primary} />
                   
                </XStack>
                 r */}

{/* Expense Table
<ScrollView style={{ paddingHorizontal: 16, marginTop: 16 }}>
    <YStack backgroundColor="$background" borderRadius={12} elevation="$1" overflow="hidden">
        <TableHeader />

        {expenses.map((expense) => (
            <TouchableOpacity key={expense.id} onPress={() => navigateToDetail(expense)}>
                <ExpenseRow
                    expense={expense}
                    StatusChip={StatusChip}
                />
            </TouchableOpacity>
        ))}
    </YStack>
</ScrollView>
 */ }

{/* FAB 
<Button
    circular
    icon={Plus}
    position="absolute"
    bottom={120}
    right={24}
    size="$5"
    backgroundColor="$blue9"
    color="white"
    onPress={() => setModalVisible(true)}
    elevate
/>

const TableHeader = () => (
    <XStack backgroundColor="$blue9" paddingVertical={12} paddingHorizontal={16}>
        <Text color="white" flex={3} fontWeight="bold" fontSize={14}>
            Description
        </Text>
        <Text color="white" flex={2} textAlign="left" fontWeight="bold" fontSize={14}>
            Amount
        </Text>
        <Text color="white" flex={2} textAlign="center" fontWeight="bold" fontSize={14}>
            Status
        </Text>
    </XStack>
);

const ExpenseRow = ({ expense, StatusChip, }: { expense: Expense; StatusChip: React.FC<{ status: ExpenseStatus }>; }) => (
    <YStack
        paddingHorizontal={16}
        paddingVertical={12}
        borderBottomWidth={1}
        borderColor="$gray4"
    >
        <XStack alignItems="center" marginBottom={4}>
            <YStack flex={3}>
                <Text fontSize={14} numberOfLines={1}>
                    {expense.description}
                </Text>
                <Text fontSize={12} color="$gray10" marginTop={2}>
                    {new Date(expense.date).toLocaleDateString()}
                </Text>
            </YStack>
            <Text flex={2} textAlign="right" fontSize={14} mr="$2" fontWeight="500">
                ${expense.amount.toFixed(2)}
            </Text>
            <YStack flex={2} alignItems="center" ml="$8">
                <StatusChip status={expense.status} />
            </YStack>
        </XStack>
    </YStack>
);
*/ }

import { GoalBackground } from "@/constants/GoalBackground";
import { useTheme } from "@/styles/ThemeContext";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import uuid from "react-native-uuid";
import { Button, Card, Input, ScrollView, Select, Text, XStack, YStack } from "tamagui";

const categories = [
    { label: "Education", icon: "school" },
    { label: "Medical", icon: "medical-bag" },
    { label: "Activities", icon: "soccer" },
    { label: "Clothing", icon: "tshirt-crew" },
    { label: "Childcare", icon: "baby-face-outline" },
    { label: "Other", icon: "dots-horizontal" },
];

export const AddExpenseScreen = ({ navigation, route }: any) => {
    const { colors } = useTheme();
    const childrenList = route?.params?.children || [{ id: "1", name: "Child 1" }];
    const [selectedChild, setSelectedChild] = useState(childrenList[0]?.id || "");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Other");
    const [split, setSplit] = useState("50");
    const [receiptUrl, setReceiptUrl] = useState("");

    const handleAdd = () => {
        if (!description || !amount) return;

        const newExpense = {
            id: uuid.v4().toString(),
            child_id: selectedChild,
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
            split_percentage: parseFloat(split),
            status: "pending",
            receipt_url: receiptUrl,
        };

        route?.params?.onAdd?.(newExpense);
        resetForm();
        navigation.goBack();
    };

    const resetForm = () => {
        setSelectedChild(childrenList[0]?.id || "");
        setDescription("");
        setAmount("");
        setCategory("Other");
        setSplit("50");
        setReceiptUrl("");
    };

    const handleAttachReceipt = () => {
        console.log("Attach receipt functionality");
    };

    return (
        <GoalBackground>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <YStack f={1} bg="transparent" p="$4" space="$4">
                    {/* Header */}
                    <XStack
                        space="$4"
                        padding="$2"
                        mt="$6"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                    >
                        <Button
                            unstyled
                            circular
                            pressStyle={{ opacity: 0.6 }}
                            onPress={navigation.goBack}
                            icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                        />
                        <Text color={colors.text} fontWeight="700"
                            fontSize="$6"
                            flex={1} marginHorizontal="$2">
                            Add Expense
                        </Text>
                    </XStack>

                    <ScrollView flex={1} keyboardShouldPersistTaps="handled">
                        <Card p="$2" borderRadius="$6" bg="transparent" space="$4">

                            {/* Select Child */}
                            <YStack space="$2">
                                <Text fontSize="$5" fontWeight="600" color="$blue10">
                                    Select Child Concerned
                                </Text>
                                <Select
                                    value={selectedChild}
                                    onValueChange={setSelectedChild}
                                    size="$4"
                                >
                                    {childrenList.map((child: any, index: number) => (
                                        <Select.Item key={child.id} value={child.id} index={index}>
                                            {child.name}
                                        </Select.Item>
                                    ))}
                                </Select>
                            </YStack>

                            {/* Description */}
                            <Input
                                placeholder="Description"
                                value={description}
                                onChangeText={setDescription}
                            />

                            {/* Amount */}
                            <Input
                                placeholder="Amount ($)"
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                            />

                            {/* Category */}
                            <YStack space="$2">
                                <Text fontSize="$5" fontWeight="600" color="$blue10">
                                    Category
                                </Text>
                                <XStack fw="wrap" gap="$2">
                                    {categories.map((cat) => (
                                        <Button
                                            key={cat.label}
                                            size="$3"
                                            theme={category === cat.label ? "active" : "alt2"}
                                            onPress={() => setCategory(cat.label)}
                                            iconAfter={
                                                <MaterialCommunityIcons
                                                    name={cat.icon as any}
                                                    size={16}
                                                    style={{ marginLeft: 4 }}
                                                />
                                            }
                                        >
                                            {cat.label}
                                        </Button>
                                    ))}
                                </XStack>
                            </YStack>

                            {/* Split */}
                            <YStack space="$2">
                                <Text fontSize="$5" fontWeight="600" color="$blue10">
                                    Split Percentage
                                </Text>
                                <Input
                                    keyboardType="numeric"
                                    value={split}
                                    onChangeText={setSplit}
                                />
                                <XStack jc="space-between" space="$2">
                                    {["25", "50", "75"].map((val) => (
                                        <Button key={val} size="$3" flex={1} onPress={() => setSplit(val)}>
                                            {val}%
                                        </Button>
                                    ))}
                                </XStack>
                            </YStack>

                            {/* Attach Receipt */}
                            <Button
                                size="$3"
                                borderStyle="dashed"
                                iconAfter={<MaterialCommunityIcons name="paperclip" size={16} />}
                                onPress={handleAttachReceipt}
                            >
                                Attach Receipt
                            </Button>
                        </Card>
                    </ScrollView>

                    {/* Footer */}
                    <XStack space="$3">
                        <Button
                            size="$4"
                            theme="alt2"
                            flex={1}
                            onPress={() => {
                                resetForm();
                                navigation.goBack();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="$4"
                            theme="active"
                            flex={1}
                            onPress={handleAdd}
                            disabled={!description || !amount}
                        >
                            Add Expense
                        </Button>
                    </XStack>
                </YStack>
            </TouchableWithoutFeedback>
        </GoalBackground>
    );
};


import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {
    Activity,
    Baby,
    BookOpen,
    Shirt,
    StepForward,
    Stethoscope,
    Utensils,
} from '@tamagui/lucide-icons';
import { useNavigation } from 'expo-router';
import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import {
    Avatar,
    Circle,
    H5,
    H6,
    Separator,
    Switch
} from 'tamagui';
import { LinearGradient } from 'tamagui/linear-gradient';

export const AddExpenseScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);

    const [selectedChild, setSelectedChild] = useState('1')
    const [reimbursement, setReimbursement] = useState('Kingsley')
    const [selectedCategory, setSelectedCategory] = useState('Food')
    const [showReimbursement, setShowReimbursement] = useState(false)
    const [amount, setAmount] = useState('250')

    const [splitMethod, setSplitMethod] = useState<"split" | "custom">("split");
    const [presetOption, setPresetOption] = useState<string>("50-50");
    const [customSplit, setCustomSplit] = useState({ you: "", coParent: "" });
    const [currency, setCurrency] = useState("USD");
    const [showPicker, setShowPicker] = useState(false)
    const currencyOptions = ["USD", "EUR", "GBP", "NGN"]

    // Memoized data
    const children = useMemo(() => [
        { id: '1', name: 'Kingsley', avatar: 'https://i.pravatar.cc/100?img=1' },
        { id: '2', name: 'Andre', avatar: 'https://i.pravatar.cc/100?img=2' },
        { id: '3', name: 'Sofia', avatar: 'https://i.pravatar.cc/100?img=3' },
    ], []);

    const categories = useMemo(() => [
        { name: 'Food', icon: Utensils },
        { name: 'Education', icon: BookOpen },
        { name: 'Child care', icon: Baby },
        { name: 'Clothing', icon: Shirt },
        { name: 'Medical', icon: Stethoscope },
        { name: 'Activities', icon: Activity },
        { name: 'Other', icon: StepForward },
    ], []);

    const splitOptions = useMemo(() => ["50-50", "25-75", "72-25", "70-30", "30-70", "90-10"], []);
    const reimbursementOptions = useMemo(() => ['Kingsley', 'Andre', 'Other'], []);

    // Helper functions
    const getSplitNumbers = (option: string) => {
        const [you, coParent] = option.split("-").map((n) => parseInt(n, 10));
        return { you, coParent };
    };

    const getTotalAmount = () => parseFloat(amount) || 0;

    const getSplitAmounts = useMemo(() => {
        const total = getTotalAmount();

        if (splitMethod === "split") {
            const { you, coParent } = getSplitNumbers(presetOption);
            return {
                you: (total * you) / 100,
                coParent: (total * coParent) / 100
            };
        } else {
            const youPercent = parseFloat(customSplit.you) || 0;
            const coParentPercent = parseFloat(customSplit.coParent) || 0;

            return {
                you: (total * youPercent) / 100,
                coParent: (total * coParentPercent) / 100
            };
        }
    }, [amount, splitMethod, presetOption, customSplit]);

    // Get selected child name
    const selectedChildName = useMemo(() => {
        const child = children.find(c => c.id === selectedChild);
        return child?.name || 'Unknown';
    }, [selectedChild, children]);

    return (
        <GoalBackground>
            <ScrollView
                p="$3"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <XStack
                    space="$4"
                    padding="$2"
                    mt="$5"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                >
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />

                    <Text color={colors.text} fontWeight="700"
                        fontSize="$6"
                        flex={1} marginHorizontal="$2">
                        Add Expense
                    </Text>
                </XStack>

                {/* Select Child */}
                <YStack mt="$4" mb='$4'>
                    <H6 mb="$2">Select Child Concerned</H6>

                    <Card bc="white" p="$3" br="$4">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
                        >
                            {children.map((child) => {
                                const active = selectedChild === child.id;
                                return (
                                    <TouchableOpacity
                                        key={child.id}
                                        onPress={() => setSelectedChild(child.id)}
                                        style={{
                                            alignItems: "center",
                                            marginRight: 16,
                                            padding: 14,
                                            borderRadius: 4,
                                            borderWidth: active ? 2 : 1,
                                            borderColor: active ? "#FF8C01" : colors.border as any,
                                            backgroundColor: active ? "#FEF4EC" : "transparent",
                                        }}
                                    >
                                        <Avatar size="$6" br="$10">
                                            <Avatar.Image src={child.avatar} />
                                            <Avatar.Fallback>{child.name[0]}</Avatar.Fallback>
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
                                );
                            })}
                        </ScrollView>
                    </Card>
                </YStack>

                {/* Description */}
                <YStack mb="$4">
                    <H6 mb="$2">Description</H6>
                    <Card p="$3" bg="white" borderRadius="$2">
                        <Text>School Snack</Text>
                    </Card>
                </YStack>

                {/* Amount */}
                <YStack mb="$4">
                    <H6 mb="$2">Amount</H6>
                    <XStack
                        bg="white"
                        borderWidth={1}
                        borderColor="$gray6"
                        borderRadius="$6"
                        ai="center"
                        p="$2"
                        space="$3"
                    >
                        {/* Currency Native Picker */}
                        <Picker
                            selectedValue={currency}
                            style={{ width: 110, height: 50 }}
                            onValueChange={(val) => setCurrency(val)}
                        >
                            {currencyOptions.map((curr) => (
                                <Picker.Item key={curr} label={curr} value={curr} />
                            ))}
                        </Picker>

                        {/* Amount Input */}
                        <Input
                            flex={1}
                            placeholder="0.00"
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={setAmount}
                            borderWidth={0}
                            fontSize="$6"
                            fontWeight="700"
                        />
                    </XStack>
                </YStack>

                {/* Date */}
                <YStack mb="$4">
                    <H6 mb="$2">Date</H6>
                    <TouchableOpacity onPress={() => setOpen(true)}>
                        <Card p="$3" bg="white" borderRadius="$4">
                            <Text>{date.toLocaleDateString()}</Text>
                        </Card>
                    </TouchableOpacity>
                    {open && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setOpen(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
                        />
                    )}
                </YStack>

                {/* Receipt */}
                <YStack mb="$4">
                    <H6 mb="$2">Receipt (Optional)</H6>
                    <Button bg="white" borderColor="$gray8" borderRadius="$2">
                        <Text>Upload receipt</Text>
                    </Button>
                </YStack>

                {/* Category */}
                <YStack mb="$4">
                    <H6 mb="$2">Category</H6>
                    <XStack flexWrap="wrap" jc="space-between">
                        {categories.map(({ name, icon: Icon }) => {
                            const active = selectedCategory === name;
                            return (
                                <TouchableOpacity
                                    key={name}
                                    style={{
                                        height: 66,
                                        margin: 4,
                                        marginBottom: 8,
                                        flexBasis: '30%',
                                        borderRadius: 12,
                                        borderColor: colors.border as any,
                                        overflow: 'hidden',
                                    }}
                                    onPress={() => setSelectedCategory(name)}
                                >
                                    {active ? (
                                        <LinearGradient
                                            colors={['#FF8C01', '#CFAC0C', '#E79C06', '#FF8C01']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                flex: 1,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderRadius: 12,
                                            }}
                                        >
                                            <YStack ai="center" space="$2">
                                                <Icon size={20} color="white" />
                                                <Text color="white">{name}</Text>
                                            </YStack>
                                        </LinearGradient>
                                    ) : (
                                        <YStack
                                            f={1}
                                            ai="center"
                                            jc="center"
                                            bg="white"
                                            br={12}
                                        >
                                            <YStack ai="center" space="$2">
                                                <Icon size={20} color="$color" />
                                                <Text color="$color">{name}</Text>
                                            </YStack>
                                        </YStack>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </XStack>
                </YStack>

                <YStack space="$4">
                    {/* Preset Split */}
                    <YStack>
                        <XStack ai="center" jc="space-between" onPress={() => setSplitMethod("split")} asChild>
                            <TouchableOpacity>
                                <XStack ai="center" space="$2">
                                    <Circle size={20} borderWidth={2} borderColor="#FF8C01" ai="center" jc="center">
                                        {splitMethod === "split" && <Circle size={10} bg="#FF8C01" />}
                                    </Circle>
                                    <H5>Preset Split Percentage</H5>
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
                                            <Text fontWeight="700">${getSplitAmounts.you.toFixed(2)}</Text>
                                        </XStack>
                                        <XStack jc="space-between" ai="center">
                                            <Text>Co-parent ({getSplitNumbers(presetOption).coParent}%)</Text>
                                            <Text fontWeight="700">${getSplitAmounts.coParent.toFixed(2)}</Text>
                                        </XStack>
                                    </YStack>
                                )}
                            </Card>
                        )}
                    </YStack>

                    {/* Custom Split */}
                    <YStack>
                        <XStack ai="center" jc="space-between" onPress={() => setSplitMethod("custom")} asChild>
                            <TouchableOpacity>
                                <XStack ai="center" space="$2">
                                    <Circle size={20} borderWidth={2} borderColor="#FF8C01" ai="center" jc="center">
                                        {splitMethod === "custom" && <Circle size={10} bg="#FF8C01" />}
                                    </Circle>
                                    <H5>Custom Split Percentage</H5>
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
                                            onChangeText={(val) => setCustomSplit({ ...customSplit, you: val })}
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
                                            onChangeText={(val) => setCustomSplit({ ...customSplit, coParent: val })}
                                        />
                                    </YStack>
                                </XStack>

                                {/* Calculated amounts */}
                                {!!customSplit.you && !!customSplit.coParent && (
                                    <YStack space="$3">
                                        <XStack jc="space-between" ai="center">
                                            <Text>You ({customSplit.you}%)</Text>
                                            <Text fontWeight="700">
                                                ${getSplitAmounts.you.toFixed(2)}
                                            </Text>
                                        </XStack>
                                        <XStack jc="space-between" ai="center">
                                            <Text>Co-parent ({customSplit.coParent}%)</Text>
                                            <Text fontWeight="700">
                                                ${getSplitAmounts.coParent.toFixed(2)}
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
                    >
                        <Text fontSize="$5" fontWeight="600" color="$color">
                            Reimbursement
                        </Text>

                        <Switch
                            checked={showReimbursement}
                            onCheckedChange={setShowReimbursement}
                            size="$3"
                            bc={showReimbursement ? "#FF8C01" : "$gray6"}
                        >
                            <Switch.Thumb
                                animation="quick"
                                bg="white"
                                scale={1.1}
                                shadowColor="rgba(0,0,0,0.2)"
                                shadowRadius={1}
                            />
                        </Switch>
                    </XStack>

                    {showReimbursement && (
                        <YStack mt="$2">
                            <Text color="$gray10" mb="$3">
                                Select who reimburses this expense
                            </Text>

                            <XStack space="$3" jc="space-between">
                                {reimbursementOptions.map((option) => {
                                    const isActive = reimbursement === option;
                                    const initials = option
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase();

                                    return (
                                        <TouchableOpacity
                                            key={option}
                                            style={{ flex: 1 }}
                                            onPress={() => setReimbursement(option)}
                                        >
                                            <Card
                                                p="$3"
                                                br="$6"
                                                bw={1}
                                                ai="center"
                                                jc="center"
                                                bg={isActive ? "#FFF6DF" : "white"}
                                                borderColor={isActive ? "#FF8C01" : "$gray6"}
                                                space="$2"
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
                                                    color={isActive ? "#FF8C01" : "$color"}
                                                >
                                                    {option}
                                                </Text>
                                            </Card>
                                        </TouchableOpacity>
                                    );
                                })}
                            </XStack>
                        </YStack>
                    )}
                </YStack>

                {/* Fixed bottom action row */}
                <XStack
                    jc="space-between"
                    ai="center"
                    px="$3"
                    space='$2'
                    mt='$8'
                >
                    <Button
                        flex={1}
                        mr="$2"
                        size='$5'
                        variant='outlined'
                        borderColor={colors.primary}
                        br="$3"
                        onPress={() => console.log("Cancel")}
                    >
                        Cancel
                    </Button>
                    <Button
                        flex={1}
                        ml="$2"
                        size='$5'
                        bg={colors.primary}
                        borderColor={colors.primary}
                        color={colors.onPrimary}
                        br="$3"
                        onPress={() => console.log("Save")}
                    >
                        Add Expense
                    </Button>
                </XStack>

            </ScrollView>
        </GoalBackground>
    );
};

export default AddExpenseScreen;



import { StackNavigationProp } from '@react-navigation/stack';

import { ChevronLeft, Receipt, Wallet } from '@tamagui/lucide-icons';
import React from 'react';
import { RefreshControl } from 'react-native';


type ExpenseDetailProps = {
    route: { params: { expense: any } }
    navigation: StackNavigationProp<any>
}

export const ExpenseDetailScreen = ({ navigation, route }: ExpenseDetailProps) => {
    const { colors } = useTheme()
    const { expense } = route.params
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const payShareAmount = (expense.amount * expense.split_percentage / 100).toFixed(2)

    const onRefresh = () => {
        setRefreshing(true);
    };

    const DetailItem = ({ label, value }: { label: string; value: string | number }) => (
        <>
            <XStack
                justifyContent="space-between"
                paddingVertical="$3"
                borderBottomWidth={1}
                borderBottomColor="rgba(0,0,0,0.1)"
            >
                <Text fontWeight="bold" color={colors.text}>
                    {label}
                </Text>
                <Text color={colors.text}>{value}</Text>
            </XStack>
        </>
    )

    return (

        <ScrollView
            flex={1}
            backgroundColor={colors.background}
            paddingHorizontal="$4"
            paddingTop="$4"
            contentContainerStyle={{ paddingBottom: 170 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.primary}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            <Button
                unstyled
                circular
                pressStyle={{ opacity: 0.6 }}
                onPress={navigation.goBack}
                icon={ChevronLeft}
            >
                <Text>Back</Text>
            </Button>

            <YStack
                flex={1}
                padding="$4"
                mt="$8"
                backgroundColor={colors.background}
            >
                <DetailItem label="Description:" value={expense.description} />
                <DetailItem label="Amount:" value={`$${expense.amount.toFixed(2)}`} />
                <DetailItem label="Category:" value={expense.category} />
                <DetailItem label="Date:" value={new Date(expense.date).toLocaleDateString()} />
                <DetailItem label="Split:" value={`${expense.split_percentage}%`} />

                {expense.receipt_url && (
                    <Button
                        icon={Receipt}
                        backgroundColor={colors.primary}
                        color={colors.onPrimary}
                        mt="$6"
                        mb="$4"
                        onPress={() => {
                            // View receipt action
                        }}
                    >
                        View Receipt
                    </Button>
                )}

                <Button
                    icon={Wallet}
                    backgroundColor={colors.success}
                    color={colors.onPrimary}
                    mt="$2"
                    onPress={() => {
                        // Make payment action
                    }}
                >
                    Pay Your Share (${payShareAmount})
                </Button>

            </YStack>
        </ScrollView>

    )
}

{/* Approval Options */ }
<YStack mt="$6" space="$4">
    {/* Approve and pay now */}
    <Button
        bg={approvalOption === "now" ? "$green8" : "transparent"}
        borderWidth={1}
        borderColor={approvalOption === "now" ? "$green8" : "$gray5"}
        onPress={() => setApprovalOption("now")}
        jc="flex-start"
        py="$7"
        br="$4"
    >
        <XStack ai="center" space="$3">
            {approvalOption === "now" ? (
                <Check size={20} color="white" />
            ) : (
                <Card circular size="$1" borderWidth={1} borderColor="$gray7" />
            )}
            <Text
                color={approvalOption === "now" ? "white" : colors.text}
                fontWeight="600"
            >
                Approve and pay Now
            </Text>
        </XStack>
    </Button>

    {/* Approve and pay later */}
    <Button
        bg={approvalOption === "later" ? "$blue8" : "transparent"}
        borderWidth={1}
        borderColor={approvalOption === "later" ? "$blue8" : "$gray5"}
        onPress={() => setApprovalOption("later")}
        jc="flex-start"
        br="$4"
    >
        <XStack ai="center" space="$3">
            {approvalOption === "later" ? (
                <Check size={20} color="white" />
            ) : (
                <Card circular size="$1" borderWidth={1} borderColor="$gray7" />
            )}
            <Text
                color={approvalOption === "later" ? "white" : "$gray12"}
                fontWeight="600"
            >
                Approve and pay later
            </Text>
        </XStack>
    </Button>

    {/* Reject */}
    <Button
        bg={approvalOption === "reject" ? "$red8" : "transparent"}
        borderWidth={1}
        borderColor={approvalOption === "reject" ? "$red8" : "$gray5"}
        onPress={() => setApprovalOption("reject")}
        jc="flex-start"
        br="$4"
    >
        <XStack ai="center" space="$3">
            {approvalOption === "reject" ? (
                <X size={20} color="white" />
            ) : (
                <Card circular size="$1" borderWidth={1} borderColor="$gray7" />
            )}
            <Text
                color={approvalOption === "reject" ? "white" : "$gray12"}
                fontWeight="600"
            >
                Reject
            </Text>
        </XStack>
    </Button>
</YStack>


<Button
    size="$5"
    mt="$9"
    w="100%"
    bg="#FF8C01"
    color="white"
    br="$4"
    onPress={() =>
        (navigation as any).navigate("ExpenseRecords", {
            screen: "Reimbursable"  // opens the Reimbursable tab directly
        })
    }
>
    View Expense
</Button>


onPress = {() => {
    onClose();
    navigation.navigate("ConfirmRequest", {
        description,
        amount,
        currency,
        requestedFromName,
        date,
        fileName,
    });
}}

import { RootStackParamList } from "@/navigation/MainNavigator";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { TouchableOpacity } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";

type ExpenseCardProps = {
    expenseId: string;
    title: string;
    amount: number;
    currency?: string;
    childName: string;
    date: string;
    category: string;
    categoryColor: string;
    status: "Pending Approval" | "Approved" | "Rejected" | "Paid" | "Pending" | "Reimburser";
    splitInfo: string;
    reimbursedBy: string;
    type?: "expense" | "payment" | "request";
    paymentData?: any;
    requestData?: any;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ExpenseCard = ({
    expenseId,
    title,
    amount,
    currency = "₦",
    childName,
    date,
    category,
    categoryColor,
    status,
    splitInfo,
    reimbursedBy,
    type = "expense",
    paymentData,
    requestData,
}: ExpenseCardProps) => {
    const navigation = useNavigation<NavigationProp>();

    const statusColors: Record<string, string> = {
        "Pending Approval": "#FFF0D5",
        "Approved": "#4ade80",
        "Rejected": "#f87171",
        "Paid": "#4ade80",
        "Pending": "#FFF0D5",
        "Reimburser": "#3b82f6",
    };
    const statusBg = statusColors[status] || "#FFF0D5";

    // Different designs for each tab type
    const tabDesigns = {
        expense: {
            borderTopColor: "#f97316",
            icon: "dollar-sign" as const,
            bgColor: "#FFF5E6"
        },
        payment: {
            borderTopColor: "#3b82f6",
            icon: "credit-card" as const,
            bgColor: "#EFF6FF"
        },
        request: {
            borderTopColor: "#8b5cf6",
            icon: "send" as const,
            bgColor: "#F5F3FF"
        }
    };

    const design = tabDesigns[type];

    const navigateToDetails = () => {
        switch (type) {
            case "payment":
                if (paymentData) {
                    navigation.navigate("ConfirmPayment", {
                        expense: {
                            id: expenseId,
                            title: title,
                            amount: amount,
                            currency: currency,
                            category: category,
                            date: date,
                            status: status,
                            children: { name: childName }
                        },
                        payment: paymentData
                    });
                } else {
                    // Fallback if no payment data
                    navigation.navigate("ExpenseDetails", { expenseId });
                }
                break;

            case "request":
                if (requestData) {
                    navigation.navigate("ConfirmRequest", {
                        requestId: requestData.id,
                        title: title,
                        description: title,
                        amount: requestData.amount || amount,
                        currency: requestData.currency || currency,
                        requestedFromId: requestData.requested_from_id,
                        requestedFromName: requestData.contactName || reimbursedBy,
                        dueDate: requestData.due_date || date,
                        status: requestData.status || status,
                        fileName: requestData.fileName
                    });
                } else {
                    if (expenseId) {
                        navigation.navigate("ExpenseDetails", { expenseId });
                    } else {
                        console.warn("No expenseId available for navigation");
                    }
                }
                break;


            case "expense":
            default:
                navigation.navigate("ExpenseDetails", { expenseId });
                break;
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={navigateToDetails}>
            <Card
                br="$4"
                p="$4"
                bw={1}
                height={176}
                borderColor="$gray5"
                borderTopColor={design.borderTopColor}
                borderTopWidth={8}
                bg='white'
            >
                <YStack space="$3" f={1}>
                    <XStack jc="space-between" ai="center">
                        <YStack>
                            <Text fow="700" fos="$5" color="$gray12">
                                {title}
                            </Text>
                            <Text color="$gray10" fos="$3">For {childName}</Text>
                        </YStack>
                        <Text fow="700" fos="$6" color="$gray12">
                            {currency}
                            {amount.toLocaleString()}
                        </Text>
                    </XStack>

                    {/* Middle Row */}
                    <XStack space="$2" ai="center" flexWrap="wrap" jc="space-between">
                        <XStack ai="center" space="$1">
                            <Feather name="calendar" size={14} color="#6b7280" />
                            <Text color="$gray10" fos="$2">{date}</Text>
                        </XStack>

                        <Text
                            bg={categoryColor}
                            color="white"
                            px="$2"
                            py={2}
                            br="$2"
                            fos="$2"
                            fow="600"
                        >
                            {category}
                        </Text>

                        <Text
                            bg={statusBg}
                            color="black"
                            px="$2"
                            py={2}
                            br="$2"
                            fos="$2"
                            fow="600"
                        >
                            {status}
                        </Text>
                    </XStack>

                    {/* Bottom Row */}
                    <XStack jc="space-between" ai="center" mt="$2">
                        <YStack>
                            <Text color="$gray10" fos="$2">{splitInfo}</Text>
                            {reimbursedBy && (
                                <Text color="$gray10" fos="$2">
                                    {type === "payment" ? "Paid to: " : "By: "}{reimbursedBy}
                                </Text>
                            )}
                        </YStack>

                        <XStack ai="center" space="$1">
                            <Text color="#059669" fow="600" fos="$2">
                                View {type === "expense" ? "Details" : type === "payment" ? "Payment" : "Request"}
                            </Text>
                            <Feather name={design.icon} size={14} color="#059669" />
                        </XStack>
                    </XStack>
                </YStack>
            </Card>
        </TouchableOpacity>
    );
};

export default ExpenseCard;