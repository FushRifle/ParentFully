import { CelebrationModal } from '@/components/CelebrateModal';
import { GoalSettingsModal } from '@/components/goals/GoalSettingsModal';
import { GoalBackground } from '@/constants/GoalBackground';
import { useAuth } from '@/context/AuthContext';
import { updateSelectedGoal } from '@/hooks/goals/useGoal';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RootStackParamList } from '@/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    Button,
    ScrollView,
    Spinner,
    Text,
    View,
    YStack
} from 'tamagui';
import GoalCard from './GoalCard';

type Goal = {
    id: string;
    goal_id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired';
    area: string;
    goal: string;
    reward_name: string;
    core_value?: { id: string; title: string };
};

type Child = {
    id: string;
    name: string;
    age: number;
    points: number;
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
    status: 'Working on' | 'Mastered' | 'Expired';
    reminders?: boolean;
    notes?: string;
    child?: Child;
    points?: number;
    progress?: number;
    reward_name: string;
    frequency_progress?: number;
    frequency_target?: number;
};

type ChildProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ChildProfile'>;

const GoalsScreen = ({ childId }: { childId: string }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [goals, setGoals] = useState<SelectedGoal[]>([]);
    const [editingGoal, setEditingGoal] = useState<SelectedGoal | null>(null);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [celebratingTask, setCelebratingTask] = useState({ visible: false, taskTitle: '' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const fetchGoals = useCallback(async () => {
        if (!childId) {
            setLoading(false)
            setError("No child selected")
            return
        }

        try {
            setLoading(true)
            setError(null)

            const query = supabase
                .from("selected_goals")
                .select(
                    `
        *,
        goals_plan:goal_id (*)
      `
                )
                .eq("child_id", childId)
                .order("created_at", { ascending: false })

            if (user?.id) query.eq("user_id", user.id)

            const { data, error: fetchError } = await query
            if (fetchError) throw fetchError

            const validGoals = (data ?? [])
                .filter(
                    (item): item is typeof item & { goals_plan: NonNullable<typeof item["goals_plan"]> } =>
                        item.goals_plan !== null
                )
                .map((item) => ({
                    ...item,
                    goals_plan: item.goals_plan,
                }))

            setGoals(
                validGoals.map((item: any) => ({
                    ...item,
                    goal_id: item.goal_id ?? item.goals_plan?.id ?? item.id,
                    user_id: item.user_id,
                    child_id: item.child_id,
                    created_at: item.created_at,
                    celebrate: item.celebrate,
                    target_date: item.target_date,
                    reward_name: item.reward_name,
                    frequency_progress: item.frequency_progress ?? 0,
                    frequency_target: item.frequency_target ?? 0,
                }))
            )
        } catch (err) {
            console.error("Error fetching goals:", err)
            setError("Failed to load goals. Please try again.")
            setGoals([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [childId, user?.id])

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchGoals();
    }, [fetchGoals]);

    const handleGoalDelete = useCallback(async (goalId: string) => {
        try {
            const { error } = await supabase
                .from('goals_plan')
                .delete()
                .eq('id', goalId);

            if (error) throw error;

            setGoals(prev => prev.filter((g: SelectedGoal) => g.id !== goalId));

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Goal deleted successfully',
                position: 'bottom'
            });
        } catch (error) {
            console.error('Error deleting goal:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete goal',
                position: 'bottom'
            });
        }
    }, []);

    const handleStatusChange = useCallback(
        async (goalId: string, status: 'Working on' | 'Mastered' | 'Expired', e: any) => {
            e?.stopPropagation?.();
            try {
                const updated = await updateSelectedGoal(goalId, { status });

                setGoals(prev => prev.map(g => (g.id === (updated as any).id ? { ...g, ...(updated as any) } : g)) as SelectedGoal[]);

                if (status === 'Mastered') {
                    setCelebratingTask({ visible: true, taskTitle: (updated as any).goal || 'Goal Mastered!' });
                }
            } catch (err) {
                console.error('Error updating goal status:', err);
                Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update goal status', position: 'bottom' });
            }
        },
        []
    );

    const handleIncrementProgress = async (
        goalId: string,
        frequencyProgress: number,
        frequencyTarget: number
    ) => {
        try {
            const newFrequencyProgress = frequencyProgress + 1;
            const newProgress = Math.round((newFrequencyProgress / frequencyTarget) * 100);
            const mastered = newFrequencyProgress >= frequencyTarget;

            const { error, data } = await supabase
                .from('selected_goals')
                .update({
                    frequency_progress: newFrequencyProgress,
                    progress: newProgress,
                    status: mastered ? 'Mastered' : 'Working on',
                    updated_at: new Date().toISOString()
                })
                .eq('id', goalId)
                .select()
                .single();

            if (error) throw error;

            setGoals(prev =>
                prev.map(goal =>
                    goal.id === goalId
                        ? {
                            ...goal,
                            frequency_progress: newFrequencyProgress,
                            progress: newProgress,
                            status: mastered ? 'Mastered' : 'Working on',
                        }
                        : goal
                )
            );

            if (mastered && (data as any)?.goals_plan?.goal) {
                setCelebratingTask({
                    visible: true,
                    taskTitle: (data as any).goals_plan.goal,
                });

                Toast.show({
                    type: 'success',
                    text1: 'Goal Mastered!',
                    text2: `You've completed ${(data as any).goals_plan.goal}`,
                    position: 'bottom',
                });
            }
        } catch (err) {
            console.error('Error:', err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to increment progress', position: 'bottom' });
        }
    };

    const handleDecrementProgress = async (
        goalId: string,
        frequencyProgress: number,
        frequencyTarget: number
    ) => {
        try {
            const newFrequencyProgress = Math.max(frequencyProgress - 1, 0);
            const newProgress = Math.round((newFrequencyProgress / frequencyTarget) * 100);
            const newStatus = newFrequencyProgress < frequencyTarget ? 'Working on' : undefined;

            const { error } = await supabase
                .from('selected_goals')
                .update({
                    frequency_progress: newFrequencyProgress,
                    progress: newProgress,
                    status: newStatus,
                })
                .eq('id', goalId);

            if (error) throw error;

            setGoals(prev =>
                prev.map(goal =>
                    goal.id === goalId
                        ? {
                            ...goal,
                            frequency_progress: newFrequencyProgress,
                            progress: newProgress,
                            status: newStatus ?? goal.status,
                        }
                        : goal
                )
            );
        } catch (err) {
            console.error('Error:', err);
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to decrement progress', position: 'bottom' });
        }
    };

    const closeCelebrationModal = () => setCelebratingTask(prev => ({ ...prev, visible: false }));

    if (loading) {
        return (
            <View f={1} jc="center" ai="center">
                <Spinner size="large" color={colors.primary as any} />
            </View>
        );
    }

    if (error) {
        return (
            <YStack f={1} jc="center" ai="center" p="$4" gap="$3">
                <Text color={colors.error} fontWeight="700">Error</Text>
                <Text color={colors.textSecondary}>{error}</Text>
                <Button onPress={fetchGoals} variant="outlined">Retry</Button>
            </YStack>
        );
    }

    return (
        <GoalBackground>
            <View f={1}>
                <ScrollView
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[colors.primary as any]}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {goals.length === 0 ? (
                        <YStack ai="center" mt='$3' jc="center" p="$6" br="$4" bg={colors.surface} gap="$3">
                            <Text color={colors.textSecondary}>No goals found. Add some to get started!</Text>
                            <Button
                                size='$5'
                                onPress={() => navigation.navigate('CorePlan')}
                                backgroundColor={colors.secondary}
                                color={colors.onPrimary}
                                marginTop="$4"
                            >
                                Add New Goal
                            </Button>
                        </YStack>
                    ) : (
                        <>
                            {goals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    colors={colors}
                                    handleIncrementProgress={handleIncrementProgress}
                                    handleDecrementProgress={handleDecrementProgress}
                                    onEdit={(selectedGoal) => {
                                        navigation.navigate("GoalDetails", {
                                            goal: selectedGoal,
                                            onSave: fetchGoals,
                                        });
                                    }}
                                    handleStatusChange={(id, status, e) =>
                                        handleStatusChange(id, status as "Working on" | "Mastered" | "Expired", e)
                                    }
                                />
                            ))}
                            <Button
                                mt="$5"
                                size='$5'
                                bg={colors.primary}
                                color={colors.onPrimary}
                                onPress={() => navigation.navigate('CorePlan')}
                            >
                                Add Another Goal
                            </Button>
                        </>
                    )}
                </ScrollView>

                <GoalSettingsModal
                    open={settingsModalOpen}
                    onOpenChange={setSettingsModalOpen}
                    goal={editingGoal}
                    onSave={fetchGoals}
                />

                <CelebrationModal
                    visible={celebratingTask.visible}
                    onClose={closeCelebrationModal}
                    taskTitle={celebratingTask.taskTitle}
                />
            </View>
        </GoalBackground>

    );
};

export default GoalsScreen;
