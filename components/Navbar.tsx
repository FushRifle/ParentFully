import { useAuth } from '@/context/AuthContext'
import { useChildContext } from '@/context/ChildContext'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { NotificationService } from '@/supabase/services/notifications'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Animated, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import {
    Button,
    H4,
    H5,
    Image,
    ScrollView,
    Text,
    View,
    XStack,
    YStack,
    useTheme as useTamaguiTheme
} from 'tamagui'

interface NavbarProps {
    navigation: any
    title?: string
}

interface ProfileData {
    avatar_url?: string
    username?: string
    email?: string
}

interface Notification {
    id: string
    title: string
    message: string
    read: boolean
    created_at: string
}

const Navbar: React.FC<NavbarProps> = ({ navigation, title = 'Co-Parent Connect' }) => {
    const { colors } = useTheme()
    const tamaguiTheme = useTamaguiTheme()
    const { currentChild } = useChildContext()
    const { logout } = useAuth()

    const [showProfileDropdown, setShowProfileDropdown] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [profile, setProfile] = useState<ProfileData | null>(null)
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [toastNotification, setToastNotification] = useState<Notification | null>(null)
    const [sound, setSound] = useState<Audio.Sound>()

    const dropdownAnim = useRef(new Animated.Value(0)).current
    const notificationsAnim = useRef(new Animated.Value(0)).current
    const toastAnim = useRef(new Animated.Value(0)).current

    const getUserId = useCallback(async (): Promise<string | null> => {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        return user?.id || null
    }, [])

    useEffect(() => {
        let isMounted = true
        let localSound: Audio.Sound | undefined

        const loadSound = async () => {
            const { sound } = await Audio.Sound.createAsync(
                require('@/assets/sounds/notification.mp3')
            )
            if (isMounted) {
                setSound(sound)
                localSound = sound
            } else {
                sound.unloadAsync()
            }
        }

        loadSound()

        return () => {
            isMounted = false
            if (localSound) {
                localSound.unloadAsync()
            }
        }
    }, [])

    const playNotificationSound = useCallback(async () => {
        try {
            await sound?.replayAsync()
        } catch (error) {
            console.error('Error playing sound:', error)
        }
    }, [sound])

    useEffect(() => {
        if (!toastNotification) return

        Animated.timing(toastAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()

        const timer = setTimeout(() => {
            Animated.timing(toastAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setToastNotification(null))
        }, 3000)

        return () => clearTimeout(timer)
    }, [toastNotification])

    const fetchProfile = useCallback(async () => {
        const userId = await getUserId()
        if (!userId) return

        try {
            const { data, error } = await supabase
                .from('users')
                .select('avatar_url, username, email')
                .eq('id', userId)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoadingProfile(false)
        }
    }, [getUserId])

    const fetchNotifications = useCallback(async () => {
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
            console.error('Error fetching user or user not logged in:', userError)
            return
        }

        const userId = user.id

        try {
            const { data: notifs, error } = await supabase
                .from('notifications')
                .select('id, title, message, read, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) throw error

            setNotifications(notifs || [])
            setUnreadCount(notifs?.filter((n) => !n.read).length || 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }, [])

    useEffect(() => {
        fetchProfile()
        fetchNotifications()

        const channel = supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                async (payload) => {
                    const newNotification = payload.new as Notification
                    setToastNotification(newNotification)
                    await playNotificationSound()
                    await fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchProfile, fetchNotifications, playNotificationSound])

    const toggleDropdown = (type: 'profile' | 'notifications') => {
        if (type === 'profile') {
            setShowNotifications(false)
            setShowProfileDropdown((prev) => !prev)
        } else {
            setShowProfileDropdown(false)
            setShowNotifications((prev) => {
                const next = !prev
                if (next) markAllAsRead()
                return next
            })
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    const closeAllDropdowns = () => {
        setShowProfileDropdown(false)
        setShowNotifications(false)
    }

    const markAsRead = useCallback(async (id: string) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const userId = await getUserId()
        if (!userId) return

        try {
            await NotificationService.markAllAsRead(userId)
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }, [getUserId])

    const getAvatarSource = () => {
        if (currentChild?.photo) {
            return { uri: currentChild.photo }
        }
        if (profile?.avatar_url) {
            return { uri: profile.avatar_url }
        }
        return require('@/assets/images/profile.jpg')
    }

    useEffect(() => {
        Animated.timing(dropdownAnim, {
            toValue: showProfileDropdown ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }, [showProfileDropdown, dropdownAnim])

    useEffect(() => {
        Animated.timing(notificationsAnim, {
            toValue: showNotifications ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start()
    }, [showNotifications, notificationsAnim])

    const interpolateAnim = (anim: Animated.Value) => ({
        translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-10, 0],
        }),
        opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
        }),
    })

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        return `${Math.floor(diffInSeconds / 86400)} days ago`
    }

    const { translateY: toastTranslateY, opacity: toastOpacity } = interpolateAnim(toastAnim)
    const { translateY: notificationsTranslateY, opacity: notificationsOpacity } =
        interpolateAnim(notificationsAnim)

    return (
        <XStack
            ai="center"
            px="$4"
            pt={Platform.OS === 'ios' ? '$10' : '$5'}
            pb="$3"
            bc={colors.background}
            borderBottomWidth="$1"
            borderBottomColor={typeof colors.border === 'string' ? colors.border : undefined}
        >
            {/* Toast Notification */}
            {toastNotification && (
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            top: Platform.OS === 'ios' ? 100 : 70,
                            left: 20,
                            right: 20,
                            padding: 16,
                            borderRadius: 12,
                            zIndex: 1000,
                            backgroundColor: colors.notificationUnread,
                            transform: [{ translateY: toastTranslateY }],
                            opacity: toastOpacity,
                        },
                    ]}
                >
                    <Text color={colors.text} fontSize={16} fontWeight="bold" mb="$1">
                        {toastNotification.title}
                    </Text>
                    <Text color={colors.text} fontSize={14}>
                        {toastNotification.message}
                    </Text>
                </Animated.View>
            )}

            <Button unstyled>
                <Image
                    source={require('@/assets/images/icon.png')}
                    width={40}
                    height={40}
                    br="$2"
                />
            </Button>

            <H4 flex={1} ta="center" color={colors.text} fontWeight="700">
                {title}
            </H4>

            <XStack ai="center">
                <View position="relative" ml="$3">
                    <Button
                        unstyled
                        onPress={() => toggleDropdown('notifications')}
                        icon={
                            <Icon
                                name={showNotifications ? 'notifications' : 'notifications-outline'}
                                size={24}
                                color={colors.primary}
                            />
                        }
                    />
                    {unreadCount > 0 && (
                        <View
                            position="absolute"
                            top={-6}
                            right={-6}
                            width={20}
                            height={20}
                            br={10}
                            ai="center"
                            jc="center"
                            bc={colors.primary}
                        >
                            <Text color="#fff" fontSize={11} fontWeight="700">
                                {unreadCount}
                            </Text>
                        </View>
                    )}

                    {showNotifications && (
                        <Animated.View
                            style={[
                                {
                                    position: 'absolute',
                                    top: 70,
                                    right: 0,
                                    width: 340,
                                    maxHeight: 600,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    zIndex: 100,
                                    overflow: 'hidden',
                                    backgroundColor: colors.cardBackground,
                                    transform: [{ translateY: notificationsTranslateY }],
                                    opacity: notificationsOpacity,
                                },
                            ]}
                        >
                            <YStack
                                flex={1}
                                borderRadius={14}
                                ai="center"
                                jc="center"
                                px="$4"
                                gap="$1"
                                bc={colors.modalBackground}
                            >
                                <YStack
                                    borderRadius={14}
                                    width="100%"
                                    py="$5"
                                    px="$4"
                                    elevation={5}
                                    bc={colors.background}
                                >
                                    <XStack ai="center" jc="space-between" pb="$4" py="$1" borderBottomWidth="$1" borderBottomColor="#ddd">
                                        <H5 color={colors.text}>Notifications</H5>
                                        <XStack ai="center">
                                            {notifications.length > 0 && (
                                                <Button
                                                    onPress={markAllAsRead}
                                                    py="$1.5"
                                                    px="$3.5"
                                                    br="$2"
                                                    bc="white"
                                                >
                                                    <Text color={colors.primary}>Mark all as read</Text>
                                                </Button>
                                            )}
                                            <Button unstyled onPress={closeAllDropdowns}>
                                                <Ionicons name="close" size={24} color={colors.text} />
                                            </Button>
                                        </XStack>
                                    </XStack>

                                    <ScrollView>
                                        {notifications.length === 0 ? (
                                            <YStack flex={1} jc="center" ai="center" p="$6">
                                                <Ionicons
                                                    name="notifications-off-outline"
                                                    size={48}
                                                    color={colors.primary}
                                                    mb="$3"
                                                />
                                                <Text color={colors.primary}>No notifications yet</Text>
                                                <Text color={colors.primary}>
                                                    We'll notify you when something new arrives
                                                </Text>
                                            </YStack>
                                        ) : (
                                            notifications.map((item) => (
                                                <Button
                                                    key={item.id}
                                                    py="$3.5"
                                                    px="$4"
                                                    borderBottomWidth="$1"
                                                    bc={item.read ? colors.background : colors.notificationUnread}
                                                    borderColor={
                                                        typeof colors.border === 'string' ? colors.border : undefined
                                                    }
                                                    onPress={() => markAsRead(item.id)}
                                                    unstyled
                                                >
                                                    <YStack>
                                                        <Text color={colors.primary}>{item.title}</Text>
                                                        <Text color={colors.primary}>{item.message}</Text>
                                                        <Text color={colors.primary} fontSize={12} mt="$1">
                                                            {formatTime(item.created_at)}
                                                        </Text>
                                                    </YStack>
                                                </Button>
                                            ))
                                        )}
                                    </ScrollView>

                                    {notifications.length > 0 && (
                                        <Button
                                            mt="$3"
                                            als="center"
                                            py="$3"
                                            px="$6"
                                            br="$3"
                                            bc="white"
                                            onPress={() => {
                                                closeAllDropdowns()
                                                navigation.navigate('Notifications')
                                            }}
                                        >
                                            <Text color={colors.primary}>View All Notifications</Text>
                                        </Button>
                                    )}
                                </YStack>
                            </YStack>
                        </Animated.View>
                    )}
                </View>

                <Button
                    position="relative"
                    ml="$3"
                    onPress={() => toggleDropdown('profile')}
                    unstyled
                >
                    <Image
                        source={getAvatarSource()}
                        width={38}
                        height={38}
                        br={19}
                        borderWidth={1}
                        borderColor="rgba(0,0,0,0.1)"
                        defaultSource={require('@/assets/images/profile.jpg')}
                    />

                    {showProfileDropdown && (
                        <Animated.View
                            style={[
                                {
                                    position: 'absolute',
                                    top: 50,
                                    right: 0,
                                    width: 220,
                                    borderRadius: 14,
                                    borderWidth: 1,
                                    paddingVertical: 8,
                                    zIndex: 100,
                                    backgroundColor: colors.cardBackground,
                                    transform: [
                                        {
                                            translateY: dropdownAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [-10, 0],
                                            }),
                                        },
                                    ],
                                    opacity: dropdownAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 1],
                                    }),
                                    ...(typeof colors.border === 'string'
                                        ? {
                                            borderColor: colors.border,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.1,
                                            shadowRadius: 4,
                                            elevation: 3,
                                        }
                                        : {}),
                                },
                            ]}
                        >
                            {profile && (
                                <XStack
                                    ai="center"
                                    px="$4"
                                    py="$3"
                                    borderBottomWidth="$1"
                                    borderBottomColor={
                                        typeof colors.border === 'string' || typeof colors.border === 'number'
                                            ? colors.border
                                            : undefined
                                    }
                                >
                                    <Image
                                        source={getAvatarSource()}
                                        width={42}
                                        height={42}
                                        br={21}
                                        mr="$3.5"
                                        defaultSource={require('@/assets/images/profile.jpg')}
                                    />
                                    <YStack>
                                        <Text color={colors.text} fontSize={15} fontWeight="700">
                                            {profile.username}
                                        </Text>
                                        <Text color={colors.textSecondary} fontSize={13}>
                                            {profile.email}
                                        </Text>
                                    </YStack>
                                </XStack>
                            )}

                            <Button
                                fd="row"
                                ai="center"
                                py="$3"
                                px="$4"
                                onPress={() => {
                                    navigation.navigate('Settings')
                                    closeAllDropdowns()
                                }}
                                unstyled
                            >
                                <Icon name="settings" size={18} color={colors.text} />
                                <Text color={colors.text} fontSize={15} ml="$3.5">
                                    Settings
                                </Text>
                            </Button>

                            <Button
                                fd="row"
                                ai="center"
                                py="$3"
                                px="$4"
                                onPress={() => {
                                    navigation.navigate('Support')
                                    closeAllDropdowns()
                                }}
                                unstyled
                            >
                                <Icon name="help-circle" size={18} color={colors.text} />
                                <Text color={colors.text} fontSize={15} ml="$3.5">
                                    Support
                                </Text>
                            </Button>
                        </Animated.View>
                    )}
                </Button>
            </XStack>
        </XStack>
    )
}

export default Navbar