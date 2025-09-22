import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/supabase/client';
import type { MediaItem } from '@/types/messaging';
import { useEffect, useState } from 'react';

// Supported file extensions for media detection
const MEDIA_EXTENSIONS = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif',
    // Documents
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    // Audio
    '.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac',
    // Video
    '.mp4', '.mov', '.avi', '.mkv', '.webm'
];

export const useChatMedia = (conversationId: string) => {
    const { user } = useAuth();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!conversationId || !user?.id) {
            setLoading(false);
            return;
        }

        const fetchMediaMessages = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get all messages for this conversation that contain media
                const { data: messages, error: messagesError } = await supabase
                    .from('direct_messages')
                    .select('id, content, created_at, sender_id, receiver_id')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .or(MEDIA_EXTENSIONS.map(ext => `content.ilike.%${ext}`).join(','));

                if (messagesError) throw messagesError;

                // Transform messages into media items
                const mediaItems = messages
                    .filter(msg => {
                        const content = msg.content?.toString() || '';
                        return MEDIA_EXTENSIONS.some(ext => content.toLowerCase().includes(ext));
                    })
                    .map(msg => {
                        const content = msg.content.toString();
                        const fileName = content.split('/').pop() || 'file';
                        const extension = fileName.split('.').pop()?.toLowerCase() || '';

                        // Determine if current user is sender or receiver
                        const isSender = msg.sender_id === user.id;

                        return {
                            id: msg.id,
                            uri: content,
                            name: fileName,
                            type: getMediaType(extension),
                            createdAt: msg.created_at,
                            senderId: msg.sender_id,
                            isFromCurrentUser: isSender
                        };
                    });

                setMedia(mediaItems);
            } catch (err) {
                console.error('Error fetching media messages:', err);
                setError('Failed to load shared media');
            } finally {
                setLoading(false);
            }
        };

        fetchMediaMessages();

        // Real-time subscription
        const channel = supabase
            .channel(`chat-media-updates:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
                },
                fetchMediaMessages
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, user?.id]);

    return { media, loading, error };
};

// Helper to determine media type from extension
const getMediaType = (extension: string): MediaItem['type'] => {
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(extension)) {
        return 'image';
    }
    if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(extension)) {
        return 'video';
    }
    if (['.mp3', '.m4a', '.wav', '.aac', '.ogg', '.flac'].includes(extension)) {
        return 'audio';
    }
    return 'document';
};