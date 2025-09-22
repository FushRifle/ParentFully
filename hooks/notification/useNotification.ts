import { supabase } from '@/supabase/client'
import type { Notification } from '@/types/notification'
import { useCallback, useEffect, useState } from 'react'

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            setUser(user)
        }
        fetchUser()
    }, [])

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) console.error(error)
        else setNotifications(data ?? [])
        setLoading(false)
    }, [user])

    // Mark all as seen
    const markAllAsSeen = useCallback(async () => {
        if (!user) return
        const { error } = await supabase
            .from('notifications')
            .update({ seen: true })
            .eq('user_id', user.id)
            .eq('is_reed', true)

        if (error) console.error(error)
        else fetchNotifications()
    }, [user, fetchNotifications])

    const markAsSeen = async (notificationId: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ seen: true })
                .eq('id', notificationId)

            if (error) throw error

            // Optimistic update
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, seen: true } : n
                )
            )
        } catch (error) {
            console.error('Error marking notification as seen:', error)
        }
    }

    // Subscribe to realtime inserts/updates
    useEffect(() => {
        if (!user) return

        fetchNotifications()

        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, fetchNotifications])

    // Filtered views
    const unseen = notifications.filter((n) => !n.seen)
    const seen = notifications.filter((n) => n.seen)

    return {
        notifications,
        unseen,
        seen,
        loading,
        markAllAsSeen,
        markAsSeen,
        refresh: fetchNotifications,
    }
}
