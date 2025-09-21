import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { add, format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import {
    Button,
    Input,
    Label,
    Paragraph,
    Sheet,
    Switch,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui';
import { v4 as uuidv4 } from 'uuid';

type GoalDetailsModalProps = {
    visible: boolean;
    onClose: () => void;
    goal: Goal | null;
    onSave: (updatedGoal: Goal) => void;
    onDelete?: (goalId: string) => void;
};

type Goal = {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired';
    area: string;
    goal: string;
    measurable?: string;
    achievable?: string;
    relevant?: string;
    time_bound?: string;
    is_default?: boolean;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    user_id?: string;
    age_group?: string;
    celebration?: string;
    progress?: number;
    is_edited?: boolean;
    is_selected?: boolean;
    // New columns
    reminders?: boolean;
    notes?: string;
    timeframe?: string;
    target_date?: string;
};

const GoalDetailsModal = ({ visible, onClose, goal, onSave, onDelete }: GoalDetailsModalProps) => {
    const { colors } = useTheme();
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false);
    const [frequencyCount, setFrequencyCount] = useState(0);
    const [frequencyDuration, setFrequencyDuration] = useState(1);
    const [frequencyUnit, setFrequencyUnit] = useState('weeks');
    const [reminders, setReminders] = useState(false);
    const [editedGoal, setEditedGoal] = useState<Goal | null>(null);

    useEffect(() => {
        if (goal) {
            setEditedGoal({ ...goal });
            // Parse time_bound to extract frequency if it exists
            if (goal.time_bound) {
                const timeMatch = goal.time_bound.match(/(\d+)\s*times?\s*in\s*(\d+)\s*(days|weeks|months|years)/i);
                if (timeMatch) {
                    setFrequencyCount(parseInt(timeMatch[1]) || 0);
                    setFrequencyDuration(parseInt(timeMatch[2]) || 1);
                    setFrequencyUnit(timeMatch[3].toLowerCase());
                }
            }
        }
    }, [goal]);

    if (!goal || !editedGoal) return null;

    const statusColors = {
        Mastered: {
            text: 'white',
            bg: colors.success,
            icon: 'award',
        },
        'Working on': {
            text: 'white',
            bg: colors.primary,
            icon: 'activity',
        },
        Expired: {
            text: 'white',
            bg: colors.error,
            icon: 'clock',
        },
    };

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
        if (!editedGoal?.id || !user?.id) return;

        try {
            // Check if this is a default goal that needs to be copied
            if (editedGoal.is_default) {
                // Create a user-specific copy of the default goal
                const { data, error } = await supabase
                    .from('goals_plan')
                    .insert({
                        // Copy all fields from the original goal
                        ...editedGoal,
                        // But generate a new ID and set user ownership
                        id: uuidv4(), // or use your UUID method
                        user_id: user.id,
                        is_default: false, // This is now a user-specific goal
                        is_edited: false, // Reset since it's a new copy
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        // Ensure all new fields are included
                        reminders: editedGoal.reminders ?? false,
                        notes: editedGoal.notes ?? '',
                        timeframe: editedGoal.timeframe ?? '',
                        target_date: editedGoal.target_date ?? null,
                        time_bound: `${frequencyCount} times in ${frequencyDuration} ${frequencyUnit}`
                    })
                    .select()
                    .single();

                if (error) throw error;

                onClose();
                onSave(data as Goal);
            } else {
                // For non-default goals, just update normally
                const updatedGoal = {
                    ...editedGoal,
                    time_bound: `${frequencyCount} times in ${frequencyDuration} ${frequencyUnit}`,
                    updated_at: new Date().toISOString()
                };

                onClose();
                onSave(updatedGoal);
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving goal:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save goal',
                position: 'bottom'
            });
        }
    };
    const handleChange = (field: keyof Goal, value: string | boolean) => {
        setEditedGoal((prev) => ({
            ...prev!,
            [field]: value,
        }));
    };

    const renderEditableSection = (title: string, field: keyof Goal, multiline: boolean = false) => (
        <YStack mb="$4">
            <Text color={colors.textSecondary} fontWeight="600" fontSize="$3" mb="$1.5">
                {title}
            </Text>
            {isEditing ? (
                <Input
                    value={editedGoal[field] as string || ''}
                    onChangeText={(text) => handleChange(field, text)}
                    placeholder={`Enter ${title.toLowerCase()}`}
                    borderColor={colors.border as any}
                    backgroundColor={colors.surface}
                    borderRadius="$3"
                    fontSize="$4"
                    padding="$3"
                    placeholderTextColor={colors.textSecondary}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            ) : (
                <Paragraph
                    color={editedGoal[field] ? colors.text : colors.textSecondary}
                    fontSize="$4"
                    backgroundColor={colors.surface}
                    padding="$3"
                    borderRadius="$3"
                    minHeight={multiline ? 80 : undefined}
                >
                    {editedGoal[field] || 'Not specified'}
                </Paragraph>
            )}
        </YStack>
    );

    return (
        <Sheet
            forceRemoveScrollEnabled
            open={visible}
            onOpenChange={(open: any) => {
                if (!open) onClose();
            }}
            snapPoints={[90]}
            modal
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay backgroundColor="rgba(0,0,0,0.5)" />
            <Sheet.Handle backgroundColor={colors.border} />
            <Sheet.Frame
                padding="$5"
                backgroundColor={colors.cardBackground}
                borderTopLeftRadius="$5"
                borderTopRightRadius="$5"
                space="$4"
            >
                <KeyboardAwareScrollView
                    enableOnAndroid
                    keyboardShouldPersistTaps="handled"
                    extraScrollHeight={20}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >

                    {/* Header */}
                    <XStack justifyContent="space-between" alignItems="center" mb="$4">
                        <Text color={colors.primary} fontWeight="700" fontSize="$6">
                            Goal Details
                        </Text>

                        <XStack space="$3">
                            {isEditing ? (
                                <>
                                    <Button
                                        size="$3"
                                        backgroundColor={colors.success}
                                        borderRadius="$3"
                                        onPress={handleSave}
                                        hoverStyle={{ opacity: 0.8 }}
                                        pressStyle={{ scale: 0.95 }}
                                    >
                                        <Button.Text color="white">Save</Button.Text>
                                        <Button.Icon>
                                            <Feather name="check" size={16} color="white" />
                                        </Button.Icon>
                                    </Button>

                                    <Button
                                        size="$3"
                                        backgroundColor={colors.error}
                                        borderRadius="$3"
                                        onPress={() => setIsEditing(false)}
                                        hoverStyle={{ opacity: 0.8 }}
                                        pressStyle={{ scale: 0.95 }}
                                    >
                                        <Button.Text color="white">Cancel</Button.Text>
                                        <Button.Icon>
                                            <Feather name="x" size={16} color="white" />
                                        </Button.Icon>
                                    </Button>
                                </>
                            ) : (
                                <XStack space="$3">
                                    <Button
                                        size="$3"
                                        backgroundColor={colors.surface}
                                        borderColor={colors.border as any}
                                        borderWidth={1}
                                        borderRadius="$3"
                                        onPress={() => setIsEditing(true)}
                                        hoverStyle={{ backgroundColor: colors.surface }}
                                    >
                                        <Button.Text color={colors.primary}>Edit</Button.Text>
                                        <Button.Icon>
                                            <Feather name="edit-2" size={16} color={colors.primary} />
                                        </Button.Icon>
                                    </Button>

                                    {onDelete && (
                                        <Button
                                            size="$3"
                                            backgroundColor={colors.surface}
                                            borderColor={colors.border as any}
                                            borderWidth={1}
                                            borderRadius="$3"
                                            onPress={() => onDelete(goal.id)}
                                            hoverStyle={{ backgroundColor: colors.surface }}
                                        >
                                            <Button.Text color={colors.error}>Delete</Button.Text>
                                            <Button.Icon>
                                                <Feather name="trash-2" size={16} color={colors.error} />
                                            </Button.Icon>
                                        </Button>
                                    )}
                                </XStack>
                            )}
                        </XStack>
                    </XStack>

                    {/* SMART Goal Breakdown */}
                    <YStack space="$1">
                        {renderEditableSection('Area', 'area')}
                        {renderEditableSection('Goal', 'goal', true)}
                        {renderEditableSection('Measurable', 'measurable', true)}
                        {renderEditableSection('Achievable', 'achievable', true)}
                        {renderEditableSection('Relevant', 'relevant', true)}

                        {/* Time Bound Section */}
                        <YStack mb="$4">
                            <Text color={colors.textSecondary} fontWeight="600" fontSize="$3" mb="$1.5">
                                Time Bound
                            </Text>
                            {isEditing ? (
                                <YStack space="$3">
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
                                        <Text fontSize="$4" fontWeight='500' color={colors.primary}>
                                            times in
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
                                        <View borderWidth={1} borderColor="$border" borderRadius="$4" flex={1}>
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
                                    <Text fontSize="$3" color={colors.textSecondary}>
                                        Target date: {format(calculateTargetDate(), 'MMM dd, yyyy')}
                                    </Text>
                                </YStack>
                            ) : (
                                <Paragraph
                                    color={goal.time_bound ? colors.text : colors.textSecondary}
                                    fontSize="$4"
                                    backgroundColor={colors.surface}
                                    padding="$3"
                                    borderRadius="$3"
                                >
                                    {goal.time_bound || 'Not specified'}
                                </Paragraph>
                            )}
                        </YStack>

                        {/* Additional Info */}
                        <YStack>
                            <Text color={colors.textSecondary} fontWeight="600" fontSize="$3" mb="$2">
                                Additional Information
                            </Text>
                            <XStack space="$4" flexWrap="wrap">
                                <YStack>
                                    <Text fontSize="$2" color={colors.textSecondary}>Status:</Text>
                                    <Text fontSize="$3" color={colors.text}>{goal.status || 'N/A'}</Text>
                                </YStack>
                                <YStack>
                                    <Text fontSize="$2" color={colors.textSecondary}>Age Group:</Text>
                                    <Text fontSize="$3" color={colors.text}>{goal.age_group || 'N/A'}</Text>
                                </YStack>
                                <YStack>
                                    <Text fontSize="$2" color={colors.textSecondary}>Time Bound:</Text>
                                    <Text fontSize="$3" color={colors.text}>{goal.time_bound || 'Not specified'}</Text>
                                </YStack>
                            </XStack>
                        </YStack>

                        {/* Reminder Toggle */}
                        {isEditing && (
                            <XStack alignItems="center" justifyContent="space-between" mt="$4">
                                <Label fontWeight="bold" color={colors.text}>Enable Reminders</Label>
                                <Switch
                                    checked={reminders}
                                    backgroundColor={colors.accent}
                                    onCheckedChange={setReminders}
                                    size="$3"
                                >
                                    <Switch.Thumb />
                                </Switch>
                            </XStack>
                        )}
                    </YStack>
                </KeyboardAwareScrollView>
            </Sheet.Frame>
        </Sheet>
    );
};

export default GoalDetailsModal;