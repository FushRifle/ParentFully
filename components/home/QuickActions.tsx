import { useAuth } from '@/context/AuthContext'
import { useMessageCount } from '@/hooks/chat/useMessageCount'
import { useTheme } from '@/styles/ThemeContext'
import * as Icons from '@tamagui/lucide-icons'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useMemo, useState } from 'react'
import { Card, Text, View, XStack, YStack } from 'tamagui'

const QuickActions = ({ handleActionPress }: { handleActionPress: (screen: string) => void }) => {
    const { colors, isDark } = useTheme()
    const { user } = useAuth()
    const { totalUnreadCount } = useMessageCount(user?.id || '')

    const [showAll, setShowAll] = useState(false)

    // actions depends on unread count (badge)
    const actions = useMemo(
        () => [
            {
                key: 'Discipline',
                label: 'Discipline Plan',
                description: 'Set and manage boundaries and rules for your family.',
                icon: 'HandHeart',
                screen: 'WelcomeDiscipline',
                light: '#00C86D',
                dark: '#331A1A',
            },
            {
                key: 'Chat',
                label: 'Chat',
                description: 'Send and receive messages instantly with your co-parent',
                icon: 'MessageCircle',
                screen: 'Messaging',
                light: '#00CAC4',
                dark: '#33281A',
                badge: totalUnreadCount,
            },
            {
                key: 'Family',
                label: 'Family Contacts',
                description: 'Invite family members, third parties and mediators.',
                icon: 'Users',
                screen: 'WelcomeFamily',
                light: '#00C86D',
                dark: '#331A1A',
            },
            {
                key: 'Routine',
                label: 'Routine',
                description: 'Create and manage daily routines to build consistency.',
                icon: 'Recycle',
                screen: 'WelcomeRoutine',
                light: '#00C86C',
                dark: '#331A1A',
            },
            {
                key: 'Budget',
                label: 'Budget',
                description: 'Track and manage your family budget.',
                icon: 'Wallet',
                screen: 'Expense',
                light: '#07D3BE',
                dark: '#331A1A',
            },
            {
                key: 'Calendar',
                label: 'Calendar',
                description: 'Plan and track important family events and schedules',
                icon: 'Calendar',
                screen: 'Calendar',
                light: '#6F44FF',
                dark: '#1A331D',
            },
            {
                key: 'SharedFiles',
                label: 'Shared Files',
                description: 'Store, access and share important family documents.',
                icon: 'FileText',
                screen: 'Documents',
                light: '#FF8C01',
                dark: '#1A2633',
            },
            {
                key: 'Task',
                label: 'Task',
                description: 'Create, assign and manage tasks for your family.',
                icon: 'ShieldCheck',
                screen: 'Tasks',
                light: '#8D40FF',
                dark: '#1A1633',
            },
            {
                key: 'Activities',
                label: 'Activities',
                description: 'View a log of action and updates across family account.',
                icon: 'ActivitySquare',
                screen: 'Activities',
                light: '#FF0D0D',
                dark: '#331A1A',
            },
            {
                key: 'Journal',
                label: 'My Journal',
                description: 'Connect, share and learn from other parents.',
                icon: 'BookText',
                screen: 'Journal',
                light: '#7FBF00',
                dark: '#331A1A',
            },
            {
                key: 'Community',
                label: 'Community',
                description: 'Connect, share and learn from other parents.',
                icon: 'Handshake',
                screen: 'Community',
                light: '#408DFF',
                dark: '#331A1A',
            },
            {
                key: 'Support',
                label: 'Support',
                description: 'Get quick help and guidance from experts when needed.',
                icon: 'Headphones',
                screen: 'Support',
                light: '#FD1ED0',
                dark: '#331A1A',
            },
        ],
        [totalUnreadCount]
    )

    const displayedActions = showAll ? actions : actions.slice(0, 6)

    const cardShadowStyle = {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    }

    const handlePress = (screen: string) => {
        handleActionPress(screen)
    }

    return (
        <YStack space="$4" marginTop="$4">
            <XStack ai="center" jc="space-between" w="100%" px="$2" py="$1">
                <YStack>
                    <Text
                        fontSize="$4"
                        fontWeight="700"
                        style={{
                            background: 'linear-gradient(to right, #9FCC16, #FF8C01)',
                            WebkitBackgroundClip: 'text',
                            color: 'green',
                        }}
                    >
                        Quick Actions
                    </Text>

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
                <Text
                    color={colors.primaryDark}
                    fontSize="$4"
                    textDecorationLine="underline"
                    onPress={() => setShowAll(!showAll)}
                >
                    {showAll ? 'View less' : 'See more'}
                </Text>
            </XStack>

            <XStack flexWrap="wrap" justifyContent="space-between" rowGap="$4">
                {displayedActions.map(({ key, label, description, icon, screen, light, dark, badge }) => {
                    const IconComponent = (Icons as any)[icon]
                    return (
                        <Card
                            key={key}
                            padding="$3"
                            width="48%"
                            maxWidth={180}
                            maxHeight={160}
                            alignItems="center"
                            justifyContent="center"
                            pressStyle={{ opacity: 0.9 }}
                            onPress={() => handlePress(screen)}
                            backgroundColor={isDark ? colors.card : '#fff'}
                            borderRadius="$8"
                            style={cardShadowStyle}
                        >
                            <YStack jc="flex-start">
                                <View
                                    width={45}
                                    height={45}
                                    borderRadius="$6"
                                    mt="$3"
                                    backgroundColor={isDark ? dark : light}
                                    alignItems="center"
                                    justifyContent="center"
                                    position="relative"
                                >
                                    {IconComponent && <IconComponent size={27} color="white" />}
                                    {typeof badge === 'number' && badge > 0 && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: -6,
                                                right: -6,
                                                backgroundColor: colors.primary,
                                                borderRadius: 10,
                                                paddingHorizontal: 5,
                                                minWidth: 16,
                                                height: 18,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                                                {badge}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text
                                    fontSize="$3"
                                    fontWeight="600"
                                    color={colors.text}
                                    marginTop="$2"
                                    textAlign="left"
                                >
                                    {label}
                                </Text>
                                <Text
                                    fontSize="$2"
                                    color={colors.textSecondary}
                                    textAlign="left"
                                    marginTop="$1"
                                    mb="$5"
                                    flexShrink={0}
                                >
                                    {description}
                                </Text>
                            </YStack>
                        </Card>
                    )
                })}

            </XStack>
        </YStack>
    )
}

export default QuickActions