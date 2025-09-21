import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Card, H4, ScrollView, Text, View, XStack, YStack } from 'tamagui';
import { v4 as uuidv4 } from 'uuid';

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

type RoutineTemplate = {
    id: string;
    name: string;
    ageRange: string;
    description?: string;
    tasks: (string | TemplateTask)[];
    notes?: string;
    isPreloaded?: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    categories?: string[];
};

export default function RoutineTemplatesScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();

    // Core state
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTasks, setSelectedTasks] = useState<Record<string, boolean>>({});

    // Template state
    const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
    const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<RoutineTemplate | null>(null);

    //child States
    const [childId, setChildId] = useState<string | null>(null);
    const [childName, setChildName] = useState('');
    const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);

    // Modal visibility
    const [modalState, setModalState] = useState({
        childSelection: false,
        edit: false,
    });

    // Fetch all templates
    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('routine_templates')
                .select('*')
                .order('created_at', { ascending: true });

            if (fetchError) throw fetchError;

            setTemplates(data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError('Failed to load templates');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchChildren = useCallback(async () => {
        try {
            if (!user?.id) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('children')
                .select('id, name, age')
                .or(`user_id.eq.${user.id},parent_id.eq.${user.id}`)
                .order('name', { ascending: true });

            if (error) throw error;
            if (!data?.length) throw new Error('No children found');

            setChildren(data);
            if (!childId) {
                setChildId(data[0].id);
                setChildName(data[0].name);
            }
        } catch (err) {
            console.error('Error fetching children:', err);
            setError(err instanceof Error ? err.message : 'Failed to load children');
        }
    }, [user?.id, childId]);

    useEffect(() => {
        fetchChildren();
        fetchTemplates();
    }, [fetchChildren, fetchTemplates]);

    // Handlers
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchTemplates();
    }, [fetchTemplates]);

    const toggleModal = (modal: keyof typeof modalState, value?: boolean) => {
        setModalState(prev => ({ ...prev, [modal]: value ?? !prev[modal] }));
    };
    const toggleTemplateExpand = (templateId: string) => {
        setExpandedTemplateId(expandedTemplateId === templateId ? null : templateId);
    };

    const handleDeleteTask = async (templateId: string, taskTitle: string) => {
        try {
            const template = templates.find(t => t.id === templateId);
            if (!template) throw new Error('Template not found');

            const updatedTasks = template.tasks.filter(task =>
                typeof task === 'string' ? task !== taskTitle : task?.title?.trim() !== taskTitle.trim()
            );

            const { error } = await supabase
                .from('routine_templates')
                .update({ tasks: updatedTasks })
                .eq('id', templateId);

            if (error) throw error;

            setTemplates(prev =>
                prev.map(t =>
                    t.id === templateId ? { ...t, tasks: updatedTasks } : t
                )
            );
        } catch (err) {
            console.error('Error deleting task:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete task');
        }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        try {
            const { error } = await supabase
                .from('routine_templates')
                .delete()
                .eq('id', templateId);

            if (error) throw error;

            setTemplates(prev => prev.filter(t => t.id !== templateId));
        } catch (error) {
            console.error('Failed to delete template:', error);
            alert(error instanceof Error ? error.message : 'Failed to delete template');
        }
    };

    const handleEditTemplate = (template: RoutineTemplate) => {
        setEditingTemplate(template);
    };

    const handleAddToRoutine = async (
        task: string | TemplateTask,
        template: RoutineTemplate,
        childId: string
    ) => {
        try {
            const taskObj = typeof task === 'string' ? { title: task } : task;
            const taskKey = `${template.id}-${taskObj.title}`;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data: existingTasks, error: fetchError } = await supabase
                .from('routine_tasks')
                .select('id')
                .eq('title', taskObj.title)
                .eq('template_id', template.id)
                .eq('child_id', childId)
                .gte('created_at', today.toISOString())
                .lte('created_at', new Date(today.setHours(23, 59, 59, 999)).toISOString());

            if (fetchError) throw fetchError;

            if (existingTasks && existingTasks.length > 0) {
                Toast.show({
                    type: 'info',
                    text1: 'Task Exists',
                    text2: `${taskObj.title} is already in ${childName}'s routine today`,
                });
                return;
            }

            // Insert the new task with child_id
            const { error } = await supabase
                .from('routine_tasks')
                .insert({
                    child_id: childId, // Include child_id in the insert
                    title: taskObj.title,
                    description: taskObj.description || '',
                    time_slot: taskObj.time_slot || '00:00',
                    routine_name: template.name,
                    template_id: template.id,
                    priority: taskObj.priority || 'medium',
                    duration_minutes: taskObj.duration_minutes || 15,
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

            // Update the selected state
            setSelectedTasks(prev => ({
                ...prev,
                [taskKey]: true
            }));

            Toast.show({
                type: 'success',
                text1: 'Task Added',
                text2: `${taskObj.title} has been added to ${childName}'s routine`,
            });

        } catch (error) {
            console.error('Error adding task:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add task to routine',
            });
        }
    };

    // UI
    if (error) {
        return (
            <View flex={1} justifyContent="center" alignItems="center" padding="$4">
                <Text color={colors.error} marginBottom="$4">{error}</Text>
                <Button onPress={fetchTemplates}>Retry</Button>
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
    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            const { data: pre, error: preErr } = await supabase
                .from("routine_templates")
                .select("*")
                .order("id", { ascending: true });

            const { data: mine, error: myErr } = await supabase
                .from("user_routines")
                .select("*")
                .eq("user_id", user.id)
                .order("id", { ascending: true });

            const order = ["Morning", "After School", "Evening", "No School"];

            const sortByCustomOrder = (arr: any[]) =>
                arr.sort(
                    (a, b) => order.indexOf(a.period) - order.indexOf(b.period)
                );

            setPredefined(pre ? sortByCustomOrder(pre) : []);
            setMyRoutines(mine ? sortByCustomOrder(mine) : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load routines");
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <View flex={1} backgroundColor={colors.background}>

            {/* Routine Tasks Section
                <YStack space="$3"
                    mb="$4">
                    <XStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="$6" fontWeight="bold" color={colors.text}>
                            Today's Tasks
                        </Text>
                    </XStack>
                    {routines.length > 0 ? (
                        routines.map((routine) => (
                            <XStack
                                key={routine.id}
                                padding="$3"
                                borderRadius="$5"
                                elevation={10}
                                mb="$2"
                                jc="space-between"
                                backgroundColor={colors.secondary}
                            >
                                <YStack>
                                    <Text fontSize="$5" color={colors.onPrimary} fontWeight="500">
                                        {routine.title}
                                    </Text>
                                    <Text fontSize="$2" color={colors.onPrimary} mb="$1">
                                        {routine.created_at?.slice(0, 10)}
                                    </Text>
                                </YStack>
                                <PaperButton
                                    icon={routine.completed ? "check-circle" : "circle-outline"}
                                    mode="text"
                                    onPress={() => toggleRoutineCompletion(routine.id, routine.completed)}
                                    textColor={routine.completed ? String(colors.success) : String(colors.onPrimary)}
                                >
                                    {routine.completed ? 'Done' : 'Pending'}
                                </PaperButton>
                            </XStack>
                        ))
                    ) : (
                        <Text ta="center" my="$4" color={colors.text}>
                            No routines found
                        </Text>
                    )}
                </YStack>
                */}


            {/* Header */}
            <View mx="$3" mt="$5" mb="$1">
                <XStack jc="space-between" ai="center" position="relative">

                    {/* Back Button */}
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.primary} />}
                    />

                    {/* Center Title (absolute center) */}
                    <YStack
                        position="absolute"
                        left={0}
                        right={0}
                        ai="center"
                        pointerEvents="none"
                    >
                        <Text color={colors.primary} fontWeight="700" fontSize="$5" ta="center">
                            Family Routine Tasks
                        </Text>
                    </YStack>

                    {/* Child Selector */}
                    <Button unstyled onPress={() => toggleModal('childSelection', true)}>
                        <YStack ai="center" mt="$3">
                            <MaterialIcons name="child-care" size={20} color={colors.primary} />
                            <Text color={colors.primary} fontWeight="700" fontSize="$5" ta="center">
                                {childName ? `${childName}` : 'Select Child'}
                            </Text>
                            {childName && (
                                <Text color={colors.textSecondary} fontSize="$1">
                                    Tap to change child
                                </Text>
                            )}
                        </YStack>
                    </Button>
                </XStack>
            </View>


            {/* Main Content */}
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                contentContainerStyle={{
                    padding: 16,
                    flexGrow: 1,
                    paddingBottom: 80
                }}
                showsVerticalScrollIndicator={false}
            >
                {templates.length === 0 ? (
                    <View flex={1} justifyContent="center" alignItems="center" padding="$4">
                        <Text color={colors.textSecondary}>No templates found. Create your first one!</Text>
                    </View>
                ) : (
                    <YStack space="$4">
                        {templates.map(template => (
                            <Card key={template.id} backgroundColor={colors.primaryContainer}
                                borderRadius="$6"
                                mt="$3"
                            >
                                <XStack
                                    padding="$4"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    onPress={() => toggleTemplateExpand(template.id)}
                                >
                                    <YStack flex={1}>
                                        <Text
                                            fontWeight="bold"
                                            fontSize="$4"
                                            color={colors.primary}
                                        >
                                            {template.name}
                                        </Text>

                                        <Text color={colors.primary} fontSize="$2" marginTop="$1">
                                            {template.ageRange} • {template.tasks.length} tasks
                                        </Text>
                                    </YStack>

                                    <XStack space="$2">
                                        <Button
                                            size="$2"
                                            circular
                                            icon={<MaterialIcons name="edit" size={18} color={colors.onPrimary} />}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleEditTemplate(template);
                                            }}
                                            backgroundColor={colors.primary}
                                        />
                                        <Button
                                            size="$2"
                                            circular
                                            icon={
                                                expandedTemplateId === template.id ?
                                                    <MaterialIcons name="expand-less" size={18} color={colors.onPrimary} /> :
                                                    <MaterialIcons name="expand-more" size={18} color={colors.onPrimary} />
                                            }
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                toggleTemplateExpand(template.id);
                                            }}
                                            backgroundColor={colors.primary}
                                        />
                                    </XStack>
                                </XStack>

                                {expandedTemplateId === template.id && (
                                    <YStack padding="$4" borderTopWidth={1} borderTopColor={colors.primary as any}>
                                        <YStack space="$3">
                                            {template.tasks.length === 0 ? (
                                                <Text color={colors.primary}>No tasks in this template</Text>
                                            ) : (
                                                template.tasks.map((task, index) => {
                                                    const taskObj = typeof task === 'string' ? { title: task } : task;
                                                    const taskKey = `${template.id}-${taskObj.title}`;
                                                    const isSelected = selectedTasks[taskKey];

                                                    return (
                                                        <XStack
                                                            key={index}
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            pressStyle={{ opacity: 0.8 }}
                                                            onPress={() => {
                                                                if (childId) {
                                                                    handleAddToRoutine(task, template, childId);
                                                                }
                                                            }}
                                                        >
                                                            <YStack flex={1}>
                                                                <XStack space="$2">
                                                                    <Text color={colors.primary}>• {taskObj.title}</Text>
                                                                </XStack>

                                                                {taskObj.description && (
                                                                    <Text color={colors.primary} fontSize="$2">
                                                                        {taskObj.description}
                                                                    </Text>
                                                                )}
                                                                {taskObj.time_slot && (
                                                                    <Text color={colors.primary} fontSize="$2">
                                                                        Time: {taskObj.time_slot}
                                                                    </Text>
                                                                )}
                                                            </YStack>
                                                            <XStack space="$2">
                                                                {isSelected && (
                                                                    <MaterialIcons
                                                                        name="check-circle"
                                                                        size={24}
                                                                        color={colors.success}
                                                                    />
                                                                )}
                                                                <Button
                                                                    size="$2"
                                                                    circular
                                                                    icon={<MaterialIcons name="delete" size={18} color={colors.error} />}
                                                                    onPress={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteTask(template.id, taskObj.title);
                                                                    }}
                                                                    backgroundColor={colors.surface}
                                                                />
                                                            </XStack>

                                                        </XStack>
                                                    );
                                                })
                                            )}
                                        </YStack>

                                        <XStack justifyContent="space-between" marginTop="$5">
                                            <Button
                                                onPress={() => handleDeleteTemplate(template.id)}
                                                backgroundColor={colors.error}
                                                color={colors.onPrimary}
                                            >
                                                Delete Template
                                            </Button>
                                            <Button
                                                onPress={() => handleEditTemplate(template)}
                                                backgroundColor={colors.primary}
                                                color={colors.onPrimary}
                                            >
                                                Edit Template
                                            </Button>
                                        </XStack>
                                    </YStack>
                                )}
                            </Card>
                        ))}
                        <Button
                            onPress={() => {
                                setEditingTemplate({
                                    id: uuidv4(),
                                    name: '',
                                    ageRange: '',
                                    tasks: [],
                                    description: '',
                                    notes: ''
                                });
                            }}
                            backgroundColor={colors.primary}
                            color={colors.onPrimary}
                            marginBottom="$4"
                        >
                            Create New Template
                        </Button>
                    </YStack>
                )}
            </ScrollView>

            {modalState.childSelection && (
                <Modal
                    animationType="fade"
                    transparent
                    visible={modalState.childSelection}
                    onRequestClose={() => toggleModal('childSelection', false)}
                >
                    <View flex={1} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.4)">
                        <Card width="90%" padding={16} borderRadius={12} backgroundColor={colors.cardBackground}>
                            <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
                                <H4 color={colors.text}>Select a Child</H4>
                                <Button
                                    unstyled
                                    onPress={() => toggleModal('childSelection', false)}
                                    icon={<MaterialIcons name="close" size={24} color={colors.error} />}
                                />
                            </XStack>

                            <YStack space={12}>
                                {children.length > 0 ? (
                                    children.map((child) => (
                                        <Pressable
                                            key={child.id}
                                            onPress={() => {
                                                setChildId(child.id);
                                                setChildName(child.name);
                                                toggleModal('childSelection', false);
                                            }}
                                        >
                                            <YStack
                                                padding={12}
                                                backgroundColor={child.id === childId ? colors.surface : colors.background}
                                                borderRadius={8}
                                                borderWidth={1}
                                                borderColor={colors.border as any}
                                            >
                                                <XStack space={12} alignItems="center">
                                                    <MaterialIcons name="child-care" size={24} color={colors.primary} />
                                                    <YStack>
                                                        <Text fontWeight="600" color={colors.text}>
                                                            {child.name}
                                                        </Text>
                                                    </YStack>
                                                </XStack>
                                            </YStack>
                                        </Pressable>
                                    ))
                                ) : (
                                    <Text textAlign="center" color={colors.textSecondary}>
                                        No children available
                                    </Text>
                                )}
                            </YStack>
                        </Card>
                    </View>
                </Modal>
            )}
        </View>
    );
}