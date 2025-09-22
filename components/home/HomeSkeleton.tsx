import { useTheme } from '@/styles/ThemeContext'
import React from 'react'
import { View, XStack, YStack } from 'tamagui'

export const HomeSkeleton = () => {
    const { colors } = useTheme()

    return (
        <YStack space="$8" px="$4" pt="$9" bg={colors.background}>
            {/* Header Skeleton */}
            <XStack space="$3" ai="center">
                <View w={48} h={48} br={24} bg={colors.border as any} />
                <View flex={1} h={20} br={6} bg={colors.border as any} />
                <View w={48} h={48} br={6} bg={colors.border as any} />
                <View w={28} h={28} br={14} bg={colors.border as any} />
            </XStack>

            {/* Children Section */}
            <XStack ai="center" jc="space-between">
                <View w={120} h={20} br={6} bg={colors.border as any} />
                <View w={80} h={20} br={6} bg={colors.border as any} />
            </XStack>

            <View w="100%" h={120} br={12} bg={colors.border as any} />

            {/* Quick Actions Skeleton */}
            <XStack space="$3" mt="$4">
                <View flex={1} h={60} br={12} bg={colors.border as any} />
                <View flex={1} h={60} br={12} bg={colors.border as any} />
                <View flex={1} h={60} br={12} bg={colors.border as any} />
            </XStack>

            {/* Daily Tips Skeleton */}
            <YStack mt="$4" space="$3">
                <View w={140} h={20} br={6} bg={colors.border as any} />
                <View w="100%" h={80} br={12} bg={colors.border as any} />
            </YStack>
        </YStack>
    )
}
