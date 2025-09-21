import CompletedGoalsTimeline from '@/components/home/CompletedGoalsCard';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    Button,
    Card,
    H5,
    Paragraph,
    Progress,
    SizableText,
    Spinner,
    Tabs,
    Text,
    useTheme as useTamaguiTheme,
    View,
    XStack,
    YStack,
} from 'tamagui';

type Props = {
    userId: string;
    childId: string;
    navigation: any;
};

type Goal = {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired';
    area: string;
    goal: string;
    core_value?: {
        id: string;
        title: string;
    };
};

type SelectedGoal = {
    id: string;
    progress?: number;
    goals_plan: Goal | null;
};

const SelectedGoalsSummary: React.FC<Props> = ({ userId, childId, navigation }) => {
    const { colors } = useTheme();
    const theme = useTamaguiTheme();
    const [goals, setGoals] = useState<SelectedGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tabState, setTabState] = useState<'active' | 'completed'>('active');

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error } = await supabase
                    .from('selected_goals')
                    .select(`
            id,
            progress,
            goals_plan:goal_id (
              id,
              goal,
              area,
              status,
              core_value:core_values!fk_core_value (
                id,
                title
              )
            )
          `)
                    .eq('user_id', userId)
                    .eq('child_id', childId);

                if (error) throw error;

                const validGoals = (data ?? [])
                    .filter(item => item.goals_plan !== null)
                    .map(item => ({
                        id: item.id,
                        progress: item.progress,
                        goals_plan: item.goals_plan,
                    }));

                setGoals(validGoals as unknown as SelectedGoal[]);
            } catch (err) {
                console.error('Error fetching goals:', err);
                setError('Failed to load goals. Please try again.');
                setGoals([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId && childId) fetchGoals();
        else setLoading(false);
    }, [userId, childId]);

    const navigateToGoal = (goalId: string | undefined) => {
        if (goalId) {
            navigation.navigate('Goals', { goalId, category: 'Goals' } as never);
        }
    };

    const getProgressValue = (goal: SelectedGoal) => {
        if (goal.goals_plan?.status === 'Mastered') return 100;
        return goal.progress ?? 0;
    };

    const handleDeleteGoal = (goalId: string) => {
        console.log('Deleting goal:', goalId);
        // Add Supabase delete logic if needed
    };

    const filteredGoals = goals.filter(goal =>
        tabState === 'active'
            ? goal.goals_plan?.status !== 'Mastered'
            : goal.goals_plan?.status === 'Mastered'
    );

    const dummyGoals = [
        {
            id: '1',
            title: 'Learn to tie shoes',
            completedAt: '2025-06-20T14:00:00Z',
            parent: 'Mom',
            category: 'Independence',
        },
        {
            id: '2',
            title: 'Complete reading book',
            completedAt: '2025-06-22T18:30:00Z',
            parent: 'Dad',
            category: 'Education',
        },
    ];

    if (loading) {
        return (
            <Card elevate p="$3" mb="$4">
                <XStack ai="center" space="$2">
                    <Spinner size="large" />
                    <Paragraph>Loading selected goals...</Paragraph>
                </XStack>
            </Card>
        );
    }

    if (error) {
        return (
            <Card elevate p="$3" mb="$4">
                <XStack ai="center" space="$3">
                    <View bg="$red10" w={40} h={40} br="$4" ai="center" jc="center" mr="$3">
                        <Icon name="warning-outline" size={20} color="white" />
                    </View>
                    <YStack>
                        <H5>Error</H5>
                        <Paragraph color="$gray10Dark">{error}</Paragraph>
                    </YStack>
                </XStack>
            </Card>
        );
    }

    return (
        <YStack space="$3" mb="$4">
            <Tabs
                value={tabState}
                onValueChange={val => setTabState(val as 'active' | 'completed')}
            >
                <Tabs.List mb="$2" justifyContent="space-around">
                    <Tabs.Tab value="active">
                        <Text fontWeight="600" color={tabState === 'active' ? theme.blue9 : colors.primary}>
                            Active Goals
                        </Text>
                    </Tabs.Tab>
                    <Tabs.Tab value="completed">
                        <Text fontWeight="600" color={tabState === 'completed' ? theme.green9 : colors.primary}>
                            Completed Goals
                        </Text>
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>

            {filteredGoals.length === 0 ? (
                <Card elevate p="$3" mb="$4" bg={colors.surface}>
                    <XStack ai="center" space="$3">
                        <View bg="$orange10" w={40} h={40} br="$4" ai="center" jc="center" mr="$3">
                            <Icon name="list-outline" size={20} color="white" />
                        </View>
                        <YStack>
                            <H5>{tabState === 'active' ? 'Active Goals' : 'Completed Goals'}</H5>
                            <Paragraph color="$gray10Dark">
                                {tabState === 'active'
                                    ? 'No active goals yet. Add some to get started!'
                                    : 'No completed goals yet. Keep working!'}
                            </Paragraph>
                        </YStack>
                    </XStack>
                </Card>
            ) : tabState === 'completed' ? (
                <CompletedGoalsTimeline
                    goals={filteredGoals.length > 0 ? filteredGoals.map(goal => ({
                        id: goal.id,
                        title: goal.goals_plan?.goal || 'Untitled Goal',
                        completedAt: new Date().toISOString(),
                        parent: goal.goals_plan?.core_value?.title || 'Unknown',
                        category: goal.goals_plan?.area || 'General',
                    })) : dummyGoals}
                />
            ) : (
                filteredGoals.map(goal => (
                    <Card
                        key={goal.id}
                        elevate
                        p="$3"
                        mb="$2"
                        bg={colors.surface}
                        borderWidth={1}
                        borderColor={colors.primary as any}
                        pressStyle={{ opacity: 0.9 }}
                        onPress={() => navigateToGoal(goal.goals_plan?.id)}
                        animation="bouncy"
                        enterStyle={{ scale: 0.95, opacity: 0 }}
                    >
                        <YStack space="$2">
                            <XStack ai="center" jc="space-between">
                                <XStack ai="center" space="$2" flex={1}>
                                    <View
                                        bg={goal.goals_plan?.status === 'Mastered' ? colors.success : colors.accent}
                                        w={32}
                                        h={32}
                                        br="$4"
                                        ai="center"
                                        jc="center"
                                    >
                                        <Icon
                                            name={goal.goals_plan?.status === 'Mastered' ? 'checkmark-done' : 'flag-outline'}
                                            size={16}
                                            color="white"
                                        />
                                    </View>
                                    <YStack flex={1}>
                                        <SizableText size="$3" fontWeight="600" color="$color12" numberOfLines={1}>
                                            {goal.goals_plan?.goal || 'Untitled Goal'}
                                        </SizableText>
                                        <SizableText size="$1" color={colors.primary}>
                                            {goal.goals_plan?.core_value?.title || 'General'}
                                        </SizableText>
                                    </YStack>
                                </XStack>
                                <XStack ai="center" space="$2">
                                    <Button
                                        size="$1"
                                        circular
                                        icon={<Icon name="trash-outline" size={16} color={colors.primary} />}
                                        onPress={() => handleDeleteGoal(goal.id)}
                                        chromeless
                                        opacity={0.7}
                                    />
                                </XStack>
                            </XStack>

                            <YStack space="$1" mt="$2">
                                <XStack ai="center" jc="space-between">
                                    <SizableText size="$1" color={colors.primary}>
                                        Progress
                                    </SizableText>
                                    <SizableText size="$1" fontWeight="600" color={colors.primary}>
                                        {getProgressValue(goal)}%
                                    </SizableText>
                                </XStack>
                                <Progress value={getProgressValue(goal)} size="$1" bg="$gray4" mb="$1">
                                    <Progress.Indicator
                                        animation="bouncy"
                                        bg={goal.goals_plan?.status === 'Mastered' ? '$green10' : colors.secondary}
                                    />
                                </Progress>
                            </YStack>
                        </YStack>
                    </Card>
                ))
            )}
        </YStack>
    );
};

export default SelectedGoalsSummary;
