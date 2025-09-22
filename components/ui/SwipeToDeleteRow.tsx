import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Dimensions } from 'react-native'
import { PanGestureHandler } from 'react-native-gesture-handler'
import Animated, {
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated'
import { Text, XStack, YStack } from 'tamagui'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = -0.3 * SCREEN_WIDTH

type Props = {
    task: {
        id: string
        title: string
        time_slot?: string
    }
    onDelete: (id: string) => void
}

export default function SwipeToDeleteRow({ task, onDelete }: Props) {
    const translateX = useSharedValue(0)
    const rowHeight = useSharedValue(1)

    const panGesture = useAnimatedGestureHandler({
        onActive: (event) => {
            translateX.value = Math.min(0, event.translationX)
        },
        onEnd: () => {
            if (translateX.value < SWIPE_THRESHOLD) {
                translateX.value = withTiming(-SCREEN_WIDTH)
                rowHeight.value = withTiming(0, undefined, () => {
                    runOnJS(onDelete)(task.id)
                })
            } else {
                translateX.value = withTiming(0)
            }
        },
    })

    const rStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }))

    const rContainerStyle = useAnimatedStyle(() => ({
        height: rowHeight.value === 0 ? 0 : undefined,
        opacity: rowHeight.value,
        marginVertical: 8,
    }))

    return (
        <Animated.View style={rContainerStyle}>
            <PanGestureHandler onGestureEvent={panGesture}>
                <Animated.View style={[rStyle]}>
                    <XStack
                        backgroundColor="$background"
                        padding="$3"
                        alignItems="center"
                        borderRadius="$3"
                    >
                        <MaterialIcons name="lens" size={10} color="orange" style={{ marginRight: 8 }} />
                        <YStack flex={1}>
                            <Text>{task.title}</Text>
                            {task.time_slot && (
                                <XStack alignItems="center" space="$2" marginTop="$1">
                                    <MaterialIcons name="access-time" size={14} color="#999" />
                                    <Text fontSize="$2" color="#999">
                                        {task.time_slot}
                                    </Text>
                                </XStack>
                            )}
                        </YStack>
                    </XStack>
                </Animated.View>
            </PanGestureHandler>
        </Animated.View>
    )
}
