import { GoalSettingsModal } from '@/components/goals/GoalSettingsModal';
import { GoalPointsModal } from '@/components/goals/GoalsPoints';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Goal } from '@/types/goals';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { SvgXml } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import {
    Button,
    Card,
    H4,
    Paragraph,
    ScrollView,
    Spinner,
    Tabs,
    Text,
    Theme,
    View,
    XStack,
    YStack
} from 'tamagui';

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
};

type Child = {
    id: string;
    name: string;
    age: number;
};

type GoalPointsModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    goal: SelectedGoal | null
    maxPoints?: number
}

const timeframeOptions = [
    { label: '1 Week', value: '1 week', days: 7 },
    { label: '2 Weeks', value: '2 weeks', days: 14 },
    { label: '1 Month', value: '1 month', days: 30 },
    { label: '3 Months', value: '3 months', days: 90 },
    { label: '6 Months', value: '6 months', days: 180 },
    { label: 'Custom', value: 'custom', days: 0 }
];

const priorityOptions = [
    { label: 'Low', value: 'low', color: '$green' },
    { label: 'Medium', value: 'medium', color: '$yellow' },
    { label: 'High', value: 'high', color: '$red' }
];

// Beautiful abstract illustration SVG
const abstractIllustrationSvg = `
<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E1F5FE" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#B3E5FC" stop-opacity="0.3" />
    </linearGradient>
    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#E8F5E9" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#C8E6C9" stop-opacity="0.2" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#grad1)" />
  <path d="M0,0 C50,100 100,50 150,150 C200,250 250,200 300,300 L300,0 Z" fill="url(#grad2)" />
  <circle cx="50" cy="50" r="30" fill="#81D4FA" opacity="0.3" />
  <circle cx="250" cy="250" r="40" fill="#4FC3F7" opacity="0.3" />
  <path d="M50,250 Q150,200 250,50" stroke="#29B6F6" stroke-width="2" stroke-opacity="0.2" fill="none" />
</svg>`;

const GoalScreen = ({ route, navigation }: { route: any; navigation: any }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const category = route.params?.category || 'Goals';

    // State management
    const [selectedGoals, setSelectedGoals] = useState<SelectedGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGoal, setEditingGoal] = useState<SelectedGoal | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<SelectedGoal | null>(null);
    const [pointsModalOpen, setPointsModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Settings state
    const [timeframe, setTimeframe] = useState('1 week');
    const [targetDate, setTargetDate] = useState(new Date());
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [reminders, setReminders] = useState(false);
    const [notes, setNotes] = useState('');
    const [points, setPoints] = useState(0);

    // Date selection state
    const [selectedDay, setSelectedDay] = useState<number>(targetDate.getDate());
    const [selectedMonth, setSelectedMonth] = useState<number>(targetDate.getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(targetDate.getFullYear());

    // Update targetDate when date parts change
    useEffect(() => {
        const newDate = new Date(selectedYear, selectedMonth, selectedDay);
        setTargetDate(newDate);
    }, [selectedDay, selectedMonth, selectedYear]);

    const handleSave = () => {
        fetchSelectedGoals();
    };

    const calculateTargetDate = (timeframeValue: string) => {
        const now = new Date();
        const option = timeframeOptions.find(opt => opt.value === timeframeValue);
        if (!option) return now;

        if (option.value === 'custom') return targetDate;

        const newDate = new Date(now);
        newDate.setDate(newDate.getDate() + option.days);
        return newDate;
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSelectedGoals();
        setRefreshing(false);
    }, []);

    const fetchSelectedGoals = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('selected_goals')
                .select(`
                    id,
                    goal_id,
                    child_id,
                    timeframe,
                    target_date,
                    priority,
                    reminders,
                    notes,
                    progress,
                    created_at,
                    goals_plan:goal_id (
                        id,
                        goal,
                        area,
                        status,
                        is_active,
                        core_value:core_values!goals_plan_core_value_id_fkey (
                            id,
                            title
                        )
                    ),
                    child:children!selected_goals_child_id_fkey (
                        id,
                        name,
                        age
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSelectedGoals(data as any);
        } catch (error) {
            console.error('Error fetching selected goals:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load selected goals',
                position: 'bottom',
            });
        } finally {
            setLoading(false);
        }
    };

    const setupSubscription = () => {
        if (!user?.id) return;

        return supabase
            .channel('selected_goals_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'selected_goals',
                    filter: `user_id=eq.${user.id}`,
                },
                fetchSelectedGoals
            )
            .subscribe();
    };

    useEffect(() => {
        fetchSelectedGoals();
        const subscription = setupSubscription();

        return () => {
            subscription && supabase.removeChannel(subscription);
        };
    }, [user?.id, category]);

    const handleStatusChange = async (goalId: string, newStatus: 'Working on' | 'Mastered') => {
        try {
            const { error } = await supabase
                .from('goals_plan')
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', goalId);

            if (error) throw error;

            fetchSelectedGoals();
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Goal status updated',
                position: 'bottom',
            });
        } catch (error) {
            console.error('Error updating goal status:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update goal status',
                position: 'bottom',
            });
        }
    };

    const handleSaveSettings = async (settings: {
        timeframe: string; targetDate: Date; priority: 'low' | 'medium' | 'high';
        reminders: boolean;
        notes: string;
    }) => {

        if (!editingGoal) return;

        try {
            const { error } = await supabase
                .from('selected_goals')
                .update({
                    timeframe: timeframe,
                    target_date: targetDate.toISOString(),
                    priority: priority,
                    reminders: reminders,
                    notes: notes,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingGoal.id);

            if (error) throw error;

            fetchSelectedGoals();
            setSettingsModalOpen(false);
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Goal settings updated',
                position: 'bottom',
            });
        } catch (error) {
            console.error('Error updating goal settings:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to update goal settings',
                position: 'bottom',
            });
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        try {
            const { error } = await supabase
                .from('selected_goals')
                .delete()
                .eq('id', goalId);

            if (error) throw error;

            fetchSelectedGoals();
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Goal deleted',
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
    };

    const handleOpenPointsModal = (goal: SelectedGoal) => {
        setSelectedGoal(goal);
        setPointsModalOpen(true);
    };

    const handleOpenSettings = (goal: SelectedGoal) => {
        setEditingGoal(goal);
        setSettingsModalOpen(true);
    };

    const getProgressValue = (goal: SelectedGoal) => {
        if (goal.goals_plan?.status === 'Mastered') return 100
        return goal.progress ?? 0
    }

    const renderGoalItem = (goal: SelectedGoal) => {
        const currentStatus = goal.goals_plan.status;
        const nextStatus = currentStatus === 'Working on' ? 'Mastered' : 'Working on';
        const statusColor = currentStatus === 'Mastered' ? colors.success : colors.warning;
        const priorityColor = goal.priority === 'high' ? colors.error :
            goal.priority === 'medium' ? colors.warning : colors.success;

        const progress = goal.points ?? 0;
        const maxPoints = 100;
        const progressPercent = Math.min((progress / maxPoints) * 100, 100);

        return (
            <Card
                key={goal.id}
                mt="$3"
                padding="$3"
                marginBottom="$3"
                borderRadius="$4"
                backgroundColor={colors.card}
                onPress={() => handleOpenSettings(goal)}
                elevate
                animation="quick"
                pressStyle={{ scale: 0.98 }}
                position="relative"
                overflow="hidden"
                height={90} // Fixed height
            >
                {/* Background Illustration - scaled down */}
                <SvgXml
                    xml={abstractIllustrationSvg}
                    width="100%"
                    height="100%"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        opacity: 0.15,
                        zIndex: 0,
                        transform: [{ rotate: '15deg' }, { scale: 0.8 }] // Added scale
                    }}
                />

                <YStack space="$1" zIndex={1}>
                    {/* Header with Area + Actions - made more compact */}
                    <XStack alignItems="center" justifyContent="space-between">
                        <XStack alignItems="center" space="$1.5">
                            <MaterialIcons name="category" size={14} color={colors.primary} />
                            <Text fontSize="$2" color={colors.primary}>
                                Title: {goal.goals_plan.area || 'No area specified'}
                            </Text>
                        </XStack>
                        <Button
                            size="$2"
                            circular
                            chromeless
                            icon={<MaterialIcons name="delete" size={20} color={colors.error} />}
                            onPress={() => handleDeleteGoal(goal.id)}
                            hoverStyle={{ backgroundColor: colors.surface }}
                        />
                    </XStack>
                    <XStack>
                        {/* Core Value - compact version */}
                        {goal.goals_plan.core_value && (
                            <XStack alignItems="center" space="$1.5">
                                <MaterialIcons name="category" size={14} color={colors.primary} />
                                <Text fontSize="$1" color={colors.primary}>
                                    Area: {goal.goals_plan.core_value.title}
                                </Text>
                            </XStack>
                        )}

                        {/* Child Name - compact version */}
                        {goal.child && (
                            <XStack alignItems="center" space="$1.5">
                                <MaterialIcons name="child-care" size={14} color={colors.primary} />
                                <Text fontSize="$1" color={colors.primary}>
                                    {goal.child.name}
                                </Text>
                            </XStack>
                        )}
                    </XStack>
                </YStack>
            </Card>
        );
    };

    if (loading) {
        return (
            <View flex={1} justifyContent="center" alignItems="center" backgroundColor={colors.background}>
                <Spinner size="large" color={colors.primary as any} />
                <Paragraph marginTop="$2" color="$color">
                    Loading goals...
                </Paragraph>
            </View>
        );
    }

    return (
        <Theme name="light">
            <View flex={1} backgroundColor={colors.background} marginBottom={100}>
                <YStack flex={1} padding="$5">
                    <XStack justifyContent="space-between" alignItems="center" marginTop="$5" marginBottom="$4">
                        <H4 color="$color" fontWeight="bold">
                            {category}
                        </H4>
                        <Button
                            size="$3"
                            icon={<MaterialIcons name="add" size={18} color={colors.primary as any} />}
                            onPress={() => navigation.navigate('CorePlan')}
                            color={colors.primary as any}
                            borderWidth={1}
                            borderColor={colors.primary as any}
                            borderRadius="$3"
                            pressStyle={{ opacity: 0.8 }}
                        >
                            Add Goal
                        </Button>
                    </XStack>

                    <Tabs
                        defaultValue="active"
                        orientation="horizontal"
                        flexDirection="column"
                        borderRadius="$4"
                        overflow="hidden"
                        flex={1}
                        backgroundColor={colors.background}
                    >
                        <Tabs.List
                            backgroundColor={colors.surface}
                            borderBottomWidth={1}
                            borderBottomColor={colors.border as any}
                        >
                            <Tabs.Tab
                                value="active"
                                flex={1}
                                borderWidth={1}
                                borderColor={colors.border as any}
                                borderBottomWidth={2}
                                borderBottomColor={colors.primary}
                                paddingVertical="$2"
                                backgroundColor="transparent"
                                hoverStyle={{ backgroundColor: colors.card as any }}
                            >
                                <Text color="$color" fontWeight="600">
                                    Active
                                </Text>
                            </Tabs.Tab>
                            <Tabs.Tab
                                value="inactive"
                                flex={1}
                                borderBottomWidth={2}
                                borderBottomColor="transparent"
                                paddingVertical="$3"
                                backgroundColor="transparent"
                                hoverStyle={{ backgroundColor: colors.surface as any }}
                            >
                                <Text color="$color" fontWeight="600">
                                    Completed
                                </Text>
                            </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Content value="active" flex={1}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                }
                            >
                                <YStack space="$3" paddingTop="$3" paddingBottom="$8">
                                    {selectedGoals
                                        .filter((goal) => goal.goals_plan.is_active)
                                        .map((goal) => renderGoalItem(goal))}

                                    {selectedGoals.filter((goal) => goal.goals_plan.is_active).length === 0 && (
                                        <Card elevate bordered padding="$4" backgroundColor={colors.surface}>
                                            <Paragraph textAlign="center" color="$color">
                                                No active goals found for this category
                                            </Paragraph>
                                        </Card>
                                    )}
                                </YStack>
                            </ScrollView>
                        </Tabs.Content>

                        <Tabs.Content value="inactive" flex={1}>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <YStack space="$3" paddingTop="$3" paddingBottom="$8">
                                    {selectedGoals
                                        .filter((goal) => !goal.goals_plan.is_active)
                                        .map((goal) => renderGoalItem(goal))}

                                    {selectedGoals.filter((goal) => !goal.goals_plan.is_active).length === 0 && (
                                        <Card elevate bordered padding="$4" backgroundColor={colors.surface}>
                                            <Paragraph textAlign="center" color="$color">
                                                No inactive goals found
                                            </Paragraph>
                                        </Card>
                                    )}
                                </YStack>
                            </ScrollView>
                        </Tabs.Content>
                    </Tabs>
                </YStack>

                {/* Modals */}
                <GoalPointsModal
                    open={pointsModalOpen}
                    onOpenChange={setPointsModalOpen}
                    goal={selectedGoal}
                    maxPoints={100}
                />

                <GoalSettingsModal
                    open={settingsModalOpen}
                    onOpenChange={setSettingsModalOpen}
                    goal={editingGoal as SelectedGoal | null}
                    onSave={handleSave}
                />
            </View>
        </Theme>
    );
};

export default GoalScreen;