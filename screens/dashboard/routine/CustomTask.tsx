import { GoalBackground } from "@/constants/GoalBackground";
import { Text } from '@/context/GlobalText';
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from '@/supabase/client';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronDown, Clock } from '@tamagui/lucide-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H4, Input, XStack, YStack } from 'tamagui';

type Task = {
    id?: string;
    title: string;
    icon?: string;
    time_slot?: string;
    duration_minutes?: string;
};

type CustomTaskRouteParams = {
    task?: Task;
    onSave: (task: Task, isEditing: boolean) => void;
    routineId?: string;
    isPredefined: boolean;
};

const CustomTaskScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as CustomTaskRouteParams;

    const [task, setTask] = useState<Task>(params.task || {
        title: '',
        icon: 'checkbox-blank-circle-outline',
        time_slot: '00:00',
        duration_minutes: '15'
    });
    const [loading, setLoading] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const isEditing = !!params.task;

    useEffect(() => {
        // Set initial time from task if editing
        if (params.task?.time_slot) {
            const [hours, minutes] = params.task.time_slot.split(':').map(Number);
            const date = new Date();
            date.setHours(hours, minutes);
            setSelectedTime(date);
        }
    }, [params.task]);

    const updateTaskName = (text: string) => {
        setTask({ ...task, title: text });
    };

    const updateTaskDuration = (minutes: string) => {
        setTask({ ...task, duration_minutes: minutes });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setSelectedTime(selectedDate);
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            setTask({ ...task, time_slot: `${hours}:${minutes}` });
        }
    };

    const handleSaveTask = async () => {
        setLoading(true);
        try {
            const isEditing = !!params.task;
            let savedTask = { ...task };

            if (params.isPredefined && isEditing) {
                // For predefined routines, create a copy instead of editing
                await handleCreateCopyForPredefined();
            } else {
                // For user-created routines or new tasks
                await handleDirectSave(isEditing);
            }

            // Show success modal
            setShowSuccessModal(true);
            setTimeout(() => {
                setShowSuccessModal(false);
                navigation.goBack();
            }, 1500);

        } catch (error) {
            console.error('Error saving task:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    const handleDirectSave = async (isEditing: boolean) => {
        if (isEditing && params.routineId) {
            // Update existing task in user's routine
            const { error } = await supabase
                .from('routine_template_tasks')
                .update({
                    title: task.title,
                    icon: task.icon,
                    time_slot: task.time_slot,
                    duration_minutes: parseInt(task.duration_minutes || '15'),
                    updated_at: new Date().toISOString()
                })
                .eq('id', task.id)
                .eq('routine_id', params.routineId);

            if (error) throw error;
        } else if (params.routineId) {
            // Create new task in user's routine
            const { data, error } = await supabase
                .from('routine_template_tasks')
                .insert({
                    title: task.title,
                    icon: task.icon,
                    time_slot: task.time_slot,
                    duration_minutes: parseInt(task.duration_minutes || '15'),
                    routine_id: params.routineId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) throw error;
            task.id = data.id;
        }

        params.onSave(task, isEditing);
    };

    const handleCreateCopyForPredefined = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        if (!params.routineId) throw new Error('No routine ID provided');

        let userRoutineId: string;

        // 1️⃣ Check if user already has a copy of this routine
        const { data: existingCopy } = await supabase
            .from('routine_templates')
            .select('id')
            .eq('original_template_id', params.routineId)
            .eq('user_id', user.id)
            .single();

        if (existingCopy) {
            // ✅ Use existing user copy
            userRoutineId = existingCopy.id;

            // Check if this specific task already exists in the user's copy
            const { data: existingTask } = await supabase
                .from('routine_template_tasks')
                .select('id')
                .eq('routine_id', userRoutineId)
                .eq('title', params.task?.title || '')
                .single();

            if (existingTask) {
                // Update existing task in user's copy
                const { error } = await supabase
                    .from('routine_template_tasks')
                    .update({
                        title: task.title,
                        icon: task.icon,
                        time_slot: task.time_slot,
                        duration_minutes: parseInt(task.duration_minutes || '15'),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingTask.id)
                    .eq('routine_id', userRoutineId);

                if (error) throw error;
                task.id = existingTask.id;
            } else {
                // Insert new task in user's copy
                const { data: newTask, error } = await supabase
                    .from('routine_template_tasks')
                    .insert({
                        title: task.title,
                        icon: task.icon,
                        time_slot: task.time_slot,
                        duration_minutes: parseInt(task.duration_minutes || '15'),
                        routine_id: userRoutineId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (error) throw error;
                task.id = newTask.id;
            }
        } else {
            // 2️⃣ No user copy yet → create a copy of the entire predefined routine
            const { data: originalRoutine, error: origErr } = await supabase
                .from('routine_templates')
                .select('*')
                .eq('id', params.routineId)
                .single();
            if (origErr || !originalRoutine) throw origErr || new Error('Original routine not found');

            // Create a copy of the routine template
            const { data: newRoutine, error: routineError } = await supabase
                .from('routine_templates')
                .insert({
                    name: originalRoutine.name,
                    icon: originalRoutine.icon,
                    description: originalRoutine.description,
                    is_preloaded: false,
                    user_id: user.id,
                    original_template_id: params.routineId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (routineError || !newRoutine) throw routineError || new Error('Failed to create routine copy');

            userRoutineId = newRoutine.id;

            // Copy all tasks from original routine, replacing the edited task
            const { data: originalTasks } = await supabase
                .from('routine_template_tasks')
                .select('*')
                .eq('routine_id', params.routineId);

            if (originalTasks && originalTasks.length > 0) {
                const tasksToInsert = originalTasks.map(ot => {
                    if (ot.id === params.task?.id) {
                        // This is the edited task - use the new values
                        return {
                            title: task.title,
                            icon: task.icon,
                            time_slot: task.time_slot,
                            duration_minutes: parseInt(task.duration_minutes || '15'),
                            routine_id: userRoutineId,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        };
                    }
                    // Other tasks copied as-is
                    return {
                        title: ot.title,
                        icon: ot.icon,
                        time_slot: ot.time_slot,
                        duration_minutes: ot.duration_minutes,
                        routine_id: userRoutineId,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    };
                });

                const { data: newTasks, error: tasksError } = await supabase
                    .from('routine_template_tasks')
                    .insert(tasksToInsert)
                    .select();

                if (tasksError) throw tasksError;

                // Find ID of the edited task
                const insertedEditedTask = newTasks.find(t => t.title === task.title);
                if (insertedEditedTask) task.id = insertedEditedTask.id;
            }
        }

        // 3️⃣ Return the updated task
        params.onSave({ ...task }, true);
    };

    return (
        <GoalBackground>
            <SafeAreaView style={{ backgroundColor: colors.secondary }}>
                <XStack ai="center" jc="flex-start" width="100%" paddingTop="$3" paddingBottom="$4" px="$3" space="$3">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name={"arrow-left"} size={20} color="white" />
                    </TouchableOpacity>
                    <H4 fontSize={16} fontWeight="600" color={colors.onPrimary}>
                        {isEditing ? "Edit Task" : "Create Custom Task"}
                    </H4>
                </XStack>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                <YStack marginBottom="$4" mt="$2">
                    <Text color={colors.text} fontWeight="600" mb="$4">
                        {isEditing ? "Edit your task details" : "Add tasks that suit your child needs"}
                    </Text>

                    <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={5} keyboardOpeningTime={0} style={{ flex: 1 }}>
                        {/* Task Name */}
                        <YStack>
                            <Text color={colors.text} fontWeight="600" mb="$2">Task Name</Text>
                            <Card flex={1} padding="$3" borderRadius="$2" height={56} width='100%' backgroundColor={colors.card}>
                                <Input
                                    color={colors.text}
                                    fontSize={14}
                                    value={task.title}
                                    onChangeText={updateTaskName}
                                    placeholder="e.g., Make my bed"
                                    placeholderTextColor={colors.textSecondary}
                                    backgroundColor="transparent"
                                    borderColor={colors.border as any}
                                    borderWidth={0}
                                    padding={0}
                                />
                            </Card>

                            {/* Duration */}
                            <YStack mt='$3'>
                                <Text color={colors.text} fontWeight="600" mb="$2">Duration</Text>
                                <Card padding="$2" borderRadius="$2" height={56} backgroundColor="white" width='100%'>
                                    <XStack alignItems="center" justifyContent="space-between" space="$2" px='$5' flex={1}>
                                        <TouchableOpacity
                                            onPress={() => updateTaskDuration(Math.max(1, parseInt(task.duration_minutes || "5") - 1).toString())}>
                                            <H4 color={colors.text}>-</H4>
                                        </TouchableOpacity>

                                        <XStack alignItems="center" space="$3">
                                            <Text color={colors.text} fontWeight="600">{task.duration_minutes || "5"}</Text>
                                            <Text color={colors.textSecondary}>min</Text>
                                        </XStack>

                                        <TouchableOpacity onPress={() => updateTaskDuration((parseInt(task.duration_minutes || "5") + 1).toString())}>
                                            <H4 color={colors.text}>+</H4>
                                        </TouchableOpacity>
                                    </XStack>
                                </Card>
                            </YStack>

                            {/* Time Picker */}
                            <YStack marginBottom={24} mt="$3">
                                <Text color={colors.text} fontSize={14} fontWeight="600" mb="$2">Time</Text>
                                <Card flex={1} padding="$3" height={56} borderRadius="$2" width="100%" backgroundColor={colors.card}>
                                    <Button backgroundColor={colors.card} borderColor="transparent" borderWidth={1} borderRadius={8} padding={12} flexDirection="row" alignItems="center" onPress={() => setShowTimePicker(true)} unstyled>
                                        <Clock size={20} color={colors.primary as any} />
                                        <Text flex={1} color={colors.text} marginLeft={12} fontSize={14}>{formatTime(selectedTime)}</Text>
                                        <ChevronDown size={20} color={colors.textSecondary} />
                                    </Button>
                                </Card>
                                {showTimePicker && (
                                    <DateTimePicker
                                        value={selectedTime}
                                        mode="time"
                                        is24Hour={false}
                                        display="default"
                                        onChange={handleTimeChange}
                                    />
                                )}
                            </YStack>
                        </YStack>
                    </KeyboardAwareScrollView>

                    <Modal visible={showSuccessModal} transparent={true} animationType="fade">
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                            <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10, alignItems: "center", width: "80%" }}>
                                <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
                                <Text fontSize={14} fontWeight="bold" marginVertical={10}>Task {isEditing ? "Updated" : "Added"} Successfully!</Text>
                            </View>
                        </View>
                    </Modal>
                </YStack>

                <XStack justifyContent="space-between" marginTop={16}>
                    <Button flex={1}
                        size='$5'
                        borderColor={colors.error as any}
                        borderWidth={1}
                        borderRadius={8}
                        marginRight={12} onPress={() => navigation.goBack()}
                    >
                        <Text color={colors.error} textAlign="center">Cancel</Text>
                    </Button>

                    <Button
                        size='$5'
                        flex={1}
                        backgroundColor={colors.primary}
                        borderRadius={8} padding={16}
                        marginLeft={12}
                        onPress={handleSaveTask}
                        disabled={loading || !task.title.trim()}
                        opacity={loading || !task.title.trim() ? 0.6 : 1}
                    >
                        {loading ? <ActivityIndicator color="white" /> :
                            <Text color="white" textAlign="center"
                            >
                                {isEditing ? "Update Task" : "Save Task"}
                            </Text>
                        }
                    </Button>
                </XStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default CustomTaskScreen;