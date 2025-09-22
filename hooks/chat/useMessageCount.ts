import { Chat, useChats } from '@/hooks/chat/useChats'
import { useMessages } from '@/hooks/chat/useMessages'
import { supabase } from '@/supabase/client'
import { useEffect, useState } from 'react'
import type { AppStateStatus } from 'react-native'
import { AppState } from 'react-native'

type UnreadCounts = Record<string, number>

export function useMessageCount(userId: string) {
    const [unreadCountsBySenderId, setUnreadCountsBySenderId] = useState<UnreadCounts>({})
    const [totalUnreadCount, setTotalUnreadCount] = useState(0)

    const refreshUnreadCounts = async () => {
        if (!userId) return

        try {
            // Get unread direct messages
            const { data: directMessages, error: directError } = await supabase
                .from('direct_messages')
                .select('sender_id')
                .eq('receiver_id', userId)
                .eq('read', false)

            if (directError) throw directError

            // Get unread group messages (if applicable)
            const { data: groupMessages, error: groupError } = await supabase
                .from('group_messages')
                .select('child_id')
                .not('read_by', 'cs', `["${userId}"]`)

            if (groupError) throw groupError

            // Combine counts
            const countsMap: UnreadCounts = {}
            let total = 0

            // Process direct messages
            for (const msg of directMessages || []) {
                countsMap[msg.sender_id] = (countsMap[msg.sender_id] || 0) + 1
                total++
            }

            // Process group messages
            for (const msg of groupMessages || []) {
                countsMap[msg.child_id] = (countsMap[msg.child_id] || 0) + 1
                total++
            }

            setUnreadCountsBySenderId(countsMap)
            setTotalUnreadCount(total)
        } catch (error) {
            console.error('Error fetching unread counts:', error)
        }
    }

    // Set up real-time subscription for message updates
    useEffect(() => {
        if (!userId) return

        const channel = supabase
            .channel(`unread_counts:${userId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `receiver_id=eq.${userId}`
                },
                () => refreshUnreadCounts()
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'group_messages'
                },
                () => refreshUnreadCounts()
            )
            .subscribe()

        // Refresh when app comes to foreground
        const subscription = AppState.addEventListener('change', (state: AppStateStatus) => {
            if (state === 'active') {
                refreshUnreadCounts()
            }
        })

        // Initial load
        refreshUnreadCounts()

        return () => {
            supabase.removeChannel(channel)
            subscription.remove()
        }
    }, [userId])

    return {
        unreadCountsBySenderId,
        totalUnreadCount,
        refreshUnreadCounts
    }
}

export function useChatScreenData(userId: string) {
    const { chats: rawChats, loading: chatsLoading } = useChats(userId)
    const [chats, setChats] = useState<Chat[]>([])
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const { unreadCountsBySenderId, refreshUnreadCounts } = useMessageCount(userId)

    const { messages, loading: msgsLoading, sendMessage } = useMessages({
        chatId: selectedChat?.id || '',
        isGroup: selectedChat?.isGroup || false,
        userId,
    })

    // Update chats with unread counts
    useEffect(() => {
        const updatedChats = rawChats.map(chat => ({
            ...chat,
            unreadCount: unreadCountsBySenderId[chat.id] || 0
        }))
        setChats(updatedChats)
    }, [rawChats, unreadCountsBySenderId])

    // Mark messages as read when chat is selected
    // Mark messages as read when chat is selected
    useEffect(() => {
        const markMessagesAsRead = async () => {
            if (!selectedChat || !userId) return;

            try {
                if (selectedChat.isGroup) {
                    const { data: unreadMessages, error: fetchError } = await supabase
                        .from('group_messages')
                        .select('id')
                        .eq('child_id', selectedChat.id)
                        .not('read_by', 'cs', `{"${userId}"}`);

                    if (fetchError) throw fetchError;

                    if (unreadMessages && unreadMessages.length > 0) {
                        await Promise.all(unreadMessages.map(msg =>
                            supabase.rpc('add_to_read_by', {
                                message_id: msg.id,
                                user_id: userId
                            })
                        ));
                    }
                } else {
                    await supabase
                        .from('direct_messages')
                        .update({ read: true })
                        .eq('receiver_id', userId)
                        .eq('sender_id', selectedChat.id)
                        .eq('read', false);
                }

                // ✅ Immediately update local state
                setChats(prev =>
                    prev.map(chat =>
                        chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat
                    )
                );
            } catch (error) {
                console.error('Error marking messages as read:', error);
            }
        };

        markMessagesAsRead();
    }, [selectedChat, userId]);

    return {
        chats,
        chatsLoading,
        messages,
        msgsLoading,
        sendMessage,
        selectedChat,
        setSelectedChat,
        refreshUnreadCounts
    }
}