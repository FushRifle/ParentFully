import { supabase } from '@/supabase/client';

interface Notification {
    user_id: string;
    title: string;
    message: string;
    type?: string;
}

export const NotificationService = {
    async getNotifications(userId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data || [];
    },

    async markAsRead(notificationId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) {
            console.error('Error marking notification as read:', error);
        }
    },

    async markAllAsRead(userId: string): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
        }
    },

    async createNotification(notification: Notification): Promise<void> {
        const { error } = await supabase
            .from('notifications')
            .insert(notification);

        if (error) {
            console.error('Error creating notification:', error);
        }
    },

    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
        return count || 0;
    }
};