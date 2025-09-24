import ConfirmModal from '@/components/settings/ConfirmModal';
import { GoalBackground } from '@/constants/GoalBackground';
import { Text } from '@/context/GlobalText';
import { handleDeleteAccount } from '@/hooks/auth/useDeleteAccount';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type {
    Child,
    FamilyMember,
    UserProfile
} from '@/types/profile';
import { Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ChevronRight, Gift, Star } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, RefreshControl, Switch, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    Adapt,
    Avatar,
    Button,
    Card,
    H4,
    H6,
    Image,
    ScrollView,
    Select,
    Sheet,
    Spinner,
    Stack,
    View,
    XStack,
    YStack
} from 'tamagui';

// Constants
const AVATAR_DEFAULT = require('@/assets/images/profile.jpg');
const GRADIENT_COLORS = ['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.05)'] as const;
const REFRESH_CONTROL_TINT = 'primary' as const;
const AVATAR_SIZE = 80;
const BgMain = require('@/assets/backgrounds/Bg-Main.png');

export type RootStackParamList = {
    Login: undefined;
    ChildEdit: { child?: ChildProfile };
    ChildProfile: { child: any };
    UserEdit: undefined;
};

type ChildProfile = {
    id: string;
    name: string;
    age: number;
    photo: string | null;
    avatar?: string | { uri: string };
    notes?: string;
    interests?: string[];
    allergies?: string[];
    developmentstage?: string;
};

interface SettingItemProps {
    icon: string;
    name: string;
    colors: any;
    textColor?: string;
    iconColor?: string;
    IconBg?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = memo(
    ({ icon, name, colors, textColor, iconColor, IconBg, rightComponent, onPress }) => (
        <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$2.5"
            onPress={onPress}
        >
            <XStack alignItems="center" space="$4">
                <View
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9999,
                        borderWidth: 1,
                        borderColor: colors.border as any,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: IconBg || "transparent",
                    }}
                >
                    <Icon
                        name={icon}
                        size={14}
                        color={iconColor || colors.primary}
                    />
                </View>
                <Text color={textColor || colors.text}>
                    {name}
                </Text>
            </XStack>
            {rightComponent}
        </XStack>
    )
);

const getInitials = (name: string) => {
    if (!name || !name.trim()) return '?';
    const names = name.trim().split(' ');
    return names.length === 1
        ? names[0].charAt(0).toUpperCase()
        : (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const UserProfileCard = memo(
    ({
        user,
        colors,
        onEditProfile,
    }: {
        user: UserProfile;
        colors: any;
        onEditProfile: () => void;
    }) => (
        <YStack
            borderRadius="$9"
            backgroundColor={colors.secondary}
            padding="$4"
            space="$4"
            ai="center"
            jc="center"
        >
            <Stack position="relative" ai="center">
                <Avatar circular size={AVATAR_SIZE}>
                    {user.avatar_url ? (
                        <Avatar.Image
                            source={
                                typeof user.avatar_url === 'string'
                                    ? { uri: user.avatar_url }
                                    : user.avatar_url
                            }
                        />
                    ) : (
                        <Avatar.Fallback
                            backgroundColor="#AAFFAA33"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Text fontWeight="700" color="white" textAlign="center">
                                {getInitials(user.name)}
                            </Text>
                        </Avatar.Fallback>
                    )}
                </Avatar>

                <Button
                    position="absolute"
                    bottom={0}
                    right={0}
                    circular
                    size="$2.5"
                    backgroundColor="$primary"
                    icon={<MaterialCommunityIcons name="pen" size={14} color="white" />}
                    onPress={onEditProfile}
                    pressStyle={{ opacity: 0.9 }}
                />
            </Stack>

            <YStack ai="center" space="$1">
                <Text color="white" fontWeight="700">
                    {user.name}
                </Text>
                <Text color="white" fontWeight="500">
                    @{user.username}
                </Text>
            </YStack>

            <Button
                backgroundColor="#AAFFAA33"
                color="$background"
                icon={<MaterialIcons name="edit" size={12} color="white" />}
                onPress={onEditProfile}
            >
                Edit Profile
            </Button>
        </YStack>
    )
);

export function UserProfileScreen() {
    // Hooks
    const { colors, toggleTheme, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

    // State
    const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [coParents, setCoParents] = useState<FamilyMember[]>([]);
    const [childrenDropdownOpen, setChildrenDropdownOpen] = useState(false);
    const [openChildId, setOpenChildId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const selectedChild = children.find((c) => c.id === selectedChildId);
    const [isChildrenDropdownOpen, setIsChildrenDropdownOpen] = useState(false);
    const [isFamilyDropdownOpen, setIsFamilyDropdownOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        type: '',
    });

    const toggleChildrenDropdown = () => setIsChildrenDropdownOpen(!isChildrenDropdownOpen);
    const toggleChildDropdown = (childId: string) => {
        setOpenChildId(prev => (prev === childId ? null : childId));
    };

    const fetchUserData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
            if (authError || !authUser) throw authError || new Error('No authenticated user');

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (userError || !userData) throw userError || new Error('User not found');

            const formattedUser: UserProfile = {
                id: userData.id,
                name: authUser.user_metadata?.display_name || userData.full_name || 'User',
                email: userData.email,
                username: userData.username || userData.email.split('@')[0],
                role: userData.role || '',
                avatar_url: userData.avatar_url ? { uri: userData.avatar_url } : AVATAR_DEFAULT,
                notificationsEnabled: userData.notifications_enabled ?? true,
                darkMode: userData.dark_mode ?? false,
                family_id: userData.family_id || undefined
            };

            setUser(formattedUser);
            await Promise.all([
                fetchFamilyRelationships(userData.id),
                fetchChildren(userData.id)
            ]);
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFamilyRelationships = useCallback(async (userId: string) => {
        try {
            setLoading(true);

            const { data: invite, error: inviteError } = await supabase
                .from('invites')
                .select('family_id')
                .or(`inviter_id.eq.${userId},accepted.eq.true`)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (inviteError || !invite?.family_id) {
                throw new Error('No family found for this user.');
            }

            const familyId = invite.family_id;

            const { data: users, error: usersError } = await supabase
                .from('users')
                .select('id, full_name, email, avatar_url')
                .eq('family_id', familyId)
                .neq('id', userId);

            if (usersError) throw usersError;

            const relationshipsWithUsers: FamilyMember[] = (users || []).map(user => ({
                id: user.id,
                name: user.full_name || 'Family Member',
                email: user.email || '',
                relationship: 'Family Member',
                avatar: user.avatar_url ? { uri: user.avatar_url } : AVATAR_DEFAULT
            }));

            setCoParents(relationshipsWithUsers);
        } catch (error) {
            console.error('Error fetching family members:', error);
            setError('Failed to load family members');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchChildren = useCallback(async (userId: string) => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('children')
                .select('id, name, age, photo, parent_id, developmentstage')
                .eq('user_id', userId);

            if (error) throw error;

            const formattedChildren: Child[] = (data || []).map((child) => ({
                id: child.id,
                name: child.name,
                dob: child.age || undefined,
                avatar: child.photo ? { uri: child.photo } : undefined,
                parent_id: child.parent_id,
                developmentstage: child.developmentstage
            }));

            setChildren(formattedChildren);
        } catch (error) {
            console.error('Failed to fetch children:', error);
            setError('Failed to load children data');
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (user?.id) {
                await Promise.all([
                    fetchUserData(),
                    fetchChildren(user.id)
                ]);
            } else {
                await fetchUserData();
            }
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchUserData, fetchChildren, user?.id]);

    const handleToggleTheme = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    const handleLanguageChange = async (lang: string) => {
        setSelectedLanguage(lang);
        await i18n.changeLanguage(lang);
    };

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            router.replace('/(auth)/login');
        } catch (error) {
            console.error('Logout failed:', error);
            Alert.alert(t('logout_error'), t('logout_failed'));
        }
    };

    const handleDeleteAccountConfirm = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await handleDeleteAccount(user.id);
        }
        setConfirmModal({ visible: false, type: '' });
    };

    const handleEditProfile = useCallback(() => {
        navigation.navigate("UserEdit" as never);
    }, [navigation]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchUserData();
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [fetchUserData]);

    const renderChildrenSection = useCallback(() => {
        return (
            <YStack space="$4" marginTop="$2">
                {children.length === 0 ? (
                    <XStack
                        borderRadius="$4"
                        padding="$4"
                        alignItems="center"
                        space="$2"
                        backgroundColor={colors.background}
                        borderWidth={1}
                        borderColor={colors.primaryLight}
                    >
                        <Text color={colors.primary}>No children added yet.</Text>
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: colors.primary,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 9999,
                            }}
                        >
                            <Feather name="plus" size={16} color={colors.onPrimary} />
                        </Pressable>
                    </XStack>
                ) : (
                    <>
                        <YStack
                            backgroundColor={colors.background}
                            borderRadius="$4"
                            borderWidth={1}
                            borderColor={colors.primaryLight}
                            overflow="hidden"
                        >
                            <Pressable
                                onPress={() => toggleChildrenDropdown()}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: 12,
                                    backgroundColor: isChildrenDropdownOpen ? colors.secondary : colors.secondary,
                                }}
                            >
                                <Text fontWeight="bold" color={colors.onPrimary}>
                                    My Children ({children.length})
                                </Text>
                                <Ionicons
                                    name={isChildrenDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                    size={20}
                                    color={isChildrenDropdownOpen ? colors.onPrimary : colors.onPrimary}
                                />
                            </Pressable>

                            {isChildrenDropdownOpen && (
                                <YStack space="$2" padding="$2">
                                    {children.map((child) => (
                                        <TouchableOpacity
                                            key={child.id}
                                            activeOpacity={0.7}
                                            onPress={() => {
                                                navigation.navigate('ChildProfile', { child });
                                            }}
                                        >
                                            <XStack
                                                padding="$3"
                                                alignItems="center"
                                                space="$3"
                                                backgroundColor={colors.card}
                                                borderBottomWidth={1}
                                                borderBottomColor={colors.secondary as any}
                                                borderRadius={8}
                                            >
                                                <Avatar circular size="$4.5">
                                                    <Avatar.Image source={child.avatar || AVATAR_DEFAULT} />
                                                    <Avatar.Fallback backgroundColor={colors.primary}>
                                                        <Text color="white" fontWeight="700">
                                                            {child.name?.[0] ?? "?"}
                                                        </Text>
                                                    </Avatar.Fallback>
                                                </Avatar>

                                                <H6 fontSize={14} color={colors.text} flex={1} fontWeight='600'>
                                                    {child.name}
                                                </H6>
                                                <Text>
                                                    Age: {child.age ?? 'N/A'}
                                                </Text>
                                                <XStack flex={1} jc="flex-end" ai="center">
                                                    <ChevronRight color={colors.textSecondary} />
                                                </XStack>
                                            </XStack>
                                        </TouchableOpacity>
                                    ))}
                                </YStack>
                            )}
                        </YStack>
                    </>
                )}
            </YStack>
        );
    }, [children, colors, isChildrenDropdownOpen, navigation]);

    const renderFamilySection = useCallback(() => {
        return (
            <>
                <YStack
                    backgroundColor={colors.background}
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor={colors.primaryLight}
                    overflow="hidden"
                >
                    <Pressable
                        onPress={() => setIsFamilyDropdownOpen(!isFamilyDropdownOpen)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 12,
                            backgroundColor: isFamilyDropdownOpen ? colors.secondary : colors.secondary,
                        }}
                    >
                        <Text fontWeight="bold" color={colors.onPrimary}>
                            My Co-parents ({coParents.length})
                        </Text>
                        <Ionicons
                            name={isFamilyDropdownOpen ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color={isFamilyDropdownOpen ? colors.onPrimary : colors.onPrimary}
                        />
                    </Pressable>

                    {isFamilyDropdownOpen && (
                        <YStack space="$2" padding="$2">
                            {coParents.length > 0 ? (
                                coParents.map(parent => (
                                    <TouchableOpacity
                                        key={parent.id}
                                        activeOpacity={0.7}
                                        onPress={() => { }}
                                    >
                                        <XStack
                                            padding="$3"
                                            alignItems="center"
                                            space="$3"
                                            backgroundColor="#F5F8FA"
                                        >
                                            <Image
                                                source={parent.avatar || AVATAR_DEFAULT}
                                                width={48}
                                                height={48}
                                                borderRadius={18}
                                                borderColor={colors.primaryLight}
                                                borderWidth={1}
                                            />
                                            <YStack flex={1} space='$1'>
                                                <Text color={colors.text} flex={1}>
                                                    {parent.name}
                                                </Text>
                                                <Text color={colors.text}>
                                                    Co-Parent
                                                </Text>
                                            </YStack>

                                            <XStack flex={0} jc="flex-end" ai="center">
                                                <ChevronRight size={20} color={colors.text as any} />
                                            </XStack>
                                        </XStack>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <YStack
                                    padding="$4"
                                    alignItems="center"
                                    justifyContent="center"
                                    minHeight={80}
                                >
                                    <Text color={colors.primary}>
                                        No co-parents added yet
                                    </Text>
                                </YStack>
                            )}
                        </YStack>
                    )}
                </YStack>
            </>
        );
    }, [coParents, colors, isFamilyDropdownOpen]);

    if (loading && !user) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Spinner size="large" />
                <Text marginTop="$2">Loading profile...</Text>
            </YStack>
        );
    }

    if (!user) {
        return (
            <YStack flex={1} justifyContent="center" alignItems="center">
                <Text>Failed to load profile</Text>
                {error && <Text color="$red10">{error}</Text>}
                <Button onPress={fetchUserData} marginTop="$2">
                    Retry
                </Button>
            </YStack>
        );
    }

    return (
        <GoalBackground>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors[REFRESH_CONTROL_TINT]}
                    />
                }
                contentContainerStyle={{
                    paddingBottom: insets.bottom + 10,
                }}
            >
                <YStack space="$5" paddingHorizontal="$3" mt='$7'>
                    <XStack justifyContent="flex-start" mt="$4" space='$4'>
                        <Button
                            unstyled
                            onPress={() => navigation.goBack()}
                            icon={<Feather name="chevron-left" size={23} color={colors.text} />}
                            pressStyle={{ opacity: 0.8 }}
                        />
                        <H4 fontWeight="700" color={colors.text}>Profile</H4>
                    </XStack>

                    <GoalBackground>
                        <UserProfileCard
                            user={user}
                            colors={colors}
                            onEditProfile={handleEditProfile}
                        />
                    </GoalBackground>

                    <YStack space="$3" marginTop="$1" marginBottom="$2">
                        <TouchableOpacity onPress={() => navigation.navigate('GiftRefer' as never)}>
                            <Card padding="$3" borderRadius="$6"
                                backgroundColor={colors.card}
                            >
                                <YStack space='$3'>
                                    <Gift color='#DC0D28' />
                                </YStack>

                                <XStack jc='space-between' mt='$4' mb='$2'>
                                    <Text color={colors.text}>
                                        Refer Friends
                                    </Text>
                                    <ChevronRight />
                                </XStack>
                                <Text>
                                    Earn rewards by inviting friends to join
                                </Text>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('Premium' as never)}>
                            <Card padding="$3" borderRadius="$6" backgroundColor={colors.card}>
                                <YStack space="$3">
                                    <Star color="#F4B400" />
                                </YStack>

                                <XStack jc="space-between" mt="$4" mb="$2">
                                    <Text color={colors.text}>
                                        Premium Subscription
                                    </Text>
                                    <ChevronRight />
                                </XStack>

                                <Text color={colors.text}>
                                    Unlock exclusive features and benefits
                                </Text>
                            </Card>
                        </TouchableOpacity>
                    </YStack>

                    <YStack space="$3" px='$2' mt='$2'>
                        <XStack jc="space-between" ai="center">
                            <H6 fontWeight="600" color={colors.text}>Children</H6>
                            <Pressable
                                onPress={() => { }}
                                style={{

                                    borderRadius: 20,
                                    backgroundColor: colors.primary,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Feather name="plus" size={19} color={colors.onPrimary} />
                            </Pressable>
                        </XStack>

                        {renderChildrenSection()}
                    </YStack>

                    <YStack space="$3" px='$2'>
                        <XStack jc="space-between" ai="center">
                            <H6 fontWeight="600" color={colors.text}>Co-Parents</H6>
                            <Pressable
                                onPress={() => { }}
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: colors.primary,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Feather name="plus" size={19} color={colors.onPrimary} />
                            </Pressable>
                        </XStack>
                        {renderFamilySection()}
                    </YStack>

                    <YStack px='$2' mt="$2" space='$2'>
                        <H6 fontWeight="600" color={colors.text}>Account Settings</H6>
                        <Card padding="$3" borderRadius="$4" backgroundColor={colors.card} space='$2'>
                            <SettingItem
                                icon="mail-outline"
                                name={t('update_email')}
                                colors={colors}
                                textColor="black"
                                iconColor="#ff4444"
                                IconBg='#FFECEC'
                                rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />}
                            />
                            <SettingItem
                                icon="lock-closed-outline"
                                name={t('Change Password')}
                                colors={colors}
                                textColor="black"
                                iconColor="green"
                                IconBg='white'
                                rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />}
                            />

                            <SettingItem
                                icon="language-outline"
                                name={t('language')}
                                colors={colors}
                                textColor="black"
                                iconColor="blue"
                                IconBg='#FFECEC'
                                rightComponent={
                                    <Select
                                        value={selectedLanguage}
                                        onValueChange={handleLanguageChange}
                                    >
                                        <Select.Trigger width={120} borderWidth={1} backgroundColor="transparent">
                                            <Select.Value color={colors.primary} />
                                        </Select.Trigger>
                                        <Adapt when="sm">
                                            <Sheet modal dismissOnSnapToBottom>
                                                <Sheet.Frame>
                                                    <Adapt.Contents />
                                                </Sheet.Frame>
                                            </Sheet>
                                        </Adapt>
                                        <Select.Content>
                                            <Select.Viewport>
                                                <Select.Item index={0} value="en">
                                                    <Select.ItemText>English</Select.ItemText>
                                                </Select.Item>
                                                <Select.Item index={1} value="es">
                                                    <Select.ItemText>Yoruba</Select.ItemText>
                                                </Select.Item>
                                                <Select.Item index={2} value="fr">
                                                    <Select.ItemText>Français</Select.ItemText>
                                                </Select.Item>
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select>
                                }
                            />

                            <SettingItem
                                icon="notifications-outline"
                                name={t('notifications')}
                                colors={colors}
                                textColor="black"
                                iconColor="#ff4444"
                                IconBg='#FFECEC'
                                rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />}
                            />
                            <SettingItem
                                icon="moon-outline"
                                name={t('dark_mode')}
                                colors={colors}
                                textColor="black"
                                iconColor="black"
                                IconBg='#FFECEC'
                                rightComponent={
                                    <Switch
                                        value={isDark}
                                        onValueChange={handleToggleTheme}
                                        thumbColor={colors.primary}
                                        trackColor={{ false: '#767577', true: colors.primaryLight }}
                                    />
                                }
                            />
                            <SettingItem
                                icon="walk-outline"
                                name={t('logout')}
                                colors={colors}
                                textColor="#ff4444"
                                iconColor="#ff4444"
                                onPress={handleLogout}
                            />
                        </Card>
                    </YStack>

                    <YStack space="$3" px='$2'>
                        <H6 fontWeight="600" color={colors.text}>Support and Legal</H6>
                        <Card padding="$3" borderRadius="$4" backgroundColor={colors.card} space='$2'>
                            <SettingItem icon="help-circle-outline" name={t('help_center')}
                                colors={colors}
                                textColor="black"
                                iconColor="blue"
                                IconBg='#FFECEC'
                                rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />}
                            />
                            <SettingItem icon="shield-checkmark-outline" name={t('privacy_policy')}
                                colors={colors}
                                textColor="black"
                                iconColor="blue"
                                IconBg='#FFECEC'
                                rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />} />
                            <SettingItem icon="document-text-outline" name={t('terms_of_service')}
                                colors={colors}
                                textColor="black"
                                iconColor="blue"
                                IconBg='#FFECEC'
                                rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />} />
                            <SettingItem
                                icon="information-circle-outline"
                                name={t('about_app')}
                                colors={colors}
                                textColor="black"
                                iconColor="blue"
                                IconBg='#FFECEC'
                                rightComponent={<Text color={colors.textSecondary}>v1.0.0</Text>}
                            />
                        </Card>
                    </YStack>

                    <YStack space="$3" marginTop="$1" marginBottom="$15">
                        <Card padding="$3" borderRadius="$4"
                            backgroundColor={colors.card}
                            borderColor={colors.error}
                            borderWidth={1}
                        >
                            <YStack space='$3'>
                                <H6 fontWeight="600" color={colors.text}>Danger Zone</H6>
                                <Text color={colors.textSecondary}>
                                    Permanently delete your account. This action cannot be undone. All your data will be permanently deleted.
                                </Text>
                            </YStack>

                            <XStack jc='flex-end' mt='$4' mb='$2'>
                                <Button
                                    size="$4"
                                    br='$6'
                                    color="white"
                                    backgroundColor="red"
                                    onPress={() => setConfirmModal({ visible: true, type: 'deleteAccount' })}
                                    pressStyle={{ backgroundColor: '$red2' }}
                                >
                                    Delete Account
                                </Button>
                            </XStack>
                        </Card>
                    </YStack>
                </YStack>

                <ConfirmModal
                    visible={confirmModal.visible}
                    onClose={() => setConfirmModal({ visible: false, type: '' })}
                    onConfirm={handleDeleteAccountConfirm}
                    title={t('delete_account_confirm_title')}
                    message={t('delete_account_confirm_message')}
                    confirmText={t('delete')}
                    cancelText={t('cancel')}
                />
            </ScrollView>
        </GoalBackground>
    );
}