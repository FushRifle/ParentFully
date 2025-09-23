import { GoalBackground } from '@/constants/GoalBackground';
import { useAuth } from '@/context/AuthContext';
import { Text } from '@/context/GlobalText';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RootStackParamList } from '@/types';
import { Child, Reward, SmartFields } from '@/types/goals';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, ChevronRight } from '@tamagui/lucide-icons';
import { add, format } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    Button,
    H4,
    H6,
    Image,
    Input,
    Paragraph,
    RadioGroup,
    ScrollView,
    Spinner,
    View,
    XStack,
    YStack
} from 'tamagui';

type AddGoalScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddGoal'>;
type AddGoalScreenRouteProp = RouteProp<RootStackParamList, 'AddGoal'>;

type Reminder = {
    id?: string;
    reminderId?: string;
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

type Goal = {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    priority?: 'low' | 'medium' | 'high';
    area: string; goal: string;
    measurable?: string; achievable?: string; relevant?:
    string; time_bound?: string; is_default?: boolean;
    created_at?: string; updated_at?: string;
    is_active?: boolean; user_id?: string; age_group?: string;
    celebration?: string; progress?: number; is_edited?: boolean; is_selected?: boolean;
    reminder_id?: string;
    notes?: string; timeframe?: string; target_date?: string;
}

const SmartFieldInput = React.memo(({
    value,
    onChange,
    placeholder,
    borderColor
}: {
    value: string;
    onChange: (text: string) => void;
    placeholder: string;
    borderColor: string;
}) => (
    <Input
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        backgroundColor='white'
        padding="$3"
        borderRadius="$3"
        multiline
        numberOfLines={4}
        borderColor={borderColor as any}
    />
));

const ChildSelectorItem = React.memo(({
    child,
    isSelected,
    onSelect,
    colors
}: {
    child: Child;
    isSelected: boolean;
    onSelect: (id: string) => void;
    colors: any;
}) => (
    <YStack
        ai="center"
        space="$1"
        onPress={() => onSelect(child.id)}
    >
        <RadioGroup.Item
            value={child.id}
            id={child.id}
            style={{ display: 'none' }}
        />

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
                style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                }}
                defaultSource={require("@/assets/images/profile.jpg")}
            />
        </XStack>

        <Text
            htmlFor={child.id}
            textAlign="center"
            color={isSelected ? colors.primary : colors.text}
        >
            {child.name}
        </Text>
    </YStack>
));

const AddGoalScreen = () => {
    const { user } = useAuth()
    const { colors } = useTheme()
    const navigation = useNavigation<AddGoalScreenNavigationProp>();
    const [frequencyCount, setFrequencyCount] = useState(0)
    const [frequencyDuration, setFrequencyDuration] = useState(1)
    const [frequencyUnit, setFrequencyUnit] = useState('weeks')
    const route = useRoute<AddGoalScreenRouteProp>();

    // Get params from route
    const category = route.params?.category || 'General';
    const initialGoal = route.params?.initialGoal || null;
    const onSaveCallback = route.params?.onSave;

    const [formState, setFormState] = useState({
        area: '',
        goalText: '',
        status: 'Working on' as 'Working on' | 'Mastered',
        selectedChild: '',
        saveToCorePlan: true,
        frequencyCount: 0,
        frequencyDuration: 1,
        frequencyUnit: 'weeks' as 'days' | 'weeks' | 'months' | 'years',
    });

    const [smart, setSmart] = useState<SmartFields>({
        measurable: '',
        achievable: '',
        relevant: '',
    });

    const [reward, setReward] = useState<Reward>({
        name: '',
        notes: ''
    });

    const [loading, setLoading] = useState(false)
    const [children, setChildren] = useState<Child[]>([])
    const [childrenLoading, setChildrenLoading] = useState(false)
    const [reminders, setReminders] = useState<Reminder[]>([]);

    // Memoized values
    const smartFieldsConfig = useMemo(() => [
        { key: "measurable", Text: "Measurable", placeholder: "How will you measure success?" },
        { key: "achievable", Text: "Achievable", placeholder: "Is the goal realistic?" },
        { key: "relevant", Text: "Relevant", placeholder: "Why is this goal important?" },
    ], []);

    // format time to 12-hour clock with AM/PM
    const formatTime = useCallback((timeString?: string) => {
        if (!timeString) return "—";
        const [hours, minutes] = timeString.split(":");
        const h = parseInt(hours, 10);
        const m = minutes.padStart(2, "0");
        const suffix = h >= 12 ? "PM" : "AM";
        const hour12 = ((h + 11) % 12) + 1;
        return `${hour12}:${m} ${suffix}`;
    }, []);

    const calculateTargetDate = useCallback(() => {
        const now = new Date()
        return add(now, { [formState.frequencyUnit]: formState.frequencyDuration })
    }, [formState.frequencyUnit, formState.frequencyDuration]);

    const targetDate = useMemo(() => format(calculateTargetDate(), 'MMM dd, yyyy'), [calculateTargetDate]);

    // Effects
    useEffect(() => {
        if (initialGoal) {
            setFormState(prev => ({
                ...prev,
                area: initialGoal.area || '',
                goalText: initialGoal.goal || '',
                status: initialGoal.status === 'Mastered' ? 'Mastered' : 'Working on',
                selectedChild: initialGoal.assigned_to || ''
            }));

            setSmart({
                measurable: initialGoal.measurable || '',
                achievable: initialGoal.achievable || '',
                relevant: initialGoal.relevant || '',
            });

            if (initialGoal.reward_name) {
                setReward({
                    name: initialGoal.reward_name,
                    notes: initialGoal.reward_notes || ''
                })
            }
        }

        fetchChildren();
    }, [initialGoal]);

    const fetchReminders = useCallback(async (goalId: string) => {
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
    }, []);

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
    }, [user]);

    const handleSubmit = useCallback(async () => {
        if (!formState.area || !formState.goalText) {
            Alert.alert('Missing Information', 'Please fill in the goal area and description');
            return;
        }

        setLoading(true);
        try {
            const { data: coreValue, error: cvError } = await supabase
                .from('core_values')
                .select('id')
                .eq('title', category)
                .single();

            if (cvError) throw cvError;
            if (!coreValue) throw new Error('Core value not found');

            const coreValueId = coreValue.id;

            const newGoal = {
                user_id: user?.id ?? null,
                child_id: formState.selectedChild || null,
                core_value_id: coreValueId ?? null,
                area: formState.area,
                goal: formState.goalText,
                status: formState.status,
                measurable: smart.measurable,
                achievable: smart.achievable,
                relevant: smart.relevant,
                time_bound:
                    frequencyCount && frequencyDuration && frequencyUnit
                        ? `${frequencyCount} times in ${frequencyDuration} ${frequencyUnit}`
                        : null,
                progress: 0,
                is_active: true,
                reward_name: reward.name || null,
                reward_notes: reward.notes || null,
            };

            const { data: goalData, error: goalError } = await supabase
                .from('goals_plan')
                .insert([newGoal])
                .select()
                .single();

            if (goalError) throw goalError;

            const selectedGoal = {
                goal_id: goalData.id,
                child_id: formState.selectedChild,
                user_id: user?.id,
                status: formState.status,
                frequency_target: newGoal.time_bound,
                is_active: true,
            };

            const { error: selectedError } = await supabase
                .from('selected_goals')
                .insert([selectedGoal]);

            if (selectedError) throw selectedError;

            if (onSaveCallback && goalData) {
                onSaveCallback(goalData as Goal);
            }

            navigation.goBack();
        } catch (error) {
            console.error('Goal insert failed:', error);
            Alert.alert('Error', 'Failed to save goal. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [
        formState,
        smart,
        reward,
        user,
        category,
        frequencyCount,
        frequencyDuration,
        frequencyUnit,
        navigation,
        onSaveCallback,
    ]);

    const updateFormState = useCallback((field: keyof typeof formState, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateSmartField = useCallback((field: keyof SmartFields, value: string) => {
        setSmart(prev => ({ ...prev, [field]: value }));
    }, []);

    const updateRewardField = useCallback((field: keyof Reward, value: string) => {
        setReward(prev => ({ ...prev, [field]: value }));
    }, []);

    const navigateToReminder = useCallback(() => {
        if (!initialGoal) {
            console.warn("No goal selected to attach reminder");
            return;
        }

        navigation.navigate('Reminder', {
            goal: initialGoal,
            reminderId: reminders[0]?.id,
            onSave: async () => {
                try {
                    const { data, error } = await supabase
                        .from("reminders")
                        .select("*")
                        .eq("goal_id", initialGoal.id)
                        .order("created_at", { ascending: false });

                    if (error) throw error;
                    setReminders(data ?? []);
                } catch (err) {
                    console.error("Failed to refresh reminders:", err);
                }
            },
        });
    }, [initialGoal, navigation]);

    return (
        <GoalBackground>
            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={20}
                keyboardOpeningTime={0}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <XStack alignItems="center" mb="$4" mt='$6'>
                    <Button unstyled onPress={() => navigation.goBack()} hitSlop={20} mr="$5">
                        <MaterialIcons name="arrow-back" size={24} color={colors.text} />
                    </Button>
                    <H6 color={colors.text} fontWeight='600'>
                        Add New Goal
                    </H6>
                </XStack>

                <YStack space="$3" mb='$5'>
                    <Paragraph color={colors.textSecondary}>Category: {category}</Paragraph>
                    {/* Area */}
                    <YStack mt='$2'>
                        <Text color={colors.text} fontWeight="500">Goal Area</Text>
                        <Input
                            value={formState.area}
                            onChangeText={(text) => updateFormState('area', text)}
                            placeholder="Goal Area"
                            backgroundColor='white'
                            borderColor={colors.border as any}
                        />
                    </YStack>

                    {/* Goal */}
                    <YStack space="$1">
                        <Text color={colors.text} fontWeight="bold">Goal Description</Text>
                        <Input
                            value={formState.goalText}
                            onChangeText={(text) => updateFormState('goalText', text)}
                            multiline
                            numberOfLines={4}
                            placeholder="Describe the goal..."
                            backgroundColor='white'
                            borderColor={colors.border as any}
                            paddingVertical="$2"
                            textAlignVertical="top"
                        />
                    </YStack>

                    {/* SMART Fields */}
                    <YStack space="$3" mt="$4">
                        <H6 color={colors.text} fontWeight="600">SMART Criteria</H6>
                        {smartFieldsConfig.map((field) => (
                            <YStack key={field.key}>
                                <Text fontWeight="500" color={colors.text} mb="$1.5">{field.Text}</Text>
                                <SmartFieldInput
                                    value={smart[field.key as keyof SmartFields]}
                                    onChange={(text) => updateSmartField(field.key as keyof SmartFields, text)}
                                    placeholder={field.placeholder}
                                    borderColor={colors.border as any}
                                />
                            </YStack>
                        ))}
                    </YStack>

                    {/* Time Bound */}
                    <YStack mb="$4">
                        <Text color={colors.text} fontWeight="500" mb="$1.5">
                            Time Bound
                        </Text>
                        <YStack space="$3">
                            <XStack alignItems="center" space="$3">
                                <Input
                                    keyboardType="numeric"
                                    width={80}
                                    borderWidth={1}
                                    borderColor={colors.border as any}
                                    value={formState.frequencyCount.toString()}
                                    onChangeText={(text) => updateFormState('frequencyCount', Number(text))}
                                />
                                <Text fontWeight="500" color={colors.text}>times in</Text>
                                <Input
                                    keyboardType="numeric"
                                    width={60}
                                    borderWidth={1}
                                    borderColor={colors.border as any}
                                    value={formState.frequencyDuration.toString()}
                                    onChangeText={(text) => updateFormState('frequencyDuration', Number(text))}
                                />
                                <View borderWidth={1}
                                    borderColor={colors.border as any}
                                    backgroundColor='transparent'
                                    borderRadius="$4" flex={1}>
                                    <Picker
                                        selectedValue={formState.frequencyUnit}
                                        onValueChange={(val: string) => updateFormState('frequencyUnit', val)}
                                    >
                                        <Picker.Item label="Days" value="days" />
                                        <Picker.Item label="Weeks" value="weeks" />
                                        <Picker.Item label="Months" value="months" />
                                        <Picker.Item label="Years" value="years" />
                                    </Picker>
                                </View>
                            </XStack>

                            <Text color={colors.textSecondary}>
                                Target date: {targetDate}
                            </Text>
                        </YStack>
                    </YStack>

                    {/* Assign To */}
                    <YStack space="$2" mb="$2">
                        <H6 color={colors.text} fontWeight="600">Assign To: </H6>
                        {children.length > 0 ? (
                            <RadioGroup
                                value={formState.selectedChild}
                                onValueChange={(val) => updateFormState('selectedChild', val)}
                            >
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <XStack space="$4" px="$2">
                                        {children.map((child) => (
                                            <ChildSelectorItem
                                                key={child.id}
                                                child={child}
                                                isSelected={formState.selectedChild === child.id}
                                                onSelect={(id) => updateFormState('selectedChild', id)}
                                                colors={colors}
                                            />
                                        ))}
                                    </XStack>
                                </ScrollView>
                            </RadioGroup>
                        ) : (
                            <Paragraph color="$gray10">No children added yet</Paragraph>
                        )}
                    </YStack>

                    {/* Reward System */}
                    <YStack mb="$2" space='$3'>
                        <H6 mb="$1" fontWeight='600'>Reward System</H6>
                        <YStack space='$2'>
                            <YStack space='$1'>
                                <Text mb='$1.5' color={colors.text} fontWeight="500">Reward Name</Text>
                                <Input
                                    value={reward.name}
                                    onChangeText={(text) => updateRewardField('name', text)}
                                    placeholder="Name of the reward"
                                    backgroundColor='white'
                                    borderColor={colors.border as any}
                                />
                            </YStack>

                            <YStack space="$1">
                                <Text mb='$1.5' color={colors.text} fontWeight="500">Notes</Text>
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

                    {/* Reminder */}
                    <YStack space="$1" mt="$1">
                        <H6 color={colors.text} fontWeight="600">
                            Reminder
                        </H6>
                        <Text>When should we remind you about your goal?</Text>

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
                                        goal: initialGoal ?? undefined,
                                        reminderId: reminders[0].id,
                                        onSave: () => initialGoal && fetchReminders(initialGoal.id),
                                    })
                                }
                            >
                                <YStack>
                                    <H4 color={colors.text}>
                                        {formatTime(reminders[0].time)}
                                    </H4>
                                    <Text>{reminders[0].repeat}</Text>
                                </YStack>
                                <XStack ai="center" space="$2">
                                    <ChevronRight size={20} color={colors.text as string} />
                                </XStack>
                            </XStack>

                        ) : (
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

                    {/* Save to CorePlan Radio Button 
                    <YStack space="$2" mt="$2">
                        <XStack alignItems="center" space="$2">
                            <RadioGroup value={formState.saveToCorePlan ? "yes" : "no"}
                                onValueChange={() => updateFormState('saveToCorePlan', !formState.saveToCorePlan)}
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
                                    {formState.saveToCorePlan && (
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

                            <Text htmlFor="yes" color={colors.text}>
                                {formState.saveToCorePlan ? "Saved to CorePlan" : "Save Goal to CorePlan"}
                            </Text>
                        </XStack>
                    </YStack>
                    */}

                    {/* Buttons */}
                    <XStack space="$2" justifyContent="space-between" marginTop="$4">
                        <Button
                            size='$4'
                            width='48%'
                            backgroundColor='transparent'
                            borderColor={colors.primary}
                            color={colors.primary}
                            onPress={() => navigation.goBack()}
                            borderRadius="$3"
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={!formState.area || !formState.goalText || loading}
                            backgroundColor={colors.primary as any}
                            color={colors.onPrimary as any}
                            onPress={handleSubmit}
                            borderRadius="$3"
                            size='$4'
                            width='48%'
                        >
                            {loading ? <Spinner color={colors.onPrimary as any} /> : "Create Goal"}
                        </Button>
                    </XStack>
                </YStack>
            </KeyboardAwareScrollView>
        </GoalBackground>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1 },
    container: { padding: 20, paddingBottom: 40 },
})

export default AddGoalScreen;