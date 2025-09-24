import { Text } from '@/context/GlobalText';
import { useGoalsContext } from '@/context/GoalContext';
import { supabase } from '@/supabase/client';
import { useNavigation } from '@react-navigation/native';
import { Award, Edit3, Trash2 } from '@tamagui/lucide-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, H3, H6, XStack, YStack } from 'tamagui';
import CelebrationModal from './CelebrationModal';


const statusStyles: Record<string, { bg: string; text: string }> = {
    Mastered: { bg: '#D1FAE5', text: '#059669' },
    'Try again': { bg: '#DDDDDD', text: '#000000' },
    'Working on': { bg: '#FFF3E5', text: '#FF8C01' },
    Behind: { bg: '#FFE0E0', text: '#E65A5A' },
};

type GoalCardProps = {
    goal: SelectedGoal;
    colors: any;
    onEdit: (goal: Goal) => void;
    handleIncrementProgress: (id: string, progress: number, target: number) => void;
    handleDecrementProgress: (id: string, progress: number, target: number) => void;
    handleStatusChange: (id: string, status: string, e: any) => void;
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
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    reminders?: boolean;
    notes?: string;
    reward_name: string;
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
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    area: string;
    reward_name: string;
    goal: string;
    core_value?: { id: string; title: string };
};

type Child = {
    id: string;
    name: string;
    age: number;
    points: number;
};

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo: string;
    notes?: string;
    points?: number;
}

const GoalCard: React.FC<GoalCardProps> = ({
    goal,
    colors,
    handleIncrementProgress,
    handleDecrementProgress,
    handleStatusChange,
}) => {
    const navigation = useNavigation<any>();
    const { updateGoal, deleteGoal } = useGoalsContext();
    const [showOptions, setShowOptions] = useState(false);
    const [showCelebrationModal, setShowCelebrationModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [child, setChild] = useState<ChildProfile | null>(null);

    const fetchChildDetails = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('id', goal.child_id)
                .single();

            if (error) throw error;
            if (data) setChild(data);
        } catch (error) {
            console.error('Error fetching child details:', error);
        }
    }, [goal.child_id]);

    useEffect(() => {
        if (goal.child_id) {
            fetchChildDetails();
        }
    }, [goal.child_id, fetchChildDetails]);

    const handleGoalDelete = useCallback(async (goalId: string) => {
        try {
            const { error } = await supabase.from('selected_goals').delete().eq('id', goalId);
            if (error) throw error;

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Goal deleted successfully',
                position: 'bottom',
            });
        } catch (error) {
            console.error('Error deleting goal:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete goal',
                position: 'bottom',
            });
        }
    }, []);

    const handleStatusChangeWithCelebration = useCallback((id: string, status: string, e: any) => {
        setSelectedStatus(status);
        setShowCelebrationModal(true);
    }, []);

    const confirmStatusChange = useCallback(() => {
        handleStatusChange(goal.id, selectedStatus, null);
        setShowCelebrationModal(false);
    }, [goal.id, selectedStatus, handleStatusChange]);

    const getProgressValue = useCallback((goal: SelectedGoal) => {
        if (goal.goals_plan?.status === 'Mastered') return 100;
        const current = goal.frequency_progress ?? goal.progress ?? 0;
        const target = goal.frequency_target ?? 1;
        const percent = Math.round((current / target) * 100);
        return Math.min(percent, 100);
    }, []);

    const calculateDaysRemaining = useCallback((targetDate?: string) => {
        if (!targetDate) return null;
        const today = new Date();
        const target = new Date(targetDate);
        const diff = target.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    }, []);

    const handleOpenGoal = (goal: any) => {
        navigation.navigate('GoalDetails', {
            goal,
            onSave: (updatedGoal: any) => updateGoal(updatedGoal),
            onDelete: (goalId: string) => deleteGoal(goalId),
        });
    };

    const progress = getProgressValue(goal);
    const daysRemaining = calculateDaysRemaining(goal.target_date);
    const rawStatus = goal.status || 'Working on';
    const isMastered = rawStatus === 'Mastered';
    const isNotStarted = (goal.frequency_progress ?? 0) === 0 && !isMastered;
    const statusLabel = isNotStarted ? 'Not Started' : rawStatus;
    const statusColor = statusStyles[rawStatus] || statusStyles['Working on'];
    const hasTarget = goal.frequency_target !== undefined && goal.frequency_target > 0;
    const currentProgress = goal.frequency_progress ?? 0;
    const targetProgress = goal.frequency_target ?? 1;
    const isCompleted = hasTarget && currentProgress >= targetProgress;
    const showProgressControls = hasTarget && !isMastered;
    const showTimeframeInfo = hasTarget || goal.target_date;

    useEffect(() => {
        if (typeof daysRemaining === "number" && daysRemaining <= 0 && goal.status !== "Expired") {
            handleStatusChange(goal.id, "Expired", null);
        }
    }, [daysRemaining, goal.status, goal.id, handleStatusChange]);

    if (!goal?.goals_plan) return null;

    return (
        <>
            <YStack
                bg={colors.card}
                width="100%"
                h={160}
                p="$3"
                br="$4"
                mb="$3"
                space="$1"
                elevation={3}
                pressStyle={{ scale: 0.98 }}
            >
                {/* Title + Status Button */}
                <XStack ai="center" jc="space-between" mb="$2">
                    <H6 fontWeight="600" fontSize={14} color={colors.text} flexShrink={1}>
                        {goal.goals_plan.area}
                    </H6>

                    <Button
                        size="$1.5"
                        br="$4"
                        px="$2"
                        bg={statusColor.bg}
                        color={statusColor.text}
                        onPress={(e) => handleStatusChangeWithCelebration(goal.id, rawStatus, e)}
                    >
                        {statusLabel}
                    </Button>
                </XStack>

                {/* Progress Count + Controls */}
                {hasTarget && (
                    <XStack ai="center" jc="space-between" mb="$1">
                        <H6 fontSize={14} fontWeight='600' color={statusColor.text}>
                            {currentProgress} / {targetProgress} <Text fontSize="$3" fontWeight='500' color={colors.text}>Times Done</Text>
                        </H6>

                        {showProgressControls && (
                            <XStack space="$3" ai="center" jc="space-evenly">
                                <Button
                                    size="$3"
                                    w={28}
                                    h={28}
                                    circular
                                    bg={colors.disabled}
                                    borderWidth={1}
                                    borderColor={colors.border}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleDecrementProgress(goal.id, currentProgress, targetProgress);
                                    }}
                                >
                                    <H3 color={colors.onPrimary}>−</H3>
                                </Button>

                                <H6 fontSize={14} fontWeight="600" color={colors.text}>
                                    {currentProgress}
                                </H6>

                                <Button
                                    size="$3"
                                    w={28}
                                    h={28}
                                    circular
                                    bg={colors.success}
                                    borderWidth={1}
                                    borderColor={colors.border}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleIncrementProgress(goal.id, currentProgress, targetProgress);
                                    }}
                                >
                                    <H3 color={colors.onPrimary}>+</H3>
                                </Button>
                            </XStack>
                        )}
                    </XStack>
                )}

                {/* Progress Bar - Only show if has target */}
                {hasTarget && (
                    <XStack jc="flex-start" ai="center" mt='$2'>
                        <YStack flex={1} mr="$1">
                            <XStack w="100%" h={7} bg={colors.border} br="$5" overflow="hidden">
                                <XStack
                                    bg={statusColor.text}
                                    w={`${progress}%`}
                                    h="100%"
                                    br="$4"
                                    animation="quick"
                                />
                            </XStack>
                        </YStack>
                    </XStack>
                )}

                {/* Timeframe + Icons */}
                <XStack jc="space-between" ai="center" mt="$2">
                    <H6 fontWeight="600" color={isCompleted ? colors.success : colors.textSecondary} fontSize={14} flexShrink={1}>
                        {!hasTarget && !goal.target_date ? "No target set" :
                            isCompleted ? "Mastered" :
                                typeof daysRemaining === "number" ? (
                                    daysRemaining <= 0 ? "Target date passed" : `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} left`
                                ) : "(no target date)"}
                    </H6>

                    {isMastered ? (
                        <Button
                            size="$2.5"
                            br="$9"
                            px="$3"
                            bg={colors.success}
                            borderWidth={1}
                            borderColor={colors.border}
                            onPress={() => console.log('Certificate for', goal.id)}
                        >
                            <XStack ai="center" space="$2">
                                <Award size={18} color={colors.onPrimary} />
                                <Text color={colors.onPrimary}>Certificate</Text>
                            </XStack>
                        </Button>
                    ) : (
                        <XStack space="$3">
                            <Button
                                size="$2.5"
                                circular
                                chromeless
                                icon={<Trash2 size={18} color={colors.error} />}
                                onPress={() => setShowOptions(true)}
                            />
                            <Button
                                size="$2.5"
                                circular
                                chromeless
                                icon={<Edit3 size={18} color={colors.text} />}
                                onPress={() => handleOpenGoal(goal.goals_plan)}
                            />
                        </XStack>
                    )}
                </XStack>
            </YStack>

            <CelebrationModal
                visible={showCelebrationModal}
                onClose={() => setShowCelebrationModal(false)}
                onConfirm={() => {
                    navigation.navigate('Certificate', {
                        childName: child?.name,
                        skill: goal.goals_plan.area,
                        reward: goal.goals_plan.reward_name,
                        date: new Date().toLocaleDateString(),
                    })
                    setShowCelebrationModal(false)
                }}
                childName={child?.name}
                goalArea={goal.goals_plan.area}
                currentProgress={currentProgress}
                targetProgress={targetProgress}
            />

            {/* Delete Confirm Modal */}
            <Modal
                visible={showOptions}
                transparent
                animationType="slide"
                onRequestClose={() => setShowOptions(false)}
            >
                <YStack f={1} jc="flex-end" bg="rgba(0,0,0,0.4)">
                    <YStack
                        bg={colors.card}
                        p="$4"
                        br="$6"
                        space="$6"
                        elevation={6}
                        borderTopLeftRadius={20}
                        borderTopRightRadius={20}
                    >
                        <YStack space='$3'>
                            <H6 fontSize={14} fontWeight="600" jc='center' ai='center' color={colors.text}>
                                Are you sure you want to Delete this goal?
                            </H6>
                            <H6 fontSize={13} fontWeight="600">
                                Once this goal is deleted it cannot be retrieved and all progress will be lost
                            </H6>
                        </YStack>

                        <XStack jc='center' ai='center' space='$6' mt='$5' mb='$7'>
                            <Button
                                size="$4"
                                w='40%'
                                variant="outlined"
                                borderColor={colors.border}
                                onPress={() => setShowOptions(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                size="$4"
                                w='40%'
                                bg="red"
                                color="white"
                                onPress={() => {
                                    handleGoalDelete(goal.id);
                                    setShowOptions(false);
                                }}
                            >
                                Delete
                            </Button>
                        </XStack>
                    </YStack>
                </YStack>
            </Modal>
        </>
    );
};

export default GoalCard;