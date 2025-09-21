import DailyTipCard from '@/components/home/DailyTipCard'
import { HomeSkeleton } from '@/components/home/HomeSkeleton'
import QuickActions from '@/components/home/QuickActions'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import HorizontalProfileCard from '@/components/profile/HorizontalProfileCard'
import { GoalBackground } from '@/constants/GoalBackground'
import useImageUpload from '@/hooks/image/cloudinary/cloudinary'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { BottomTabParamList } from '@/types'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { RouteProp, useFocusEffect } from '@react-navigation/native'
import { Plus } from '@tamagui/lucide-icons'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useCallback, useEffect, useState } from 'react'
import { RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Button, ScrollView, Text, XStack, YStack } from 'tamagui'

interface HomeScreenProps {
    navigation: any
    route: RouteProp<BottomTabParamList, 'Home'>
}

interface ChildData {
    id: string
    name: string
    age: number
    photo: string | null
    notes?: string
    interests?: string[]
    allergies?: string[]
}

interface ProfileData {
    id: string
    username?: string
    avatar_url?: string
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { colors } = useTheme()
    const [children, setChildren] = useState<ChildData[]>([])
    const [selectedChild, setSelectedChild] = useState<ChildData | null>(null)
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const { tempImage } = useImageUpload()

    useEffect(() => {
        fetchData()
    }, [])

    useFocusEffect(
        useCallback(() => {
            fetchData()
        }, [])
    )

    const fetchData = async () => {
        try {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No authenticated user')

            const { data: profileData } = await supabase
                .from('users')
                .select('id, username, avatar_url')
                .eq('id', user.id)
                .single()
            setProfile(profileData)

            const { data: childList, error } = await supabase
                .from('children')
                .select('id, name, age, photo, notes, interests, allergies')
                .eq('user_id', user.id)

            if (error) {
                console.error('Error fetching children:', error)
                return
            }

            setChildren(childList || [])
            if (childList?.length) setSelectedChild(childList[0])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const onRefresh = () => {
        setRefreshing(true)
        fetchData()
    }

    const handleEditChild = async (updatedChild: ChildData) => {
        try {
            const { error } = await supabase
                .from('children')
                .update({
                    name: updatedChild.name,
                    age: updatedChild.age,
                    notes: updatedChild.notes,
                    photo_url: updatedChild.photo,
                    interests: updatedChild.interests,
                    allergies: updatedChild.allergies,
                })
                .eq('id', updatedChild.id)

            if (error) {
                console.error('Supabase error:', error)
                return
            }

            const updatedChildren = children.map((child) =>
                child.id === updatedChild.id ? updatedChild : child
            )
            setChildren(updatedChildren)
            setSelectedChild(updatedChild)
        } catch (err) {
            console.error('Unexpected error:', err)
        }
    }

    const handleActionPress = (screen: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate(screen as any)
    }

    return (
        <GoalBackground>
            <ScrollView
                flex={1}
                contentContainerStyle={{ paddingBottom: 130 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <YStack flex={1} bg={colors.background} mt="$9">
                        <HomeSkeleton />
                    </YStack>
                ) : (
                    <>
                        {/* Header Section */}
                        <SafeAreaView style={{ backgroundColor: colors.primary }}>
                            <YStack
                                space="$3"
                                bg={colors.primary}
                                width="100%"
                                paddingTop="$4"
                                paddingBottom="$4"
                                px="$3"
                            >
                                <XStack justifyContent="space-between" alignItems="center" space="$3">
                                    {/* Avatar */}
                                    <Button unstyled onPress={() => navigation.navigate('UserProfile')}>
                                        <Avatar size="$6" br="$10">
                                            {profile?.avatar_url ? (
                                                <Avatar.Image source={{ uri: profile.avatar_url, cache: 'force-cache' }} />
                                            ) : null}
                                            <Avatar.Fallback bc=" rgba(255, 255, 255, 0.3)" jc="center" ai="center">
                                                <Text
                                                    fontSize="$8"
                                                    fontWeight="700"
                                                    color="white"
                                                    textAlign="center"
                                                >
                                                    {profile?.username
                                                        ? profile.username
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase()
                                                        : "U"}
                                                </Text>
                                            </Avatar.Fallback>
                                        </Avatar>
                                    </Button>

                                    {/* Greeting */}
                                    <YStack flex={1} ml="$2">
                                        <Text fontSize="$5" fontWeight="700" color="white">
                                            Hi {profile?.username}
                                        </Text>
                                        <Text color="white" fontSize="$3">
                                            Ready to make today amazing?
                                        </Text>
                                    </YStack>

                                    {/* Headphones + Notifications */}
                                    <XStack ai="center" space="$3">
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate("Support")}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 22,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: "rgba(255, 255, 255, 0.3)",
                                            }}
                                        >
                                            <MaterialCommunityIcons name="headphones" size={24} color="white" />
                                        </TouchableOpacity>

                                        <NotificationBell />
                                    </XStack>
                                </XStack>

                            </YStack>
                        </SafeAreaView>

                        <YStack px='$4'>
                            <XStack ai="center" jc="space-between" w="100%" py="$5">
                                <YStack>
                                    <Text
                                        fontSize="$4"
                                        fontWeight="700"
                                        style={{
                                            background: 'linear-gradient(to right, #9FCC16, #FF8C01)',
                                            WebkitBackgroundClip: 'text',
                                            color: 'green'
                                        }}
                                    >
                                        My Children
                                    </Text>

                                    {/* Thicker underline directly below text */}
                                    <LinearGradient
                                        colors={['#9FCC16', '#FF8C01']}
                                        start={[0, 0]}
                                        end={[1, 0]}
                                        style={{
                                            height: 4,
                                            borderRadius: 2,
                                            marginTop: 2,
                                            width: '100%',
                                        }}
                                    />
                                </YStack>

                                <XStack ai="center" space="$2">
                                    <Button
                                        chromeless
                                        onPress={() => navigation.navigate('AddChild' as never)}
                                        bc={colors.primary}
                                        br={9999}
                                        size="$2"
                                        width={20}
                                        height={20}
                                        ai="center"
                                        jc="center"
                                    >
                                        <Plus size={14} color="white" />
                                    </Button>
                                    <Text color={colors.primary} fontSize="$2">Add Child</Text>
                                </XStack>
                            </XStack>


                            {selectedChild && (
                                <YStack mb="$2">
                                    <HorizontalProfileCard
                                        children={children as any}
                                        selectedChild={selectedChild as any}
                                        onSelectChild={setSelectedChild as any}
                                        onEditChild={handleEditChild as any}
                                        setChildren={setChildren as any}
                                    />
                                </YStack>
                            )}

                            {/* Quick Actions */}
                            <QuickActions handleActionPress={handleActionPress} />

                            {/* Daily Tips */}
                            <YStack space="$3" mt="$6">
                                <YStack>
                                    <Text
                                        fontSize="$4"
                                        fontWeight="700"
                                        style={{
                                            background: 'linear-gradient(to right, #9FCC16, #FF8C01)',
                                            WebkitBackgroundClip: 'text',
                                            color: 'green'
                                        }}
                                    >
                                        Parenting Tips
                                    </Text>

                                    {/* Thicker underline directly below text */}
                                    <LinearGradient
                                        colors={['#9FCC16', '#FF8C01']}
                                        start={[0, 0]}
                                        end={[1, 0]}
                                        style={{
                                            height: 4,
                                            borderRadius: 2,
                                            marginTop: 2,
                                            width: '26%',
                                        }}
                                    />
                                </YStack>
                                <DailyTipCard />
                            </YStack>
                        </YStack>
                    </>
                )}
            </ScrollView>
        </GoalBackground>
    )
}

export default HomeScreen
