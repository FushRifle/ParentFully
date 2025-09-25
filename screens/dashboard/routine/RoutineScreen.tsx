import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView } from "react-native";
import { Card, H4, H5, View, XStack, YStack } from "tamagui";


type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: "low" | "medium" | "high";
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

type RoutineTemplate = {
    id: string;
    name: string;
    ageRange?: string;
    description?: string;
    tasks: (string | TemplateTask)[];
    notes?: string;
    isPreloaded?: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    categories?: string[];
};

type Child = {
    id: string;
    name: string;
    age: number;
};

const RoutineScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);

    // Template state
    const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
    const [activeCount, setActiveCount] = useState(0);
    const [templateCount, setTemplateCount] = useState(0);

    const fetchRoutineTasks = useCallback(async () => {
        try {
            let query = supabase
                .from("routine_tasks")
                .select("routine_name, child_id")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (selectedChild) {
                query = query.eq("child_id", selectedChild.id);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching routine tasks:", err);
            return [];
        }
    }, [user?.id, selectedChild?.id]);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch user's routine templates
            const { data, error: fetchError } = await supabase
                .from("routine_templates")
                .select("*")
                .order("created_at", { ascending: true });

            if (fetchError) throw fetchError;

            // Fetch routine tasks to count active routines
            const routineTasksData = await fetchRoutineTasks();

            // Count unique routine names
            const uniqueNames = new Set(
                routineTasksData.map((task) => task.routine_name).filter(Boolean)
            );
            setActiveCount(uniqueNames.size);

            const userTemplates = data || [];

            // Total templates = User templates + Preloaded
            setTemplateCount(userTemplates.length);

            // Store User templates + Preloaded together
            setTemplateCount(userTemplates.length);
        } catch (err) {
            console.error("Error fetching templates:", err);
            setError("Failed to load templates");
        } finally {
            setLoading(false);
        }
    }, [fetchRoutineTasks]);

    const fetchChildren = useCallback(async () => {
        try {
            const { data, error } = await supabase.from("children").select("*");
            if (error) throw error;

            setChildren(data || []);

            // auto-pick first child if none selected
            if (data && data.length > 0 && !selectedChild) {
                setSelectedChild(data[0]);
            }
        } catch (err) {
            console.error("Error fetching children:", err);
        }
    }, [selectedChild]);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    return (
        <GoalBackground>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                {/* Hero Illustration */}
                <YStack ai="center" mt="$4" mb="$5">
                    <Image
                        source={require("@/assets/illustration/amico.png")}
                        style={{
                            width: 368,
                            top: 35,
                            height: 348,
                            resizeMode: "contain",
                        }}
                    />
                </YStack>

                {/* Section Header */}
                <YStack px="$4" mb="$5">
                    <H5 fontWeight="600" color={colors.text}>
                        Routine
                    </H5>
                    <Text fontWeight="500" color="#555">
                        Create structured Routines that support positive behavior and growth
                    </Text>
                </YStack>

                {/* Stat Cards */}
                <XStack px="$4" space="$3" mb="$5">
                    <Card
                        flex={1}
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor="white"
                    >
                        <H4 color="#FF8C01" fontWeight="600">
                            {activeCount}
                        </H4>
                        <Text color="#555">
                            Active Plans
                        </Text>
                    </Card>

                    <Card
                        flex={1}
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor="white"
                    >
                        <H4 color="#4CAF50" fontWeight="600">
                            {templateCount}
                        </H4>
                        <Text color="#555">
                            Templates
                        </Text>
                    </Card>
                </XStack>

                {/* Action Cards */}
                <YStack px="$4" space="$3">
                    {/* Active Routine */}
                    <Card
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor="white"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => {
                            if (!selectedChild) {
                                console.warn("No child selected");
                                return;
                            }
                            navigation.navigate("ActiveRoutine", { childId: selectedChild.id });
                        }}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space="$3">
                                <MaterialCommunityIcons
                                    name="star"
                                    size={24}
                                    color={colors.secondary}
                                />
                                <YStack>
                                    <Text fontWeight="700" color={colors.text}>
                                        Active Routine
                                    </Text>
                                    <Text color="#666">
                                        Your kid's current routine at a glance
                                    </Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color="#999"
                            />
                        </XStack>
                    </Card>

                    {/* Use Template */}
                    <Card
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor={colors.secondary}
                        pressStyle={{ opacity: 0.9 }}
                        onPress={() => navigation.navigate("Routine")}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space="$3">
                                <MaterialCommunityIcons
                                    name="file-document-outline"
                                    size={24}
                                    color="white"
                                />
                                <YStack>
                                    <Text fontWeight="700" color="white">
                                        Use Template
                                    </Text>
                                    <Text fontSize={11} color="#EEE">
                                        Start with recommendations from experts
                                    </Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color="white"
                            />
                        </XStack>
                    </Card>

                    {/* Create Custom Routine */}
                    <Card
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor="white"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => navigation.navigate("AddRoutine")}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space="$3">
                                <View
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 24,
                                        backgroundColor: "#FFEAD3",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name="plus-circle-outline"
                                        size={24}
                                        color={colors.primary}
                                    />
                                </View>

                                <YStack>
                                    <Text fontWeight="700" color={colors.text}>
                                        Create custom Routine
                                    </Text>
                                    <Text color="#666">Build from scratch</Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons
                                name="chevron-right"
                                size={24}
                                color="#999"
                            />
                        </XStack>
                    </Card>
                </YStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default RoutineScreen;
