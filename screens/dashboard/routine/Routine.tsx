import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Dimensions, Modal, PixelRatio, TextInput as RNTextInput, ScrollView, TouchableOpacity } from "react-native";
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
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editingRoutine, setEditingRoutine] = useState<RoutineTemplate | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");

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

    const handleStartEdit = useCallback((routine: RoutineTemplate) => {
        setEditingRoutine(routine);
        setEditName(routine.name);
        setEditDescription(routine.description || "");
    }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingRoutine || !user) return;

        try {
            // Check if it's a predefined routine (needs to be cloned first)
            if (editingRoutine.is_preloaded && !editingRoutine.user_id) {
                // Prevent duplicate copies
                const alreadyCopied = myRoutines.some(
                    (t) => t.original_template_id === editingRoutine.id
                );

                if (alreadyCopied) {
                    Alert.alert("Error", "This template has already been copied to your routines.");
                    return;
                }

                // Clone the predefined routine
                const { data: newRoutine, error: insertErr } = await supabase
                    .from("routine_templates")
                    .insert({
                        user_id: user.id,
                        name: editName || editingRoutine.name,
                        description: editDescription || editingRoutine.description,
                        icon: editingRoutine.icon,
                        ageRange: editingRoutine.ageRange,
                        is_preloaded: false,
                        original_template_id: editingRoutine.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (insertErr) throw insertErr;

                const tasks = await fetchTasksForRoutine(editingRoutine.id);

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
            } else {
                // Editing user routine
                const { data, error: updateErr } = await supabase
                    .from("routine_templates")
                    .update({
                        name: editName,
                        description: editDescription,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingRoutine.id)
                    .select()
                    .single();

                if (updateErr) throw updateErr;

                return { type: 'update' as const, routine: { ...editingRoutine, ...data } };
            }
        } catch (err) {
            console.error("Error saving routine:", err);
            throw err;
        }
    }, [editingRoutine, editName, editDescription, user, myRoutines, fetchTasksForRoutine]);

    const handleSelectPlan = useCallback((id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds([]);
    }, []);

    const closeEditModal = useCallback(() => {
        setEditingRoutine(null);
        setEditName("");
        setEditDescription("");
    }, []);

    return {
        selectedIds,
        editingRoutine,
        editName,
        editDescription,
        setEditName,
        setEditDescription,
        handleDelete,
        handleStartEdit,
        handleSaveEdit,
        handleSelectPlan,
        clearSelection,
        closeEditModal
    };
};

// Edit Modal Component
const EditRoutineModal = React.memo(({
    visible,
    routine,
    name,
    description,
    onNameChange,
    onDescriptionChange,
    onSave,
    onClose,
    colors,
    scaling
}: {
    visible: boolean;
    routine: RoutineTemplate | null;
    name: string;
    description: string;
    onNameChange: (text: string) => void;
    onDescriptionChange: (text: string) => void;
    onSave: () => void;
    onClose: () => void;
    colors: any;
    scaling: ReturnType<typeof useScaling>;
}) => {
    if (!routine) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View
                flex={1}
                justifyContent="center"
                alignItems="center"
                backgroundColor="rgba(0,0,0,0.5)"
            >
                <Card
                    backgroundColor="white"
                    padding={scaling.moderateScale(20)}
                    borderRadius={scaling.moderateScale(15)}
                    width={scaling.moderateScale(320)}
                    maxHeight={scaling.verticalScale(400)}
                >
                    <YStack space={scaling.verticalScale(16)}>
                        <XStack justifyContent="space-between" alignItems="center">
                            <H6 fontWeight="600" color={colors.text}>
                                Edit Routine
                            </H6>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialCommunityIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </XStack>

                        <YStack space={scaling.verticalScale(12)}>
                            <Text fontSize={scaling.scaleFont(14)} fontWeight="600" color={colors.text}>
                                Routine Name
                            </Text>
                            <RNTextInput
                                value={name}
                                onChangeText={onNameChange}
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: scaling.moderateScale(8),
                                    padding: scaling.moderateScale(12),
                                    fontSize: scaling.scaleFont(14),
                                    color: colors.text,
                                }}
                                placeholder="Enter routine name"
                                placeholderTextColor="#999"
                            />
                        </YStack>

                        <YStack space={scaling.verticalScale(12)}>
                            <Text fontSize={scaling.scaleFont(14)} fontWeight="600" color={colors.text}>
                                Description
                            </Text>
                            <RNTextInput
                                value={description}
                                onChangeText={onDescriptionChange}
                                style={{
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: scaling.moderateScale(8),
                                    padding: scaling.moderateScale(12),
                                    fontSize: scaling.scaleFont(14),
                                    color: colors.text,
                                    minHeight: scaling.verticalScale(80),
                                    textAlignVertical: 'top',
                                }}
                                placeholder="Enter routine description"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                            />
                        </YStack>

                        {routine.is_preloaded && !routine.user_id && (
                            <Text color={colors.primary} fontSize={scaling.scaleFont(12)} fontStyle="italic">
                                This is a predefined template. Saving will create a copy in your routines.
                            </Text>
                        )}

                        <XStack space={scaling.moderateScale(12)} justifyContent="flex-end" marginTop={scaling.verticalScale(16)}>
                            <Button
                                onPress={onClose}
                                backgroundColor="#f0f0f0"
                                color={colors.text}
                                paddingHorizontal={scaling.moderateScale(20)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={onSave}
                                backgroundColor={colors.primary}
                                color="white"
                                paddingHorizontal={scaling.moderateScale(20)}
                            >
                                Save
                            </Button>
                        </XStack>
                    </YStack>
                </Card>
            </View>
        </Modal>
    );
});

// Routine Card Component
const RoutineCard = React.memo(({
    routine,
    isUserRoutine,
    isSelected,
    onEdit,
    onDelete,
    onPress,
    onLongPress,
    colors,
    scaling
}: {
    routine: RoutineTemplate;
    isUserRoutine: boolean;
    isSelected: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onPress: () => void;
    onLongPress: () => void;
    colors: any;
    scaling: ReturnType<typeof useScaling>;
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <Card
                bordered
                padding={scaling.moderateScale(5)}
                borderRadius={scaling.moderateScale(10)}
                marginBottom={scaling.verticalScale(12)}
                borderWidth={2}
                backgroundColor={isSelected ? colors.card : "white"}
                borderColor={isSelected ? colors.primary : (colors.border as any)}
            >
                {isSelected && (
                    <View
                        position="absolute"
                        top={-scaling.moderateScale(6)}
                        right={-scaling.moderateScale(6)}
                        zIndex={10}
                        width={scaling.moderateScale(28)}
                        height={scaling.moderateScale(28)}
                        borderRadius={scaling.moderateScale(14)}
                        backgroundColor={colors.primary}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <MaterialCommunityIcons
                            name="check"
                            size={scaling.moderateScale(16)}
                            color="white"
                        />
                    </View>
                )}

                <XStack ai="center" jc="space-between" mb={scaling.verticalScale(8)} flex={1}>
                    <XStack ai="center" space={scaling.moderateScale(12)} flex={1}>
                        <View
                            width={scaling.moderateScale(40)}
                            height={scaling.moderateScale(40)}
                            borderRadius={scaling.moderateScale(20)}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <MaterialCommunityIcons
                                name={(routine.icon as any) || "calendar-check"}
                                size={scaling.moderateScale(20)}
                                color={colors.primary}
                            />
                        </View>

                        <YStack flex={1} space={scaling.moderateScale(6)}>
                            <XStack ai="center" jc="space-between"
                                space={scaling.moderateScale(6)}
                            >
                                <H6 fontSize={scaling.scaleFont(12)} fontWeight="600">
                                    {routine.name}
                                </H6>

                                <TouchableOpacity>
                                    <View
                                        w={20}
                                        h={20}
                                        mr={10}
                                        mt={5}
                                        br={12}
                                        onPress={onLongPress}
                                        ai="center"
                                        jc="center"
                                        bg="transparent"
                                        borderWidth={2}
                                        borderColor={isSelected ? (colors.border as any) : colors.text}
                                    >
                                        <MaterialCommunityIcons name="check" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>
                            </XStack>

                            <Text
                                fontSize={scaling.scaleFont(10)}
                                color="#555"
                                lineHeight={scaling.verticalScale(18)}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {routine.description || "No description available"}
                            </Text>

                            {isUserRoutine && routine.original_template_id && (
                                <Text color="#888" fontSize={scaling.scaleFont(10)}>
                                    Based on a predefined template
                                </Text>
                            )}

                            <XStack mt='$3' space={scaling.moderateScale(12)} jc='space-between'>
                                <XStack space={scaling.moderateScale(12)}>
                                    <Text fontSize={scaling.scaleFont(12)} fontWeight="600" color={colors.primary}>
                                        {(routine.tasks ?? []).length} Tasks
                                    </Text>

                                    {isUserRoutine && (
                                        <TouchableOpacity onPress={onDelete}>
                                            <MaterialCommunityIcons
                                                name="trash-can"
                                                size={scaling.moderateScale(20)}
                                                color="red"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </XStack>
                            </XStack>
                        </YStack>
                    </XStack>
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
        selectedIds,
        editingRoutine,
        editName,
        editDescription,
        setEditName,
        setEditDescription,
        handleDelete,
        handleStartEdit,
        handleSaveEdit,
        handleSelectPlan,
        clearSelection,
        closeEditModal
    } = useRoutineOperations(myRoutines, predefinedRoutines);

    // Focus effect for data loading
    useFocusEffect(
        useCallback(() => {
            loadAllData();
        }, [loadAllData])
    );

    // Clear selection when data reloads
    useEffect(() => {
        if (!loading) {
            clearSelection();
        }
    }, [loading, clearSelection]);

    // Filter out predefined routines that are already copied
    const filteredPredefined = useMemo(() =>
        predefinedRoutines.filter(
            (tpl) => !myRoutines.some((r) => r.original_template_id === tpl.id)
        ),
        [predefinedRoutines, myRoutines]
    );

    // Navigation handlers
    const handleRoutinePress = useCallback((routine: RoutineTemplate, isUserRoutine: boolean) => {
        if (selectedIds.length > 0) {
            handleSelectPlan(routine.id);
            return;
        }

        navigation.navigate("RoutineDetails", {
            routineId: routine.id,
            isPredefined: !isUserRoutine,
        });
    }, [selectedIds.length, handleSelectPlan, navigation]);

    const handleDownloadPlan = useCallback(() => {
        if (selectedIds.length === 0) return;
        Alert.alert("Download Plan", `Downloading ${selectedIds.length} selected plan(s)...`);
        clearSelection();
    }, [selectedIds.length, clearSelection]);

    const handlePrintSelectedPlans = useCallback(() => {
        if (selectedIds.length === 0) return;

        const selectedPlans = [...myRoutines, ...predefinedRoutines].filter((p) =>
            selectedIds.includes(p.id)
        );

        navigation.navigate("Print", {
            allPlans: JSON.stringify(selectedPlans),
            childName: CHILD_NAME,
        });
        clearSelection();
    }, [selectedIds, myRoutines, predefinedRoutines, navigation, clearSelection]);

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

    const handleModalSave = useCallback(async () => {
        try {
            await handleSaveEdit();
            closeEditModal();
            loadAllData(); // Refresh the data
        } catch (err) {
            Alert.alert("Error", "Failed to save routine. Please try again.");
        }
    }, [handleSaveEdit, closeEditModal, loadAllData]);

    // Routine card renderer
    const renderRoutineCard = useCallback((routine: RoutineTemplate, isUserRoutine: boolean) => {
        const isSelected = selectedIds.includes(routine.id);

        const handleCardDelete = async () => {
            Alert.alert(
                "Delete Routine",
                "Are you sure you want to delete this routine?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await handleDelete(routine.id);
                                loadAllData();
                            } catch (err) {
                                Alert.alert("Error", "Failed to delete routine. Please try again.");
                            }
                        }
                    }
                ]
            );
        };

        return (
            <RoutineCard
                key={routine.id}
                routine={routine}
                isUserRoutine={isUserRoutine}
                isSelected={isSelected}
                onEdit={() => handleStartEdit(routine)}
                onDelete={handleCardDelete}
                onPress={() => handleRoutinePress(routine, isUserRoutine)}
                onLongPress={() => handleSelectPlan(routine.id)}
                colors={colors}
                scaling={scaling}
            />
        );
    }, [
        selectedIds,
        handleDelete,
        handleStartEdit,
        handleSelectPlan,
        handleRoutinePress,
        colors,
        scaling,
        loadAllData
    ]);

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
                {selectedIds.length > 0 ? (
                    <YStack space={scaling.moderateScale(12)} jc="center" mt={scaling.verticalScale(16)}>
                        <Button
                            size={scaling.moderateScale(40)}
                            bg={colors.primary}
                            onPress={handleDownloadPlan}
                        >
                            <XStack ai="center" jc="center" space={scaling.moderateScale(8)}>
                                <Feather name="download" size={scaling.moderateScale(16)} color="white" />
                                <Text color="white">
                                    Download ({selectedIds.length})
                                </Text>
                            </XStack>
                        </Button>

                        <Button
                            size={scaling.moderateScale(40)}
                            bg='#9FCC16'
                            onPress={handlePrintSelectedPlans}
                        >
                            <XStack ai="center" jc="center" space={scaling.moderateScale(8)}>
                                <Feather name="printer" size={scaling.moderateScale(16)} color="white" />
                                <Text color="white">
                                    Print ({selectedIds.length})
                                </Text>
                            </XStack>
                        </Button>
                    </YStack>
                ) : (
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
                )}

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

                {/* Edit Routine Modal */}
                <EditRoutineModal
                    visible={!!editingRoutine}
                    routine={editingRoutine}
                    name={editName}
                    description={editDescription}
                    onNameChange={setEditName}
                    onDescriptionChange={setEditDescription}
                    onSave={handleModalSave}
                    onClose={closeEditModal}
                    colors={colors}
                    scaling={scaling}
                />
            </ScrollView>
        </GoalBackground>
    );
};

export default React.memo(RoutineScreen);