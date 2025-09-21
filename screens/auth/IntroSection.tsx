import { useTheme } from '@/styles/ThemeContext'
import { Heart, Star, Target } from '@tamagui/lucide-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as React from 'react'
import { Image } from 'react-native'
import {
    Button, Text,
    View,
    XStack,
    YStack
} from 'tamagui'

interface IntroScreenProps {
    onContinue: () => void
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onContinue }) => {
    const { colors, isDark } = useTheme()

    return (
        <YStack f={1}>
            {/* Background gradient */}
            <LinearGradient
                colors={['#fff5ef', '#ffffff']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* Decorative dots */}
            <YStack pos="absolute" top={103} left={77} w={17} h={17} br={9999} bg="#5A8BFF" />
            <YStack pos="absolute" bottom={200} left={20} w={17} h={17} br={9999} bg="#FF5ACD" />
            <YStack pos="absolute" top={150} right={40} w={17} h={17} br={9999} bg="#FF7A00" />

            {/* Content */}
            <YStack f={1} jc="center" ai="center" px="$6">
                <View
                    style={{
                        width: 373,
                        height: 373,
                        borderRadius: 170,
                        overflow: "hidden",
                        alignSelf: "center",
                    }}
                >
                    <Image
                        source={require("@/assets/images/Onboarding1.png")}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                    />
                </View>

                {/* Floating texts + icons */}
                <XStack
                    pos="absolute"
                    top={120}
                    left={20}
                    width={142}
                    height={48}
                    ai="center"
                    space="$2"
                    bg="rgba(255, 255, 255, 0.8)"
                    p="$2"
                    br="$4"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                >
                    <Star size={18} color="#fbbf24" fill="#fbbf24" />
                    <Text fontWeight="600" fontSize={16} color="#000">Co-parenting</Text>
                </XStack>

                <XStack
                    pos="absolute"
                    top={160}
                    right={20}
                    width={142}
                    height={48}
                    ai="center"
                    space="$2"
                    bg="rgba(255, 255, 255, 0.8)"
                    p="$2"
                    br="$4"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                >
                    <Target size={18} color="#3b82f6" />
                    <Text fontWeight="600" fontSize={16} color="#000">Setting Goals</Text>
                </XStack>

                <XStack
                    pos="absolute"
                    top={370}
                    left={40}
                    width={142}
                    height={48}
                    ai="center"
                    space="$2"
                    bg="rgba(255, 255, 255, 0.8)"
                    p="$2"
                    br="$4"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                >
                    <Heart size={18} color="#ef4444" fill="#ef4444" />
                    <Text fontWeight="600" fontSize={16} color="#000">Kids Thrive</Text>
                </XStack>

                {/* Logo */}
                <Image
                    source={require('@/assets/images/icon-dark.png')}
                    style={{ width: 212, height: 113.87, marginTop: 40 }}
                    resizeMode="contain"
                />

                <Text fontSize="$6" mt="$2" opacity={0.7}>
                    Your Partner in parenting
                </Text>

                {/* Button */}
                <Button
                    mt="$8"
                    w="90%"
                    h="$6"
                    size='$10'
                    bg={colors.primary}
                    br={9999}
                    onPress={onContinue}
                >
                    <Text color="white" fontSize='$6' fontWeight="500">
                        GET STARTED
                    </Text>
                </Button>
            </YStack>
        </YStack>
    )
}

export default IntroScreen