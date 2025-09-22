import { useTheme } from '@/styles/ThemeContext'
import React from 'react'
import { FlatList } from 'react-native'
import { Button, Text, XStack, YStack } from 'tamagui'
import ProgressBar from './ProgressBar'

const ParentingGoalsSection = ({
    goals = [],
    onPressGoal,
    onAddGoal,
}: {
    goals: any[]
    onPressGoal: (goal: any) => void
    onAddGoal: () => void
}) => {
    const { colors } = useTheme()
    const renderGoalItem = ({ item }: { item: any }) => (
        <YStack
            backgroundColor="$cardBackground"
            borderRadius="$4"
            padding="$4"
            marginBottom="$3"
            borderWidth={1}
            borderColor="$borderColor"
            pressStyle={{ opacity: 0.8 }}
            onPress={() => onPressGoal?.(item)}
        >
            <XStack justifyContent="space-between" marginBottom="$2">
                <Text fontSize="$2" fontWeight="bold" color="$color10">
                    {item?.category?.toUpperCase() || 'UNCATEGORIZED'}
                </Text>
                <Text fontSize="$2" color={colors.primary}>
                    Due: {item?.dueDate || 'N/A'}
                </Text>
            </XStack>

            <Text fontSize="$4" fontWeight="600" marginBottom="$2">
                {item?.title || 'Untitled Goal'}
            </Text>

            <ProgressBar progress={item?.progress ?? 0} />
        </YStack>
    )

    return (
        <YStack marginBottom="$6">
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                <Text fontSize="$6" fontWeight="bold">
                    Recent Parenting Goals
                </Text>
                <Button size="$2" onPress={onAddGoal} variant="outlined">
                    + Add Goal
                </Button>
            </XStack>

            {/* Subtitle */}
            <Text fontSize="$3" color={colors.primary} marginBottom="$3">
                Actionable steps from your Parenting Plan
            </Text>

            {/* List */}
            <FlatList
                data={goals}
                keyExtractor={(item) => item.id?.toString()}
                renderItem={renderGoalItem}
                scrollEnabled={false}
                ListEmptyComponent={
                    <Text color="$color8">No goals added yet.</Text>
                }
            />
        </YStack>
    )
}

export default ParentingGoalsSection
