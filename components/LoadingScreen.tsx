import { useTheme } from '@/styles/ThemeContext'
import LottieView from 'lottie-react-native'
import React from 'react'
import { Spinner, Text, YStack } from 'tamagui'

interface LoadingScreenProps {
    variant?: 'spinner' | 'dots' | 'progress' | 'skeleton'
    message?: string
    progress?: number
}

const dotsAnimation = require('@/assets/animations/dots-loading.json')
const brandIcon = require('@/assets/images/icon.png')

const LoadingScreen: React.FC<LoadingScreenProps> = ({
    variant = 'spinner',
    message = 'Loading...',
    progress = 0,
}) => {
    const { colors } = useTheme()

    const renderLoader = () => {
        switch (variant) {
            case 'dots':
                return <LottieView source={dotsAnimation} autoPlay loop style={{ width: 100, height: 100 }} />
            case 'progress':
                return (
                    <YStack width="70%" height={20} backgroundColor="#f0f0f0" borderRadius={10} overflow="hidden">
                        <YStack width={`${progress * 100}%`} height="100%" backgroundColor={colors.primary} />
                        <Text
                            position="absolute"
                            width="100%"
                            textAlign="center"
                            lineHeight={20}
                            color={colors.text}
                        >
                            {Math.round(progress * 100)}%
                        </Text>
                    </YStack>
                )
            case 'skeleton':
                return (
                    <YStack width="80%" space={3}>
                        <YStack height={20} borderRadius={4} backgroundColor={colors.cardBackground} opacity={0.6} />
                        <YStack height={20} borderRadius={4} backgroundColor={colors.cardBackground} opacity={0.6} />
                        <YStack height={20} width="60%" borderRadius={4} backgroundColor={colors.cardBackground} opacity={0.6} />
                    </YStack>
                )
            default:
                return <Spinner size="large" color={colors.primary as any} />
        }
    }

    return (
        <YStack flex={1} jc="center" ai="center" p="$4" bg={colors.background}>
            {renderLoader()}
            <Text mt="$4" fontSize={18} color={colors.text} textAlign="center">
                {message}
            </Text>
        </YStack>
    )
}

export default React.memo(LoadingScreen)
