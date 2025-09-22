import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    Button,
    Card,
    Checkbox,
    H2,
    Input,
    Label,
    Paragraph,
    ScrollView,
    Select,
    Sheet,
    Spinner,
    Switch,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui';

type RoutineTask = {
    id: string;
    child_id: string;
    title: string;
    description: string;
    is_completed: boolean;
    time_slot: string;
    category: 'morning' | 'afternoon' | 'evening' | 'other';
    tags: string[];
    is_recurring: boolean;
    recurrence_pattern?: 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom';
    recurrence_days?: number[];
    position: number;
};

export default function DailyRoutineScreen() {
    const { colors } = useTheme();
    const { childId } = useLocalSearchParams();
    const navigation = useNavigation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState<RoutineTask[]>([]);
    const [childName, setChildName] = useState('');
    const [newTaskModal, setNewTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        time_slot: '',
        category: 'other' as const,
        tags: [] as string[],
        is_recurring: false,
        recurrence_pattern: undefined as undefined | 'daily' | 'weekly' | 'weekdays' | 'weekends' | 'custom',
        recurrence_days: [] as number[]
    });
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        fetchChildData();
        fetchRoutineTasks();
    }, [childId]);

    const fetchChildData = async () => {
        if (!childId) return;

        try {
            const { data, error } = await supabase
                .from('children')
                .select('name')
                .eq('id', childId)
                .single();

            if (error) throw error;
            setChildName(data?.name || '');
        } catch (error) {
            console.error('Error fetching child data:', error);
        }
    };

    const fetchRoutineTasks = async () => {
        if (!childId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('routine_tasks')
                .select('*')
                .eq('child_id', childId)
                .order('position', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching routine tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
        try {
            const { error } = await supabase
                .from('routine_tasks')
                .update({ is_completed: !isCompleted })
                .eq('id', taskId);

            if (error) throw error;
            fetchRoutineTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDragEnd = async ({ data }: { data: RoutineTask[] }) => {
        setTasks(data);
        // Update positions in database
        const updates = data.map((task, index) => ({
            id: task.id,
            position: index
        }));

        try {
            const { error } = await supabase
                .from('routine_tasks')
                .upsert(updates);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating task positions:', error);
        }
    };

    const addNewTask = async () => {
        if (!newTask.title.trim() || !childId) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('routine_tasks')
                .insert([{
                    child_id: childId,
                    title: newTask.title,
                    description: newTask.description,
                    time_slot: newTask.time_slot || selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    category: newTask.category,
                    tags: newTask.tags,
                    is_recurring: newTask.is_recurring,
                    recurrence_pattern: newTask.recurrence_pattern,
                    recurrence_days: newTask.recurrence_days,
                    position: tasks.length
                }])
                .select();

            if (error) throw error;
            setNewTaskModal(false);
            setNewTask({
                title: '',
                description: '',
                time_slot: '',
                category: 'other',
                tags: [],
                is_recurring: false,
                recurrence_pattern: undefined,
                recurrence_days: []
            });
            fetchRoutineTasks();
        } catch (error) {
            console.error('Error adding new task:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderTaskItem = ({ item, drag, isActive }: {
        item: RoutineTask,
        drag: () => void,
        isActive: boolean
    }) => {
        return (
            <Card
                padding="$4"
                backgroundColor={isActive ? colors.surface : colors.cardBackground}
                borderColor={colors.border as any}
                borderWidth={1}
                onLongPress={drag}
                pressStyle={{ opacity: 0.8 }}
            >
                <XStack alignItems="center" space="$3">
                    <Checkbox
                        checked={item.is_completed}
                        onCheckedChange={() => toggleTaskCompletion(item.id, item.is_completed)}
                        size="$4"
                        backgroundColor={item.is_completed ? colors.primary : colors.cardBackground}
                        borderColor={colors.border as any}
                    >
                        <Checkbox.Indicator>
                            <MaterialIcons name="check" size={16} color="white" />
                        </Checkbox.Indicator>
                    </Checkbox>

                    <YStack flex={1} space="$1">
                        <XStack alignItems="center" space="$2">
                            <Text fontWeight="bold" fontSize="$5">
                                {item.title}
                            </Text>
                            {item.time_slot && (
                                <Text color={colors.textSecondary} fontSize="$2">
                                    ({item.time_slot})
                                </Text>
                            )}
                        </XStack>

                        {item.description && (
                            <Paragraph color={colors.textSecondary} fontSize="$3">
                                {item.description}
                            </Paragraph>
                        )}

                        <XStack space="$2" marginTop="$1">
                            {item.category !== 'other' && (
                                <Text
                                    fontSize="$1"
                                    backgroundColor={colors.surface}
                                    paddingHorizontal="$2"
                                    borderRadius="$2"
                                >
                                    {item.category}
                                </Text>
                            )}

                            {item.tags?.map((tag, index) => (
                                <Text
                                    key={index}
                                    fontSize="$1"
                                    backgroundColor={colors.surface}
                                    paddingHorizontal="$2"
                                    borderRadius="$2"
                                >
                                    #{tag}
                                </Text>
                            ))}

                            {item.is_recurring && (
                                <Text
                                    fontSize="$1"
                                    backgroundColor={colors.surface}
                                    paddingHorizontal="$2"
                                    borderRadius="$2"
                                >
                                    🔄 Recurring
                                </Text>
                            )}
                        </XStack>
                    </YStack>

                    <MaterialIcons
                        name="drag-handle"
                        size={24}
                        color={colors.textSecondary}
                    />
                </XStack>
            </Card>
        );
    };

    if (loading && !tasks.length) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" color={colors.primary as any} />
                <Text marginTop="$2">Loading routine...</Text>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View flex={1} backgroundColor={colors.background} padding="$4">
                <YStack space="$4">
                    <XStack alignItems="center" justifyContent="space-between">
                        <H2 color="$color">{childName}'s Daily Routine</H2>
                        <XStack space="$2">
                            <Button
                                size="$2"
                                icon={<MaterialIcons name="refresh" size={20} color={colors.primary} />}
                                onPress={fetchRoutineTasks}
                                chromeless
                            />
                            <Button
                                size="$2"
                                icon={<MaterialIcons name="add" size={20} color={colors.primary} />}
                                onPress={() => setNewTaskModal(true)}
                                chromeless
                            />
                        </XStack>
                    </XStack>

                    {tasks.length === 0 ? (
                        <Card elevate padding="$4" backgroundColor={colors.cardBackground}>
                            <Text textAlign="center">No routine tasks found</Text>
                            <Button
                                marginTop="$2"
                                onPress={() => setNewTaskModal(true)}
                            >
                                Add First Task
                            </Button>
                        </Card>
                    ) : (
                        <DraggableFlatList
                            data={tasks}
                            renderItem={renderTaskItem}
                            keyExtractor={(item) => item.id}
                            onDragEnd={handleDragEnd}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    )}
                </YStack>

                {/* Add New Task Modal */}
                <Sheet
                    modal
                    open={newTaskModal}
                    onOpenChange={setNewTaskModal}
                    snapPoints={[80]}
                    dismissOnSnapToBottom
                >
                    <Sheet.Overlay />
                    <Sheet.Handle />
                    <Sheet.Frame padding="$4" space>
                        <ScrollView>
                            <YStack space="$3">
                                <H2 textAlign="center">Add New Task</H2>

                                <YStack space="$1">
                                    <Label>Task Title *</Label>
                                    <Input
                                        value={newTask.title}
                                        onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                                        placeholder="Brush teeth"
                                    />
                                </YStack>

                                <YStack space="$1">
                                    <Label>Description</Label>
                                    <Input
                                        value={newTask.description}
                                        onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                                        placeholder="Optional description"
                                        multiline
                                        numberOfLines={3}
                                    />
                                </YStack>

                                <YStack space="$1">
                                    <Label>Time Slot</Label>
                                    <Button onPress={() => setShowTimePicker(true)}>
                                        {newTask.time_slot || 'Select time'}
                                    </Button>
                                    {showTimePicker && (
                                        <DateTimePicker
                                            value={selectedTime}
                                            mode="time"
                                            display="default"
                                            onChange={(event, date) => {
                                                setShowTimePicker(false);
                                                if (date) {
                                                    setSelectedTime(date);
                                                    setNewTask({
                                                        ...newTask,
                                                        time_slot: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    });
                                                }
                                            }}
                                        />
                                    )}
                                </YStack>

                                <YStack space="$1">
                                    <Label>Category</Label>
                                    <Select
                                        value={newTask.category}
                                        onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}
                                    >
                                        <Select.Trigger>
                                            <Select.Value placeholder="Select category" />
                                        </Select.Trigger>
                                        <Select.Content>
                                            <Select.Item value="morning" index={0}>
                                                <Select.ItemText>Morning</Select.ItemText>
                                            </Select.Item>
                                            <Select.Item value="afternoon" index={1}>
                                                <Select.ItemText>Afternoon</Select.ItemText>
                                            </Select.Item>
                                            <Select.Item value="evening" index={2}>
                                                <Select.ItemText>Evening</Select.ItemText>
                                            </Select.Item>
                                            <Select.Item value="other" index={3}>
                                                <Select.ItemText>Other</Select.ItemText>
                                            </Select.Item>
                                        </Select.Content>
                                    </Select>
                                </YStack>

                                <YStack space="$1">
                                    <Label>Tags (comma separated)</Label>
                                    <Input
                                        value={newTask.tags.join(',')}
                                        onChangeText={(text) => setNewTask({
                                            ...newTask,
                                            tags: text.split(',').map(tag => tag.trim()).filter(tag => tag)
                                        })}
                                        placeholder="hygiene,health,morning"
                                    />
                                </YStack>

                                <YStack space="$1">
                                    <XStack alignItems="center" justifyContent="space-between">
                                        <Label>Recurring Task</Label>
                                        <Switch
                                            checked={newTask.is_recurring}
                                            onCheckedChange={(checked) => setNewTask({
                                                ...newTask,
                                                is_recurring: checked
                                            })}
                                        >
                                            <Switch.Thumb />
                                        </Switch>
                                    </XStack>

                                    {newTask.is_recurring && (
                                        <YStack space="$2" marginTop="$2">
                                            <Label>Recurrence Pattern</Label>
                                            <Select
                                                value={newTask.recurrence_pattern}
                                                onValueChange={(value: any) => setNewTask({
                                                    ...newTask,
                                                    recurrence_pattern: value
                                                })}
                                            >
                                                <Select.Trigger>
                                                    <Select.Value placeholder="Select pattern" />
                                                </Select.Trigger>
                                                <Select.Content>
                                                    <Select.Item value="daily" index={0}>
                                                        <Select.ItemText>Daily</Select.ItemText>
                                                    </Select.Item>
                                                    <Select.Item value="weekdays" index={1}>
                                                        <Select.ItemText>Weekdays</Select.ItemText>
                                                    </Select.Item>
                                                    <Select.Item value="weekends" index={2}>
                                                        <Select.ItemText>Weekends</Select.ItemText>
                                                    </Select.Item>
                                                    <Select.Item value="weekly" index={3}>
                                                        <Select.ItemText>Weekly</Select.ItemText>
                                                    </Select.Item>
                                                    <Select.Item value="custom" index={4}>
                                                        <Select.ItemText>Custom Days</Select.ItemText>
                                                    </Select.Item>
                                                </Select.Content>
                                            </Select>

                                            {newTask.recurrence_pattern === 'custom' && (
                                                <YStack space="$1" marginTop="$2">
                                                    <Label>Select Days</Label>
                                                    <XStack flexWrap="wrap" space="$2">
                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                                                            <Button
                                                                key={day}
                                                                size="$2"
                                                                theme={newTask.recurrence_days?.includes(index) ? 'active' : undefined}
                                                                onPress={() => {
                                                                    const days = new Set(newTask.recurrence_days || []);
                                                                    if (days.has(index)) {
                                                                        days.delete(index);
                                                                    } else {
                                                                        days.add(index);
                                                                    }
                                                                    setNewTask({
                                                                        ...newTask,
                                                                        recurrence_days: Array.from(days)
                                                                    });
                                                                }}
                                                            >
                                                                {day}
                                                            </Button>
                                                        ))}
                                                    </XStack>
                                                </YStack>
                                            )}
                                        </YStack>
                                    )}
                                </YStack>

                                <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                                    <Button onPress={() => setNewTaskModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        theme="active"
                                        onPress={addNewTask}
                                        disabled={!newTask.title.trim()}
                                    >
                                        Add Task
                                    </Button>
                                </XStack>
                            </YStack>
                        </ScrollView>
                    </Sheet.Frame>
                </Sheet>
            </View>
        </GestureHandlerRootView>
    );
}