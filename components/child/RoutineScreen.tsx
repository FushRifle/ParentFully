import { CelebrationModal } from '@/components/CelebrateModal';
import { GoalBackground } from '@/constants/GoalBackground';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, Pen } from '@tamagui/lucide-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl } from 'react-native';
import { Button, Card, ScrollView, Text, View, XStack, YStack } from 'tamagui';

type RootStackParamList = {
    ChildProfile: { child: ChildProfile };
    Goals: undefined;
    Routine: undefined;
};

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo: string;
    notes?: string;
    points?: number;
}

type RoutineTask = {
    id: string;
    title: string;
    description?: string | null;
    time_slot?: string | null;
    routine_name?: string | null;
    template_id?: string | null;
    priority?: string | null;
    duration_minutes?: number | null;
    category?: string | null;
    icon?: string | null;
    is_completed?: boolean | null;
    created_at?: string | null;
    updated_at?: string | null;
    due_date?: string | null;
    completed_at?: string | null;
    sort_order?: number | null;
    metadata?: any;
    child_id?: string | null;
};

type ChildProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ChildProfile'>;

const TaskRow = React.memo(
    ({ task, isSelected, onToggle, colors }: {
        task: RoutineTask;
        isSelected: boolean;
        onToggle: () => void;
        colors: any;
    }) => {
        const completed = task.is_completed;

        return (
            <Pressable onPress={!completed ? onToggle : undefined}>
                <YStack
                    marginBottom="$3"
                    padding="$3"
                    borderRadius="$4"
                    backgroundColor={completed ? colors.success + "20" : colors.card} // ✅ faint green bg if completed
                    opacity={completed ? 0.7 : 1} // ✅ slightly faded
                >
                    <XStack justifyContent="space-between" alignItems="center" space="$3">
                        <XStack
                            width={22}
                            height={22}
                            borderRadius={9999}
                            borderWidth={2}
                            borderColor={completed ? colors.success : isSelected ? colors.success : colors.secondary}
                            backgroundColor={completed || isSelected ? colors.success : "transparent"}
                            alignItems="center"
                            justifyContent="center"
                        >
                            {(completed || isSelected) && <MaterialIcons name="check" size={16} color="white" />}
                        </XStack>

                        <YStack flex={1} ml="$3">
                            <Text color={completed ? colors.success : colors.text} fontWeight={completed ? "bold" : "normal"}>
                                {task.title}
                            </Text>
                            {(task.time_slot || task.duration_minutes) && (
                                <Text
                                    color={completed ? colors.success : colors.textSecondary}
                                    fontSize="$2"
                                    marginTop="$2"
                                >
                                    {task.time_slot ?? ""}
                                    {task.time_slot && task.duration_minutes ? " | " : ""}
                                    {task.duration_minutes ? `${task.duration_minutes} mins` : ""}
                                </Text>
                            )}
                        </YStack>

                        <Pen size={14} color={completed ? colors.success : colors.secondary as any} />
                    </XStack>
                </YStack>
            </Pressable>
        );
    },
    (prevProps, nextProps) =>
        prevProps.task.id === nextProps.task.id &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.colors === nextProps.colors
);

const GroupCard = React.memo(({
    group,
    template,
    isExpanded,
    onToggleGroup,
    selectedTasks,
    setSelectedTasks,
    setCelebratingTask,
    colors
}: {
    group: any;
    template: any;
    isExpanded: boolean;
    onToggleGroup: (key: string) => void;
    selectedTasks: string[];
    setSelectedTasks: React.Dispatch<React.SetStateAction<string[]>>;
    setCelebratingTask: React.Dispatch<React.SetStateAction<{ visible: boolean; taskTitle: string }>>;
    colors: any;
}) => {
    const handleTaskToggle = useCallback((taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    }, []);

    const handleComplete = useCallback(async () => {
        if (selectedTasks.length === 0) return;

        try {
            const { error } = await supabase
                .from("routine_tasks")
                .update({ is_completed: true, completed_at: new Date().toISOString() })
                .in("id", selectedTasks);

            if (error) throw error;

            setCelebratingTask({
                visible: true,
                taskTitle: `${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""}`,
            });

            setSelectedTasks([]);
        } catch (err) {
            console.error("Error updating tasks:", err);
        }
    }, [selectedTasks, setCelebratingTask, setSelectedTasks]);

    return (
        <Card
            backgroundColor={colors.card}
            borderTopColor={group.color}
            borderTopWidth={4}
            borderColor={colors.border as any}
            borderRadius="$3"
            mt="$2"
        >
            <Pressable onPress={() => onToggleGroup(group.key)}>
                <XStack padding="$4" justifyContent="space-between" alignItems="center">
                    <YStack>
                        <Text fontWeight="bold" fontSize="$4" color={colors.text}>
                            {group.name}
                        </Text>
                        {template?.reminder && (
                            <XStack space="$2" alignItems="center" mt="$1">
                                <Bell size={14} color={colors.secondary as any} />
                                <Text color={colors.secondary} fontSize="$2">
                                    Reminder: {template.reminder.time}
                                </Text>
                            </XStack>
                        )}
                    </YStack>

                    <Button
                        size="$2"
                        circular
                        onPress={e => {
                            e?.stopPropagation?.();
                            onToggleGroup(group.key);
                        }}
                        backgroundColor={colors.secondary}
                        icon={
                            isExpanded ? (
                                <MaterialIcons name="expand-less" size={18} color="white" />
                            ) : (
                                <MaterialIcons name="expand-more" size={18} color="white" />
                            )
                        }
                    />
                </XStack>
            </Pressable>

            {isExpanded && (
                <YStack padding="$4" borderTopWidth={1} borderTopColor={colors.primary}>
                    {group.tasks.map((task: RoutineTask) => {
                        const isSelected = selectedTasks.includes(task.id);
                        return (
                            <TaskRow
                                key={task.id}
                                task={task}
                                isSelected={isSelected}
                                onToggle={() => handleTaskToggle(task.id)}
                                colors={colors}
                            />
                        );
                    })}

                    {selectedTasks.length > 0 && (
                        <Button
                            mt="$3"
                            bg={colors.primary}
                            color={colors.onPrimary}
                            onPress={handleComplete}
                        >
                            Mark as Complete
                        </Button>
                    )}
                </YStack>
            )}
        </Card>
    );
}, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.group.key === nextProps.group.key &&
        prevProps.isExpanded === nextProps.isExpanded &&
        prevProps.selectedTasks.length === nextProps.selectedTasks.length &&
        prevProps.colors === nextProps.colors
    );
});

export const RoutineScreen = ({ childId: initialChildId }: { childId: string }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [routines, setRoutines] = useState<RoutineTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [childId, setChildId] = useState<string | null>(initialChildId);
    const [childName, setChildName] = useState('');
    const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [celebratingTask, setCelebratingTask] = useState({
        visible: false,
        taskTitle: '',
    });

    const fetchTemplates = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('routine_templates')
                .select(
                    `
          id,
          name,
          color,
          reminder:reminders!routine_templates_reminder_id_fkey (
            id,
            time,
            title,
            message
          )
        `
                )
                .order('created_at', { ascending: true });

            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    }, []);

    const fetchRoutines = useCallback(async () => {
        try {
            if (!childId) return;

            setLoading(true);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const { data, error } = await supabase
                .from('routine_tasks')
                .select('*')
                .eq('child_id', childId)
                .gte('created_at', today.toISOString())
                .lt('created_at', tomorrow.toISOString())
                .order('sort_order', { ascending: true })
                .order('created_at', { ascending: true });

            if (error) throw error;

            setRoutines((data || []) as RoutineTask[]);
            setError(null);
        } catch (err) {
            console.error('Error fetching routines:', err);
            setError('Failed to load routines');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchRoutines();
        fetchTemplates();
    }, [fetchRoutines, fetchTemplates]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRoutines();
        fetchTemplates();
    }, [fetchRoutines, fetchTemplates]);

    const groupedRoutines = useMemo(() => {
        const map = new Map<string, { key: string; name: string; color: string; template_id?: string | null; tasks: RoutineTask[] }>();

        routines.forEach(task => {
            const key = task.template_id ?? task.routine_name ?? 'unassigned';
            const name = task.routine_name ?? 'Routine';

            const template = templates.find(t => t.id === task.template_id);
            const color = template?.color ?? '#CCCCCC';

            if (!map.has(key)) {
                map.set(key, { key, name, color, template_id: task.template_id, tasks: [] });
            }
            map.get(key)!.tasks.push(task);
        });

        return Array.from(map.values());
    }, [routines, templates]);

    const toggleGroup = useCallback((key: string) => {
        setExpandedGroupKey(prev => (prev === key ? null : key));
    }, []);

    const closeCelebrationModal = useCallback(() => {
        setCelebratingTask({ visible: false, taskTitle: "" });
        fetchRoutines();
    }, [fetchRoutines]);

    if (error) {
        return (
            <View flex={1} justifyContent="center" alignItems="center" padding="$4">
                <Text color={colors.error} marginBottom="$4">
                    {error}
                </Text>
                <Button onPress={() => fetchRoutines()}>Retry</Button>
            </View>
        );
    }

    if (loading && !refreshing) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <GoalBackground>
            <ScrollView
                flex={1}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                contentContainerStyle={{ padding: 16, flexGrow: 1, paddingBottom: 80 }}
                showsVerticalScrollIndicator={false}
            >
                <YStack space="$3">
                    {groupedRoutines.length === 0 ? (
                        <YStack ai="center" mt='$3' jc="center" p="$6" br="$4" bg={colors.surface} gap="$3">
                            <Text color={colors.textSecondary} fontSize='$4'>
                                No routine tasks for today
                                Add some to get started!</Text>
                            <Button
                                size='$5'
                                onPress={() =>
                                    navigation.navigate('Routine')}
                                backgroundColor={colors.secondary}
                                color={colors.onPrimary}
                                marginTop="$4"
                            >
                                Add New Routine
                            </Button>
                        </YStack>
                    ) : (
                        groupedRoutines.map(group => {
                            const isExpanded = expandedGroupKey === group.key;
                            const template = templates.find(t => t.id === group.template_id);

                            return (
                                <GroupCard
                                    key={group.key}
                                    group={group}
                                    template={template}
                                    isExpanded={isExpanded}
                                    onToggleGroup={toggleGroup}
                                    selectedTasks={selectedTasks}
                                    setSelectedTasks={setSelectedTasks}
                                    setCelebratingTask={setCelebratingTask}
                                    colors={colors}
                                />
                            );
                        })
                    )}
                </YStack>

                <CelebrationModal
                    visible={celebratingTask.visible}
                    onClose={closeCelebrationModal}
                    taskTitle={celebratingTask.taskTitle}
                />
            </ScrollView>
        </GoalBackground>

    );
};