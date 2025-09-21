import { useTheme } from '@/styles/ThemeContext'
import { useNavigation } from '@react-navigation/native'
import React, { useRef, useState } from 'react'
import {
    Animated,
    PanResponder,
    ScrollView,
} from 'react-native'
import {
    GestureHandlerRootView,
    LongPressGestureHandler,
    State
} from 'react-native-gesture-handler'
import { Text, XStack, YStack } from 'tamagui'

interface PlanCategory {
    key: string
    label: string
    icon: string
    screen: string
    color: string
}

interface PlanData {
    [key: string]: {
        progress: number
        lastUpdated: string
    }
}

interface ParentingPlanSectionProps {
    plan: PlanData
}

const ParentingPlanSection = ({ plan }: ParentingPlanSectionProps) => {
    const { colors } = useTheme()
    const navigation = useNavigation()
    const [categories, setCategories] = useState<PlanCategory[]>([
        { key: 'learning', label: 'Learning', icon: '📚', screen: 'Learning', color: '#E3F2FD' },
        { key: 'messaging', label: 'Messaging', icon: '💬', screen: 'Messaging', color: '#E8F5E9' },
        { key: 'support', label: 'Support', icon: '🆘', screen: 'Support', color: '#FFF3E0' },
        { key: 'budgeting', label: 'Budgeting', icon: '💰', screen: 'Budgeting', color: '#F3E5F5' },
        { key: 'documents', label: 'Shared Files', icon: '📄', screen: 'Documents', color: '#E0F7FA' },
        { key: 'events', label: 'Events', icon: '📅', screen: 'Events', color: '#F1F8E9' },
        { key: 'goals', label: 'Goals', icon: '🎯', screen: 'GoalScreen', color: '#FFECB3' },
        { key: 'activities', label: 'Activities', icon: '🏃', screen: 'Activities', color: '#FFCCBC' },
    ])

    const [dragging, setDragging] = useState<number | null>(null)
    const positionsRef = useRef<{ [key: number]: number }>({})
    const animatedValues = useRef<Animated.Value[]>([])
    const panResponders = useRef<any[]>([])

    // Initialize
    if (animatedValues.current.length !== categories.length) {
        animatedValues.current = categories.map(() => new Animated.Value(0))
        panResponders.current = categories.map((_, index) => {
            const positionY = animatedValues.current[index]

            return PanResponder.create({
                onStartShouldSetPanResponder: () => dragging === index,
                onMoveShouldSetPanResponder: () => dragging === index,
                onPanResponderGrant: () => {
                    positionY.setOffset(positionsRef.current[index] || 0)
                    positionY.setValue(0)
                },
                onPanResponderMove: (_, gestureState) => {
                    positionY.setValue(gestureState.dy)
                },
                onPanResponderRelease: (_, gestureState) => {
                    positionY.flattenOffset()
                    const newPosition = (positionsRef.current[index] || 0) + gestureState.dy

                    const targetIndex = Object.entries(positionsRef.current).find(
                        ([i, pos]) =>
                            parseInt(i) !== index && Math.abs(newPosition - pos) < 50
                    )?.[0]

                    if (targetIndex !== undefined) {
                        const newCategories = [...categories]
                        const [removed] = newCategories.splice(index, 1)
                        newCategories.splice(parseInt(targetIndex), 0, removed)
                        setCategories(newCategories)
                    }

                    Animated.spring(positionY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start(() => {
                        setDragging(null)
                    })
                },
                onPanResponderTerminate: () => {
                    Animated.spring(positionY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start(() => {
                        setDragging(null)
                    })
                },
            })
        })
    }

    const handleCategoryPress = (screen: string) => {
        if (dragging === null) {
            navigation.navigate(screen as never)
        }
    }

    const handleLongPress = (index: number) => {
        setDragging(index)
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <YStack f={1} p="$2" pb="$5">
                <Text fontSize={18} fontWeight="600" mb="$3">
                    Strategic Roadmap for Holistic Development
                </Text>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack space="$3" pb="$3">
                        {categories.map((category, index) => {
                            const animatedStyle = {
                                transform: [{ translateY: animatedValues.current[index] }],
                                zIndex: dragging === index ? 100 : 0,
                            }

                            return (
                                <LongPressGestureHandler
                                    key={category.key}
                                    onHandlerStateChange={({ nativeEvent }) => {
                                        if (nativeEvent.state === State.ACTIVE) {
                                            handleLongPress(index)
                                        }
                                    }}
                                    minDurationMs={500}
                                >
                                    <Animated.View
                                        style={[
                                            {
                                                backgroundColor: colors.surface,
                                                borderRadius: 10,
                                                padding: 16,
                                                elevation: dragging === index ? 8 : 2,
                                                borderLeftWidth: 6,
                                                borderLeftColor: getBorderColor(category.key),
                                            },
                                            animatedStyle,
                                        ]}
                                        onLayout={(event) => {
                                            const { y } = event.nativeEvent.layout
                                            positionsRef.current[index] = y
                                        }}
                                        {...panResponders.current[index].panHandlers}
                                    >
                                        <XStack
                                            ai="center"
                                            jc="space-between"
                                            onPress={() => handleCategoryPress(category.screen)}
                                        >
                                            <YStack>
                                                <XStack ai="center" space="$2" mb="$1">
                                                    <Text fontSize={24}>{category.icon}</Text>
                                                    <Text fontSize={16} fontWeight="500">
                                                        {category.label}
                                                    </Text>
                                                </XStack>
                                                <Text fontSize={12} color="$gray10">
                                                    Updated {plan[category.key]?.lastUpdated ?? 'recently'}
                                                </Text>
                                            </YStack>

                                            <Text fontSize={20} color="$gray9">
                                                ≡
                                            </Text>
                                        </XStack>
                                    </Animated.View>
                                </LongPressGestureHandler>
                            )
                        })}
                    </YStack>
                </ScrollView>
            </YStack>
        </GestureHandlerRootView>
    )
}

const getBorderColor = (key: string) => {
    const colors: Record<string, string> = {
        learning: '#2196F3',
        messaging: '#4CAF50',
        support: '#FF9800',
        budgeting: '#9C27B0',
        documents: '#00BCD4',
        events: '#8BC34A',
        goals: '#FFC107',
        activities: '#FF5722',
    }
    return colors[key] || '#2196F3'
}

export default ParentingPlanSection
