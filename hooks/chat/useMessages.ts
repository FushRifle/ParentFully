import { supabase } from '@/supabase/client'
import { useCallback, useEffect, useState } from 'react'

type BaseMessage = {
    id: string
    sender_id: string
    content: string
    created_at: string
    read?: boolean
}

type DirectMessage = BaseMessage & {
    receiver_id: string
    child_id?: never
}

type GroupMessage = BaseMessage & {
    child_id: string
    receiver_id?: never
}

type Message = DirectMessage | GroupMessage

type UseMessagesProps = {
    chatId: string
    isGroup: boolean
    userId: string
}

type UseMessagesReturn = {
    messages: Message[]
    loading: boolean
    error: Error | null
    sendMessage: (content: string) => Promise<void>
    markMessagesAsRead: () => Promise<void>
}

export function useMessages({ chatId, isGroup, userId }: UseMessagesProps): UseMessagesReturn {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Fetch initial messages
    useEffect(() => {
        if (!chatId || !userId) return

        const fetchMessages = async () => {
            setLoading(true)
            setError(null)

            try {
                const query = isGroup
                    ? supabase
                        .from('group_messages')
                        .select('*')
                        .eq('child_id', chatId)
                        .order('created_at', { ascending: true })
                    : supabase
                        .from('direct_messages')
                        .select('*')
                        .or(`and(sender_id.eq.${chatId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${chatId})`)
                        .order('created_at', { ascending: true })

                const { data, error: fetchError } = await query

                if (fetchError) throw fetchError
                setMessages(data || [])
            } catch (err) {
                console.error('Error fetching messages:', err)
                setError(err as Error)
            } finally {
                setLoading(false)
            }
        }

        fetchMessages()
    }, [chatId, isGroup, userId])

    // Set up real-time subscriptions
    useEffect(() => {
        if (!chatId) return

        const channel = supabase
            .channel(`messages:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: isGroup ? 'group_messages' : 'direct_messages',
                    filter: isGroup
                        ? `child_id=eq.${chatId}`
                        : `or(receiver_id=eq.${chatId},sender_id=eq.${chatId})`
                },
                (payload) => {
                    const newMessage = payload.new as Message

                    // Don't add if already exists (prevent duplicates)
                    if (!messages.some(m => m.id === newMessage.id)) {
                        setMessages(prev => [...prev, newMessage])

                        // Auto-mark as read if it's a message received by current user
                        if (newMessage.sender_id !== userId && !isGroup) {
                            markMessagesAsRead()
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatId, isGroup, userId, messages])

    const markMessagesAsRead = useCallback(async () => {
        if (isGroup || !chatId || !userId) return

        try {
            // Get unread messages sent to current user
            const { data: unreadMessages, error: fetchError } = await supabase
                .from('direct_messages')
                .select('id')
                .eq('sender_id', chatId)
                .eq('receiver_id', userId)
                .eq('read', false)

            if (fetchError) throw fetchError

            if (unreadMessages && unreadMessages.length > 0) {
                // Update all unread messages
                const { error: updateError } = await supabase
                    .from('direct_messages')
                    .update({ read: true })
                    .in('id', unreadMessages.map(m => m.id))

                if (updateError) throw updateError

                // Optimistically update local state
                setMessages(prev =>
                    prev.map(msg =>
                        msg.sender_id === chatId && msg.receiver_id === userId && !msg.read
                            ? { ...msg, read: true }
                            : msg
                    )
                )
            }
        } catch (err) {
            console.error('Error marking messages as read:', err)
        }
    }, [chatId, isGroup, userId])

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || !chatId || !userId) return

        const newMessage: Omit<Message, 'id'> = {
            sender_id: userId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            read: isGroup, // Group messages are always "read"
            ...(isGroup ? { child_id: chatId } : { receiver_id: chatId }),
        }

        try {
            const table = isGroup ? 'group_messages' : 'direct_messages'

            // Optimistically add to UI with temporary ID
            const tempId = `temp-${Date.now()}`
            setMessages(prev => [...prev, { ...newMessage, id: tempId } as Message])

            const { data, error } = await supabase
                .from(table)
                .insert(newMessage)
                .select()
                .single()

            if (error) throw error

            // Replace temp message with actual message from DB
            setMessages(prev =>
                prev.map(msg => (msg.id === tempId ? data : msg))
            )

            return data
        } catch (err) {
            console.error('Failed to send message:', err)
            // Remove the optimistic update if failed
            setMessages(prev => prev.filter(msg => msg.id !== `temp-${Date.now()}`))
            throw err
        }
    }, [chatId, isGroup, userId])

    return {
        messages,
        loading,
        error,
        sendMessage,
        markMessagesAsRead
    }
}