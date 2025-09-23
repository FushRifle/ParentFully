import { Text } from '@/context/GlobalText';
import { supabase } from "@/supabase/client";
import { Activity, Baby, BookOpen, Shirt, StepForward, Stethoscope, Utensils, Wallet2 } from "@tamagui/lucide-icons";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Card, XStack, YStack } from "tamagui";

type ExpenseType = {
    expenseId: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    categoryColor: string;
    date: string;
    childName: string;
    status: string;
    splitInfo: string;
    reimburser: string;
};

// Define categories with icons
const CATEGORIES = [
    { name: 'Food', icon: Utensils },
    { name: 'Education', icon: BookOpen },
    { name: 'Child care', icon: Baby },
    { name: 'Clothing', icon: Shirt },
    { name: 'Medical', icon: Stethoscope },
    { name: 'Activities', icon: Activity },
    { name: 'Other', icon: StepForward },
];

export const ExpensesByCategory = () => {
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchExpenses = useCallback(async () => {
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

        if (error) {
            console.error(error);
            return;
        }

        const formatted = (data || []).map((exp: any) => ({
            expenseId: exp.id,
            id: exp.id,
            title: exp.title,
            amount: Number(exp.amount ?? 0),
            currency: exp.currency ?? "₦",
            category: exp.category ?? "Other",
            categoryColor: '#4f46e5', // default color, can override
            date: exp.date ?? "",
            childName: exp.children?.name ?? "Unknown",
            status: exp.status ?? "Pending Approval",
            splitInfo: `${exp.your_percentage ?? 50}% - ${exp.co_parent_percentage ?? 50}% Split`,
            reimburser: exp.reimburser,
        }));

        setExpenses(formatted);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    if (loading) return

    <XStack ai='center' jc='center' mt='$6'>
        <Text>Loading...</Text>
    </XStack>
        ;

    if (expenses.length === 0) {
        return (
            <YStack ai="center" jc="center" mt="$6">
                <Card
                    backgroundColor="#fff8e1"
                    padding="$6"
                    borderRadius={16}
                    elevation={3}
                    ai="center"
                    jc="center"
                    width="90%"
                    space="$4"
                    borderWidth={1}
                    borderColor="#FFD54F"
                >
                    <Wallet2 size={30} color="#FFA726" />
                    <Text color="#FFA726" fontWeight="700">
                        No Expenses Created
                    </Text>
                    <Text color="#888" textAlign="center">
                        Start adding your expenses to see them by category.
                    </Text>
                </Card>
            </YStack>
        );
    }

    // Build categories data with total, currency, color
    const categoriesData = CATEGORIES.map((cat) => {
        const catExpenses = expenses.filter((e) => e.category === cat.name);
        const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
        const currency = catExpenses[0]?.currency || '₦';
        const color = catExpenses[0]?.categoryColor || '#4f46e5';
        return {
            ...cat,
            total,
            currency,
            color,
        };
    }).filter(c => c.total > 0); // optional: only show categories with expenses

    const grandTotal = categoriesData.reduce((sum, c) => sum + c.total, 0);

    return (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
            <YStack space="$4">
                {categoriesData.map((c) => {
                    const percent = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;

                    return (
                        <Card
                            key={c.name}
                            padding="$4"
                            borderRadius={12}
                            elevation={2}
                            backgroundColor="#fff"
                        >
                            <XStack justifyContent="space-between" alignItems="center">
                                <XStack alignItems="center" space="$3">
                                    <YStack
                                        width={40}
                                        height={40}
                                        ai="center"
                                        jc="center"
                                        borderRadius={20}
                                        backgroundColor={c.color}
                                    >
                                        <c.icon size={20} color="#fff" />
                                    </YStack>
                                    <Text fontWeight="600">
                                        {c.name}
                                    </Text>
                                </XStack>
                                <YStack ai="flex-end">
                                    <Text fontWeight="700">
                                        {c.currency} {c.total.toFixed(2)}
                                    </Text>
                                    <Text color="#888">
                                        {percent.toFixed(0)}%
                                    </Text>
                                </YStack>
                            </XStack>

                            <View
                                style={{
                                    height: 8,
                                    backgroundColor: '#e5e7eb',
                                    borderRadius: 4,
                                    overflow: 'hidden',
                                    marginTop: 8,
                                }}
                            >
                                <View
                                    style={{
                                        height: 8,
                                        width: `${percent}%`,
                                        backgroundColor: c.color,
                                    }}
                                />
                            </View>
                        </Card>
                    );
                })}
            </YStack>
        </ScrollView>
    );
};
