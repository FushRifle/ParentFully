import { GoalBackground } from '@/constants/GoalBackground'
import { ageGroupDescriptions, type AgeGroupKey } from '@/hooks/goals/useAgeGroupComment'
import { useCoreValueAgeDescription } from '@/hooks/goals/useCoreValueAgeDescription'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import {
    Button,
    Card,
    H4,
    Spinner,
    Text,
    ScrollView as TScrollView,
    XStack,
    YStack
} from 'tamagui'

export type Goal = {
    id: string
    core_value_id: string
    status: 'Working on' | 'Mastered' | 'Expired'
    area: string
    goal: string
    specific?: string
    measurable?: string
    achievable?: string
    relevant?: string
    time_bound?: string
    is_default?: boolean
    created_at?: string
    updated_at?: string
    is_active?: boolean
    user_id?: string
    age_group?: string
    ageDescription: string
}

type CoreValue = {
    id: string
    title: string
    description: string
    icon: string
    iconSet: 'MaterialIcons'
    color: string
    icon_color: string
}

const CorePlanScreen = () => {
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const initialAgeGroup = (route.params?.ageGroup as AgeGroupKey) || 'age3_5'
    const { getDescription } = useCoreValueAgeDescription();
    const { colors } = useTheme()
    const [coreValues, setCoreValues] = useState<CoreValue[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<AgeGroupKey>(initialAgeGroup)

    const ageGroups = Object.entries(ageGroupDescriptions).map(([id, { label }]) => ({
        id,
        label
    }))

    const fetchCoreValues = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('core_values').select('*')
        if (error) {
            console.error('Error fetching core values:', error)
        } else {
            setCoreValues(data as CoreValue[])
        }
        setLoading(false)
    }

    const handleTabChange = async (tabId: string) => {
        setActiveTab(tabId as AgeGroupKey)
        await fetchCoreValues()
    }

    const handleCardPress = async (value: CoreValue) => {
        const { data, error } = await supabase
            .from('goals_plan')
            .select('*')
            .eq('core_value_id', value.id)
            .eq('age_group', activeTab)

        if (error) {
            console.error('Error fetching goal plans:', error)
        } else {
            navigation.navigate('PlanDetail', {
                coreValue: value,
                goals: data,
                ageGroup: activeTab,
                ageDescription: getDescription(value.id, activeTab)
            })
        }
    }

    useEffect(() => {
        fetchCoreValues()
    }, [])

    return (
        <GoalBackground>
            <YStack f={1} w="100%" h="100%">
                {/* Overlay content */}
                <YStack
                    position="absolute"
                    f={1}
                    jc="center"
                    ai="center"
                    w="100%"
                    h="100%"
                >
                    <TScrollView contentContainerStyle={{ paddingBottom: 130 }}>
                        <YStack space="$4" padding="$4" marginTop="$6">
                            {/* Header */}
                            <XStack alignItems="center" space="$2">
                                <H4 color={colors.text}>Parenting Plans</H4>
                            </XStack>

                            {/* Age Group Tabs */}
                            <YStack space="$2">
                                <XStack
                                    space="$2.5"
                                    flexWrap="nowrap"
                                    justifyContent="space-between"
                                    overflow="scroll" // allows horizontal scroll on small screens
                                >
                                    {ageGroups.map((group) => {
                                        const isActive = activeTab === group.id;
                                        return (
                                            <Button
                                                key={group.id}
                                                size="$3"
                                                flex={1} // all buttons share equal width
                                                flexShrink={1}
                                                borderRadius="$9"
                                                borderColor={colors.border as any}
                                                backgroundColor={isActive ? colors.primary : "white"}
                                                color={isActive ? colors.onPrimary : colors.text}
                                                onPress={() => handleTabChange(group.id)}
                                            >
                                                {group.label}
                                            </Button>
                                        );
                                    })}
                                </XStack>
                            </YStack>

                            {/* Loading */}
                            {loading && (
                                <YStack alignItems="center" marginTop="$4">
                                    <Spinner size="large" />
                                </YStack>
                            )}

                            {/* Core Value Cards */}
                            {!loading && (
                                <XStack flexWrap="wrap" gap="$3" justifyContent="space-between">
                                    {coreValues.map((value) => (
                                        <Card
                                            key={value.id}
                                            bordered
                                            elevate
                                            shadowColor="white"
                                            borderColor={colors.border as any}
                                            size="$4"
                                            flexBasis="48%"   // 2 per row
                                            flexGrow={1}
                                            minWidth="45%"
                                            padding="$3"
                                            backgroundColor={value.color}
                                            onPress={() => handleCardPress(value)}
                                        >
                                            <YStack alignItems="center" space="$2">
                                                <YStack
                                                    width={48}
                                                    height={48}
                                                    borderRadius={30}
                                                    backgroundColor={value.icon_color || colors.accent}
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <MaterialIcons name={value.icon} size={28} color="white" />
                                                </YStack>
                                                <Text
                                                    textAlign="center"
                                                    fontWeight="700"
                                                    mt="$2"
                                                    color={colors.text}
                                                >
                                                    {value.title}
                                                </Text>
                                            </YStack>
                                        </Card>
                                    ))}
                                </XStack>
                            )}
                        </YStack>
                    </TScrollView>
                </YStack>
            </YStack>
        </GoalBackground>

    );

}

export default CorePlanScreen