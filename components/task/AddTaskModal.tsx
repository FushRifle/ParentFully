import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Button,
    Input,
    Label,
    ScrollView,
    Sheet,
    Spinner,
    Switch,
    Text,
    XStack,
    YStack
} from 'tamagui';

type AddTasksModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childId?: string;
    onTaskAdded: () => void;
};

export function AddTasksModal({ open, onOpenChange, childId, onTaskAdded }: AddTasksModalProps) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [task, setTask] = useState({
        title: '',
        description: '',
        time_slot: '',
        is_recurring: false
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());

    const handleTimeChange = (event: any, date?: Date) => {
        setShowTimePicker(false);
        if (date) {
            setSelectedTime(date);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setTask({ ...task, time_slot: timeString });
        }
    };

    const handleAddTask = async () => {
        if (!task.title.trim() || !childId) return;

        setLoading(true);
        try {
            const { error } = await supabase
                .from('Task_tasks')
                .insert([{
                    child_id: childId,
                    title: task.title,
                    description: task.description,
                    time_slot: task.time_slot,
                    is_recurring: task.is_recurring,
                    is_completed: false
                }]);

            if (error) throw error;

            // Reset form and close modal
            setTask({
                title: '',
                description: '',
                time_slot: '',
                is_recurring: false
            });
            onOpenChange(false);
            onTaskAdded();
        } catch (error) {
            console.error('Error adding task:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[70]}
            dismissOnSnapToBottom
        >
            <Sheet.Overlay />
            <Sheet.Handle backgroundColor={colors.border} />
            <Sheet.Frame padding="$4" space backgroundColor={colors.background}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack space="$4">
                        <Text fontSize="$6" fontWeight="bold" textAlign="center">
                            Add New Task Task
                        </Text>

                        <YStack space="$2">
                            <Label>Task Title *</Label>
                            <Input
                                placeholder="Enter task title"
                                value={task.title}
                                onChangeText={(text) => setTask({ ...task, title: text })}
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                            />
                        </YStack>

                        <YStack space="$2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Enter description (optional)"
                                value={task.description}
                                onChangeText={(text) => setTask({ ...task, description: text })}
                                multiline
                                numberOfLines={3}
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                            />
                        </YStack>

                        <YStack space="$2">
                            <Label>Time Slot*</Label>
                            <Button onPress={() => setShowTimePicker(true)}>
                                {task.time_slot || 'Select time'}
                            </Button>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    display="default"
                                    onChange={handleTimeChange}
                                />
                            )}
                        </YStack>

                        <XStack alignItems="center" justifyContent="space-between">
                            <Label>Recurring Task</Label>
                            <Switch
                                checked={task.is_recurring}
                                onCheckedChange={(checked) => setTask({ ...task, is_recurring: checked })}
                                backgroundColor={task.is_recurring ? colors.primary : colors.border as any}
                            >
                                <Switch.Thumb animation="quick" borderColor={colors.primary} />
                            </Switch>
                        </XStack>

                        <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                            <Button
                                onPress={() => onOpenChange(false)}
                                theme="alt1"
                                borderColor={colors.border as any}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleAddTask}
                                backgroundColor={colors.primary}
                                color="white"
                                disabled={!task.title.trim() || loading}
                            >
                                {loading ? <Spinner color="white" /> : 'Add Task'}
                            </Button>
                        </XStack>
                    </YStack>
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
}