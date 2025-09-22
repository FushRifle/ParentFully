import React from 'react';
import { Card, Text, View, XStack, YStack } from 'tamagui';

export type CompletedGoal = {
    id: string;
    title: string;
    completedAt: string;
    parent: string;
    category: string;
};

export type CompletedGoalsTimelineProps = {
    goals: CompletedGoal[];
};

const CompletedGoalsTimeline: React.FC<CompletedGoalsTimelineProps> = ({ goals }) => {
    return (
        <YStack space="$3">
            {goals.map((goal, index) => (
                <XStack key={goal.id} space="$2" alignItems="center">
                    {/* Dot & Line */}
                    <YStack alignItems="center" minWidth={24}>
                        <View
                            w={12}
                            h={12}
                            br="$10"
                            bg="$green10"
                            borderWidth={2}
                            borderColor="$green6"
                        />
                        {index < goals.length - 1 && (
                            <View w={2} flex={1} bg="$gray6" mt="$1" mb="$1" />
                        )}
                    </YStack>

                    {/* Goal Info */}
                    <Card p="$3" flex={1} bg="$gray2" elevate>
                        <YStack space="$1">
                            <Text fontWeight="600">
                                {goal.title}
                            </Text>
                            <Text color="$gray10">
                                Completed on {new Date(goal.completedAt).toLocaleDateString()}
                            </Text>
                            <Text color="$gray10">
                                By {goal.parent} • {goal.category}
                            </Text>
                        </YStack>
                    </Card>
                </XStack>
            ))}
        </YStack>
    );
};

export default CompletedGoalsTimeline;
