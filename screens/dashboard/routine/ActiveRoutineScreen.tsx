import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ChevronRight } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Card, H4, H6, View, XStack, YStack } from "tamagui";

type ActiveRoutineRouteProp = RouteProp<RootStackParamList, "ActiveRoutine">;
type RoutineDetailsNav = NativeStackNavigationProp<RootStackParamList, "RoutineDetails">;

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

interface RoutineTemplate {
    id: string;
    name: string;
    tasks: Task[];
    icon?: string;
    is_preloaded?: boolean;
    user_id?: string;
    original_template_id?: string;
}

const ActiveRoutineScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<RoutineDetailsNav>();
    const route = useRoute<ActiveRoutineRouteProp>();
    const [uniqueRoutines, setUniqueRoutines] = useState<UniqueRoutine[]>([]);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch routine tasks from Supabase
    const fetchRoutineTasks = useCallback(async () => {
        try {
            const { data: tasksData, error: tasksError } = await supabase
                .from("routine_tasks")
                .select("*")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: false });

            if (tasksError) throw tasksError;

            const { data: templatesData, error: templatesError } = await supabase
                .from("routine_templates")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            if (templatesError) throw templatesError;

            const combinedData: any[] = [...(tasksData || [])];

            templatesData?.forEach(template => {
                combinedData.push({
                    routine_name: template.name,
                    child_id: template.child_id || null,
                    created_at: template.created_at,
                });
            });

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

            // Aggregate unique routines with task counts
            const routineMap = new Map<string, UniqueRoutine>();
            routineTasksData.forEach(task => {
                const routineName = task.routine_name || task.name;
                if (!routineName) return;

                if (routineMap.has(routineName)) {
                    const existing = routineMap.get(routineName)!;
                    routineMap.set(routineName, {
                        ...existing,
                        taskCount: existing.taskCount + 1,
                    });
                } else {
                    routineMap.set(routineName, {
                        id: task.id || routineName,
                        name: routineName,
                        tasks: task.tasks || [],
                        taskCount: 1,
                        child_id: task.child_id,
                        created_at: task.created_at,
                        color: task.color || colors.primary,
                    });
                }
            });

            setUniqueRoutines(Array.from(routineMap.values()));
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    }, [fetchRoutineTasks, fetchChildren, colors.primary]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const getChildProfile = (childId?: string): ChildProfile | null => {
        if (!childId) return null;
        const child = children.find(c => c.id === childId);
        if (!child) return null;
        return {
            id: child.id,
            name: child.name,
            age: child.age || 0,
            photo: child.photo || "",
            points: 0,
        };
    };

    const handleSelectChild = (child: ChildProfile) => {
        navigation.navigate('ChildProfile', { child });
    };

    const handleRoutinePress = (routine: UniqueRoutine) => {
        navigation.navigate("RoutineDetails", {
            routineId: routine.id,
            isPredefined: false,
        });
    };

    const renderRoutineCard = (routine: UniqueRoutine) => {
        const childProfile = getChildProfile(routine.child_id);

        return (
            <TouchableOpacity
                key={routine.id}
                onPress={() => {
                    if (childProfile) handleSelectChild(childProfile);
                    else handleRoutinePress(routine);
                }}
            >
                <Card
                    padding="$5"
                    borderRadius="$5"
                    height={130}
                    marginBottom="$3"
                    borderTopWidth={4}
                    backgroundColor="white"
                    borderTopColor={routine.color as any}
                >
                    <XStack ai="center" jc="space-between" mb="$2" f={1}>
                        <XStack ai="center" space="$4" f={1}>
                            <YStack f={1} space="$2">
                                <YStack jc="flex-start" space="$2" mt="$1">
                                    <XStack jc="space-between">
                                        <H6 fontSize={14} fontWeight="600" color={colors.text}>
                                            {routine.name}
                                        </H6>
                                        <ChevronRight />
                                    </XStack>

                                    <View
                                        br={999}
                                        width={85}
                                        px="$2"
                                        backgroundColor={routine.color || colors.primary}
                                    >
                                        <Text fontWeight="600" color={colors.onPrimary}>
                                            {routine.taskCount} task(s)
                                        </Text>
                                    </View>
                                </YStack>

                                <Text fontSize="$3" color={colors.textSecondary}>
                                    Assigned to: {childProfile?.name || "Unknown"} on{" "}
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
                        <H4 fontSize={16} fontWeight="600" color={colors.text}>
                            Active Routines
                        </H4>
                    </XStack>
                    <Text fontSize="$5" color="#555">
                        See what's in progress for your child right now
                    </Text>
                </YStack>

                <YStack space="$3" mt="$3">
                    {/* {loading && <Text color={colors.text}>Loading routines...</Text>} */}

                    {/* {!loading && uniqueRoutines.length === 0 && (
                    <Text color={colors.text}>No active routines found.</Text>
                    )} */}

                    {uniqueRoutines.map(renderRoutineCard)}
                </YStack>

            </ScrollView>
        </GoalBackground>
    );
};

export default ActiveRoutineScreen;
