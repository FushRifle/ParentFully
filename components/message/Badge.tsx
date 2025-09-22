import { useAuth } from '@/hooks/auth/useAuth';
import { useMessageCount } from '@/hooks/chat/useMessageCount';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const MessageBadge = () => {
    const { user } = useAuth()
    const { totalUnreadCount } = useMessageCount(user?.id || '')

    if (!totalUnreadCount) return null

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
