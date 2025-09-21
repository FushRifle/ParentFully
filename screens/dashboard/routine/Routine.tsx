import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, TextInput, TouchableOpacity } from "react-native";
import { Button, Card, Spinner, Text, View, XStack, YStack } from "tamagui";

type RoutineDetailsScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "RoutineDetails"
>;

type TemplateTask = {
    id: string;
    title?: string;
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
    time_slot?: string;
    duration_minutes?: string;
    ageRange?: string;
    description?: string;
    tasks: TemplateTask[];
    icon?: string;
    is_preloaded?: boolean;
    user_id?: string;
    original_template_id?: string;
};

const RoutineScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<RoutineDetailsScreenNavigationProp>();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const [myRoutines, setMyRoutines] = useState<RoutineTemplate[]>([]);
    const [predefined, setPredefined] = useState<RoutineTemplate[]>([]);

    // Fetch tasks for any routine (user or predefined)
    const fetchTasksForRoutine = useCallback(async (routineId: string) => {
        const { data, error } = await supabase
            .from("routine_template_tasks")
            .select("*")
            .eq("routine_id", routineId)
            .order("time_slot", { ascending: true });

        if (error) {
            console.error("Error fetching tasks:", error);
            return [];
        }

        return data || [];
    }, []);

    // Fetch user's routines (includes copies of predefined ones)
    const fetchMyRoutines = useCallback(async () => {
        if (!user?.id) {
            setMyRoutines([]);
            return;
        }
        try {
            const { data, error } = await supabase
                .from("routine_templates")
                .select("*")
                .eq("user_id", user.id)
                .eq("is_preloaded", false);

            if (error) throw error;

            const routinesWithTasks: RoutineTemplate[] = await Promise.all(
                (data || []).map(async (tpl) => {
                    const tasks = await fetchTasksForRoutine(tpl.id);
                    return { ...tpl, tasks };
                })
            );

            setMyRoutines(routinesWithTasks);
        } catch (err) {
            console.error("Error fetching user routines:", err);
            setError("Failed to fetch routines");
        }
    }, [user?.id, fetchTasksForRoutine]);

    // Fetch only untouched, predefined routines
    const fetchPredefinedRoutines = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from("routine_templates")
                .select("*")
                .eq("is_preloaded", true)
                .is("user_id", null);

            if (error) throw error;

            const routinesWithTasks: RoutineTemplate[] = await Promise.all(
                (data || []).map(async (tpl) => {
                    const tasks = await fetchTasksForRoutine(tpl.id);
                    return { ...tpl, tasks };
                })
            );

            setPredefined(routinesWithTasks);
        } catch (err) {
            console.error("Error fetching predefined routines:", err);
            setError("Failed to fetch predefined routines");
        }
    }, [fetchTasksForRoutine]);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setLoading(true);
                setError(null);
                try {
                    await Promise.all([fetchMyRoutines(), fetchPredefinedRoutines()]);
                } catch (err) {
                    setError("Failed to load data");
                } finally {
                    setLoading(false);
                }
            };
            loadData();
        }, [fetchMyRoutines, fetchPredefinedRoutines])
    );

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            await Promise.all([fetchMyRoutines(), fetchPredefinedRoutines()]);
            setLoading(false);
        };
        load();
    }, [fetchMyRoutines, fetchPredefinedRoutines]);

    const handleDelete = useCallback(async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from("routine_templates")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
            setMyRoutines((prev) => prev.filter((tpl) => tpl.id !== id));
        } catch (err) {
            console.error("Error deleting routine:", err);
        }
    }, []);

    const handleStartEdit = (tpl: RoutineTemplate) => {
        setEditingId(tpl.id);
        setEditingName(tpl.name);
    };

    const handleSaveEdit = useCallback(async () => {
        if (!editingId || !user) return;

        const predefinedRoutine = predefined.find((t) => t.id === editingId);

        if (predefinedRoutine) {
            // Prevent duplicate copies
            const alreadyCopied = myRoutines.some(
                (t) => t.original_template_id === predefinedRoutine.id
            );

            if (alreadyCopied) {
                console.log("Template already copied!");
                setEditingId(null);
                setEditingName("");
                return;
            }

            try {
                const { data: newRoutine, error: insertErr } = await supabase
                    .from("routine_templates")
                    .insert({
                        user_id: user.id,
                        name: editingName || predefinedRoutine.name,
                        description: predefinedRoutine.description,
                        icon: predefinedRoutine.icon,
                        ageRange: predefinedRoutine.ageRange,
                        is_preloaded: false,
                        original_template_id: predefinedRoutine.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (insertErr) throw insertErr;

                const tasks = await fetchTasksForRoutine(predefinedRoutine.id);

                if (tasks.length > 0) {
                    const tasksToInsert = tasks.map((task) => ({
                        title: task.title,
                        description: task.description,
                        time_slot: task.time_slot,
                        priority: task.priority,
                        duration_minutes: task.duration_minutes,
                        category: task.category,
                        icon: task.icon,
                        routine_id: newRoutine.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }));

                    const { error: tasksError } = await supabase
                        .from("routine_template_tasks")
                        .insert(tasksToInsert);

                    if (tasksError) throw tasksError;
                }

                setMyRoutines((prev) => [...prev, { ...newRoutine, tasks }]);
            } catch (err) {
                console.error("Error cloning routine:", err);
            }
        } else {
            // Editing user routine
            const mine = myRoutines.find((t) => t.id === editingId);
            if (mine) {
                try {
                    const { data, error: updateErr } = await supabase
                        .from("routine_templates")
                        .update({
                            name: editingName,
                            updated_at: new Date().toISOString(),
                        })
                        .eq("id", editingId)
                        .select()
                        .single();

                    if (updateErr) throw updateErr;

                    setMyRoutines((prev) =>
                        prev.map((tpl) => (tpl.id === editingId ? { ...tpl, ...data } : tpl))
                    );
                } catch (err) {
                    console.error("Error updating routine:", err);
                }
            }
        }

        setEditingId(null);
        setEditingName("");
    }, [editingId, editingName, predefined, myRoutines, user, fetchTasksForRoutine]);

    const renderRoutineCard = (tpl: RoutineTemplate, isUserRoutine = false) => {
        const isEditing = editingId === tpl.id;

        return (
            <TouchableOpacity
                key={tpl.id}
                onPress={() =>
                    !isEditing &&
                    navigation.navigate("RoutineDetails", {
                        routineId: tpl.id,
                        isPredefined: !isUserRoutine,
                    })
                }
            >
                <Card
                    bordered
                    borderColor={colors.border as any}
                    padding="$3"
                    borderRadius="$4"
                    marginBottom="$3"
                    backgroundColor="white"
                >
                    <XStack ai="center" jc="space-between" mb="$2">
                        <XStack ai="center" space="$4" f={1}>
                            <View w={40} h={40} br={20} ai="center" jc="center">
                                <MaterialCommunityIcons
                                    name={(tpl.icon as any) || "calendar-check"}
                                    size={22}
                                    color={colors.primary as any}
                                />
                            </View>

                            <YStack f={1}>
                                {isEditing ? (
                                    <TextInput
                                        value={editingName}
                                        onChangeText={setEditingName}
                                        style={{
                                            fontSize: 18,
                                            fontWeight: "700",
                                            borderBottomWidth: 1,
                                            borderColor: colors.primary,
                                            padding: 4,
                                        }}
                                    />
                                ) : (
                                    <>
                                        <XStack jc="space-between">
                                            <Text fontSize="$6" fontWeight="700" color="#333">
                                                {tpl.name}
                                            </Text>
                                            <Text fontSize="$3" fontWeight="600" color={colors.primary}>
                                                {(tpl.tasks ?? []).length} Tasks
                                            </Text>
                                        </XStack>
                                    </>
                                )}

                                <Text
                                    fontSize="$3"
                                    color="#555"
                                    lineHeight={20}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {tpl.description || "No description available"}
                                </Text>

                                {isUserRoutine && tpl.original_template_id && (
                                    <Text fontSize="$2" color="#888" mt="$1">
                                        Based on a predefined template
                                    </Text>
                                )}
                            </YStack>
                        </XStack>
                    </XStack>

                    {/* Actions */}
                    <XStack space="$4" mr="$2" jc="flex-end">
                        {isEditing ? (
                            <XStack space="$4">
                                <TouchableOpacity onPress={handleSaveEdit}>
                                    <MaterialCommunityIcons
                                        name="check"
                                        size={23}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingId(null)}>
                                    <MaterialCommunityIcons name="close" size={23} color="gray" />
                                </TouchableOpacity>
                            </XStack>
                        ) : (
                            <XStack space="$4">
                                <TouchableOpacity onPress={() => handleStartEdit(tpl)}>
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={23}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                                {isUserRoutine && (
                                    <TouchableOpacity onPress={() => handleDelete(tpl.id)}>
                                        <MaterialCommunityIcons name="trash-can" size={23} color="red" />
                                    </TouchableOpacity>
                                )}
                            </XStack>
                        )}
                    </XStack>
                </Card>
            </TouchableOpacity>
        );
    };

    // Filter predefined routines to hide already copied ones
    const filteredPredefined = predefined.filter(
        (tpl) => !myRoutines.some((r) => r.original_template_id === tpl.id)
    );

    return (
        <GoalBackground>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            >
                {/* Header */}
                <YStack space="$4" mt="$6">
                    <XStack space="$4" ai="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                        </TouchableOpacity>
                        <Text fontSize="$8" fontWeight="700" color={colors.text}>
                            Routine
                        </Text>
                    </XStack>

                    <Text fontSize="$4" color={colors.textSecondary}>
                        Build your child's routine: choose from ready-made templates or create your
                        own
                    </Text>
                </YStack>

                {/* Loading */}
                {loading && (
                    <View ai="center" mt="$6">
                        <Spinner size="large" color={colors.primary as any} />
                    </View>
                )}

                {/* Error */}
                {error && (
                    <Text color="red" fontSize="$4" mt="$4">
                        {error}
                    </Text>
                )}

                {!loading && !error && (
                    <YStack mt="$6" space="$5">
                        {/* My Routines */}
                        <Text fontSize="$7" fontWeight="700" color={colors.text}>
                            My Routines
                        </Text>
                        {myRoutines.length > 0 ? (
                            myRoutines.map((tpl) => renderRoutineCard(tpl, true))
                        ) : (
                            <Text color="#666">No personal routines yet.</Text>
                        )}

                        {/* Predefined Routines */}
                        <Text fontSize="$7" fontWeight="700" color={colors.text} mt="$6">
                            Predefined Routines
                        </Text>
                        {filteredPredefined.length > 0 ? (
                            filteredPredefined.map((tpl) => renderRoutineCard(tpl, false))
                        ) : (
                            <Text color="#666">No templates available.</Text>
                        )}

                        {/* Divider */}
                        <XStack ai="center" my="$4">
                            <View flex={1} height={1} bg="gray" />
                            <Text mx="$3" fontSize="$7" color={colors.text}>
                                OR
                            </Text>
                            <View flex={1} height={1} bg="gray" />
                        </XStack>

                        {/* Create Custom Button */}
                        <Button
                            bg={colors.primary}
                            color="white"
                            borderRadius="$4"
                            icon={<MaterialCommunityIcons name="plus" size={20} color="white" />}
                            onPress={() => navigation.navigate("AddRoutine" as never)}
                        >
                            Create Custom
                        </Button>
                    </YStack>
                )}
            </ScrollView>
        </GoalBackground>
    );
};

export default RoutineScreen;
