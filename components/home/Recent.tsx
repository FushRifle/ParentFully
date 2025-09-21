import { useTheme } from '@/styles/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Card, Stack, Text, XStack, YStack } from 'tamagui';

interface Update {
    type: 'plan-update' | 'goal-completed' | 'message' | 'expense';
    parent: string;
    category?: string;
    title?: string;
    time: string;
    amount?: number;
}

interface RecentUpdatesProps {
    updates: Update[];
    variant?: 'default' | 'timeline';
}

const RecentUpdates: React.FC<RecentUpdatesProps> = ({ updates, variant = 'default' }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const getIcon = (type: string) => {
        switch (type) {
            case 'plan-update':
                return 'document-text';
            case 'goal-completed':
                return 'trophy';
            case 'message':
                return 'chatbubble';
            case 'expense':
                return 'cash';
            default:
                return 'notifications';
        }
    };

    const renderUpdate = (update: Update) => {
        switch (update.type) {
            case 'plan-update':
                return (
                    <Text>
                        <Text fontWeight="bold">{update.parent}</Text> updated the {update.category} plan
                    </Text>
                );
            case 'goal-completed':
                return (
                    <Text>
                        <Text fontWeight="bold">{update.parent}</Text> completed "{update.title}"
                    </Text>
                );
            case 'message':
                return (
                    <Text>
                        <Text fontWeight="bold">{update.parent}</Text> sent a new message
                    </Text>
                );
            case 'expense':
                return (
                    <Text>
                        <Text fontWeight="bold">{update.parent}</Text> logged ${update.amount} expense
                    </Text>
                );
            default:
                return null;
        }
    };

    const handleViewAll = () => {
        navigation.navigate('ActivityScreen' as never);
    };

    if (variant === 'timeline') {
        return (
            <Card elevate size="$4"
                borderColor={colors.primary as any}
                borderWidth={1}
                borderRadius="$4"
            >
                <YStack gap="$3" p="$3">
                    {updates.map((update, index) => (
                        <XStack key={index} alignItems="flex-start" gap="$3">
                            <Stack
                                width={24}
                                height={24}
                                borderRadius={12}
                                backgroundColor="$primary"
                                justifyContent="center"
                                alignItems="center"
                            >
                                <Ionicons name={getIcon(update.type)} size={14} color={colors.primary} />
                            </Stack>
                            <YStack flex={1}>
                                <XStack justifyContent="space-between" mb="$1">
                                    {renderUpdate(update)}
                                    <Text fontSize="$1" color="$textSecondary">
                                        {update.time}
                                    </Text>
                                </XStack>
                                {index < updates.length - 1 && (
                                    <Stack width={2} height={16} backgroundColor="$border" ml={11} />
                                )}
                            </YStack>
                        </XStack>
                    ))}
                </YStack>
            </Card>
        );
    }

    return (
        <Card elevate size="$4"
            borderColor={colors.primary as any}
            borderWidth={1}
            borderRadius="$4"
        >
            <YStack space="$3" p="$3">
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
                    <Text fontSize="$5" fontWeight="bold">
                        Recent Updates
                    </Text>
                </XStack>

                <YStack space="$2">
                    {updates.map((update, index) => (
                        <XStack
                            key={index}
                            bg="$background"
                            p="$3"
                            br="$4"
                            ai="center"
                            gap="$2"
                        >
                            <Stack
                                width={32}
                                height={32}
                                borderRadius={8}
                                backgroundColor="$accent"
                                justifyContent="center"
                                alignItems="center"
                                mr="$2"
                            >
                                <Ionicons name={getIcon(update.type)} size={16} color={colors.onPrimary} />
                            </Stack>
                            <YStack flex={1}>
                                {renderUpdate(update)}
                                <Text fontSize="$1" color="$textSecondary">
                                    {update.time}
                                </Text>
                            </YStack>
                        </XStack>
                    ))}
                </YStack>
            </YStack>
        </Card>
    );
};

export default RecentUpdates;