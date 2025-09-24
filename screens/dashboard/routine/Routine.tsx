import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, PixelRatio, ScrollView, TouchableOpacity } from "react-native";
import { Button, Card, H6, Spinner, View, XStack, YStack } from "tamagui";

// Types
type RoutineDetailsScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "RoutineDetails"
>;

interface TemplateTask {
    id: string;
    title?: string;
    description?: string;
    time_slot?: string;
    priority?: "low" | "medium" | "high";
    duration_minutes?: number;
    category?: string;
    icon?: string;
}

interface RoutineTemplate {
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
}

// Constants
const SCREEN_DIMENSIONS = Dimensions.get('window');
const BASE_SCREEN = { width: 390, height: 844 };
const CHILD_NAME = "My Child";

// Scaling helpers
const useScaling = () => {
    return useMemo(() => {
        const scale = (size: number) => (SCREEN_DIMENSIONS.width / BASE_SCREEN.width) * size;
        const verticalScale = (size: number) => (SCREEN_DIMENSIONS.height / BASE_SCREEN.height) * size;
        const moderateScale = (size: number, factor = 0.5) =>
            size + (scale(size) - size) * factor;
        const scaleFont = (size: number) =>
            Math.round(PixelRatio.roundToNearestPixel(scale(size)));

        return { scale, verticalScale, moderateScale, scaleFont };
    }, []);
};

// Custom hook for routine data management
const useRoutineData = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [myRoutines, setMyRoutines] = useState<RoutineTemplate[]>([]);
    const [predefinedRoutines, setPredefinedRoutines] = useState<RoutineTemplate[]>([]);

    const fetchTasksForRoutine = useCallback(async (routineId: string): Promise<TemplateTask[]> => {
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

    const fetchRoutines = useCallback(async (isPreloaded: boolean, userId?: string) => {
        let query = supabase
            .from("routine_templates")
            .select("*")
            .eq("is_preloaded", isPreloaded);

        if (isPreloaded) {
            query = query.is("user_id", null);
        } else if (userId) {
            query = query.eq("user_id", userId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const routinesWithTasks = await Promise.all(
            (data || []).map(async (template) => ({
                ...template,
                tasks: await fetchTasksForRoutine(template.id)
            }))
        );

        return routinesWithTasks;
    }, [fetchTasksForRoutine]);

    const fetchMyRoutines = useCallback(async () => {
        if (!user?.id) {
            setMyRoutines([]);
            return;
        }
        try {
            const routines = await fetchRoutines(false, user.id);
            setMyRoutines(routines);
        } catch (err) {
            console.error("Error fetching user routines:", err);
            setError("Failed to fetch routines");
        }
    }, [user?.id, fetchRoutines]);

    const fetchPredefinedRoutines = useCallback(async () => {
        try {
            const routines = await fetchRoutines(true);
            setPredefinedRoutines(routines);
        } catch (err) {
            console.error("Error fetching predefined routines:", err);
            setError("Failed to fetch predefined routines");
        }
    }, [fetchRoutines]);

    const loadAllData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([fetchMyRoutines(), fetchPredefinedRoutines()]);
        } catch (err) {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [fetchMyRoutines, fetchPredefinedRoutines]);

    return {
        loading,
        error,
        myRoutines,
        predefinedRoutines,
        fetchMyRoutines,
        fetchPredefinedRoutines,
        loadAllData
    };
};

// Custom hook for routine operations
const useRoutineOperations = (myRoutines: RoutineTemplate[], predefinedRoutines: RoutineTemplate[]) => {
    const { user } = useAuth();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");

    const fetchTasksForRoutine = useCallback(async (routineId: string): Promise<TemplateTask[]> => {
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

    const handleDelete = useCallback(async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from("routine_templates")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
        } catch (err) {
            console.error("Error deleting routine:", err);
            throw err;
        }
    }, []);

    const handleStartEdit = (tpl: RoutineTemplate) => {
        setEditingId(tpl.id);
        setEditingName(tpl.name);
    };

    const handleSaveEdit = useCallback(async () => {
        if (!editingId || !user) return;

        const predefinedRoutine = predefinedRoutines.find((t) => t.id === editingId);
        const myRoutine = myRoutines.find((t) => t.id === editingId);

        try {
            if (predefinedRoutine) {
                // Prevent duplicate copies
                const alreadyCopied = myRoutines.some(
                    (t) => t.original_template_id === predefinedRoutine.id
                );

                if (alreadyCopied) {
                    console.log("Template already copied!");
                    return;
                }

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
                        ...task,
                        routine_id: newRoutine.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }));

                    const { error: tasksError } = await supabase
                        .from("routine_template_tasks")
                        .insert(tasksToInsert);

                    if (tasksError) throw tasksError;
                }

                return { type: 'clone' as const, routine: { ...newRoutine, tasks } };
            } else if (myRoutine) {
                // Editing user routine
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

                return { type: 'update' as const, routine: { ...myRoutine, ...data } };
            }
        } catch (err) {
            console.error("Error saving routine:", err);
            throw err;
        }
    }, [editingId, editingName, predefinedRoutines, myRoutines, user, fetchTasksForRoutine]);

    const cancelEdit = useCallback(() => {
        setEditingId(null);
        setEditingName("");
    }, []);

    return {
        editingId,
        editingName,
        setEditingName,
        handleDelete,
        handleStartEdit,
        handleSaveEdit,
        cancelEdit
    };
};

// Routine Card Component
const RoutineCard = React.memo(({
    routine,
    isUserRoutine,
    isEditing,
    editingName,
    onNameChange,
    onSave,
    onCancel,
    onEdit,
    onDelete,
    onPress,
    colors
}: {
    routine: RoutineTemplate;
    isUserRoutine: boolean;
    isEditing: boolean;
    editingName: string;
    onNameChange: (text: string) => void;
    onSave: () => void;
    onCancel: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onPress: () => void;
    colors: any;
}) => {
    const TextInput = require('react-native').TextInput;

    return (
        <TouchableOpacity onPress={onPress} disabled={isEditing}>
            <Card padding="$2" borderRadius="$4" marginBottom="$3" backgroundColor="white">
                <XStack ai="center" jc="space-between" mb="$2">
                    <XStack ai="center" space="$2" f={1}>
                        <View w={40} h={40} br={20} ai="center" jc="center">
                            <MaterialCommunityIcons
                                name={(routine.icon as any) || "calendar-check"}
                                size={20}
                                color={colors.primary as any}
                            />
                        </View>

                        <YStack f={1}>
                            {isEditing ? (
                                <TextInput
                                    value={editingName}
                                    onChangeText={onNameChange}
                                    style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        borderBottomWidth: 1,
                                        borderColor: colors.primary,
                                        padding: 4,
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <>
                                    <XStack jc="space-between">
                                        <H6 fontSize={14} fontWeight="600" color="#333">
                                            {routine.name}
                                        </H6>
                                        <Text fontSize={12} color={colors.primary}>
                                            {(routine.tasks ?? []).length} Tasks
                                        </Text>
                                    </XStack>
                                </>
                            )}

                            <Text
                                mt='3'
                                color="#555"
                                lineHeight={20}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {routine.description || "No description available"}
                            </Text>

                            {isUserRoutine && routine.original_template_id && (
                                <Text color="#888" mt="$1">
                                    Based on a predefined template
                                </Text>
                            )}
                        </YStack>
                    </XStack>
                </XStack>

                <XStack space="$4" mr="$2" jc="flex-end">
                    {isEditing ? (
                        <XStack space="$4">
                            <TouchableOpacity onPress={onSave}>
                                <MaterialCommunityIcons name="check" size={23} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onCancel}>
                                <MaterialCommunityIcons name="close" size={23} color="gray" />
                            </TouchableOpacity>
                        </XStack>
                    ) : (
                        <XStack space="$4">
                            <TouchableOpacity onPress={onEdit}>
                                <MaterialCommunityIcons name="pencil" size={23} color={colors.primary} />
                            </TouchableOpacity>
                            {isUserRoutine && (
                                <TouchableOpacity onPress={onDelete}>
                                    <MaterialCommunityIcons name="trash-can" size={23} color="red" />
                                </TouchableOpacity>
                            )}
                        </XStack>
                    )}
                </XStack>
            </Card>
        </TouchableOpacity>
    );
});

// Main Component
const RoutineScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<RoutineDetailsScreenNavigationProp>();
    const scaling = useScaling();

    const {
        loading,
        error,
        myRoutines,
        predefinedRoutines,
        loadAllData
    } = useRoutineData();

    const {
        editingId,
        editingName,
        setEditingName,
        handleDelete,
        handleStartEdit,
        handleSaveEdit,
        cancelEdit
    } = useRoutineOperations(myRoutines, predefinedRoutines);

    // Focus effect for data loading
    useFocusEffect(
        useCallback(() => {
            loadAllData();
        }, [loadAllData])
    );

    // Filter out predefined routines that are already copied
    const filteredPredefined = useMemo(() =>
        predefinedRoutines.filter(
            (tpl) => !myRoutines.some((r) => r.original_template_id === tpl.id)
        ),
        [predefinedRoutines, myRoutines]
    );

    // Navigation handlers
    const handleRoutinePress = useCallback((routine: RoutineTemplate, isUserRoutine: boolean) => {
        if (editingId === routine.id) return;

        navigation.navigate("RoutineDetails", {
            routineId: routine.id,
            isPredefined: !isUserRoutine,
        });
    }, [editingId, navigation]);

    const handlePrintAllPlans = useCallback(() => {
        const allPlans = [...myRoutines, ...predefinedRoutines];
        if (allPlans.length === 0) return;

        navigation.navigate("Print", {
            allPlans: JSON.stringify(allPlans),
            childName: CHILD_NAME,
        });
    }, [myRoutines, predefinedRoutines, navigation]);

    const handleCreateCustom = useCallback(() => {
        navigation.navigate("AddRoutine" as never);
    }, [navigation]);

    // Routine card renderer
    const renderRoutineCard = useCallback((routine: RoutineTemplate, isUserRoutine: boolean) => {
        const isEditing = editingId === routine.id;

        const handleCardSave = async () => {
            try {
                await handleSaveEdit();
            } catch (err) {
                // Error is already logged in handleSaveEdit
            }
        };

        const handleCardDelete = async () => {
            try {
                await handleDelete(routine.id);
                // Optimistically remove from local state
                loadAllData();
            } catch (err) {
                // Error is already logged in handleDelete
            }
        };

        return (
            <RoutineCard
                key={routine.id}
                routine={routine}
                isUserRoutine={isUserRoutine}
                isEditing={isEditing}
                editingName={editingName}
                onNameChange={setEditingName}
                onSave={handleCardSave}
                onCancel={cancelEdit}
                onEdit={() => handleStartEdit(routine)}
                onDelete={handleCardDelete}
                onPress={() => handleRoutinePress(routine, isUserRoutine)}
                colors={colors}
            />
        );
    }, [editingId, editingName, handleSaveEdit, handleDelete, handleStartEdit, cancelEdit, handleRoutinePress, colors, loadAllData]);

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
                        <H6 fontWeight="600" color={colors.text}>
                            Routine
                        </H6>
                    </XStack>

                    <Text color={colors.textSecondary}>
                        Build your child's routine: choose from ready-made templates or create your own
                    </Text>
                </YStack>

                {/* Action Buttons */}
                <XStack ai="center" jc="flex-start" space={scaling.moderateScale(12)} mt={scaling.verticalScale(16)}>
                    <Button
                        unstyled
                        borderRadius={scaling.moderateScale(12)}
                        backgroundColor="#FFF0DE"
                        paddingHorizontal={scaling.moderateScale(12)}
                        onPress={handlePrintAllPlans}
                    >
                        <XStack ai="center" space={scaling.moderateScale(12)} paddingVertical={scaling.moderateScale(8)}>
                            <Feather name="download" size={scaling.moderateScale(18)} color={colors.primary} />
                            <Text color={colors.primary} fontSize={scaling.scaleFont(12)}>
                                Download All
                            </Text>
                        </XStack>
                    </Button>

                    <Button
                        unstyled
                        backgroundColor="#E3FFF2"
                        paddingHorizontal={scaling.moderateScale(12)}
                        borderRadius={scaling.moderateScale(12)}
                        onPress={handlePrintAllPlans}
                    >
                        <XStack ai="center" space={scaling.moderateScale(12)} paddingVertical={scaling.moderateScale(8)}>
                            <Feather name="printer" size={scaling.moderateScale(18)} color={colors.secondary} />
                            <Text color={colors.secondary} fontSize={scaling.scaleFont(12)}>
                                Print All
                            </Text>
                        </XStack>
                    </Button>
                </XStack>

                {/* Loading State */}
                {loading && (
                    <View ai="center" mt="$6">
                        <Spinner size="large" color={colors.primary as any} />
                    </View>
                )}

                {/* Error State */}
                {error && (
                    <Text color="red" fontSize="$3" mt="$4">
                        {error}
                    </Text>
                )}

                {/* Content */}
                {!loading && !error && (
                    <YStack mt="$6" space="$2">
                        {/* My Routines Section */}
                        <H6 fontSize={14} fontWeight="600" color={colors.text} mb='$2'>
                            My Routines
                        </H6>
                        {myRoutines.length > 0 ? (
                            myRoutines.map((routine) => renderRoutineCard(routine, true))
                        ) : (
                            <Text color="#666">No personal routines yet.</Text>
                        )}

                        {/* Predefined Routines Section */}
                        <H6 fontSize={14} fontWeight="600" color={colors.text} mt="$4" mb='$2'>
                            Predefined Routines
                        </H6>
                        {filteredPredefined.length > 0 ? (
                            filteredPredefined.map((routine) => renderRoutineCard(routine, false))
                        ) : (
                            <Text color="#666">No templates available.</Text>
                        )}

                        {/* Divider */}
                        <XStack ai="center" my="$4">
                            <View flex={1} height={1} bg="gray" />
                            <H6 fontSize={14} fontWeight='600' mx="$3" color={colors.text}>
                                OR
                            </H6>
                            <View flex={1} height={1} bg="gray" />
                        </XStack>

                        {/* Create Custom Button */}
                        <Button
                            bg={colors.primary}
                            color="white"
                            borderRadius="$4"
                            icon={<MaterialCommunityIcons name="plus" size={20} color="white" />}
                            onPress={handleCreateCustom}
                        >
                            Create Custom
                        </Button>
                    </YStack>
                )}
            </ScrollView>
        </GoalBackground>
    );
};

export default React.memo(RoutineScreen);