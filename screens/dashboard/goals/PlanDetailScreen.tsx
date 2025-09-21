import { GoalBackground } from '@/constants/GoalBackground'
import { useAuth } from '@/context/AuthContext'
import { createGoal as createGoalService } from '@/hooks/goals/useGoal'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { RootStackParamList } from '@/types'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Plus } from '@tamagui/lucide-icons'
import React, { useCallback, useEffect, useState } from 'react'
import { Modal, useWindowDimensions } from 'react-native'
import Toast from 'react-native-toast-message'
import { Button, Card, H5, H6, ScrollView, Spinner, Text, useTheme as useTamaguiTheme, View, XStack, YStack } from 'tamagui'
import { v4 as uuidv4 } from 'uuid'

const IconMap: Record<string, any> = { Feather, FontAwesome, MaterialIcons, AntDesign }

type Goal = {
    id: string; core_value_id: string; status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again'; area: string; goal: string;
    measurable?: string; achievable?: string; relevant?: string; time_bound?: string; is_default?: boolean; created_at?: string; updated_at?: string;
    is_active?: boolean; user_id?: string; age_group?: string; celebration?: string; progress?: number; is_edited?: boolean; is_selected?: boolean;
    reminders?: boolean; notes?: string; timeframe?: string; target_date?: string;
}

type CoreValue = {
    id: string;
    title: string;
    description: string;
    icon: string; iconComponent: React.ComponentType<any>;
    color: string;
    iconColor: string;
    age_group?: string
}

type Child = { id: string; name: string; age: number }

type PlanDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlanDetail'>

const PlanDetailScreen = () => {
    const route = useRoute()
    const { coreValue, ageGroup, ageDescription } = route.params as { coreValue: CoreValue; goals: Goal[]; ageGroup: string; ageDescription: string }
    const [goals, setGoals] = useState<{ userGoals: Goal[]; predefinedGoals: Goal[] }>({ userGoals: [], predefinedGoals: [] })
    const { colors, isDark } = useTheme()
    const tamaguiTheme = useTamaguiTheme()
    const { user } = useAuth()
    const navigation = useNavigation<PlanDetailScreenNavigationProp>()
    const [showOptions, setShowOptions] = useState(false)
    const [loading, setLoading] = useState(true)
    const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)
    const [addModalVisible, setAddModalVisible] = useState(false)
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
    const IconComponent = IconMap[coreValue.iconComponent as any] || MaterialIcons
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [detailsModalVisible, setDetailsModalVisible] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showChildModal, setShowChildModal] = useState(false)
    const [children, setChildren] = useState<Child[]>([])
    const { width: screenWidth } = useWindowDimensions()

    const fetchGoals = useCallback(async (ageGroup: string) => {
        if (!user?.id || !ageGroup) return
        try {
            setLoading(true)
            const { data: userGoals, error: userError } = await supabase
                .from('goals_plan').select('*').eq('core_value_id', coreValue.id).eq('age_group', ageGroup).eq('user_id', user.id).order('created_at', { ascending: false })
            if (userError) throw userError
            const { data: predefinedGoals, error: predefinedError } = await supabase
                .from('goals_plan').select('*').eq('core_value_id', coreValue.id).eq('age_group', ageGroup).eq('is_default', true).is('user_id', null).order('created_at', { ascending: false })
            if (predefinedError) throw predefinedError
            setGoals({ userGoals: userGoals || [], predefinedGoals: predefinedGoals || [] })
        } catch (error) {
            console.error('Error fetching goals:', error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load goals', position: 'bottom' })
        } finally { setLoading(false) }
    }, [user?.id, coreValue.id])

    useEffect(() => {
        if (ageGroup) {
            fetchGoals(ageGroup);
        }
    }, [fetchGoals, ageGroup]);

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user?.id) return
            try {
                const { data, error } = await supabase.from('children').select('id, name, age').eq('user_id', user.id)
                if (error) throw error
                setChildren(data || [])
            } catch (error) {
                console.error('Error fetching children:', error)
                Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load children', position: 'bottom' })
            }
        }
        fetchChildren()
    }, [user?.id])

    useEffect(() => { if (ageGroup) fetchGoals(ageGroup) }, [fetchGoals, ageGroup])

    const toggleGoalSelection = useCallback((goalId: string, e: any) => {
        e.stopPropagation()
        setSelectedGoalIds(prev => prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId])
    }, [])

    const handleAddGoal = useCallback(async (newGoal: Omit<Goal, 'id' | 'status'>) => {
        if (!user?.id) return
        try {
            const createdGoal = await createGoalService({ ...newGoal, core_value_id: coreValue.id, user_id: user.id, status: 'Working on', is_default: false, is_active: true })
            setGoals(prev => ({ ...prev, userGoals: [createdGoal, ...prev.userGoals] }))
            setAddModalVisible(false)
            Toast.show({ type: 'success', text1: 'Success', text2: 'Goal added successfully!', position: 'bottom' })
        } catch (error) {
            console.error('Error adding goal:', error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to add goal', position: 'bottom' })
        }
    }, [user?.id, coreValue.id])

    const handleUpdateGoal = useCallback(async (updatedGoal: Goal) => {
        if (!updatedGoal || !updatedGoal.id || !user?.id) return
        try {
            let result: Goal
            if (updatedGoal.is_default) {
                const { data, error } = await supabase.from('goals_plan').insert({
                    ...updatedGoal, id: uuidv4(), user_id: user.id, is_default: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
                }).select().single()
                if (error) throw error
                result = data as Goal
                setGoals(prev => ({ userGoals: [result, ...prev.userGoals], predefinedGoals: prev.predefinedGoals.filter(g => g.id !== updatedGoal.id) }))
            } else {
                const { data, error } = await supabase.from('goals_plan').update({
                    ...updatedGoal, updated_at: new Date().toISOString()
                }).eq('id', updatedGoal.id).select().single()
                if (error) throw error
                result = data as Goal
                setGoals(prev => ({ userGoals: prev.userGoals.map(g => g.id === result.id ? result : g), predefinedGoals: prev.predefinedGoals }))
            }
            setEditingGoal(null)
            Toast.show({ type: 'success', text1: 'Success', text2: 'Goal updated successfully!', position: 'bottom' })
        } catch (error) {
            console.error('Error updating goal:', error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to update goal', position: 'bottom' })
        }
    }, [user?.id])

    const handleGoalDelete = useCallback(async (goalId: string) => {
        try {
            const { error } = await supabase.from('goals_plan').delete().eq('id', goalId)
            if (error) throw error
            setGoals(prev => ({ userGoals: prev.userGoals.filter(g => g.id !== goalId), predefinedGoals: prev.predefinedGoals }))
            Toast.show({ type: 'success', text1: 'Success', text2: 'Goal deleted successfully', position: 'bottom' })
        } catch (error) {
            console.error('Error deleting goal:', error)
            Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to delete goal', position: 'bottom' })
        }
    }, [])

    const renderUserGoalsSection = () => (
        <YStack mb="$4">
            <H5 fontWeight="700" color={colors.text} mb="$3" fontSize='$6'>My Goals ({goals.userGoals.length})</H5>
            {goals.userGoals.length > 0 ? (
                <YStack space="$2">
                    {goals.userGoals.map((item) => (
                        <View key={`user-${item.id}`}>{renderGoalItem(item, 'user')}</View>
                    ))}
                </YStack>
            ) : (
                <YStack ai="center" jc="center" p="$4" bg={colors.surface} borderRadius="$3">
                    <MaterialIcons name="person" size={24} color={colors.textSecondary} />
                    <Text ta="center" color={colors.textSecondary} mt="$2">You haven't created any personal goals yet</Text>
                </YStack>
            )}
        </YStack>
    )

    const renderPredefinedGoalsSection = () => (
        <YStack>
            <H5 fontWeight="700" fontSize='$6' color={colors.text} mb="$3">Predefined Goals ({goals.predefinedGoals.length})</H5>
            {goals.predefinedGoals.length > 0 ? (
                <YStack space="$2">
                    {goals.predefinedGoals.map((item) => (
                        <View key={`predefined-${item.id}`}>{renderGoalItem(item, 'predefined')}</View>
                    ))}
                </YStack>
            ) : (
                <Text ta="center" color={colors.textSecondary} p="$4">No predefined goals available</Text>
            )}
        </YStack>
    )

    const navigateToAddGoal = () => {
        navigation.navigate('AddGoal', {
            category: coreValue.title,
            onSave: (newGoal) => { setGoals(prev => ({ ...prev, userGoals: [newGoal, ...prev.userGoals] })) }
        })
    }

    const navigateToGoalDetails = (goal: Goal) => {
        navigation.navigate('GoalDetails', {
            goal: goal,
            onSave: (updatedGoal) => { handleUpdateGoal(updatedGoal) },
            onDelete: (goalId) => { handleGoalDelete(goalId) }
        })
    }

    const renderGoalItem = useCallback((item: Goal, type: 'user' | 'predefined') => (
        <Card
            bg={colors.card}
            elevate
            width={screenWidth - 32}
            maxWidth={500}
            minHeight={102}
            shadowColor="white"
            pressStyle={{ scale: 0.975 }}
            onPress={() => navigateToGoalDetails(item)}
            br={10}
            mb="$1.5"
            p="$2"
        >
            <XStack ai="center" gap="$1.5">
                <YStack flex={1} px='$2' gap="$1.5" mt='$2'>
                    <XStack jc='space-between'>
                        <H6
                            numberOfLines={1}
                            fontSize='$5'
                            fontWeight="700"
                            color={colors.text}
                            flex={1}
                            mr="$2"
                        >
                            {item.area || 'Goal'}
                        </H6>
                        <Button
                            unstyled
                            onPress={(e) => {
                                e.stopPropagation();
                                setGoalToDelete(item);
                                setShowOptions(true);
                            }}
                            hitSlop={12} p="$0.5" top='0'>
                            <MaterialIcons name="delete" size={24} color={colors.text} />
                        </Button>
                    </XStack>
                    <Text
                        fontSize="$4"
                        color={colors.textSecondary}
                        flexWrap="wrap"
                        numberOfLines={2} // Allow 2 lines for better text display
                        flex={1}
                    >
                        {item.goal || 'No description'}
                    </Text>
                    {type === 'user' && (
                        <Button unstyled onPress={() => navigateToGoalDetails(item)}>
                            <Text color={colors.secondaryContainer}>View Details</Text>
                        </Button>
                    )}
                    {type === 'predefined' && (
                        <Button unstyled onPress={() => navigateToGoalDetails(item)}>
                            <Text color={colors.secondaryContainer}>Set Goals</Text>
                        </Button>
                    )}
                </YStack>
            </XStack>
        </Card>
    ), [selectedGoalIds, colors, toggleGoalSelection, handleGoalDelete, screenWidth])

    const totalGoals = goals.userGoals.length + goals.predefinedGoals.length

    const GoalCardSkeleton = () => (
        <Card
            bg={colors.card}
            width={screenWidth - 32}
            maxWidth={500}
            minHeight={102}
            br={10}
            mb="$1.5"
            p="$2"
        >
            <XStack ai="center" gap="$1.5">
                <YStack flex={1} px="$2" gap="$1.5" mt="$2">
                    <XStack jc="space-between">
                        <YStack width={120} height={20} bg={colors.border as any} br="$1" />
                        <YStack width={24} height={24} bg={colors.border as any} br="$2" />
                    </XStack>
                    <YStack width={200} height={16} bg={colors.border as any} br="$1" />
                    <YStack width={80} height={16} bg={colors.border as any} br="$1" />
                </YStack>
            </XStack>
        </Card>
    );

    return (
        <GoalBackground>
            <YStack f={1} w="100%" h="100%">
                <YStack position="absolute" f={1} jc="center" ai="center" w="100%" h="100%">
                    <YStack p="$4" pb="$4" borderBottomLeftRadius="$4" borderBottomRightRadius="$4" width="100%">
                        <XStack ai="center" jc="flex-start" mb="$2" mt="$5">
                            <Button unstyled onPress={() => navigation.goBack()} hitSlop={20} mr="$5">
                                <MaterialIcons name="arrow-back" size={24} color={tamaguiTheme.primary?.val} />
                            </Button>
                            <Text fontSize='$4' ta="left" flex={1} color="$primary">{coreValue.title}</Text>
                        </XStack>
                        <Text ta="left" fontSize="$4" px="$3" color={isDark ? colors.primary : colors.text}>{ageDescription}</Text>
                    </YStack>

                    <XStack jc="flex-end" ai="flex-end" mt="$4" mb="$2" mr='$5' width="100%">
                        <XStack space='$2'>
                            <Button chromeless onPress={navigateToAddGoal}
                                bc={colors.primaryDark} br={9999}
                                size="$2" width={25} height={25}
                                ai="center" jc="center">
                                <Plus size={14} color="white" />
                            </Button>
                            <Text color={colors.primaryDark} fontSize="$4">Add Goal</Text>
                        </XStack>
                    </XStack>

                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 120,
                            width: "100%",
                            alignItems: "center"
                        }}
                        px="$4"
                        pt="$4"
                        showsVerticalScrollIndicator={false}
                    >
                        {loading ? (
                            <YStack space="$4" width="100%" ai="center">
                                <YStack mb="$4" width="100%" maxWidth={500}>
                                    <H5 fontWeight="700" color={colors.text} mb="$3" fontSize="$4">
                                        My Goals
                                    </H5>
                                    <YStack space="$2">
                                        {[1, 2, 3].map((i) => (
                                            <GoalCardSkeleton key={`skeleton-${i}`} />
                                        ))}
                                    </YStack>
                                </YStack>
                                <YStack width="100%" maxWidth={500}>
                                    <H5 fontWeight="700" fontSize="$4" color={colors.text} mb="$3">
                                        Predefined Goals
                                    </H5>
                                    <YStack space="$2">
                                        {[1, 2, 3].map((i) => (
                                            <GoalCardSkeleton key={`skeleton-predefined-${i}`} />
                                        ))}
                                    </YStack>
                                </YStack>
                            </YStack>
                        ) : totalGoals > 0 ? (
                            <YStack space="$4" width="100%" ai="center">
                                <YStack width="100%" maxWidth={500}>
                                    {renderUserGoalsSection()}
                                </YStack>
                                <YStack width="100%" maxWidth={500}>
                                    {renderPredefinedGoalsSection()}
                                </YStack>
                            </YStack>
                        ) : (
                            <YStack flex={1} ai="center" jc="center" px="$4" space="$3" width="100%">
                                <MaterialIcons name="inbox" size={40} color={tamaguiTheme.colorSecondary?.val} />
                                <H5 ta="center" color="$colorSecondary" fontWeight="600">No goals yet</H5>
                                <Text ta="center" color="$colorSecondary" fontSize="$2">Get started by adding your first goal</Text>
                                <Button onPress={() => setAddModalVisible(true)} mt="$3" size="$2" borderWidth={1} borderColor="$primary" backgroundColor="transparent">
                                    <Text color="$primary" fontWeight="500">Create Goal</Text>
                                </Button>
                            </YStack>
                        )}
                        {selectedGoalIds.length > 0 && (
                            <YStack
                                position="absolute"
                                bottom={0}
                                left={0}
                                right={0}
                                px="$4"
                                pb="$6"
                                pt="$3"
                                ai="center"
                            >
                                <Button
                                    backgroundColor="black"
                                    borderRadius="$7"
                                    height="$5"
                                    onPress={() => setShowChildModal(true)}
                                    disabled={saving}
                                    pressStyle={{ opacity: 0.9 }}
                                    width="100%"
                                    maxWidth={500}
                                >
                                    {saving ? <Spinner color="white" /> : <Text color="white" fontWeight="600">Save {selectedGoalIds.length}{selectedGoalIds.length === 1 ? ' Goal' : ' Goals'}</Text>}
                                </Button>
                            </YStack>
                        )}

                    </ScrollView>
                </YStack>

                <Modal visible={showOptions} transparent animationType="slide" onRequestClose={() => setShowOptions(false)}>
                    <YStack f={1} jc="flex-end" bg="rgba(0,0,0,0.4)">
                        <YStack bg={colors.card} p="$4" br="$6" space="$6" elevation={6} borderTopLeftRadius={20} borderTopRightRadius={20}>
                            <YStack space='$3'>
                                <Text fontSize="$4" fontWeight="600" jc='center' ai='center' color={colors.text}>Are you sure you want to Delete this goal?</Text>
                                <Text fontSize="$4" fontWeight="600">Once this goal is deleted it cannot be retrieved and all progress will be lost</Text>
                            </YStack>
                            <XStack jc='center' ai='center' space='$6' mt='$5' mb='$7'>
                                <Button size="$5" w='40%' variant="outlined" borderColor={colors.border as any} onPress={() => setShowOptions(false)}>Cancel</Button>
                                <Button size="$5" w='40%' bg="red" color="white"
                                    onPress={() => {
                                        if (goalToDelete) {
                                            handleGoalDelete(goalToDelete.id);
                                            setGoalToDelete(null);
                                        }
                                        setShowOptions(false);
                                    }}>
                                    Delete
                                </Button>
                            </XStack>
                        </YStack>
                    </YStack>
                </Modal>
            </YStack>
        </GoalBackground>
    )
}

export default PlanDetailScreen