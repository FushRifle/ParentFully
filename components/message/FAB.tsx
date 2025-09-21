import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { Button, Text, YStack } from 'tamagui';

type FabOption = {
    icon: React.ComponentProps<typeof MaterialIcons>['name']
    label: string
    color: string
    onPress: () => void
}


export const FloatingActionMenu = ({ options }: { options: FabOption[] }) => {
    const [isOpen, setIsOpen] = useState(false)
    const animation = useRef(new Animated.Value(0)).current
    const { colors } = useTheme()
    const theme = useTheme()

    const toggleMenu = () => {
        Animated.timing(animation, {
            toValue: isOpen ? 0 : 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start()
        setIsOpen(!isOpen)
    }

    const rotation = {
        transform: [
            {
                rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '135deg'],
                }),
            },
        ],
    }

    const pulse = {
        transform: [
            {
                scale: animation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.1, 1],
                }),
            },
        ],
    }

    return (
        <YStack position="absolute" bottom="$10" right="$5" alignItems="flex-end" space="$2">
            {options.map((option, index) => {
                const optionStyle = {
                    transform: [
                        {
                            translateY: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -((70 * (index + 1)) + 10)],
                            }),
                        },
                        {
                            scale: animation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.5, 1],
                            }),
                        },
                    ],
                    opacity: animation,
                }

                return (
                    <Animated.View key={option.label} style={[optionStyle, { position: 'absolute' }]}>
                        <Button
                            theme={colors.secondary as any}
                            circular
                            width={100}
                            height={100}
                            elevation="$5"
                            onPress={() => {
                                option.onPress()
                                toggleMenu()
                            }}
                            pressStyle={{ scale: 0.95 }}
                            animation="quick"
                        >
                            <MaterialIcons name={option.icon} size={24} color={colors.primary} />
                            <Text
                                fontSize="$1"
                                color={colors.primary}
                                fontWeight="600"
                                position="absolute"
                                top={-20}
                            >
                                {option.label}
                            </Text>
                        </Button>
                    </Animated.View>
                )
            })}

            <Animated.View style={[rotation, pulse]}>
                <Button
                    circular
                    width={80}
                    height={80}
                    backgroundColor={colors.primary || '$blue10'}
                    elevation="$4"
                    onPress={toggleMenu}
                    pressStyle={{ backgroundColor: colors.accent || '$blue9' }}
                    animation="quick"
                >
                    <MaterialIcons
                        name={isOpen ? 'close' : 'edit'}
                        size={30}
                        color="white"
                    />
                </Button>
            </Animated.View>
        </YStack>
    )
}
