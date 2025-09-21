import { useTheme } from '@/styles/ThemeContext'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import ConfettiCannon from 'react-native-confetti-cannon'
import Modal from 'react-native-modal'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { Button, Card, Text, View, YStack } from 'tamagui'

type Props = {
    visible: boolean
    onClose: () => void
    taskTitle: string
}

export const CelebrationModal = ({ visible, onClose, taskTitle }: Props) => {
    const { colors } = useTheme()
    const confettiRef = useRef<any>(null)

    // Trigger confetti only when modal becomes visible
    useEffect(() => {
        if (visible && confettiRef.current) {
            confettiRef.current.start()
        }
    }, [visible])

    return (
        <Modal
            isVisible={visible}
            animationIn="zoomIn"
            animationOut="zoomOut"
            animationOutTiming={150}
            backdropOpacity={0.7}
            style={{ justifyContent: 'center', margin: 20 }}
        >
            <Animated.View entering={FadeInUp.duration(300)}>
                <Card
                    backgroundColor={colors.card}
                    borderRadius="$8"
                    padding="$6"
                    alignItems="center"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.15}
                    shadowRadius={6}
                    elevation={4}
                >


                    <YStack alignItems="center" marginBottom="$6">
                        <View position="relative" marginBottom="$4">
                            <MaterialIcons
                                name="emoji-events"
                                size={80}
                                color="#FFD700"
                                style={{ zIndex: 2 }}
                            />
                            <View
                                position="absolute"
                                width={90}
                                height={90}
                                borderRadius={45}
                                backgroundColor="rgba(255, 215, 0, 0.2)"
                                top={-5}
                                left={-5}
                                zIndex={1}
                            />
                        </View>

                        <YStack marginBottom="$6" alignItems="center">
                            <Text fontSize="$8" fontWeight="800" color={colors.success} marginBottom="$2" textAlign="center">
                                🎉 Task Completed!
                            </Text>
                            <Text fontSize="$4" color={colors.textSecondary} textAlign="center">
                                Congratulations! You did an amazing job!
                            </Text>
                        </YStack>
                    </YStack>

                    {/* Confetti with fewer particles & faster animation */}
                    <ConfettiCannon
                        ref={confettiRef}
                        count={60}
                        origin={{ x: -10, y: 0 }}
                        explosionSpeed={700}
                        fadeOut
                        autoStart={false}
                        colors={['#FFD700', '#4CAF50', '#2196F3', '#FF5722']}
                    />

                    <Button
                        onPress={() => {
                            // Stop confetti quickly
                            confettiRef.current?.stop();
                            onClose();
                        }}
                        marginTop="$2"
                        backgroundColor={colors.primary}
                        borderRadius="$3"
                        width="100%"
                        shadowColor={colors.success}
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={0.3}
                        shadowRadius={4}
                        elevation={4}
                        height={48}
                    >
                        <Text fontSize="$4" fontWeight="600" color={colors.onPrimary}>
                            Done
                        </Text>
                    </Button>

                </Card>
            </Animated.View>
        </Modal>
    )
}
