import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { MaterialIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl } from 'react-native'
import Toast from 'react-native-toast-message'
import { Button, ScrollView, Sheet, Text, XStack, YStack } from 'tamagui'


type Goal = {
    id: string
    goal: string
    area: string
    core_value?: { id: string; title: string };
}

type SelectedGoal = {
    goals_plan: Goal
}

type CompletedGoalsSheetProps = {
    open: boolean
    onClose: () => void
    childId: string | null
}

export const CompletedGoalsSheet: React.FC<CompletedGoalsSheetProps> = ({
    open,
    onClose,
    childId,
}) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        if (open && childId) {
            fetchCompletedGoals()
        } else {
            setGoals([])
        }
    }, [open, childId])

    const fetchCompletedGoals = async () => {
        try {
            setLoading(true)
            setRefreshing(true)

            const { data, error } = await supabase
                .from('selected_goals')
                .select(`
        id,
        status,
        child_id,
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
                .eq('status', 'Mastered')
                .eq('child_id', childId)
                .order('updated_at', { ascending: false })

            if (error) throw error

            // filter out rows with no goal relation
            const validGoals = data
                ?.filter((item: any) => item.goals_plan !== null)
                .map((item: any) => item.goals_plan) ?? []

            setGoals(validGoals)
        } catch (error) {
            console.error('Error fetching mastered goals:', error)
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load completed goals',
                position: 'bottom',
            })
            setGoals([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleRefresh = async () => {
        await fetchCompletedGoals()
    }

    return (
        <Sheet
            open={open}
            onOpenChange={(val: boolean) => !val && onClose()}
            dismissOnSnapToBottom
            snapPointsMode="fit"
            animation="medium"
        >
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame
                padding="$4"
                borderTopLeftRadius="$6"
                borderTopRightRadius="$6"
                backgroundColor={colors.background}
                space="$3"
            >
                <XStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="$6" fontWeight="700" mb="$4">Completed Goals</Text>
                    <Button
                        size="$3"
                        circular
                        chromeless
                        onPress={onClose}
                        icon={<MaterialIcons name="close" size={25} />}
                    />
                </XStack>

                {loading && !refreshing ? (
                    <YStack flex={1} justifyContent="center" alignItems="center" minHeight={200}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </YStack>
                ) : goals.length === 0 ? (
                    <YStack flex={1} justifyContent="center" alignItems="center" minHeight={200}>
                        <Text color="$gray10" textAlign="center">
                            No completed goals yet.{'\n'}Keep working on your goals!
                        </Text>
                    </YStack>
                ) : (
                    <ScrollView
                        height={300}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                            />
                        }
                    >
                        <YStack space="$1">
                            {goals.map((goal) => (
                                <XStack
                                    key={goal.id}
                                    backgroundColor="$backgroundStrong"
                                    padding="$2"
                                    borderRadius="$6"
                                    alignItems="flex-start"
                                    space="$3"
                                    shadowColor="rgba(0,0,0,0.1)"
                                    shadowOffset={{ width: 0, height: 2 }}
                                    shadowOpacity={0.1}
                                    shadowRadius={4}
                                >
                                    <MaterialIcons name="check-circle" size={24} color="#4CAF50" />

                                    <YStack flex={1} space="$2">
                                        {goal.core_value && (
                                            <Text fontSize="$6" fontWeight="700" color="$color">
                                                {goal.core_value.title}
                                            </Text>
                                        )}
                                        {goal.area && (
                                            <Text fontSize="$5" fontWeight="600" color="$gray12">
                                                {goal.area}
                                            </Text>
                                        )}
                                        {goal.goal && (
                                            <Text fontSize="$4" color="$gray10">
                                                {goal.goal}
                                            </Text>
                                        )}
                                    </YStack>
                                </XStack>
                            ))}
                        </YStack>

                    </ScrollView>
                )}
            </Sheet.Frame>
        </Sheet>
    )
}