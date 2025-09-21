import { GOAL_BACKGROUND } from '@/constants/Images';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Check } from '@tamagui/lucide-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    Adapt,
    Button,
    Circle,
    H4,
    H5,
    Image,
    Input,
    Label,
    Paragraph,
    RadioGroup,
    ScrollView,
    Select,
    Sheet,
    Spinner,
    XStack,
    YStack
} from 'tamagui';

// Types
type Goal = {
    id: string
    core_value_id: string
    status: 'Working on' | 'Mastered' | 'Expired'
    area: string
    goal: string
    specific?: string
    measurable?: string
    achievable?: string
    relevant?: string
    time_bound?: string
    is_default?: boolean
    created_at?: string
    updated_at?: string
    is_active?: boolean
    user_id?: string
    age_group?: string
    assigned_to?: string
    reward_name?: string
    reward_notes?: string
}

type Child = {
    id: string
    name: string
    photo: string | null
}

type Reward = {
    name: string
    notes: string
}

type SmartFields = {
    specific: string
    measurable: string
    achievable: string
    relevant: string
    timeBound: string
}

type Props = {
    visible: boolean
    onClose: () => void
    onSave: (goal: any) => void
    initialGoal: Goal | null
    category: string
}

const AddGoalModal = ({ visible, onClose, onSave, initialGoal, category }: Props) => {
    const { user } = useAuth()
    const { colors } = useTheme()

    const [area, setArea] = useState('')
    const [goalText, setGoalText] = useState('')
    const [status, setStatus] = useState<'Working on' | 'Mastered'>('Working on')
    const [reminder, setReminder] = useState<'remind' | 'no-remind'>('no-remind')
    const [smart, setSmart] = useState<SmartFields>({
        specific: '',
        measurable: '',
        achievable: '',
        relevant: '',
        timeBound: ''
    })
    const [children, setChildren] = useState<Child[]>([])
    const [selectedChild, setSelectedChild] = useState('')
    const [saveToCorePlan, setSaveToCorePlan] = useState(true)
    const [loading, setLoading] = useState(false)
    const [childrenLoading, setChildrenLoading] = useState(false)
    const [reward, setReward] = useState<Reward>({
        name: '',
        notes: ''
    })

    // Reset form when modal becomes visible or initialGoal changes
    useEffect(() => {
        if (visible) {
            if (initialGoal) {
                setArea(initialGoal.area || '')
                setGoalText(initialGoal.goal || '')
                setStatus(
                    initialGoal.status === 'Mastered'
                        ? 'Mastered'
                        : 'Working on'
                )
                setSmart({
                    specific: initialGoal.specific || '',
                    measurable: initialGoal.measurable || '',
                    achievable: initialGoal.achievable || '',
                    relevant: initialGoal.relevant || '',
                    timeBound: initialGoal.time_bound || ''
                })
                setSelectedChild(initialGoal.assigned_to || '')

                if (initialGoal.reward_name) {
                    setReward({
                        name: initialGoal.reward_name,
                        notes: initialGoal.reward_notes || ''
                    })
                }
            } else {
                // Reset form
                setArea('')
                setGoalText('')
                setStatus('Working on')
                setSmart({
                    specific: '',
                    measurable: '',
                    achievable: '',
                    relevant: '',
                    timeBound: ''
                })
                setSelectedChild('')
                setReward({
                    name: '',
                    notes: ''
                })
            }

            // Fetch children only if needed
            if (children.length === 0) {
                fetchChildren()
            }
        }
    }, [visible, initialGoal])

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

    const handleSubmit = useCallback(async () => {
        if (!area || !goalText) {
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
                user_id: user?.id,
                core_value_id: coreValueId,
                area,
                goal: goalText,
                status,
                specific: smart.specific,
                measurable: smart.measurable,
                achievable: smart.achievable,
                relevant: smart.relevant,
                time_bound: smart.timeBound,
                progress: 0,
                is_active: true,
                assigned_to: selectedChild || null,
                reward_name: reward.name || null,
                reward_notes: reward.notes || null
            };

            // Insert into goals_plan
            const { error } = await supabase.from('goals_plan').insert([newGoal]);
            if (error) throw error;

            onSave(newGoal);
            onClose();
        } catch (error) {
            console.error('Goal insert failed:', error);
            Alert.alert('Error', 'Failed to save goal. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [area, goalText, status, smart, selectedChild, reward, user, category, onSave, onClose]);

    // Memoize the smart fields configuration to prevent recreation on every render
    const smartFieldsConfig = useMemo(() => [
        { key: "specific", label: "Specific", placeholder: "What exactly do you want to accomplish?" },
        { key: "measurable", label: "Measurable", placeholder: "How will you measure success?" },
        { key: "achievable", label: "Achievable", placeholder: "Is the goal realistic?" },
        { key: "relevant", label: "Relevant", placeholder: "Why is this goal important?" },
        { key: "timeBound", label: "Time-bound", placeholder: "When will you achieve it?" },
    ], []);

    // Update individual smart field
    const updateSmartField = useCallback((field: keyof SmartFields, value: string) => {
        setSmart(prev => ({ ...prev, [field]: value }));
    }, []);

    // Update reward field
    const updateRewardField = useCallback((field: keyof Reward, value: string) => {
        setReward(prev => ({ ...prev, [field]: value }));
    }, []);

    if (!visible) return null;

    return (
        <Sheet
            open={visible}
            onOpenChange={(open: boolean) => !open && onClose()}
            snapPoints={[95]}
            modal
            dismissOnSnapToBottom
            animation="quick"
        >
            <Sheet.Overlay />
            <Sheet.Handle />

            <Sheet.Frame padding="$4" space f={1}>
                {/* Background image with 5% opacity */}
                <Image
                    source={GOAL_BACKGROUND}
                    resizeMode="cover"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0.05,
                    }}
                />

                {/* Overlay content */}
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={20}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    <YStack space="$4">
                        <H4 color="$color">
                            {initialGoal ? "Edit Goal" : "Add New Goal"}
                        </H4>

                        <Paragraph color="$gray10">Category: {category}</Paragraph>

                        {/* Area */}
                        <YStack>
                            <Label color="$color" fontWeight="bold">Goal Area</Label>
                            <Input
                                value={area}
                                onChangeText={setArea}
                                placeholder="Goal Area"
                                backgroundColor='white'
                                borderColor={colors.border as any}
                            />
                        </YStack>

                        {/* Goal */}
                        <YStack space="$1">
                            <Label color="$color" fontWeight="bold">Goal Description</Label>
                            <Input
                                value={goalText}
                                onChangeText={setGoalText}
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
                        <YStack space="$1" marginTop="$2">
                            <Label color="$color" fontWeight="bold">SMART Criteria</Label>

                            {smartFieldsConfig.map((field) => (
                                <YStack key={field.key}>
                                    <Label color="$color">{field.label}</Label>
                                    <Input
                                        value={smart[field.key as keyof SmartFields]}
                                        onChangeText={(text) => updateSmartField(field.key as keyof SmartFields, text)}
                                        placeholder={field.placeholder}
                                        backgroundColor='white'
                                        borderColor={colors.border as any}
                                    />
                                </YStack>
                            ))}
                        </YStack>

                        {/* Assign To */}
                        <YStack space="$2" p='$2'>
                            <Label color="$color" fontWeight="bold">Assign To</Label>
                            {childrenLoading ? (
                                <Spinner size="small" />
                            ) : children.length > 0 ? (
                                <RadioGroup
                                    value={selectedChild}
                                    onValueChange={setSelectedChild}
                                >
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <XStack space="$4" px="$2">
                                            {children.map((child) => (
                                                <YStack
                                                    key={child.id}
                                                    ai="center"
                                                    space="$2"
                                                    onPress={() => setSelectedChild(child.id)}
                                                >
                                                    <RadioGroup.Item value={child.id} id={child.id} style={{ display: 'none' }} />

                                                    {child.photo ? (
                                                        <Image
                                                            source={{ uri: child.photo }}
                                                            style={{ width: 60, height: 60, borderRadius: 30 }}
                                                            defaultSource={require('@/assets/images/profile.jpg')}
                                                        />
                                                    ) : (
                                                        <Circle backgroundColor="$gray5" size={60} />
                                                    )}

                                                    <Label
                                                        htmlFor={child.id}
                                                        fontSize="$3"
                                                        textAlign="center"
                                                        color={selectedChild === child.id ? colors.primary : colors.text}
                                                    >
                                                        {child.name}
                                                    </Label>
                                                </YStack>
                                            ))}
                                        </XStack>
                                    </ScrollView>
                                </RadioGroup>
                            ) : (
                                <Paragraph color="$gray10">No children added yet</Paragraph>
                            )}
                        </YStack>

                        {/* Reward System */}
                        <YStack backgroundColor="$background">
                            <H5 marginBottom="$3">Reward System</H5>

                            <YStack space="$3">
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
                                        paddingVertical="$2"
                                        textAlignVertical="top"
                                    />
                                </YStack>
                            </YStack>
                        </YStack>

                        {/* Reminder Dropdown */}
                        <YStack space="$2" mt="$2">
                            <Label color="$color" fontWeight="bold">Reminder</Label>
                            <Select
                                value={reminder}
                                onValueChange={(value) => setReminder(value as "remind" | "no-remind")}
                            >
                                <Select.Trigger borderWidth={1} borderColor="$borderColor" br="$4" h={40} jc="space-between" px="$3">
                                    <Select.Value placeholder="Select reminder option" />
                                    <Select.Icon />
                                </Select.Trigger>

                                <Adapt when="sm" platform="touch">
                                    <Sheet modal dismissOnSnapToBottom>
                                        <Sheet.Frame>
                                            <Sheet.ScrollView>
                                                <Adapt.Contents />
                                            </Sheet.ScrollView>
                                        </Sheet.Frame>
                                    </Sheet>
                                </Adapt>

                                <Select.Content>
                                    <Select.ScrollUpButton />
                                    <Select.Viewport>
                                        <Select.Group>
                                            <Select.Label>Reminder Options</Select.Label>
                                            <Select.Item value="remind" index={0}>
                                                <Select.ItemText>Remind me</Select.ItemText>
                                                <Select.ItemIndicator><Check size={16} /></Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item value="no-remind" index={1}>
                                                <Select.ItemText>Do not remind me</Select.ItemText>
                                                <Select.ItemIndicator><Check size={16} /></Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Group>
                                    </Select.Viewport>
                                    <Select.ScrollDownButton />
                                </Select.Content>
                            </Select>
                        </YStack>

                        {/* Save to CorePlan Radio Button */}
                        <YStack space="$2" mt="$2">
                            <XStack alignItems="center" space="$2">
                                <RadioGroup
                                    value={saveToCorePlan ? "yes" : "no"}
                                    onValueChange={(value) => setSaveToCorePlan(value === "yes")}
                                >
                                    <RadioGroup.Item value="yes" id="yes">
                                        <RadioGroup.Indicator />
                                    </RadioGroup.Item>
                                </RadioGroup>
                                <Label htmlFor="yes">
                                    {saveToCorePlan ? "Saved to CorePlan" : "Save Goal to CorePlan"}
                                </Label>
                            </XStack>
                        </YStack>

                        {/* Buttons */}
                        <XStack space="$2" justifyContent="space-between" marginTop="$4">
                            <Button
                                size='$4'
                                width='48%'
                                backgroundColor='transparent'
                                borderColor={colors.primary}
                                color={colors.primary}
                                onPress={onClose}
                                borderRadius="$3"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={!area || !goalText || loading}
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
            </Sheet.Frame>
        </Sheet>
    );
}

export default React.memo(AddGoalModal);