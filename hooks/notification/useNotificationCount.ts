import { supabase } from '@/supabase/client'
import { useEffect, useState } from 'react'
import type { AppStateStatus } from 'react-native'
import { AppState } from 'react-native'

type Notification = {
    id: string
    user_id: string
    title: string
    message: string
    is_read: boolean
    created_at: string
    type: string
    metadata?: Record<string, unknown>
}

export function useNotificationCount() {
    const [notificationCount, setNotificationCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        setLoading(true)
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()

            if (userError || !user?.id) {
                setLoading(false)
                return
            }

            const { data, count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .eq('seen', false)
                .order('created_at', { ascending: false })

            if (error) throw error

            setNotifications(data || [])
            setNotificationCount(count ?? 0)
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationIds: string[]) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .in('id', notificationIds)

            if (error) throw error

            // Optimistic update
            setNotifications(prev =>
                prev.map(n =>
                    notificationIds.includes(n.id) ? { ...n, read: true } : n
                )
            )
            setNotificationCount(prev => Math.max(0, prev - notificationIds.length))
        } catch (error) {
            console.error('Error marking notifications as read:', error)
        }
    }

    useEffect(() => {
        let mounted = true
        let userId: string | null = null

        const init = async () => {
            const { data: { user }, error } = await supabase.auth.getUser()
            if (error || !user?.id) return
            userId = user.id

            await fetchNotifications()

            // Subscribe to notifications
            const channel = supabase
                .channel('notifications')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                    },
                    (payload) => {
                        const newNotification = payload.new as Notification
                        if (newNotification.user_id === userId && !newNotification.is_read) {
                            setNotifications(prev => [newNotification, ...prev])
                            setNotificationCount(prev => prev + 1)
                        }
                    }
                )
                .subscribe()

            const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
                if (state === 'active') {
                    fetchNotifications()
                }
            })

            return () => {
                supabase.removeChannel(channel)
                subscription.remove()
            }
        }

        init()

        return () => {
            mounted = false
        }
    }, [])

    return {
        count: notificationCount,
        notifications,
        loading,
        refresh: fetchNotifications,
        markAsRead,
    }
}