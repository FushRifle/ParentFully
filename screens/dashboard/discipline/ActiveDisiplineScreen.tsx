import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pen } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";

type ActiveDisciplineRouteProp = RouteProp<
    RootStackParamList,
    "ActiveDiscipline"
>;

type DisciplineDetailsNav = NativeStackNavigationProp<
    RootStackParamList,
    "DisciplineDetails"
>;

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

type Child = {
    id: string;
    name: string;
    photo?: string;
    age?: number;
};

type DisciplinePlan = {
    id: string;
    name: string;
    description: string;
    strategy?: string;
    consequences?: string;
    rewards?: string;
    notes?: string;
    icon?: string;
    rules: RuleSet[];
    ageRange?: string;
    isPreloaded?: boolean;
    user_id?: string;
    child_id?: string;
    created_at?: string;
};

const ActiveDisciplineScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<DisciplineDetailsNav>();

    const route = useRoute<ActiveDisciplineRouteProp>();
    const [plans, setPlans] = useState<DisciplinePlan[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [myPlans, setMyPlans] = useState<DisciplinePlan[]>([]);
    const [templates, setTemplates] = useState<DisciplinePlan[]>([]);
    const [allPlans, setAllPlans] = useState<DisciplinePlan[]>([]);

    const fetchUserPlans = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("discipline_plans")
                .select("*")
                .eq("user_id", user?.id)
                .order("id", { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching user plans:", err);
            return [];
        }
    }, [user?.id]);

    const fetchChildren = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("children")
                .select("id, name");

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching children:", err);
            return [];
        }
    }, []);

    const loadPlansAndChildren = useCallback(async () => {
        setLoading(true);
        const [plansData, childrenData] = await Promise.all([
            fetchUserPlans(),
            fetchChildren(),
        ]);
        setPlans(plansData);
        setChildren(childrenData);
        setLoading(false);
    }, [fetchUserPlans, fetchChildren]);

    useEffect(() => {
        loadPlansAndChildren();
    }, [loadPlansAndChildren]);

    const getChildName = (childId?: string) => {
        if (!childId) return "Unknown";
        const child = children.find((c) => c.id === childId);
        return child ? child.name : "Unknown";
    };

    const handlePrintAllPlans = (plans: DisciplinePlan[], childName: string) => {
        if (!plans || plans.length === 0) return;
        navigation.navigate("Print", {
            allPlans: JSON.stringify(plans),
            childName,
        });
    };

    const handleEdit = (plan: DisciplinePlan) => {
        navigation.navigate("DisciplineDetails", {
            id: plan.id,
            name: plan.name,
            description: plan.notes || plan.description || "",
            rules: plan.rules || [],
            icon: plan.icon || "calendar-check",
        });
    };

    const renderDisciplineCard = (tpl: DisciplinePlan) => {
        const isSelected = selectedIds.includes(tpl.id);
        return (
            <TouchableOpacity
                key={tpl.id}
            >
                <Card
                    padding="$5"
                    borderRadius="$5"
                    height={184}
                    marginBottom="$3"
                    borderWidth={2}
                    backgroundColor={isSelected ? colors.card : "white"}
                    borderColor={isSelected ? colors.primary : (colors.border as any)}
                >
                    <XStack ai="center" jc="space-between" mb="$2" f={1}>
                        <XStack ai="center" space="$4" f={1}>
                            <YStack f={1} space="$2">
                                <YStack jc="flex-start" space="$2" mt="$1">
                                    <Text fontSize="$6" fontWeight="700" color="#333">
                                        {tpl.name}
                                    </Text>
                                    <Text fontSize="$4" fontWeight="600" color="#008CFF">
                                        {tpl.rules?.length || 0} rule(s)
                                    </Text>
                                </YStack>

                                <Text fontSize="$4" color={colors.textSecondary}>
                                    Assigned to: {getChildName(tpl.child_id)} on{" "}
                                    {tpl.created_at
                                        ? new Date(tpl.created_at).toLocaleDateString()
                                        : "N/A"}
                                </Text>

                                <XStack ai="center" jc="flex-start" space="$4" mt="$4">
                                    {/* Edit */}
                                    <Button
                                        size="$3"
                                        backgroundColor="#DDEEFF"
                                        px="$3"
                                        br="$3"
                                        onPress={() => handleEdit(tpl)}
                                    >
                                        <XStack ai="center" space="$2" py="$2">
                                            <Pen size={18} color="#0080FF" />
                                            <Text color="#0080FF" fontSize="$4" fontWeight="600">
                                                Edit
                                            </Text>
                                        </XStack>
                                    </Button>

                                    {/* Download */}
                                    <Button
                                        size="$3"
                                        br="$3"
                                        backgroundColor="#FFF0DE"
                                        px="$3"
                                        onPress={() => navigation.navigate("Print", { printAll: true })}
                                    >
                                        <XStack ai="center" space="$2" py="$2">
                                            <Feather name="download" size={16} color={colors.primary} />
                                            <Text color={colors.primary} fontSize="$4" fontWeight="600">
                                                Download
                                            </Text>
                                        </XStack>
                                    </Button>

                                    {/* Print */}
                                    <Button
                                        size="$3"
                                        backgroundColor="#E3FFF2"
                                        px="$3"
                                        br="$6"
                                        onPress={() => handlePrintAllPlans(allPlans, getChildName(tpl.child_id))}
                                    >
                                        <XStack ai="center" space="$2" py="$2">
                                            <Feather name="printer" size={18} color={colors.secondary} />
                                            <Text color={colors.secondary} fontSize="$4" fontWeight="600">
                                                Print
                                            </Text>
                                        </XStack>
                                    </Button>
                                </XStack>
                            </YStack>
                        </XStack>
                    </XStack>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                <YStack space="$4" mt="$6">
                    <XStack space="$4" ai="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                        </TouchableOpacity>
                        <Text fontSize="$7" fontWeight="700" color={colors.text}>
                            Active Plans
                        </Text>
                    </XStack>
                    <Text fontSize="$5" color="#555">
                        See what’s in progress for your child right now
                    </Text>
                </YStack>

                <YStack space="$3" mt='$3'>
                    {loading && <Text color={colors.text}>Loading plans...</Text>}

                    {!loading && plans.length === 0 && (
                        <Text color={colors.text}>No active plans found.</Text>
                    )}

                    {!loading && plans.map((plan) => renderDisciplineCard(plan))}
                </YStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default ActiveDisciplineScreen;
