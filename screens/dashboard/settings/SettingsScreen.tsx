import ConfirmModal from '@/components/settings/ConfirmModal';
import { handleDeleteAccount } from '@/hooks/auth/useDeleteAccount';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
    Adapt,
    Button,
    Card,
    ScrollView,
    Select,
    Sheet,
    Text,
    XStack
} from 'tamagui';

type RootStackParamList = { login: undefined };

const SettingsScreen = () => {
    const { t, i18n } = useTranslation();
    const { colors, toggleTheme, isDark } = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
    const [confirmModal, setConfirmModal] = useState({
        visible: false,
        type: '',
    });

    const handleToggleTheme = useCallback(() => {
        toggleTheme();
    }, [toggleTheme]);

    const handleLanguageChange = async (lang: string) => {
        setSelectedLanguage(lang);
        await i18n.changeLanguage(lang);
    };

    const handleToggleNotifications = useCallback(async (value: boolean) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('user_settings')
                .upsert({ user_id: user.id, notifications_enabled: value }, { onConflict: 'user_id' });

            if (error) throw error;

            Alert.alert(t('notifications'), value ? t('enabled') : t('disabled'));
        } catch (error) {
            console.error('Error updating notification settings:', error);
            Alert.alert(t('error'), t('notification_update_failed'));
        }
    }, [t]);


    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // Navigate to the auth layout and reset history
            router.replace('/(auth)/login'); // replace so the user can't go back
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

    return (
        <ScrollView
            flex={1}
            backgroundColor={colors.background}
            padding="$4"
            showsVerticalScrollIndicator={false}
        >
            <XStack marginBottom="$4" marginTop={Platform.OS === 'ios' ? '$6' : '$5'} alignItems="center">
                <Button
                    unstyled
                    onPress={() => navigation.goBack()}
                    flexDirection="row"
                    alignItems="center"
                    hoverStyle={{ opacity: 0.8 }}
                >
                    <Icon name="chevron-back" size={24} color={colors.primary} />
                    <Text marginLeft="$2" fontSize="$4" color={colors.primary}>{t('back')}</Text>
                </Button>
            </XStack>

            {/* App Preferences */}
            <Card padding="$4" marginBottom="$4" borderRadius="$4" backgroundColor={colors.surface}>
                <Text fontSize="$6" fontWeight="600" marginBottom="$3" color={colors.text}>
                    {t('app_preferences')}
                </Text>

                <SettingItem
                    icon="moon-outline"
                    name={t('dark_mode')}
                    colors={colors}
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
                    icon="language-outline"
                    name={t('language')}
                    colors={colors}
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
                    rightComponent={
                        <Switch
                            value={true}
                            onValueChange={handleToggleNotifications}
                            thumbColor={colors.primary}
                            trackColor={{ false: '#767577', true: colors.primaryLight }}
                        />
                    }
                />
            </Card>

            {/* Account */}
            <Card padding="$4" marginBottom="$4" borderRadius="$4" backgroundColor={colors.surface}>
                <Text fontSize="$6" fontWeight="600" marginBottom="$3" color={colors.text}>
                    {t('account')}
                </Text>
                <SettingItem
                    icon="mail-outline"
                    name={t('update_email')}
                    colors={colors}
                    rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />}
                />
                <SettingItem
                    icon="lock-closed-outline"
                    name={t('Change Password')}
                    colors={colors}
                    rightComponent={<Icon name="chevron-forward" size={20} color={colors.textSecondary} />}
                />
                <SettingItem
                    icon="trash-outline"
                    name={t('Delete Account')}
                    colors={colors}
                    textColor="#ff4444"
                    iconColor="#ff4444"
                    onPress={() => setConfirmModal({ visible: true, type: 'deleteAccount' })}
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

            {/* Support */}
            <Card padding="$4" marginBottom="$4" borderRadius="$4" backgroundColor={colors.surface}>
                <Text fontSize="$6" fontWeight="600" marginBottom="$3" color={colors.text}>
                    {t('support_and_about')}
                </Text>
                <SettingItem icon="help-circle-outline" name={t('help_center')} colors={colors} />
                <SettingItem icon="shield-checkmark-outline" name={t('privacy_policy')} colors={colors} />
                <SettingItem icon="document-text-outline" name={t('terms_of_service')} colors={colors} />
                <SettingItem
                    icon="information-circle-outline"
                    name={t('about_app')}
                    colors={colors}
                    rightComponent={<Text fontSize="$3" color={colors.textSecondary}>v1.0.0</Text>}
                />
            </Card>

            <Text textAlign="center" fontSize="$2" color={colors.textSecondary}>© 2025 Parentfully</Text>

            {/* Confirm Modal */}
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
    );
};

interface SettingItemProps {
    icon: string;
    name: string;
    colors: any;
    textColor?: string;
    iconColor?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
}

const SettingItem: React.FC<SettingItemProps> = React.memo(
    ({ icon, name, colors, textColor, iconColor, rightComponent, onPress }) => (
        <XStack
            justifyContent="space-between"
            alignItems="center"
            paddingVertical="$2.5"
            onPress={onPress}
            pressStyle={onPress ? { opacity: 0.8 } : {}}
        >
            <XStack alignItems="center" space="$2">
                <Icon name={icon} size={20} color={iconColor || colors.primary} />
                <Text fontSize="$4" color={textColor || colors.text}>{name}</Text>
            </XStack>
            {rightComponent}
        </XStack>
    )
);

export default SettingsScreen;