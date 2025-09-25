import { GoalBackground } from "@/constants/GoalBackground";
import { Text } from '@/context/GlobalText';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Bell, ChevronRight, Menu } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    Modal,
    RefreshControl,
    ScrollView,
    TouchableOpacity
} from "react-native";
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Button,
    Fieldset,
    H4,
    H6,
    Label,
    Sheet,
    Spinner,
    View,
    XStack,
    YStack,
} from "tamagui";

type RoutineDetailsScreenRouteProp = RouteProp<
    RootStackParamList,
    "RoutineDetails"
>;

type Reminder = {
    id?: string;
    goal_id?: string;
    routine_id?: string;
    user_id: string;
    title: string;
    message: string;
    date: string;
    time: string;
    repeat: "None" | "Once" | "Daily" | "Mon-Fri" | "Custom";
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

type Task = {
    id?: string;
    title: string;
    icon?: string;
    time_slot?: string;
    duration_minutes?: string;
};

type Mode = "view" | "reorder";

type Child = {
    id: string;
    age?: string;
    name: string;
    photo?: string | null;
};

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number | string;
    category?: string;
    icon?: string;
};

type RoutineTemplate = {
    id: string;
    name: string;
    icon?: string;
    child_id?: string;
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

const RoutineDetailsScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const route = useRoute<RoutineDetailsScreenRouteProp>();
    const { routineId } = route.params;
    const [routine, setRoutine] = useState<RoutineTemplate | null>(null);

    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // ---- State ----
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
    const [showOptions, setShowOptions] = useState(false)
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [mode, setMode] = useState<Mode>("view");
    const [tasks, setTasks] = useState<Task[]>([]);

    const predefinedRoutines: RoutineTemplate[] = [];
    const [children, setChildren] = useState<Child[]>([]);
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);
    const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);
    const [assignSheetOpen, setAssignSheetOpen] = useState(false);
    const [showAssignmentSuccess, setShowAssignmentSuccess] = useState(false);

    const fetchRoutine = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("routine_templates")
                .select("id, name, icon, description, routine_template_tasks(id, title, icon, time_slot, duration_minutes)")
                .eq("id", routineId)
                .single();

            if (error) throw error;

            const tpl: RoutineTemplate = {
                id: data.id,
                name: data.name,
                icon: data.icon,
                description: data.description,
                tasks: data.routine_template_tasks || [],
            };

            setRoutine(tpl);

            // Set tasks from the fetched routine template tasks
            const fetchedTasks = (data.routine_template_tasks || []).map((task: any) => ({
                id: task.id,
                title: task.title,
                icon: task.icon,
                time_slot: task.time_slot,
                duration_minutes: task.duration_minutes ? String(task.duration_minutes) : undefined,
            }));

            setTasks(fetchedTasks);
        } catch (err) {
            console.error("Error fetching routine:", err);
        } finally {
            setLoading(false);
        }
    }, [routineId]);

    const handleAddToRoutine = async (
        task: string | TemplateTask,
        template: RoutineTemplate,
        childId: string
    ) => {
        try {
            const taskObj = typeof task === 'string' ? { title: task } : task;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: existingTasks, error: fetchError } = await supabase
                .from('routine_tasks')
                .select('id')
                .eq('title', taskObj.title)
                .eq('child_id', childId)
                .gte('created_at', today.toISOString())
                .lte('created_at', new Date(today.setHours(23, 59, 59, 999)).toISOString());

            if (fetchError) throw fetchError;

            if (existingTasks && existingTasks.length > 0) return;

            // Insert the new task
            const { error } = await supabase
                .from('routine_tasks')
                .insert({
                    child_id: childId,
                    title: taskObj.title,
                    description: taskObj.description || '',
                    time_slot: taskObj.time_slot || '00:00',
                    routine_name: template.name,
                    priority: taskObj.priority || 'medium',
                    duration_minutes: taskObj.duration_minutes
                        ? Number(taskObj.duration_minutes)
                        : 15,
                    category: taskObj.category || 'uncategorized',
                    icon: taskObj.icon || 'checkbox-blank-circle-outline',
                    is_completed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    due_date: new Date().toISOString(),
                    sort_order: 0,
                    metadata: {}
                });

            if (error) throw error;

            setSelectedTasks(prev => {
                if (!prev) return [];
                return prev;
            });

        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const fetchReminders = useCallback(async (rid: string) => {
        if (!rid) return;
        try {
            const { data, error } = await supabase
                .from("reminders")
                .select("*")
                .eq("routine_id", rid)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching reminders:", error.message);
                return;
            }
            setReminders(data ?? []);
        } catch (err) {
            console.error("Unexpected error fetching reminders:", err);
        }
    }, []);

    const fetchChildren = useCallback(async () => {
        try {
            setChildrenLoading(true);
            setChildrenError(null);
            const { data: userRes, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;

            const userId = userRes.user?.id;
            if (!userId) {
                setChildren([]);
                return;
            }

            const { data, error } = await supabase
                .from("children")
                .select("id, name, photo, age")
                .eq("user_id", userId)

            if (error) throw error;
            setChildren((data as Child[]) ?? []);
        } catch (err: any) {
            console.error("Error fetching children:", err?.message ?? err);
            setChildrenError("Failed to load children");
        } finally {
            setChildrenLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoutine();
        fetchReminders(routineId);
    }, [fetchRoutine, fetchReminders, routineId]);

    useEffect(() => {
        fetchChildren();
    }, [fetchChildren]);

    useEffect(() => {
        const handleClickOutside = () => {
            if (activeMenu !== null) {
                setActiveMenu(null);
            }
        };
    }, [activeMenu]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        Promise.all([fetchRoutine(), fetchReminders(routineId), fetchChildren()]).finally(() =>
            setRefreshing(false)
        );
    }, [fetchRoutine, fetchReminders, fetchChildren, routineId]);

    const toggleTask = useCallback((index: number) => {
        setSelectedTasks((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    }, []);

    const handleReorder = useCallback(() => setMode("reorder"), []);

    const handleSaveReorder = useCallback(() => {
        // TODO: persist order if needed
        setMode("view");
    }, []);

    const handleCancel = useCallback(() => {
        setMode("view");
        // Reset tasks to the original fetched state
        fetchRoutine();
    }, [fetchRoutine]);

    const handleAssignToChild = useCallback(() => {
        setAssignSheetOpen(true);
    }, []);

    const handleAddCustomRoutine = useCallback(() => {
        navigation.navigate("CustomTask", {
            onSave: (savedTask: Task, isEditing: boolean) => {
                if (isEditing) {
                    const updatedTasks = tasks.map(t =>
                        t.id === savedTask.id ? savedTask : t
                    );
                    setTasks(updatedTasks);
                } else {
                    setTasks([...tasks, { ...savedTask, id: Date.now().toString() }]);
                }
            },
            routineId: routine?.id,
            isPredefined: routine?.isPreloaded || false,
        });
    }, [navigation, tasks, routine]);

    const handleAssignRoutine = useCallback(
        async (template: RoutineTemplate) => {
            if (!selectedChildren || selectedChildren.length === 0) return;
            if (!selectedTasks || selectedTasks.length === 0) return;

            const tasksToAssign = selectedTasks
                .map((index) => tasks[index])
                .filter(Boolean)
                .map((task) => ({
                    ...task,
                    duration_minutes: task.duration_minutes
                        ? Number(task.duration_minutes)
                        : undefined,
                }));

            try {
                // Get current user ID
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("User not authenticated");

                let templateToUse = template;

                // If it's a user-created template (not preloaded), create a copy for each child
                if (!template.isPreloaded && template.id) {
                    // Create a copy of the template for each selected child
                    const templateCopies = await Promise.all(
                        selectedChildren.map(async (child) => {
                            const { data: newTemplate, error: insertError } = await supabase
                                .from("routine_templates")
                                .insert({
                                    name: template.name,
                                    icon: template.icon,
                                    description: template.description,
                                    tasks: template.tasks,
                                    notes: template.notes,
                                    categories: template.categories,
                                    is_active: true,
                                    user_id: user.id,
                                    child_id: child.id,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                })
                                .select()
                                .single();

                            if (insertError) throw insertError;
                            return newTemplate;
                        })
                    );

                    // Use the first template copy for task assignment
                    // (Each child gets their own copy but we use one for the task assignment logic)
                    templateToUse = { ...templateCopies[0], tasks: template.tasks };
                }
                // If it's a preloaded template, just assign the tasks without creating copies

                // Assign tasks to children using the appropriate template
                await Promise.all(
                    selectedChildren.flatMap((child) =>
                        tasksToAssign.map((task) => handleAddToRoutine(task, templateToUse, child.id))
                    )
                );

                setAssignSheetOpen(false);
                setSelectedChildren([]);
                setSelectedTasks([]);
                setShowAssignmentSuccess(true);
            } catch (err) {
                console.error("Error assigning routine:", err);
            }
        },
        [selectedChildren, selectedTasks, tasks, handleAddToRoutine]
    );

    const keyExtractor = useCallback(
        (item: Task, index: number) => item.id?.toString() ?? `task-${index}`,
        []
    );

    const renderReorderItem = useCallback(
        ({ item, drag, isActive, getIndex }: RenderItemParams<Task>) => {
            const index = getIndex();
            return (
                <ScaleDecorator>
                    <XStack
                        bg="white"
                        p="$3"
                        br="$3"
                        space="$5"
                        height={76}
                        ai="center"
                        mb="$3"
                        jc="space-between"
                        borderWidth={1}
                        borderColor={colors.border as any}
                        opacity={isActive ? 0.8 : 1}
                    >
                        {/* Drag Handle */}
                        <TouchableOpacity onLongPress={drag} disabled={isActive}>
                            <Menu size={20} color={colors.text as string} />
                        </TouchableOpacity>

                        {/* Task Title */}
                        <Text flex={1} color="#333" numberOfLines={1}>
                            {item.title || `Task ${typeof index === "number" ? index + 1 : ""}`}
                        </Text>

                        {/* Task Details */}
                        <Text color={colors.text} fontSize={12}>
                            {item.time_slot || "—"} | {item.duration_minutes || "—"} mins
                        </Text>
                    </XStack>
                </ScaleDecorator>
            );
        },
        [colors.border, colors.text]
    );

    const renderViewItem = useCallback(
        ({ item: task, drag, isActive, getIndex }: RenderItemParams<Task>) => {
            const index = typeof getIndex === "function" ? getIndex() : undefined;
            const isSelected = typeof index === "number" && selectedTasks.includes(index);

            return (
                <XStack
                    key={keyExtractor(task, typeof index === "number" ? index : 0)}
                    bg={isActive ? "#f0f0f0" : "white"}
                    p="$3"
                    br="$3"
                    mb='$5'
                    space="$5"
                    height={76}
                    ai="center"
                    jc="space-between"
                    borderWidth={1}
                    borderColor={colors.border as any}
                    style={{ zIndex: openDropdownIndex === index ? 1000 : 1 }}
                >
                    {/* Checkbox */}
                    <TouchableOpacity onPress={() => typeof index === "number" && toggleTask(index)}>
                        <View
                            w={20}
                            h={20}
                            br={12}
                            ai="center"
                            jc="center"
                            bg={isSelected ? colors.success : "transparent"}
                            borderWidth={2}
                            borderColor={isSelected ? (colors.border as any) : colors.text}
                        >
                            {isSelected && <MaterialCommunityIcons name="check" size={20} color="white" />}
                        </View>
                    </TouchableOpacity>

                    {/* Icon */}
                    <MaterialCommunityIcons
                        name={(task.icon as any) || "calendar-check"}
                        size={22}
                        color={colors.primary}
                    />

                    {/* Task info */}
                    <YStack flex={1} mx="$3">
                        <Text color="#333" numberOfLines={1}>
                            {task.title || `Task ${typeof index === "number" ? index + 1 : ""}`}
                        </Text>
                        <Text color={colors.text}>
                            {task.time_slot || "—"} | {task.duration_minutes || "—"} mins
                        </Text>
                    </YStack>

                    {/* Dropdown toggle */}
                    <XStack ai="center" jc="center" position="relative">
                        <TouchableOpacity onPress={() => typeof index === "number" && setOpenDropdownIndex(prev => prev === index ? null : index)}>
                            <MaterialCommunityIcons
                                name="pen"
                                size={18}
                                color={colors.secondary as any}
                            />
                        </TouchableOpacity>

                        {/* Dropdown on card */}
                        {typeof index === "number" && openDropdownIndex === index && (
                            <YStack
                                bg="white"
                                br="$3"
                                shadowColor="#000"
                                shadowOpacity={0.1}
                                shadowRadius={5}
                                elevation={10}
                                position="absolute"
                                top={-10} // moves dropdown slightly above card
                                right={-10} // adjust for card alignment
                                zIndex={1000}
                                width={150}
                            >
                                <TouchableOpacity
                                    onPress={() => {
                                        setOpenDropdownIndex(null);
                                        navigation.navigate("CustomTask", {
                                            task,
                                            onSave: (savedTask: Task, isEditing: boolean) => {
                                                if (isEditing) {
                                                    const updatedTasks = tasks.map(t =>
                                                        t.id === savedTask.id ? savedTask : t
                                                    );
                                                    setTasks(updatedTasks);
                                                }
                                            },
                                            routineId: routine?.id,
                                            isPredefined: routine?.isPreloaded || false,
                                        });
                                    }}
                                >
                                    <Text px="$2" py="$1">Edit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setOpenDropdownIndex(null);
                                        setTasks(prev => prev.filter(t => t.id !== task.id));
                                    }}
                                >
                                    <Text px="$2" py="$1">Delete</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => {
                                        setOpenDropdownIndex(null);
                                        drag?.(); // optional chaining in case drag is undefined
                                    }}
                                >
                                    <Text px="$2" py="$1">Reorder</Text>
                                </TouchableOpacity>
                            </YStack>
                        )}
                    </XStack>
                </XStack>
            );
        },
        [colors, keyExtractor, selectedTasks, toggleTask, tasks, routine, openDropdownIndex, setTasks, navigation]
    );

    const Header = useMemo(
        () => (
            <SafeAreaView style={{ backgroundColor: colors.secondary }}>
                <XStack
                    ai="center"
                    jc="space-between"
                    width="100%"
                    paddingTop="$2"
                    paddingBottom="$2"
                    px="$3"
                >
                    <TouchableOpacity
                        onPress={() => (mode === "view" ? navigation.goBack() : handleCancel())}
                    >
                        <MaterialCommunityIcons
                            name={mode === "view" ? "arrow-left" : "close"}
                            size={20}
                            color="white"
                        />
                    </TouchableOpacity>

                    <XStack jc="flex-start" ai="center" space="$3">
                        <View w={50} h={50} br={25} ai="center" jc="center" bg="#005A31">
                            <MaterialCommunityIcons name={routine?.icon as any || "calendar"} size={24} color="yellow" />
                        </View>
                        <H4 fontWeight="600" color="white">
                            {routine?.name || "Routine"}
                        </H4>
                    </XStack>

                    <XStack>
                        {mode === "view" ? (
                            <TouchableOpacity onPress={handleReorder}>
                                <MaterialCommunityIcons
                                    name='dots-vertical'
                                    size={22}
                                    color="white"
                                />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleSaveReorder}>
                                <MaterialCommunityIcons
                                    name="check"
                                    size={20}
                                    color="white"
                                />
                            </TouchableOpacity>
                        )}
                    </XStack>
                </XStack>

                <XStack px='$3' mb='$2'>
                    <Text fontSize={13} fontWeight="700" color="white">
                        {routine?.description || "Routine"}
                    </Text>
                </XStack>
            </SafeAreaView>
        ),
        [colors.secondary, handleCancel, handleReorder, handleSaveReorder, mode, navigation, routine]
    );

    const Content = useMemo(() => {
        return (
            <DraggableFlatList
                data={tasks}
                keyExtractor={keyExtractor}
                renderItem={renderViewItem} // unified view item with dropdown + drag
                onDragEnd={({ data }) => setTasks(data)}
                activationDistance={10} // long press to start drag
                dragItemOverflow={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                removeClippedSubviews={false}
                windowSize={10}
                contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
                ListHeaderComponent={
                    <YStack px="$3" mb='$4'>
                        <Text fontWeight="500" color={colors.text} mb="$2">
                            Select Tasks that apply to your child's routine
                        </Text>
                        <Text color={colors.textSecondary} fontSize={12}>
                            Long press a task to drag and reorder it. Tap the pen icon to edit, delete, or reorder.
                        </Text>
                    </YStack>
                }
                ListFooterComponent={
                    <YStack space="$4" px="$3" py="$2">
                        {/* Reminder */}
                        <YStack space="$2" mt="$2" px="$1">
                            <H6 fontSize={14} color={colors.text} fontWeight="600">
                                Reminder
                            </H6>
                            <Text>When should we remind you to start this routine?</Text>

                            {reminders.length > 0 ? (
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("Reminder", {
                                            routine: { id: routineId, title: routine?.name },
                                            reminderId: reminders[0]?.id,
                                            onSave: () => fetchReminders(routineId),
                                        })
                                    }
                                >
                                    <XStack
                                        mt="$3"
                                        ai="center"
                                        jc="space-between"
                                        p="$3"
                                        bg="#F9FAFB"
                                        br="$4"
                                        borderWidth={1}
                                        borderColor="#E5E7EB"
                                    >
                                        <YStack>
                                            <H4 color={colors.text}>{reminders[0].time.slice(0, 5)}</H4>
                                            <Text>{reminders[0].repeat}</Text>
                                        </YStack>
                                        <ChevronRight size={20} color={colors.text as string} />
                                    </XStack>
                                </TouchableOpacity>
                            ) : (
                                <Button
                                    width="100%"
                                    borderColor={colors.border as any}
                                    mt="$3"
                                    onPress={() =>
                                        navigation.navigate("Reminder", {
                                            routine: { id: routineId, title: routine?.name },
                                            onSave: () => fetchReminders(routineId),
                                        })
                                    }
                                    icon={<Bell size={16} />}
                                >
                                    Set Reminder
                                </Button>
                            )}
                        </YStack>

                        {/* Assign / Add buttons */}
                        {selectedTasks.length > 0 ? (
                            <Button
                                mt="$3"
                                size="$5"
                                bg={colors.primary}
                                color={colors.onPrimary}
                                onPress={handleAssignToChild}
                                icon={
                                    <MaterialCommunityIcons
                                        name="account-child-outline"
                                        size={18}
                                        color="white"
                                    />
                                }
                            >
                                Assign Routine ({selectedTasks.length} selected)
                            </Button>
                        ) : (
                            <Button
                                mt="$3"
                                size="$5"
                                bg={colors.primary}
                                color={colors.onPrimary}
                                onPress={handleAddCustomRoutine}
                                icon={
                                    <MaterialCommunityIcons
                                        name="plus-circle-outline"
                                        size={18}
                                        color="white"
                                    />
                                }
                            >
                                Add Custom Task
                            </Button>
                        )}
                    </YStack>
                }
                ListEmptyComponent={
                    loading ? (
                        <XStack ai="center" jc="center" p="$4">
                            <Spinner size="large" />
                            <Text ml="$3">Loading tasks...</Text>
                        </XStack>
                    ) : (
                        <Text color="#777" textAlign="center" py="$4">
                            No tasks yet. Add custom tasks to get started.
                        </Text>
                    )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary as string}
                    />
                }
            />
        );
    }, [
        tasks,
        keyExtractor,
        renderViewItem,
        colors,
        loading,
        refreshing,
        onRefresh,
        reminders,
        routineId,
        fetchReminders,
        navigation,
        selectedTasks,
        handleAssignToChild,
        handleAddCustomRoutine,
    ]);


    return (
        <GoalBackground>
            {Header}

            <SafeAreaView style={{ flex: 1 }}>
                {Content}
            </SafeAreaView>

            {/* Assign Routine Sheet */}
            <Sheet
                open={assignSheetOpen}
                onOpenChange={setAssignSheetOpen}
                snapPoints={[75]}
                modal
                dismissOnSnapToBottom
                animation="medium"
            >
                {/* Parent background overlay */}
                <Sheet.Overlay
                    animation="quick"
                    opacity={0.6}
                    bg="rgba(0,0,0,0.5)"
                />

                {/* Handle */}
                <Sheet.Handle />

                {/* Sheet frame */}
                <Sheet.Frame padding="$4" space="$4" bg="$background">
                    <H4 fontSize={16} fontWeight="600" mb="$3">
                        Assign Routine
                    </H4>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Fieldset space="$3">
                            <Label>Choose children</Label>

                            {childrenLoading ? (
                                <XStack ai="center" space="$2" py="$2">
                                    <Spinner size="small" />
                                    <Text>Loading children…</Text>
                                </XStack>
                            ) : childrenError ? (
                                <Text color="red">{childrenError}</Text>
                            ) : children.length === 0 ? (
                                <Text color="#666">No children found.</Text>
                            ) : (
                                <YStack space="$2">
                                    {children.map((child) => {
                                        const isSelected = selectedChildren.some((c) => c.id === child.id);

                                        return (
                                            <XStack
                                                key={child.id}
                                                onPress={() => {
                                                    if (isSelected) {
                                                        setSelectedChildren((prev) =>
                                                            prev.filter((c) => c.id !== child.id)
                                                        );
                                                    } else {
                                                        setSelectedChildren((prev) => [...prev, child]);
                                                    }
                                                }}
                                                p="$3"
                                                br="$3"
                                                height={70}
                                                ai="center"
                                                space="$5"
                                                borderWidth={1}
                                                borderColor={isSelected ? colors.primary : (colors.border as any)}
                                                bg={isSelected ? colors.primary : 'transparent'}
                                            >
                                                {/* Avatar */}
                                                <Avatar.Image
                                                    source={
                                                        child.photo
                                                            ? { uri: child.photo, cache: 'force-cache' }
                                                            : require('@/assets/images/profile.jpg')
                                                    }
                                                    size={54}
                                                />

                                                {/* Info */}
                                                <YStack>
                                                    <Text
                                                        color={isSelected ? colors.onPrimary : colors.text}
                                                        fontWeight="600"
                                                    >
                                                        {child.name}
                                                    </Text>
                                                    <Text color={isSelected ? colors.onPrimary : colors.text}>
                                                        {child.age} y/o
                                                    </Text>
                                                </YStack>

                                                {/* Checkbox */}
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (isSelected) {
                                                            setSelectedChildren((prev) =>
                                                                prev.filter((c) => c.id !== child.id)
                                                            );
                                                        } else {
                                                            setSelectedChildren((prev) => [...prev, child]);
                                                        }
                                                    }}
                                                    style={{ marginLeft: 'auto' }}
                                                >
                                                    <View
                                                        w={22}
                                                        h={22}
                                                        br={12}
                                                        ai="center"
                                                        jc="center"
                                                        bg={isSelected ? colors.success : 'transparent'}
                                                        borderWidth={2}
                                                        borderColor={isSelected ? colors.success : colors.text}
                                                    >
                                                        {isSelected && (
                                                            <MaterialCommunityIcons
                                                                name="check"
                                                                size={14}
                                                                color="white"
                                                            />
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            </XStack>
                                        );
                                    })}
                                </YStack>
                            )}
                        </Fieldset>

                        {/* Bottom button */}
                        <XStack space="$3" jc="center" ai="center" mt="$4">
                            <Button
                                size="$5"
                                width="100%"
                                onPress={() =>
                                    handleAssignRoutine({
                                        id: routineId,
                                        name: routine?.name || '',
                                        description: routine?.description,
                                        icon: routine?.icon,
                                        tasks: tasks,
                                        ageRange: '',
                                    } as RoutineTemplate)
                                }
                                disabled={selectedChildren.length === 0}
                                bg={colors.primary}
                                color="white"
                                br="$4"
                            >
                                Done
                            </Button>
                        </XStack>
                    </ScrollView>
                </Sheet.Frame>
            </Sheet>

            {/* Success Modal */}
            <Modal visible={showAssignmentSuccess} transparent animationType="slide" onRequestClose={() => setShowAssignmentSuccess(false)}>
                <YStack f={1} jc="flex-end" bg="rgba(0,0,0,0.4)">
                    <YStack bg={colors.card} p="$4" br="$6" space="$6" elevation={6} borderTopLeftRadius={20} borderTopRightRadius={20}>
                        <YStack space='$3' ai="center">
                            <MaterialCommunityIcons name="check-circle" size={48} color={colors.success} />
                            <Text fontWeight="600" textAlign="center" color={colors.text}>
                                Tasks Assigned Successfully!
                            </Text>
                            <Text fontWeight="600" textAlign="center">
                                The selected tasks have been added to your child's routine.
                            </Text>
                        </YStack>
                        <XStack jc='center' ai='center' mt='$5' mb='$7'>
                            <Button
                                size="$5"
                                w='80%'
                                bg={colors.primary}
                                color="white"
                                onPress={() => setShowAssignmentSuccess(false)}
                            >
                                OK
                            </Button>
                        </XStack>
                    </YStack>
                </YStack>
            </Modal>

            {/* Delete Modal */}
            <Modal visible={showOptions} transparent animationType="slide" onRequestClose={() => setShowOptions(false)}>
                <YStack f={1} jc="flex-end" bg="rgba(0,0,0,0.4)">
                    <YStack bg={colors.card} p="$4" br="$6" space="$6" elevation={6} borderTopLeftRadius={20} borderTopRightRadius={20}>
                        <YStack space='$3'>
                            <Text fontWeight="600" jc='center' ai='center' color={colors.text}>
                                Are you sure you want to Delete this Task ?
                            </Text>
                            <Text fontWeight="600">
                                Once this Task is deleted it cannot be retrieved.
                            </Text>
                        </YStack>
                        <XStack jc='center' ai='center' space='$6' mt='$5' mb='$7'>
                            <Button size="$5" w='40%' variant="outlined"
                                borderColor={colors.border as any}
                                onPress={() => setShowOptions(false)}>
                                Cancel
                            </Button>
                            <Button size="$5" w='40%' bg="red" color="white">
                                Delete
                            </Button>
                        </XStack>
                    </YStack>
                </YStack>
            </Modal>

        </GoalBackground>
    );
};

export default RoutineDetailsScreen;