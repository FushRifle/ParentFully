import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { add, format } from 'date-fns';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import {
    Button,
    Input,
    Label,
    ScrollView,
    Separator,
    Sheet,
    Spinner,
    Switch,
    Tabs,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui';

const priorityOptions = [
    { label: 'Low', value: 'low', color: '$green' },
    { label: 'Medium', value: 'medium', color: '$yellow' },
    { label: 'High', value: 'high', color: '$red' }
];

type GoalSettingsModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    goal: {
        id: string;
        goal_id: string;
        user_id: string;
        child_id: string;
        goals_plan: {
            id: string;
            goal: string;
            area: string;
            status: 'Working on' | 'Mastered' | 'Expired';
            core_value?: {
                id: string;
                title: string;
            };
        };
        created_at: string;
        timeframe?: string;
        target_date?: string;
        priority?: 'low' | 'medium' | 'high';
        reminders?: boolean;
        notes?: string;
        points?: number;
        progress?: number;
    } | null;
    onSave: () => void;
};

type SelectedGoal = {
    id: string;
    goal_id: string;
    user_id: string;
    child_id: string;
    goals_plan: Goal;
    created_at: string;
    child_name?: string;
    timeframe?: string;
    target_date?: string;
    priority?: 'low' | 'medium' | 'high';
    reminders?: boolean;
    notes?: string;
    child?: Child;
    points?: number;
    progress?: number;
    frequency_progress?: number;
    frequency_target?: number;
};

type Goal = {
    id: string;
    goal_id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired';
    area: string;
    goal: string;
    core_value?: {
        id: string;
        title: string;
    };
};

type Child = {
    id: string;
    name: string;
    age: number;
};

export function GoalSettingsModal({
    open,
    onOpenChange,
    onSave,
    goal
}: GoalSettingsModalProps) {
    const { colors } = useTheme();
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [frequencyCount, setFrequencyCount] = useState(0);
    const [frequencyDuration, setFrequencyDuration] = useState(1);
    const [frequencyUnit, setFrequencyUnit] = useState('weeks');
    const [reminders, setReminders] = useState(false);
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (goal) {
            setPriority(goal.priority || 'medium');
            setReminders(goal.reminders || false);
            setNotes(goal.notes || '');

            // Parse existing frequency data if available
            if (goal.timeframe) {
                const match = goal.timeframe.match(/(\d+) in (\d+) (days|weeks|months|years)/);
                if (match) {
                    setFrequencyCount(parseInt(match[1], 10));
                    setFrequencyDuration(parseInt(match[2], 10));
                    setFrequencyUnit(match[3]);
                }
            }
        }
    }, [goal]);

    const calculateTargetDate = () => {
        const now = new Date();
        let duration = frequencyDuration;

        // Convert frequency unit to date-fns compatible unit
        let unit: 'days' | 'weeks' | 'months' | 'years';
        switch (frequencyUnit) {
            case 'days': unit = 'days'; break;
            case 'weeks': unit = 'weeks'; break;
            case 'months': unit = 'months'; break;
            case 'years': unit = 'years'; break;
            default: unit = 'weeks';
        }

        return add(now, { [unit]: duration });
    };

    const handleSave = async () => {
        if (!goal) return;

        setIsLoading(true);
        try {
            const calculatedTargetDate = calculateTargetDate();
            const timeframeString = `${frequencyCount} in ${frequencyDuration} ${frequencyUnit}`;

            const { error } = await supabase
                .from('selected_goals')
                .update({
                    timeframe: timeframeString,
                    frequency_target: frequencyCount,
                    target_date: calculatedTargetDate.toISOString(),
                    priority,
                    reminders,
                    notes,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', goal.id);

            if (error) throw error;

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Goal settings updated successfully!',
            });

            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error('Error updating goal:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update goal settings',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getProgressValue = (goal: SelectedGoal) => {
        if (goal.goals_plan?.status === 'Mastered') return 100;
        return goal.progress ?? 0;
    };

    if (!goal) return null;

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[85]}
            dismissOnSnapToBottom
            zIndex={100_000}
        >
            <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
            <Sheet.Handle backgroundColor={colors.primary} />
            <Sheet.Frame padding="$4" space backgroundColor={colors.background} borderRadius="$9">
                <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack paddingBottom="$4">
                        <Tabs defaultValue="info" orientation="horizontal" flexDirection="column">
                            <Tabs.List
                                backgroundColor={colors.background}
                                borderBottomWidth={1}
                                borderBottomColor={colors.border as any}
                                marginBottom="$3"
                            >
                                <Tabs.Tab
                                    value="info"
                                    flex={1}
                                    borderBottomWidth={2}
                                    borderBottomColor={colors.primary}
                                    paddingVertical="$2"
                                >
                                    <Text color="$color" fontWeight="600">
                                        Goal Details
                                    </Text>
                                </Tabs.Tab>

                                <Separator vertical height="$4" backgroundColor={colors.border as any} />

                                <Tabs.Tab
                                    value="settings"
                                    flex={1}
                                    borderBottomWidth={2}
                                    borderBottomColor={colors.primary}
                                    paddingVertical="$2"
                                >
                                    <Text color="$color" fontWeight="600">
                                        Settings
                                    </Text>
                                </Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Content value="settings">
                                <YStack space="$4">
                                    {/* Priority Picker */}
                                    <YStack space="$2">
                                        <Label fontWeight="bold">Priority</Label>
                                        <View borderWidth={1} borderColor="$border" borderRadius="$4">
                                            <Picker
                                                selectedValue={priority}
                                                onValueChange={(val: 'low' | 'medium' | 'high') => setPriority(val)}
                                            >
                                                {priorityOptions.map(option => (
                                                    <Picker.Item key={option.value} label={option.label} value={option.value} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </YStack>

                                    {/* Frequency Target & Timeframe */}
                                    <YStack space="$2">
                                        <Label fontWeight="bold">Target Frequency</Label>
                                        <XStack alignItems="center" space="$3">
                                            <Input
                                                keyboardType="numeric"
                                                placeholder="e.g. 30"
                                                width={80}
                                                borderWidth={1}
                                                borderColor={colors.primary}
                                                value={frequencyCount.toString()}
                                                onChangeText={(text) => setFrequencyCount(Number(text))}
                                            />
                                            <Text
                                                fontSize="$4"
                                                fontWeight='500'
                                                color={colors.primary}
                                            >
                                                in
                                            </Text>
                                            <Input
                                                keyboardType="numeric"
                                                placeholder="e.g. 3"
                                                width={60}
                                                borderWidth={1}
                                                borderColor={colors.primary}
                                                value={frequencyDuration.toString()}
                                                onChangeText={(text) => setFrequencyDuration(Number(text))}
                                            />
                                            <View borderWidth={1}
                                                borderColor="$border"
                                                borderRadius="$4" flex={1}
                                            >
                                                <Picker
                                                    selectedValue={frequencyUnit}
                                                    onValueChange={(val: string) => setFrequencyUnit(val)}
                                                >
                                                    <Picker.Item label="Days" value="days" />
                                                    <Picker.Item label="Weeks" value="weeks" />
                                                    <Picker.Item label="Months" value="months" />
                                                    <Picker.Item label="Years" value="years" />
                                                </Picker>
                                            </View>
                                        </XStack>
                                        <Text fontSize="$4" color={colors.primary}>
                                            E.g. Completed 30 times in 3 weeks
                                        </Text>
                                        <Text fontSize="$5" mt="$4" color={colors.primary}>
                                            Target date will be automatically calculated to: {format(calculateTargetDate(), 'MMM dd, yyyy')}
                                        </Text>
                                    </YStack>

                                    {/* Reminder Toggle */}
                                    <XStack mt="$2" alignItems="center" justifyContent="space-between">
                                        <Label fontWeight="bold">Enable Reminders</Label>
                                        <Switch
                                            checked={reminders}
                                            backgroundColor={colors.accent}
                                            onCheckedChange={setReminders}
                                            size="$3"
                                        >
                                            <Switch.Thumb />
                                        </Switch>
                                    </XStack>

                                    {/* Notes Input */}
                                    <YStack space="$2" mb="$4">
                                        <Label fontWeight="bold">Notes</Label>
                                        <Input
                                            value={notes}
                                            onChangeText={setNotes}
                                            placeholder="Add any notes..."
                                            borderWidth={1}
                                            borderColor={colors.text}
                                            multiline
                                            numberOfLines={4}
                                            minHeight={100}
                                        />
                                    </YStack>
                                </YStack>
                            </Tabs.Content>

                            <Tabs.Content value="info">
                                <YStack space="$7" mt="$7">
                                    {/* Core Value */}
                                    <XStack alignItems="center" space="$2">
                                        <MaterialIcons name="category" size={20} color={colors.primary as any} />
                                        <Text fontSize="$7" fontWeight="600" color={colors.primary}>
                                            Core Value: {goal.goals_plan?.core_value?.title ?? 'N/A'}
                                        </Text>
                                    </XStack>

                                    {/* Goal Area */}
                                    <XStack space="$2" alignItems="center">
                                        <MaterialIcons name="category" size={20} color={colors.primary as any} />
                                        <Text fontSize="$7" fontWeight="600" color={colors.primary}>
                                            Goal Area:{goal.goals_plan?.area}
                                        </Text>
                                    </XStack>

                                    {/* Description */}
                                    <XStack space="$2" alignItems="flex-start">
                                        <MaterialIcons name="description" size={20} color={colors.primary as any} />
                                        <YStack>
                                            <Text fontSize="$7" color={colors.primary} marginBottom="$1">
                                                Description: {goal.goals_plan.goal || 'No goal specified'}
                                            </Text>
                                        </YStack>
                                    </XStack>

                                    {/* Target Date */}
                                    <XStack alignItems="center" space="$2">
                                        <MaterialIcons name="date-range" size={20} color={colors.primary as any} />
                                        <Text fontSize="$7" color={colors.primary}>
                                            Target: {goal.target_date ? format(new Date(goal.target_date), 'MMM dd, yyyy') : 'Not set'}
                                            {goal.timeframe && ` (${goal.timeframe})`}
                                        </Text>
                                        {goal.reminders && (
                                            <MaterialIcons name="notifications" size={20} color={colors.primary as any} />
                                        )}
                                    </XStack>

                                    {/* Progress */}
                                    <XStack alignItems="center" space="$2">
                                        <MaterialIcons name="hourglass-empty" size={20} color={colors.primary as any} />
                                        <Text fontSize="$7" color={colors.primary}>
                                            Progress: {getProgressValue(goal as any)}%
                                        </Text>
                                    </XStack>

                                    {/* Status */}
                                    <YStack space="$6">
                                        <XStack alignItems="center" space="$2">
                                            <MaterialIcons name="info" size={20} color={colors.primary as any} />
                                            <Text
                                                backgroundColor={colors.secondary}
                                                color="white"
                                                paddingHorizontal="$2"
                                                paddingVertical="$1"
                                                borderRadius="$2"
                                                fontSize="$5"
                                                fontWeight="bold"
                                            >
                                                {goal.goals_plan.status.toUpperCase()}
                                            </Text>

                                            <XStack alignItems="center" space="$2">
                                                <MaterialIcons name="priority-high" size={18} color={colors.primary as any} />
                                                <Text fontSize="$2" color={colors.primary}>
                                                    Priority:
                                                </Text>
                                                <Text
                                                    backgroundColor={colors.primary}
                                                    color="white"
                                                    paddingHorizontal="$2"
                                                    paddingVertical="$1"
                                                    borderRadius="$2"
                                                    fontSize="$1"
                                                    fontWeight="bold"
                                                >
                                                    {goal.priority ? goal.priority.toUpperCase() : 'N/A'}
                                                </Text>
                                            </XStack>
                                        </XStack>
                                    </YStack>
                                </YStack>
                            </Tabs.Content>
                        </Tabs>

                        {/* Action Buttons */}
                        <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                            <Button
                                onPress={() => onOpenChange(false)}
                                backgroundColor={colors.error}
                                disabled={isLoading}
                                color={colors.onPrimary}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleSave}
                                backgroundColor={colors.success}
                                color={colors.onPrimary}
                                disabled={isLoading}
                            >
                                {isLoading ? <Spinner /> : 'Save Changes'}
                            </Button>
                        </XStack>
                    </YStack>
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
}