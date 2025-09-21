import { useTheme } from '@/styles/ThemeContext'
import { StackScreenProps } from '@react-navigation/stack'
import { PartyPopper } from '@tamagui/lucide-icons'
import { useNavigation } from 'expo-router'
import React from 'react'
import { Button, H2, Text, YStack } from 'tamagui'


type SuccessScreenParams = {
    Success: {
        heading: string
        message: string
        buttonText: string
        onPress: () => void
    }
}

type SuccessScreenProps = StackScreenProps<SuccessScreenParams, 'Success'>

export default function SuccessScreen({ route }: SuccessScreenProps) {
    const { colors } = useTheme()
    const navigation = useNavigation()
    const { heading, message, buttonText, onPress } = route.params || {}

    if (!message || !buttonText || !onPress) {
        return (
            <YStack f={1} ai="center" jc="center" p="$6" bg="white">
                <H2 color="$color">Missing parameters</H2>
            </YStack>
        )
    }

    return (
        <YStack f={1} ai="center" jc="center" p="$6" bg="white" space="$3">
            <PartyPopper size={80} color={colors.primary as any} />

            <H2 ta="center" color="$color" fontSize='$8' maw={300}>
                {message}
            </H2>

            <Text ta="center" fontWeight='400' color={colors.text} fontSize='$6' maw={300}>
                {heading}
            </Text>

            <Button
                w="100%"
                p="$3"
                size="$5"
                br="$19"
                mt='$6'
                bg={colors.primary}
                onPress={onPress}
            >
                <Text color={colors.onPrimary} fontWeight="600" fontSize="$5">
                    {buttonText}
                </Text>
            </Button>

            <Button
                w="100%"
                p="$3"
                size="$5"
                borderColor={colors.primary}
                br="$19"
                mt="$3"
                bg="transparent"
                onPress={() => navigation.navigate('AddChild' as never)}
            >
                <Text color={colors.primary} fontWeight="600" fontSize="$5">
                    Add Another Child
                </Text>
            </Button>
        </YStack>
    )
}
