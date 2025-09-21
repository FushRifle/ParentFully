import { CelebrateBackground } from '@/constants/CelebrateBackground'
import { LinearGradient } from 'expo-linear-gradient'
import { Modal, StyleSheet } from 'react-native'
import { Button, Text, XStack, YStack } from 'tamagui'
// import { Sparkles, PartyPopper, Circle } from '@tamagui/lucide-icons' // uncomment if using blobs

interface CelebrationModalProps {
    visible: boolean
    onClose: () => void
    onConfirm: () => void
    childName?: string
    goalArea?: string
    currentProgress?: number
    targetProgress?: number
}

const CelebrationModal = ({
    visible,
    onClose,
    onConfirm,
    childName,
    goalArea,
    currentProgress,
    targetProgress,
}: CelebrationModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <YStack f={1} jc="center" ai="center" bg="rgba(0,0,0,0.5)">
                <YStack
                    width="90%"
                    height={438}
                    borderRadius={24}
                    overflow="hidden"
                    position="relative"
                    ai="center"
                    jc="center"
                >
                    {/* faint background */}
                    <CelebrateBackground />

                    {/* gradient overlay */}
                    <LinearGradient
                        colors={['#8BCF0C', '#9FCC16']}
                        style={StyleSheet.absoluteFillObject}
                    />

                    {/* blobs (inside modal, above gradient, behind content) */}
                    {/*
          <Sparkles
            size={28}
            color="white"
            style={{ position: 'absolute', top: 16, left: 16 }}
          />
          <Sparkles
            size={28}
            color="white"
            style={{ position: 'absolute', top: 16, right: 16 }}
          />
          <PartyPopper
            size={32}
            color="orange"
            style={{ position: 'absolute', left: 12, top: '30%' }}
          />
          <PartyPopper
            size={32}
            color="orange"
            style={{ position: 'absolute', right: 12, top: '30%' }}
          />
          <Circle
            size={20}
            color="orange"
            fill="orange"
            style={{ position: 'absolute', right: 30, bottom: 40 }}
          />
          */}

                    {/* content on top */}
                    <YStack space="$3" ai="center" width="90%">
                        <Text fontSize="$9" fontWeight="900" color="white" textAlign="center">
                            Congratulations
                        </Text>
                        <Text fontSize="$7" fontWeight="700" color="white" textAlign="center">
                            {childName}
                        </Text>

                        {/* Goal card */}
                        <YStack
                            bg="wheat"
                            br="$6"
                            p="$4"
                            width={217}
                            height={124}
                            ai="center"
                            space="$3"
                            shadowColor="rgba(0,0,0,0.2)"
                            shadowOffset={{ width: 0, height: 2 }}
                            shadowOpacity={0.3}
                            shadowRadius={4}
                            elevation={3}
                        >
                            <Text fontSize="$4" fontWeight="700" color="black">
                                Goal Mastered
                            </Text>
                            <Text fontSize="$3" color="black" textAlign="center">
                                Complete {goalArea}
                            </Text>

                            {typeof currentProgress === 'number' &&
                                typeof targetProgress === 'number' && (
                                    <XStack
                                        bg="white"
                                        px="$4"
                                        py="$2"
                                        br="$6"
                                        mt="$2"
                                        ai="center"
                                        jc="center"
                                    >
                                        <Text fontSize="$6" fontWeight="900" color="#4CAF50">
                                            {currentProgress} / {targetProgress}
                                        </Text>
                                    </XStack>
                                )}
                        </YStack>

                        {/* Buttons */}
                        <Button size='$5' width="85%"
                            bg="#FF7A00"
                            mt='$4'
                            br="$9"
                            onPress={onConfirm}>
                            <Text color="white" fontWeight="700">
                                View Certificate
                            </Text>
                        </Button>

                        <Button
                            width="85%"
                            variant="outlined"
                            borderColor="white"
                            br="$9"
                            size='$5'
                            onPress={onClose}
                        >
                            <Text color="white" fontWeight="700">
                                Close
                            </Text>
                        </Button>
                    </YStack>
                </YStack>
            </YStack>
        </Modal>
    )
}

export default CelebrationModal
