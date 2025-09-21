import { GoalBackground } from '@/constants/GoalBackground'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { RootStackParamList } from '@/types'
import { Child, Goal, Reward } from '@/types/goals'
import { Feather, MaterialIcons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Bell, ChevronRight } from '@tamagui/lucide-icons'
import { add, format } from 'date-fns'
import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Toast from 'react-native-toast-message'
import {
    Button,
    H4,
    Image,
    Input,
    Label,
    Paragraph,
    Spinner,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui'
import { v4 as uuidv4 } from 'uuid'

type GoalDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'GoalDetails'>;
type GoalDetailsScreenRouteProp = RouteProp<RootStackParamList, 'GoalDetails'>;

type Reminder = {
    id?: string;
    goal_id: string;
    user_id: string;
    title: string;
    message: string;
    date: string;
    time: string;
    repeat: 'None' | 'Once' | 'Daily' | 'Mon-Fri' | 'Custom';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

const GoalDetailsScreen = () => {
    const { colors } = useTheme()
    const { user } = useAuth()
    const navigation = useNavigation<GoalDetailsScreenNavigationProp>();
    const route = useRoute<GoalDetailsScreenRouteProp>();
    const { goal, onSave, onDelete } = route.params;
    const [isEditing, setIsEditing] = useState(false)

    const [frequencyCount, setFrequencyCount] = useState<number>(0);
    const [frequencyDuration, setFrequencyDuration] = useState<number>(1);

    const [frequencyUnit, setFrequencyUnit] = useState('weeks')
    const [editedGoal, setEditedGoal] = useState<Goal | null>(null)
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [children, setChildren] = useState<Child[]>([])
    const [selectedChildren, setSelectedChildren] = useState<string[]>([])
    const [saveToCorePlan, setSaveToCorePlan] = useState(true)
    const [loading, setLoading] = useState(false)
    const [childrenLoading, setChildrenLoading] = useState(false)
    const [reward, setReward] = useState<Reward>({
        name: '',
        notes: ''
    })

    const formatTime = (timeString?: string) => {
        if (!timeString) return "—";
        const [hours, minutes] = timeString.split(":");
        const h = parseInt(hours, 10);
        const m = minutes.padStart(2, "0");
        const suffix = h >= 12 ? "PM" : "AM";
        const hour12 = ((h + 11) % 12) + 1;
        return `${hour12}:${m} ${suffix}`;
    };

    const fetchChildren = useCallback(async () => {
        if (!user) return;

        setChildrenLoading(true)
        try {
            const { data, error } = await supabase
                .from('children')
                .select('id, name, photo')
                .eq('user_id', user.id)

            if (error) throw error
            setChildren(data || [])
        } catch (error) {
            console.error('Error fetching children:', error)
        } finally {
            setChildrenLoading(false)
        }
    }, [user])

    const fetchReminders = async (goalId: string) => {
        if (!goalId) return;

        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .eq('goal_id', goalId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching reminders:", error.message);
                return;
            }

            if (data) {
                setReminders(data);
            }
        } catch (err) {
            console.error("Unexpected error fetching reminders:", err);
        }
    };

    useEffect(() => {
        if (goal) {
            setEditedGoal({ ...goal } as Goal);

            if (goal.time_bound) {
                const match = goal.time_bound.match(
                    /(\d+)\s*times?\s*in\s*(\d+)\s*(days|weeks|months|years)/i
                );

                if (match) {
                    const count = parseInt(match[1], 10) || 0;
                    const duration = parseInt(match[2], 10) || 1;
                    const unit = match[3].toLowerCase();

                    console.log("🟢 Parsed time_bound:", goal.time_bound);
                    console.log("   count =", count, "(", typeof count, ")");
                    console.log("   duration =", duration, "(", typeof duration, ")");
                    console.log("   unit =", unit, "(", typeof unit, ")");

                    setFrequencyCount(count);
                    setFrequencyDuration(duration);
                    setFrequencyUnit(unit);
                } else {
                    console.log("⚠️ No regex match for:", goal.time_bound);
                }
            }

            // Set assigned child if exists
            if (goal.child_id) {
                console.log("👶 Assigned child:", goal.child_id);
                setSelectedChildren([goal.child_id]);
            }

            // Set reward data if exists
            if (goal.reward_name || goal.reward_notes) {
                console.log("🏆 Reward:", {
                    name: goal.reward_name || "",
                    notes: goal.reward_notes || "",
                });
                setReward({
                    name: goal.reward_name || "",
                    notes: goal.reward_notes || "",
                });
            }
        }

        // Fetch children
        fetchChildren();

        if (goal?.id) {
            fetchReminders(goal.id);
        }
    }, [goal]);

    const calculateTargetDate = () => {
        const now = new Date()
        let unit: 'days' | 'weeks' | 'months' | 'years' = 'weeks'
        if (['days', 'weeks', 'months', 'years'].includes(frequencyUnit)) {
            unit = frequencyUnit as any
        }
        return add(now, { [unit]: frequencyDuration })
    }

    const handleSave = async () => {
        if (!editedGoal || !user?.id || selectedChildren.length === 0) return;

        setLoading(true);
        try {
            const goalDataPayload = {
                area: editedGoal.area,
                goal: editedGoal.goal,
                measurable: editedGoal.measurable,
                achievable: editedGoal.achievable,
                relevant: editedGoal.relevant,
                time_bound: `${frequencyCount} times in ${frequencyDuration} ${frequencyUnit}`,
                timeframe: editedGoal.timeframe || "",
                target_date: calculateTargetDate().toISOString(),
                notes: editedGoal.notes || "",
                reward_name: reward.name || null,
                reward_notes: reward.notes || null,
                updated_at: new Date().toISOString(),
            };

            // Insert or update goals_plan
            if (editedGoal.is_default || !editedGoal.user_id) {
                // Insert a new goal for default or new custom goals
                const { data: userGoal, error: goalError } = await supabase
                    .from("goals_plan")
                    .insert({
                        ...goalDataPayload,
                        id: uuidv4(),
                        user_id: user.id,
                        child_id: selectedChildren[0],
                        core_value_id: editedGoal.core_value_id,
                        status: "Working on",
                        created_at: new Date().toISOString(),
                        is_default: false,
                    })
                    .select()
                    .single();

                if (goalError) throw goalError;
                onSave(userGoal as Goal);
            } else {
                // Update existing user-created goal
                const { data: goalData, error: goalError } = await supabase
                    .from("goals_plan")
                    .update(goalDataPayload)
                    .eq("id", editedGoal.id)
                    .select()
                    .single();

                if (goalError) throw goalError;

                // Optional: update selected_goals for edits
                if (editedGoal.is_edited) {
                    await Promise.all(
                        selectedChildren.map(async (childId) => {
                            const { error: syncError } = await supabase
                                .from("selected_goals")
                                .update({
                                    priority: editedGoal.priority,
                                    reminders: Array.isArray(reminders) ? reminders.length > 0 : !!reminders,
                                    notes: editedGoal.notes || "",
                                    timeframe: editedGoal.timeframe || "",
                                    target_date: calculateTargetDate().toISOString(),
                                    time_bound: `${frequencyCount} times in ${frequencyDuration} ${frequencyUnit}`,
                                    reward_name: reward.name || null,
                                    reward_notes: reward.notes || null,
                                    updated_at: new Date().toISOString(),
                                    frequency_target: Number(frequencyCount),
                                })
                                .eq("goal_id", editedGoal.id)
                                .eq("child_id", childId);

                            if (syncError) throw syncError;
                        })
                    );
                }

                onSave(goalData as Goal);
            }

            navigation.goBack();
            setIsEditing(false);

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Goal saved successfully!",
                position: "bottom",
            });
        } catch (error) {
            console.error("Error saving goal:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to save goal",
                position: "bottom",
            });
        } finally {
            setLoading(false);
        }
    };


    const handleChange = (field: keyof Goal, value: string | boolean) => {
        setEditedGoal((prev) => ({
            ...prev!,
            [field]: value,
        }))
    }

    const handleDeleteReminder = async (reminderId: string) => {
        try {
            const { error } = await supabase
                .from("reminders")
                .delete()
                .eq("id", reminderId);

            if (error) throw error;

            // refresh list after delete
            if (editedGoal) {
                fetchReminders(editedGoal.id);
            } else {
                console.warn("editedGoal is null when trying to refresh reminders after delete.");
            }
        } catch (err) {
            console.error("Error deleting reminder:", err);
        }
    };

    const updateRewardField = useCallback((field: keyof Reward, value: string) => {
        setReward(prev => ({ ...prev, [field]: value }));
    }, []);

    const navigateToReminder = () => {
        if (!editedGoal) {
            console.warn("No goal selected to attach reminder");
            return;
        }

        navigation.navigate('Reminder', {
            goal: editedGoal,
            reminderId: editedGoal.reminder_id ?? undefined,
            onSave: async () => {
                try {
                    const { data, error } = await supabase
                        .from("reminders")
                        .select("*")
                        .eq("goal_id", editedGoal.id)
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    setReminders(data ?? []);
                    console.log("Reminders refreshed:", data);
                } catch (err) {
                    console.error("Failed to refresh reminders:", err);
                }
            },
        });
    };

    const renderEditableSection = (title: string, field: keyof Goal, multiline = false) => (
        <YStack mb="$4">
            <Text color={colors.text} fontWeight="700" fontSize="$5" mb="$1">
                {title}
            </Text>
            {isEditing ? (
                <Input
                    value={editedGoal ? (editedGoal[field] as string) || '' : ''}
                    onChangeText={(text) => handleChange(field, text)}
                    placeholder={`Enter ${title.toLowerCase()}`}
                    borderColor={colors.border as any}
                    backgroundColor='white'
                    borderRadius="$3"
                    fontSize="$4"
                    padding="$3"
                    multiline={multiline}
                    numberOfLines={multiline ? 3 : 1}
                    textAlignVertical={multiline ? 'top' : 'center'}
                />
            ) : (
                <Paragraph
                    color={editedGoal && editedGoal[field] ? colors.text : colors.textSecondary}
                    fontSize="$4"
                    backgroundColor='white'
                    padding="$3"
                    borderRadius="$3"
                    minHeight={multiline ? 80 : undefined}
                >
                    {(editedGoal && editedGoal[field] ? (editedGoal[field] as string) : '') || 'Not specified'}
                </Paragraph>
            )}
        </YStack>
    )

    if (!goal || !editedGoal) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" />
            </View>
        )
    }

    return (
        <GoalBackground>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                extraScrollHeight={150}
            >

                {/* Header */}
                <XStack alignItems="center" mb="$4" mt='$6'>
                    <Button unstyled onPress={() => navigation.goBack()} hitSlop={20} mr="$5">
                        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                    </Button>
                    <H4 color={colors.text} fontWeight="700" fontSize="$4">
                        {isEditing ? "Edit Goal" : "Goal Details"}
                    </H4>
                </XStack>

                {/* Editable fields */}
                {renderEditableSection('Area', 'area')}
                {renderEditableSection('Goal', 'goal', true)}
                {renderEditableSection('Measurable', 'measurable', true)}
                {renderEditableSection('Achievable', 'achievable', true)}
                {renderEditableSection('Relevant', 'relevant', true)}

                {/* Time Bound */}
                <YStack mb="$3">
                    <Text color={colors.text} fontWeight="600" fontSize="$4" mb="$1.5">
                        Time Bound
                    </Text>
                    {isEditing ? (
                        <YStack space="$3">
                            <XStack alignItems="center" space="$3">
                                <Input
                                    keyboardType="numeric"
                                    width={80}
                                    borderWidth={1}
                                    borderColor={colors.border as any}
                                    value={frequencyCount.toString()}
                                    onChangeText={(text) => setFrequencyCount(Number(text))}
                                />
                                <Text fontSize="$4" fontWeight="500" color={colors.text}>times in</Text>
                                <Input
                                    keyboardType="numeric"
                                    width={60}
                                    borderWidth={1}
                                    borderColor={colors.border as any}
                                    value={frequencyDuration.toString()}
                                    onChangeText={(text) => setFrequencyDuration(Number(text))}
                                />
                                <View borderWidth={1}
                                    borderColor={colors.text as any}
                                    backgroundColor='transparent'
                                    borderRadius="$4" flex={1}>
                                    <Picker selectedValue={frequencyUnit} onValueChange={(val: string) => setFrequencyUnit(val)}>
                                        <Picker.Item label="Days" value="days" />
                                        <Picker.Item label="Weeks" value="weeks" />
                                        <Picker.Item label="Months" value="months" />
                                        <Picker.Item label="Years" value="years" />
                                    </Picker>
                                </View>
                            </XStack>
                            <Text fontSize="$3" mb='$3' color={colors.textSecondary}>
                                Target date: {format(calculateTargetDate(), 'MMM dd, yyyy')}
                            </Text>
                        </YStack>
                    ) : (
                        <Paragraph color={goal.time_bound ? colors.text : colors.textSecondary} fontSize="$4">
                            {goal.time_bound || 'Not specified'}
                        </Paragraph>
                    )}
                </YStack>

                {/* Assign To */}
                <YStack>
                    <Text color={colors.text} fontWeight="700" fontSize="$4" mb="$1.5">
                        Assign To:
                    </Text>
                    {isEditing && (
                        <XStack space="$4" px="$2" mb='$4'>
                            {children.map((child) => {
                                const isSelected = selectedChildren.includes(child.id);

                                const toggleChild = () => {
                                    setSelectedChildren((prev) =>
                                        isSelected
                                            ? prev.filter((id) => id !== child.id)
                                            : [...prev, child.id]
                                    );
                                };

                                return (
                                    <YStack
                                        key={child.id}
                                        ai="center"
                                        space="$1"
                                        onPress={toggleChild}
                                    >
                                        <XStack
                                            w={66}
                                            h={66}
                                            jc="center"
                                            ai="center"
                                            br={33}
                                            borderWidth={3}
                                            borderColor={isSelected ? colors.primary : "transparent"}
                                        >
                                            <Image
                                                source={
                                                    child.photo
                                                        ? { uri: child.photo }
                                                        : require("@/assets/images/profile.jpg")
                                                }
                                                style={{ width: 60, height: 60, borderRadius: 30 }}
                                            />
                                        </XStack>
                                        <Label
                                            fontSize="$3"
                                            textAlign="center"
                                            color={isSelected ? colors.primary : colors.text}
                                        >
                                            {child.name}
                                        </Label>
                                    </YStack>
                                );
                            })}
                        </XStack>
                    )}
                </YStack>

                {/* Reward System */}
                {isEditing && (
                    <YStack mb="$2">
                        <H4 marginBottom="$1" fontSize='$5'>Reward System</H4>

                        <YStack>
                            <YStack>
                                <Label color="$color" fontWeight="bold">Reward Name</Label>
                                <Input
                                    value={reward.name}
                                    onChangeText={(text) => updateRewardField('name', text)}
                                    placeholder="Name of the reward"
                                    backgroundColor='white'
                                    borderColor={colors.border as any}
                                />
                            </YStack>

                            <YStack space="$1">
                                <Label color="$color" fontWeight="bold">Notes</Label>
                                <Input
                                    value={reward.notes}
                                    onChangeText={(text) => updateRewardField('notes', text)}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Additional Notes..."
                                    backgroundColor='white'
                                    borderColor={colors.border as any}
                                    paddingVertical="$3"
                                    textAlignVertical="top"
                                />
                            </YStack>
                        </YStack>
                    </YStack>
                )}

                {/* Reminder */}
                {isEditing && (
                    <YStack space="$1" mt="$3">
                        <H4 color={colors.text} fontSize="$5" fontWeight="900">
                            Reminder
                        </H4>
                        <Text fontSize="$3">When should we remind you about your goal?</Text>

                        {reminders && reminders.length > 0 ? (
                            <XStack
                                mt="$3"
                                ai="center"
                                jc="space-between"
                                p="$3"
                                bg="#F9FAFB"
                                br="$4"
                                borderWidth={1}
                                borderColor="#E5E7EB"
                                onPress={() =>
                                    navigation.navigate("Reminder", {
                                        goal: editedGoal,
                                        reminderId: reminders[0].id,
                                        onSave: () => fetchReminders(editedGoal.id),
                                    })
                                }
                            >
                                <YStack>
                                    <H4 color={colors.text} fontSize="$5">
                                        {formatTime(reminders[0].time)}
                                    </H4>
                                    <Text>{reminders[0].repeat}</Text>

                                    {/*
                                    <Button
                                        size="$1"
                                        chromeless
                                        color="red"
                                        onPress={(e) => {
                                            e.stopPropagation()
                                            if (reminders[0].id) handleDeleteReminder(reminders[0].id)
                                        }}
                                    >
                                        Delete
                                    </Button>
                                     */}
                                </YStack>
                                <XStack ai="center" space="$2">
                                    <ChevronRight size={20} color={colors.text as string} />
                                </XStack>
                            </XStack>

                        ) : (
                            // Show set reminder card if no reminder exists
                            <Button
                                width="100%"
                                borderColor={colors.border as any}
                                mt="$3"
                                onPress={navigateToReminder}
                                icon={<Bell size={16} />}
                            >
                                Set Reminder
                            </Button>
                        )}
                    </YStack>
                )}

                {/* Save to CorePlan Radio Button 
                {isEditing && (
                    <YStack space="$2" mt="$2" mb="$4">
                        <XStack alignItems="center" space="$2">
                            <RadioGroup value={saveToCorePlan ? "yes" : "no"}
                                onValueChange={() => setSaveToCorePlan((prev) => !prev)}
                            >
                                <RadioGroup.Item
                                    value="yes"
                                    id="yes"
                                    unstyled
                                    borderWidth={2}
                                    borderColor="black"
                                    size="$4"
                                    borderRadius={9999}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {saveToCorePlan && (
                                        <RadioGroup.Indicator
                                            unstyled
                                            width={12}
                                            height={12}
                                            borderRadius={9999}
                                            backgroundColor="black"
                                        />
                                    )}
                                </RadioGroup.Item>
                            </RadioGroup>

                            <Label htmlFor="yes" color={colors.text}>
                                {saveToCorePlan ? "Saved to CorePlan" : "Save Goal to CorePlan"}
                            </Label>
                        </XStack>
                    </YStack>
                )}
                */}

                {/* Buttons */}
                <XStack space="$3" jc='space-between' mt='$3' mb='$5'>
                    {isEditing ? (
                        <>
                            <Button
                                size="$5"
                                width='48%'
                                backgroundColor='transparent'
                                borderColor={colors.primary}
                                onPress={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                <Button.Text color={colors.primary}>Cancel</Button.Text>
                            </Button>

                            <Button
                                size="$5"
                                width='48%'
                                backgroundColor={colors.primary}
                                onPress={handleSave}
                                disabled={loading}
                            >
                                {loading ? (
                                    <Spinner color="white" />
                                ) : (
                                    <>
                                        <Button.Text color="white">Set Goal</Button.Text>
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="$5"
                                width='48%'
                                borderColor={colors.primary}
                                backgroundColor='transparent'
                                onPress={() => navigation.goBack()}
                            >
                                <Button.Text color={colors.primary}>Close</Button.Text>
                            </Button>
                            <Button
                                size="$5"
                                width='48%'
                                backgroundColor={colors.primary}
                                onPress={() => setIsEditing(true)}
                            >
                                <Button.Icon><Feather name="edit-2" size={16} color={colors.onPrimary} /></Button.Icon>
                                <Button.Text color={colors.onPrimary}>Edit</Button.Text>
                            </Button>
                        </>
                    )}
                </XStack>
            </KeyboardAwareScrollView>
        </GoalBackground>
    )
}

const styles = StyleSheet.create({
    bg: { flex: 1 },
    container: { padding: 20, paddingBottom: 150 },
})

export default GoalDetailsScreen