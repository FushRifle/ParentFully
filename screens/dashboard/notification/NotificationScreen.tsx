import NotificationModal from '@/components/notifications/NotificationModal';
import { useNotifications } from '@/hooks/notification/useNotification';
import { useTheme } from '@/styles/ThemeContext';
import type { Notification } from '@/types/notification';
import { Feather } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import {
    Button,
    Card,
    Paragraph,
    Spinner,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui';

type Props = NativeStackScreenProps<any, any>;

export default function NotificationScreen({ navigation }: Props) {
    const {
        notifications,
        unseen,
        loading,
        refresh,
        markAllAsSeen,
        markAsSeen,
    } = useNotifications();

    const { colors } = useTheme();
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

    // Memoized notification data
    const notificationData = useMemo(() => notifications, [notifications]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    }, [refresh]);

    const markAllAsRead = useCallback(async () => {
        setIsLoading(true);
        await Haptics.impactAsync(ImpactFeedbackStyle.Medium);
        await markAllAsSeen();
        setIsLoading(false);
    }, [markAllAsSeen]);

    const handleNotificationPress = useCallback(async (notification: Notification) => {
        if (!notification.seen) {
            await markAsSeen(notification.id);
        }
        await Haptics.impactAsync(ImpactFeedbackStyle.Light);
        setSelectedNotification(notification);
        setModalVisible(true);
    }, [markAsSeen]);

    // Optimized renderItem with React.memo
    const NotificationItem = React.memo(({ item }: { item: Notification }) => (
        <Card
            padded
            bordered
            backgroundColor={item.seen ? '$background' : '$blue1Light'}
            borderColor={item.seen ? '$borderColor' : '$blue8'}
            onPress={() => handleNotificationPress(item)}
            mb="$3"
            pressStyle={{ opacity: 0.8 }}
        >
            <XStack justifyContent="space-between" alignItems="center">
                <Text fontWeight="600" color={colors.primary}>{item.type}</Text>
                {!item.seen && (
                    <View style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                    }} />
                )}
            </XStack>
            <Text color={colors.primary} fontSize="$2" mt="$1">
                {item.message}
            </Text>
            <Text fontSize="$1" color="$gray10" mt="$1">
                {new Date(item.created_at).toLocaleString()}
            </Text>
        </Card>
    ));

    const renderItem = useCallback(({ item }: { item: Notification }) => (
        <NotificationItem item={item} />
    ), []);

    const renderEmptyComponent = useCallback(() => (
        <YStack alignItems="center" marginTop="$8">
            <Paragraph color="$gray11">No notifications found.</Paragraph>
        </YStack>
    ), []);

    const renderLoadingIndicator = useCallback(() => (
        <YStack flex={1} justifyContent="center" alignItems="center">
            <Spinner size="large" color="$color" />
        </YStack>
    ), []);

    return (
        <YStack flex={1} p="$4" backgroundColor="$background">
            {/* Header - optimized with memoized components */}
            <XStack jc="space-between" ai="center" mt="$2" mb="$3" px="$2">
                <Button
                    unstyled
                    circular
                    pressStyle={{ opacity: 0.6 }}
                    onPress={navigation.goBack}
                    icon={<Feather name="chevron-left" size={24} color={colors.primary} />}
                />

                <Text fontWeight="700" fontSize="$5" ta="center" flex={1} mx="$2">
                    Notifications
                </Text>

                <Button
                    size="$2"
                    bg={colors.primary}
                    color="white"
                    disabled={unseen.length === 0 || isLoading}
                    onPress={markAllAsRead}
                    opacity={unseen.length === 0 ? 0.5 : 1}
                    hoverStyle={{ bg: '$primaryDark' }}
                    pressStyle={{ scale: 0.95 }}
                >
                    {isLoading ? <Spinner color="black" /> : 'Mark all'}
                </Button>
            </XStack>

            {/* Optimized FlatList */}
            {loading && notifications.length === 0 ? (
                renderLoadingIndicator()
            ) : (
                <FlatList
                    data={notificationData}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={10}
                    updateCellsBatchingPeriod={50}
                    removeClippedSubviews={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmptyComponent}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: 20,
                        paddingTop: 10
                    }}
                />
            )}

            {/* Modal - only render when needed */}
            {selectedNotification && (
                <NotificationModal
                    visible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                        setSelectedNotification(null);
                    }}
                    notification={selectedNotification}
                />
            )}
        </YStack>
    );
}