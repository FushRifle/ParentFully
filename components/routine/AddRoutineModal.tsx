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
    TextArea,
    XStack,
    YStack
} from 'tamagui';

type AddRoutineModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childId?: string;
    onTaskAdded: () => void;
};

export function AddRoutineModal({ open, onOpenChange, childId, onTaskAdded }: AddRoutineModalProps) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [task, setTask] = useState({
        title: '',
        description: '',
        time_slot: '',
        is_recurring: false,
        notes: '',
    });
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());

    const resetForm = () => {
        setTask({
            title: '',
            description: '',
            time_slot: '',
            is_recurring: false,
            notes: '',
        });
        setSelectedTime(new Date());
        setError(null);
    };

    const handleTimeChange = (event: any, date?: Date) => {
        setShowTimePicker(false);
        if (date) {
            setSelectedTime(date);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            setTask(prev => ({ ...prev, time_slot: timeString }));
        }
    };

    const handleAddTask = async () => {
        if (!task.title.trim()) {
            setError('Task title is required');
            return;
        }
        if (!childId) {
            setError('No child selected');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: supabaseError } = await supabase
                .from('routine_tasks')
                .insert([{
                    child_id: childId,
                    title: task.title.trim(),
                    description: task.description.trim(),
                    time_slot: task.time_slot,
                    is_recurring: task.is_recurring,
                    is_completed: false,
                    notes: task.notes.trim(),
                    created_at: new Date().toISOString()
                }]);

            if (supabaseError) throw supabaseError;

            resetForm();
            onOpenChange(false);
            onTaskAdded();
        } catch (err) {
            console.error('Error adding task:', err);
            setError('Failed to add task. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={handleClose}
            snapPoints={[90]}
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay />
            <Sheet.Handle backgroundColor={colors.border} />
            <Sheet.Frame padding="$4" space backgroundColor={colors.background}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                    <YStack space="$4">
                        <Text fontSize="$6" fontWeight="bold" textAlign="center" color={colors.text}>
                            Add New Routine Task
                        </Text>

                        {error && (
                            <Text color={colors.error} textAlign="center" marginBottom="$2">
                                {error}
                            </Text>
                        )}

                        <YStack space="$2">
                            <Label htmlFor="title" color={colors.text}>Task Title *</Label>
                            <Input
                                id="title"
                                placeholder="Enter task title"
                                value={task.title}
                                onChangeText={(text) => setTask(prev => ({ ...prev, title: text }))}
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                                color={colors.text}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </YStack>

                        <YStack space="$2">
                            <Label htmlFor="description" color={colors.text}>Description</Label>
                            <TextArea
                                id="description"
                                placeholder="Enter description (optional)"
                                value={task.description}
                                onChangeText={(text) => setTask(prev => ({ ...prev, description: text }))}
                                numberOfLines={4}
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                                color={colors.text}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </YStack>

                        <YStack space="$2">
                            <Label color={colors.text}>Time Slot *</Label>
                            <Button
                                onPress={() => setShowTimePicker(true)}
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                                color={task.time_slot ? colors.text : colors.textSecondary}
                            >
                                {task.time_slot || 'Select time'}
                            </Button>
                            {showTimePicker && (
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    display="spinner"
                                    onChange={handleTimeChange}
                                />
                            )}
                        </YStack>

                        <YStack space="$2">
                            <Label htmlFor="notes" color={colors.text}>Notes</Label>
                            <TextArea
                                id="notes"
                                placeholder="Enter notes (optional)"
                                value={task.notes}
                                onChangeText={(text) => setTask(prev => ({ ...prev, notes: text }))}
                                numberOfLines={3}
                                backgroundColor={colors.cardBackground}
                                borderColor={colors.border as any}
                                color={colors.text}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </YStack>

                        <XStack alignItems="center" justifyContent="space-between">
                            <Label color={colors.text}>Recurring Task</Label>
                            <Switch
                                checked={task.is_recurring}
                                onCheckedChange={(checked) => setTask(prev => ({ ...prev, is_recurring: checked }))}
                                backgroundColor={task.is_recurring ? colors.primary : colors.border as any}
                                borderColor={colors.primary}
                            >
                                <Switch.Thumb animation="quick" />
                            </Switch>
                        </XStack>

                        <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                            <Button
                                onPress={handleClose}
                                theme="alt1"
                                borderColor={colors.border as any}
                                color={colors.text}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleAddTask}
                                backgroundColor={colors.primary}
                                color={colors.onPrimary}
                                disabled={!task.title.trim() || !task.time_slot || loading}
                                opacity={(!task.title.trim() || !task.time_slot) ? 0.7 : 1}
                            >
                                {loading ? <Spinner color={colors.onPrimary as any} /> : 'Add Task'}
                            </Button>
                        </XStack>
                    </YStack>
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
}