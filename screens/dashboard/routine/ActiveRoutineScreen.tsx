import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronRight } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card, Text, View, XStack, YStack } from "tamagui";

type ActiveRoutineRouteProp = RouteProp<
    RootStackParamList,
    "ActiveRoutine"
>;

type RoutineDetailsNav = NativeStackNavigationProp<
    RootStackParamList,
    "RoutineDetails"
>;

type Task = {
    title: string;
    description?: string;
    time_slot?: string;
    duration_minutes?: number;
};

type Child = {
    id: string;
    name: string;
    photo?: string;
    age?: number;
};

type UniqueRoutine = {
    id: string;
    name: string;
    tasks: (string | Task)[];
    taskCount: number;
    child_id?: string;
    created_at?: string;
    icon?: string;
    color?: string;
    description?: string;
};

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo: string;
    notes?: string;
    points?: number;
}

const ActiveRoutineScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<RoutineDetailsNav>();

    const route = useRoute<ActiveRoutineRouteProp>();
    const [uniqueRoutines, setUniqueRoutines] = useState<UniqueRoutine[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRoutineTasks = useCallback(async () => {
        try {
            // Fetch routine tasks
            const { data: tasksData, error: tasksError } = await supabase
                .from("routine_tasks")
                .select("routine_name, child_id, created_at")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (tasksError) throw tasksError;

            const { data: templatesData, error: templatesError } = await supabase
                .from("routine_templates")
                .select("name, child_id, created_at")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (templatesError) throw templatesError;

            // Combine both datasets
            const combinedData = [...(tasksData || [])];

            if (templatesData) {
                templatesData.forEach(template => {
                    combinedData.push({
                        routine_name: template.name,
                        child_id: null,
                        created_at: template.created_at
                    });
                });
            }

            return combinedData;
        } catch (err) {
            console.error("Error fetching routine data:", err);
            return [];
        }
    }, [user?.id]);

    const fetchChildren = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("children")
                .select("id, name, photo, age");

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching children:", err);
            return [];
        }
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [routineTasksData, childrenData] = await Promise.all([
                fetchRoutineTasks(),
                fetchChildren(),
            ]);

            setChildren(childrenData);

            // Process routine tasks to get unique routine names with task counts
            const routineMap = new Map();

            routineTasksData.forEach(task => {
                if (task.routine_name) {
                    if (routineMap.has(task.routine_name)) {
                        // Increment count for existing routine
                        const existing = routineMap.get(task.routine_name);
                        routineMap.set(task.routine_name, {
                            ...existing,
                            taskCount: existing.taskCount + 1
                        });
                    } else {
                        // Add new routine
                        routineMap.set(task.routine_name, {
                            id: task.routine_name, // Using name as ID
                            name: task.routine_name,
                            tasks: [], // Empty array since we don't have task details
                            taskCount: 1,
                            child_id: task.child_id,
                            created_at: task.created_at
                        });
                    }
                }
            });

            // Convert map to array
            const uniqueRoutinesArray = Array.from(routineMap.values());
            setUniqueRoutines(uniqueRoutinesArray);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchRoutineTasks, fetchChildren]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getChildName = (childId?: string) => {
        if (!childId) return "Unknown";
        const child = children.find((c) => c.id === childId);
        return child ? child.name : "Unknown";
    };

    const getChildProfile = (childId?: string): ChildProfile | null => {
        if (!childId) return null;
        const child = children.find((c) => c.id === childId);
        if (!child) return null;

        return {
            id: child.id,
            name: child.name,
            age: child.age || 0,
            photo: child.photo || "",
            points: 0
        };
    };

    const handleSelectChild = (child: ChildProfile) => {
        navigation.navigate('ChildProfile', { child });
    };

    const handleSelectRoutine = (routine: UniqueRoutine) => {
        // If you want to navigate to RoutineDetails instead
        navigation.navigate("RoutineDetails", {
            id: routine.id,
            title: routine.name,
            description: routine.description || "",
            tasks: routine.tasks as any,
            icon: routine.icon || "calendar-check",
        });
    };

    const renderRoutineCard = (routine: UniqueRoutine) => {
        const childProfile = getChildProfile(routine.child_id);

        return (
            <TouchableOpacity key={routine.id}
                onPress={() => {
                    if (childProfile) {
                        handleSelectChild(childProfile);
                    } else {
                        handleSelectRoutine(routine);
                    }
                }}
            >
                <Card
                    padding="$5"
                    borderRadius="$5"
                    height={184}
                    marginBottom="$3"
                    borderTopWidth={4}
                    backgroundColor="white"
                    borderTopColor={routine.color as any || colors.primary}
                >
                    <XStack ai="center" jc="space-between" mb="$2" f={1}>
                        <XStack ai="center" space="$4" f={1}>
                            <YStack f={1} space="$2">
                                <YStack jc="flex-start" space="$2" mt="$1">
                                    <XStack jc="space-between">
                                        <Text fontSize="$6" fontWeight="700" color="#333">
                                            {routine.name}
                                        </Text>
                                        <ChevronRight />
                                    </XStack>

                                    <View
                                        br={999}
                                        width={85}
                                        px="$2"
                                        backgroundColor={routine.color || colors.primary}
                                    >
                                        <Text fontSize="$4" fontWeight="600" color="white">
                                            {routine.taskCount} task(s)
                                        </Text>
                                    </View>
                                </YStack>

                                <Text fontSize="$4" color={colors.textSecondary}>
                                    Assigned to: {getChildName(routine.child_id)} on{" "}
                                    {routine.created_at
                                        ? new Date(routine.created_at).toLocaleDateString()
                                        : "N/A"}
                                </Text>
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
                            Active Routines
                        </Text>
                    </XStack>
                    <Text fontSize="$5" color="#555">
                        See what's in progress for your child right now
                    </Text>
                </YStack>

                <YStack space="$3" mt="$3">
                    {loading && <Text color={colors.text}>Loading routines...</Text>}

                    {!loading && uniqueRoutines.length === 0 && (
                        <Text color={colors.text}>No active routines found.</Text>
                    )}

                    {!loading && uniqueRoutines.map((routine) => renderRoutineCard(routine))}
                </YStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default ActiveRoutineScreen;