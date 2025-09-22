import { supabase } from '@/supabase/client';
import { useEffect, useState } from 'react';

export type Chat = {
    id: string
    name: string
    avatar?: string
    isGroup: boolean
    type: 'direct' | 'group'
    updatedAt: string
    lastMessage: string
    newChat: string
    unreadCount: number
};

export function useChats(userId: string) {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchChats = async () => {
            setLoading(true);
            setError(null);

            try {
                // Get the current user's family_id from invites
                const { data: inviteData, error: inviteError } = await supabase
                    .from('invites')
                    .select('family_id')
                    .eq('id', userId)
                    .single();

                if (inviteError || !inviteData?.family_id) throw inviteError;

                // Get all users in the same family
                const { data: familyUsers, error: usersError } = await supabase
                    .from('users')
                    .select('id, full_name, email, avatar_url')
                    .eq('family_id', inviteData.family_id)
                    .neq('id', userId);

                if (usersError) throw usersError;

            } catch (err) {
                setError('Failed to load chats');
                setChats([]);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [userId]);

    return { chats, loading, error };
}

