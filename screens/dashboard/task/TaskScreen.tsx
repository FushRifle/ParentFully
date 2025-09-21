import { AddTasksModal } from '@/components/task/AddTaskModal';
import { PRELOADED_TASKS } from '@/constants/Tasks';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type { FamilyTask, TaskTemplate } from '@/types/tasks';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, RefreshControl } from 'react-native';
import {
    Button,
    Card,
    Checkbox,
    H3,
    H4,
    Paragraph,
    ScrollView,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui';


export default function TaskScreen() {
    const { colors } = useTheme();
    const { childId } = useLocalSearchParams<{ childId?: string }>();
    const navigation = useNavigation();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState<FamilyTask[]>([]);
    const [childName, setChildName] = useState('');

    const isValidUUID = (id: string | undefined): boolean =>
        !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);

    const fetchData = useCallback(async () => {
        if (!isValidUUID(childId)) return;

        try {
            setLoading(true);
            await fetchChildData();
            await fetchFamilyTasks();
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);
    // Fetch child data
    const fetchChildData = async () => {
        try {
            const { data, error } = await supabase
                .from('children')
                .select('name, age')
                .eq('id', childId)
                .single();

            if (error) throw error;
            setChildName(data?.name || '');
        } catch (error) {
            console.error('Error fetching child data:', error);
        }
    };

    // Fetch family tasks
    const fetchFamilyTasks = async () => {
        try {
            const { data, error } = await supabase
                .from('family_tasks')
                .select('*')
                .eq('child_id', childId)
                .order('due_date', { ascending: true });

            if (error) throw error;
            setTasks(data || []);
        } catch (error) {
            console.error('Error fetching family tasks:', error);
        }
    };

    const toggleTaskCompletion = async (taskId: string, isCompleted: boolean) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === taskId ? { ...task, is_completed: !isCompleted } : task
            )
        );

        const { error } = await supabase
            .from('family_tasks')
            .update({ is_completed: !isCompleted })
            .eq('id', taskId);

        if (error) {
            console.error('Error updating task:', error);
            fetchFamilyTasks(); // fallback refresh
        }
    };

    const applyTemplate = async (template: TaskTemplate) => {
        try {
            setLoading(true);

            const { error } = await supabase
                .from('family_tasks')
                .insert({
                    child_id: childId,
                    title: template.title,
                    description: template.description,
                    due_date: template.due_date,
                    assignee: template.assignee,
                    is_completed: false
                });

            if (error) throw error;

            await fetchFamilyTasks();
        } catch (error) {
            console.error('Error applying template:', error);
        } finally {
            setLoading(false);
            setTemplateModalOpen(false);
        }
    };

    const TemplateModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={templateModalOpen}
            onRequestClose={() => setTemplateModalOpen(false)}
        >
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{
                    backgroundColor: colors.cardBackground,
                    margin: 20,
                    borderRadius: 10,
                    padding: 20,
                    maxHeight: '80%'
                }}>
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$5">
                        <H4>Common Family Tasks</H4>
                        <Button
                            unstyled
                            onPress={() => setTemplateModalOpen(false)}
                            icon={<Feather name="x" size={24} color={colors.text} />}
                        />
                    </XStack>

                    <ScrollView>
                        <YStack space="$3">
                            {PRELOADED_TASKS.map((task, index) => (
                                <Card key={index} padding="$3" backgroundColor={colors.surface}>
                                    <YStack space="$2">
                                        <Text fontWeight="bold">{task.title}</Text>
                                        <Text color={colors.text}>{task.description}</Text>

                                        <XStack justifyContent="space-between" marginTop="$2">
                                            <XStack alignItems="center" space="$2">
                                                <MaterialIcons
                                                    name="calendar-today"
                                                    size={16}
                                                    color={colors.textSecondary}
                                                />
                                                <Text color={colors.textSecondary}>
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </Text>
                                            </XStack>
                                            <Text color={colors.primary}>
                                                {task.assignee}
                                            </Text>
                                        </XStack>

                                        <Button
                                            marginTop="$2"
                                            onPress={() => applyTemplate(task)}
                                            backgroundColor={colors.primary}
                                            color={colors.onPrimary}
                                        >
                                            Add This Task
                                        </Button>
                                    </YStack>
                                </Card>
                            ))}
                        </YStack>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <View flex={1} backgroundColor={colors.background}>
            {/* Header */}
            <XStack
                alignItems="center"
                justifyContent="space-between"
                padding="$8"
                paddingTop="$8"
                backgroundColor={colors.primary}
                borderBottomWidth={1}
                borderBottomColor={colors.border as any}
            >
                <Button
                    unstyled
                    onPress={() => navigation.goBack()}
                    icon={<Feather name="chevron-left" size={24} color={colors.onPrimary} />}
                    pressStyle={{ opacity: 0.8 }}
                />

                <H3 color={colors.onPrimary} fontWeight="bold">
                    Family Tasks
                </H3>

                <XStack space="$3">
                    <Button
                        unstyled
                        icon={<MaterialIcons name="library-books" size={24} color={colors.onPrimary} />}
                        onPress={() => setTemplateModalOpen(true)}
                        pressStyle={{ opacity: 0.8 }}
                    />
                    <Button
                        unstyled
                        icon={<MaterialIcons name="add" size={24} color={colors.onPrimary} />}
                        onPress={() => setAddModalOpen(true)}
                        pressStyle={{ opacity: 0.8 }}
                    />
                </XStack>
            </XStack>

            {/* Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={{ padding: 16 }}
            >
                {tasks.length === 0 ? (
                    <Card
                        padding="$4"
                        backgroundColor={colors.background}
                        borderColor={colors.border as any}
                        marginBottom="$4"
                    >
                        <YStack alignItems="center" space="$3">
                            <MaterialIcons
                                name="checklist"
                                size={40}
                                color={colors.textSecondary}
                            />
                            <Text color={colors.text} textAlign="center">
                                No tasks found for this child
                            </Text>
                            <Button
                                onPress={() => setAddModalOpen(true)}
                                backgroundColor={colors.primary}
                                color="white"
                                marginTop="$2"
                            >
                                Add First Task
                            </Button>
                            <Button
                                onPress={() => setTemplateModalOpen(true)}
                                backgroundColor={colors.primary}
                                color={colors.onPrimary}
                                marginTop="$2"
                            >
                                Use Common Tasks
                            </Button>
                        </YStack>
                    </Card>
                ) : (
                    <YStack space="$3">
                        {tasks.map((task) => (
                            <Card
                                key={task.id}
                                padding="$4"
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                                borderWidth={1}
                                borderRadius="$4"
                                shadowColor={colors.accent}
                                shadowRadius={6}
                                shadowOffset={{ width: 0, height: 2 }}
                                shadowOpacity={0.05}
                            >
                                <XStack alignItems="center" space="$3">
                                    <Checkbox
                                        checked={task.is_completed}
                                        onCheckedChange={() =>
                                            toggleTaskCompletion(task.id, task.is_completed)
                                        }
                                        size="$4"
                                        backgroundColor={
                                            task.is_completed
                                                ? colors.primary
                                                : colors.cardBackground
                                        }
                                        borderColor={colors.border as any}
                                    >
                                        <Checkbox.Indicator>
                                            <MaterialIcons name="check" size={16} color="white" />
                                        </Checkbox.Indicator>
                                    </Checkbox>

                                    <YStack flex={1} space="$2">
                                        <XStack alignItems="center" space="$2">
                                            <Text
                                                fontWeight="bold"
                                                fontSize="$5"
                                                color={task.is_completed ? colors.textSecondary : colors.text}
                                                textDecorationLine={task.is_completed ? 'line-through' : 'none'}
                                            >
                                                {task.title}
                                            </Text>
                                        </XStack>

                                        {task.description && (
                                            <Paragraph
                                                color={colors.textSecondary}
                                                fontSize="$3"
                                                numberOfLines={2}
                                            >
                                                {task.description}
                                            </Paragraph>
                                        )}

                                        <XStack justifyContent="space-between" marginTop="$2">
                                            <XStack alignItems="center" space="$2">
                                                <MaterialIcons
                                                    name="calendar-today"
                                                    size={16}
                                                    color={colors.textSecondary}
                                                />
                                                <Text color={colors.textSecondary}>
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </Text>
                                            </XStack>
                                            <Text color={colors.primary}>
                                                {task.assignee}
                                            </Text>
                                        </XStack>
                                    </YStack>
                                </XStack>
                            </Card>
                        ))}
                    </YStack>
                )}
            </ScrollView>

            {/* Add Task Modal */}
            <AddTasksModal
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                childId={childId}
                onTaskAdded={fetchFamilyTasks}
            />

            {/* Template Modal */}
            {templateModalOpen && <TemplateModal />}

            {/* Floating Add Button */}
            {tasks.length > 0 && (
                <View
                    position="absolute"
                    bottom={20}
                    right={20}
                    animation="quick"
                    enterStyle={{ y: 50, opacity: 0 }}
                    exitStyle={{ y: 50, opacity: 0 }}
                >
                    <Button
                        circular
                        size="$5"
                        backgroundColor={colors.primary}
                        onPress={() => setAddModalOpen(true)}
                        icon={<MaterialIcons name="add" size={24} color="white" />}
                        shadowColor="#000"
                        shadowRadius={10}
                        shadowOffset={{ width: 0, height: 4 }}
                        shadowOpacity={0.1}
                    />
                </View>
            )}
        </View>
    );
}