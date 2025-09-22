import { DocumentViewer } from '@/components/message/DocumentViewer';
import { GroupModal } from '@/components/message/GroupModal';
import { ImageDisplay } from '@/components/message/ImageViewer';
import { MediaModal } from '@/components/message/MediaModal';
import { VideoViewer } from '@/components/message/VideoViewer';
import { VoiceMessagePlayer } from '@/components/message/VoicePlayer';
import { GoalBackground } from '@/constants/GoalBackground';
import { useChats } from '@/hooks/chat/useChats';
import { useCreateGroup } from '@/hooks/chat/useCreateGroup';
import { useDocumentSharing } from '@/hooks/chat/useDocument';
import { useMessageCount } from '@/hooks/chat/useMessageCount';
import { useMessages } from '@/hooks/chat/useMessages';
import { usePictures } from '@/hooks/chat/usePictures';
import { useVoice } from '@/hooks/chat/useVoice';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type {
    Chat, FabOption, Group, MediaItem,
    Message, MessagingScreenProps,
    Picture,
    SharedDocument,
    User,
    VoiceRecording
} from '@/types/messaging';
import {
    formatFileSize, getFileColor, getFileIcon,
    getMimeType
} from '@/utils/File';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { Video } from 'expo-av';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated, FlatList,
    Image,
    InteractionManager, Keyboard, Platform, Pressable,
    ScrollView as RNScrollView,
    SafeAreaView,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Avatar,
    Button,
    H4,
    Input,
    Paragraph,
    Text,
    useTheme as useTamaguiTheme,
    XStack,
    YStack
} from 'tamagui';

const AVATAR_DEFAULT = require('@/assets/images/profile.jpg')

const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
        return formatTime(date)
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const formatDuration = (millis: number) => {
    const minutes = Math.floor(millis / 60000)
    const seconds = ((millis % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds.padStart(2, '0')}`
}

const ChatListItem = memo(({ chat, onPress }: { chat: Chat; onPress: () => void }) => (
    <Pressable onPress={onPress}>
        <XStack padding="$4" alignItems="center" borderBottomWidth={1} borderBottomColor="$borderColor" backgroundColor="$background" pressStyle={{ backgroundColor: '$gray2' }}>
            <Avatar size="$4" circular>
                <Avatar.Image src={chat.avatar} />
                <Avatar.Fallback backgroundColor="$blue8" />
            </Avatar>
            <YStack flex={1} marginLeft="$3">
                <XStack justifyContent="space-between" alignItems="center">
                    <H4 fontWeight="600" color="$color">{chat.name}</H4>
                    <Text fontSize="$2" color="$gray10">{formatDate(chat.updatedAt)}</Text>
                </XStack>
                <XStack justifyContent="space-between" alignItems="center">
                    <Paragraph numberOfLines={1} color="$gray11" maxWidth="80%">
                        {chat.lastMessage || 'No messages yet'}
                    </Paragraph>
                    {chat.unreadCount > 0 && (
                        <YStack backgroundColor="$blue10" borderRadius={9999} paddingHorizontal={6} paddingVertical={2} minWidth={20} alignItems="center" justifyContent="center">
                            <Text color="white" fontSize="$2" fontWeight="bold">{chat.unreadCount}</Text>
                        </YStack>
                    )}
                </XStack>
            </YStack>
        </XStack>
    </Pressable>
))

const isAudioFile = (content: string) => {
    return /\.(m4a|mp3|wav|aac|ogg)$/i.test(content);
};

const isImageFile = (content: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']
    return imageExtensions.some(ext => content.toLowerCase().endsWith(ext))
};

const isDocumentFile = (content: string) => {
    const docExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt']
    return docExtensions.some(ext => content.toLowerCase().endsWith(ext))
}

const isVideoFile = (content: string) => {
    return /\.(mp4|mov|avi|mkv|webm)$/i.test(content);
};

const MessageItem = memo(
    ({ msg, isCurrentUser }: { msg: Message; isCurrentUser: boolean }) => {
        const [viewingDoc, setViewingDoc] = useState<SharedDocument | null>(null);
        const [viewingVideo, setViewingVideo] = useState<string | null>(null);
        const isVoiceMessage = isAudioFile(msg.content);
        const isImageMessage = isImageFile(msg.content);
        const isDocMessage = isDocumentFile(msg.content);
        const isVideoMessage = isVideoFile(msg.content);

        const handleDocPress = () => {
            setViewingDoc({
                id: msg.id,
                uri: msg.content,
                name: msg.content.split('/').pop() || 'Document',
                type: getMimeType(msg.content),
                size: 0,
                uploaded: true
            });
        };

        const handleVideoPress = () => {
            setViewingVideo(msg.content);
        };

        const handleDeleteMedia = async () => {
            try {
                let bucket = 'chat-documents';
                if (isImageMessage) bucket = 'chat-images';
                if (isVideoMessage) bucket = 'chat-videos';
                if (isVoiceMessage) bucket = 'chat-voices';

                const { error } = await supabase.storage
                    .from(bucket)
                    .remove([msg.content]);

                if (error) throw error;

                await supabase
                    .from('direct_messages')
                    .delete()
                    .eq('id', msg.id);

            } catch (error) {
                console.error('Delete failed:', error);
                Alert.alert('Error', 'Failed to delete media');
            }
        };

        const renderVideoThumbnail = () => (
            <Pressable onPress={handleVideoPress}>
                <YStack position="relative">
                    <Video
                        source={{ uri: msg.content }}
                        style={{ width: 250, height: 250, borderRadius: 10 }}
                        shouldPlay={false}
                        usePoster
                        posterSource={require('@/assets/images/video-placeholder.webp')}
                    />
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                    }}>
                        <MaterialIcons name="play-circle-filled" size={50} color="white" />
                    </View>
                    {isCurrentUser && (
                        <Button
                            position="absolute"
                            top="$2"
                            right="$2"
                            circular
                            size="$2"
                            backgroundColor="$red10"
                            onPress={handleDeleteMedia}
                            icon={<Feather name="x" size={16} color="white" />}
                        />
                    )}
                </YStack>
            </Pressable>
        );

        return (
            <YStack
                alignSelf={isCurrentUser ? 'flex-end' : 'flex-start'}
                maxWidth="80%"
                space="$2"
                marginVertical="$2"
                marginHorizontal="$3"
            >
                <XStack
                    backgroundColor={isCurrentUser ? '#005A31' : '#E2FFF2'}
                    borderRadius="$4"
                    paddingHorizontal={isImageMessage || isDocMessage || isVideoMessage ? '$0' : '$3'}
                    paddingVertical={isImageMessage || isDocMessage || isVideoMessage ? '$0' : '$2.5'}
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.05}
                    shadowRadius={1.5}
                    elevation={1}
                    alignItems="center"
                >
                    {isVoiceMessage ? (
                        <VoiceMessagePlayer uri={msg.content} />
                    ) : isImageMessage ? (
                        <ImageDisplay
                            path={msg.content}
                            width={250}
                            height={250}
                            borderRadius={4}
                            onDelete={isCurrentUser ? handleDeleteMedia : undefined}
                            showDelete={isCurrentUser}
                        />
                    ) : isVideoMessage ? (
                        renderVideoThumbnail()
                    ) : isDocMessage ? (
                        <DocumentPreviews
                            doc={{
                                id: msg.id,
                                uri: msg.content,
                                name: msg.content.split('/').pop() || 'Document',
                                type: getMimeType(msg.content),
                                size: 0,
                                uploaded: true
                            }}
                            onPress={handleDocPress}
                            onRemove={() => { }}
                        />
                    ) : (
                        <Paragraph
                            color={isCurrentUser ? 'white' : '$color'}
                            fontSize="$4"
                            lineHeight="$3"
                        >
                            {msg.content}
                        </Paragraph>
                    )}
                </XStack>

                <XStack
                    alignSelf={isCurrentUser ? 'flex-end' : 'flex-start'}
                    space="$2"
                    alignItems="center"
                    paddingHorizontal="$1"
                >
                    <Text fontSize="$1" color="$gray9" marginTop="$0.5">
                        {formatTime(msg.created_at)}
                    </Text>

                    {isCurrentUser && (
                        <Ionicons
                            name={msg.read ? 'checkmark-done' : 'checkmark'}
                            size={20}
                            color={msg.read ? '#007AFF' : '$gray9'}
                        />
                    )}
                </XStack>

                {viewingDoc && (
                    <DocumentViewer
                        uri={viewingDoc.uri}
                        name={viewingDoc.name}
                        type={viewingDoc.type}
                        onClose={() => setViewingDoc(null)}
                    />
                )}

                {viewingVideo && (
                    <VideoViewer
                        uri={viewingVideo}
                        name={msg.content.split('/').pop() || 'Video'}
                        onClose={() => setViewingVideo(null)}
                        onDownload={async (uri) => {
                            try {
                                const FileSystem = require('expo-file-system');
                                const fileName = uri.split('/').pop() || 'video.mp4';
                                const downloadUri = FileSystem.documentDirectory + fileName;
                                const download = await FileSystem.downloadAsync(uri, downloadUri);
                                Alert.alert('Downloaded', `Video saved to ${download.uri}`);
                            } catch (error) {
                                Alert.alert('Error', 'Failed to download video');
                            }
                        }}
                        onShare={async (uri) => {
                            // Implement your sharing logic here
                            Alert.alert('Share', 'Sharing video...');
                        }}
                    />
                )}
            </YStack>
        );
    }
);

const ContactListItem = memo(({ member, unreadCount, onPress }: { member: User; unreadCount: number; onPress: () => void }) => {
    const handlePress = useCallback(() => {
        requestAnimationFrame(() => {
            InteractionManager.runAfterInteractions(() => {
                onPress();
            });
        });
    }, [onPress]);

    return (
        <Pressable
            onPress={handlePress}
            style={({ pressed }) => ({
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }]
            })}
        >
            <XStack
                alignItems="center"
                padding="$2"
                backgroundColor="$background"
                borderRadius="$4"
                borderWidth={1}
                borderColor="gray"
                space="$3"
                marginBottom="$2"
            >
                <Avatar size="$4" circular>
                    <Avatar.Image src={member.photo || AVATAR_DEFAULT} />
                    <Avatar.Fallback backgroundColor="$blue6" />
                </Avatar>
                <YStack flex={1}>
                    <Text fontWeight="700" fontSize="$5" color="$color">{member.full_name || member.email}</Text>
                </YStack>
                {unreadCount > 0 && (
                    <YStack backgroundColor="$blue10" borderRadius={9999} paddingHorizontal={6} paddingVertical={2} minWidth={20} alignItems="center" justifyContent="center">
                        <Text color="white" fontSize="$2" fontWeight="bold">{unreadCount}</Text>
                    </YStack>
                )}
            </XStack>
        </Pressable>
    );
});

const GroupListItem = memo(
    ({
        group,
        unreadCount,
        onPress,
    }: {
        group: Group
        unreadCount: number
        onPress: () => void
    }) => {
        const handlePress = useCallback(() => {
            requestAnimationFrame(() => {
                InteractionManager.runAfterInteractions(() => {
                    onPress()
                })
            })
        }, [onPress])

        return (
            <Pressable
                onPress={handlePress}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                })}
            >
                <XStack
                    alignItems="center"
                    padding="$3"
                    backgroundColor="$background"
                    borderRadius="$4"
                    borderWidth={1}
                    borderColor="$borderColor"
                    space="$3"
                    marginBottom="$2"
                >
                    <Avatar size="$4" circular>
                        <Avatar.Image src={group.avatar || AVATAR_DEFAULT} />
                        <Avatar.Fallback backgroundColor="$blue6" />
                    </Avatar>

                    <YStack flex={1}>
                        <Text fontWeight="700" fontSize="$5" color="$color">
                            {group.name}
                        </Text>
                    </YStack>

                    {unreadCount > 0 && (
                        <YStack
                            backgroundColor="$blue10"
                            borderRadius={9999}
                            paddingHorizontal={6}
                            paddingVertical={2}
                            minWidth={20}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Text color="white" fontSize="$2" fontWeight="bold">
                                {unreadCount}
                            </Text>
                        </YStack>
                    )}
                </XStack>
            </Pressable>
        )
    }
)

const DocumentPreviews = ({
    doc,
    onRemove,
    onPress,
}: {
    doc: SharedDocument
    onRemove: () => void
    onPress?: () => void
}) => {
    const fileSize = formatFileSize(doc.size);
    const fileIcon = getFileIcon(doc.name, doc.type);

    return (
        <YStack
            position="relative"
            backgroundColor="$gray3"
            borderRadius="$4"
            padding="$3"
            marginRight="$2"
            marginBottom="$2"
            maxWidth={180}
            minWidth={120}
            hoverStyle={{ backgroundColor: '$gray4' }}
            pressStyle={{ opacity: 0.9 }}
            onPress={onPress}
        >
            <Button
                position="absolute"
                top={2}
                right={0}
                bottom={2}
                size="$2"
                circular
                unstyled
                onPress={onRemove}
                hoverStyle={{ backgroundColor: '$gray5' }}
            />
            <XStack alignItems="center" mt="$4">
                <MaterialIcons name={fileIcon} size={20} color={getFileColor(doc.type)} />
                <YStack marginLeft="$2" flex={1}>
                    <Text fontSize="$2" fontWeight="500" numberOfLines={1} ellipsizeMode="middle">
                        {doc.name}
                    </Text>
                    <Text fontSize="$1" color="$gray10">
                        {fileSize}
                        {doc.progress !== undefined && !doc.uploaded && ` • ${doc.progress}%`}
                    </Text>
                </YStack>
            </XStack>
            {doc.uploaded && (
                <MaterialIcons name="check-circle" size={16} color="$green10" marginTop="$2" />
            )}
        </YStack>
    );
};

const RecordingPreview = ({ rec, onRemove }: { rec: VoiceRecording; onRemove: () => void }) => (
    <XStack
        backgroundColor="$gray3"
        borderRadius="$2"
        padding="$2"
        marginRight="$2"
        marginBottom="$2"
        alignItems="center"
    >
        <MaterialIcons name="mic" size={20} color="gray" />
        <Text fontSize="$2" marginLeft="$1">
            {formatDuration(rec.duration)}
        </Text>
        <Button
            unstyled
            onPress={onRemove}
            marginLeft="$1"
            icon={<Feather name="x" size={16} color="gray" />}
        />
    </XStack>
);

const PicturePreview = ({ pic, onRemove }: { pic: Picture; onRemove: () => void }) => (
    <View style={{ position: 'relative', marginRight: 8, marginBottom: 8 }}>
        <Image
            source={{ uri: pic.uri }}
            style={{ width: 50, height: 50, borderRadius: 4 }}
            resizeMode="cover"
        />
        <Button
            position="absolute"
            top={-8}
            right={-8}
            circular
            size="$1"
            backgroundColor="$red10"
            onPress={onRemove}
            icon={<Feather name="x" size={12} color="white" />}
        />
    </View>
);

export const MessagingScreen = ({ navigation }: MessagingScreenProps) => {
    const [user, setUser] = useState<User | null>(null)
    const { colors } = useTheme();
    const [query, setQuery] = useState('')
    const [familyMembers, setFamilyMembers] = useState<User[]>([])
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [newMessage, setNewMessage] = useState('')
    const [showGroupModal, setShowGroupModal] = useState(false)
    const { createGroup } = useCreateGroup()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const scrollRef = useRef<RNScrollView>(null)
    const flatListRef = useRef<FlatList<Message>>(null);
    const theme = useTamaguiTheme()
    const processingSelection = useRef(false);
    const [keyboardHeight] = useState(new Animated.Value(0));
    const insets = useSafeAreaInsets();
    const { unreadCountsBySenderId } = useMessageCount(user?.id || '')
    const { chats: rawChats } = useChats(user?.id || '')
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [sharedMedia, setSharedMedia] = useState<MediaItem[]>([]);
    const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
    const isMounted = useRef(true);

    const {
        documents,
        pickDocument,
        uploadDocument,
        removeDocument,
        isUploading: isUploadingDoc
    } = useDocumentSharing(selectedChat?.id || '');

    const {
        recordings,
        isRecording,
        startRecording,
        stopRecording,
        uploadRecording,
        deleteRecording,
    } = useVoice(selectedChat?.id || '');

    const {
        pictures,
        pickImage,
        takePhoto,
        uploadPicture,
        removePicture,
        isUploading: isUploadingPic
    } = usePictures(selectedChat?.id || '');

    const { messages, sendMessage } = useMessages(selectedChat ? {
        chatId: selectedChat.id,
        isGroup: selectedChat.isGroup,
        userId: user?.id || ''
    } : { chatId: '', isGroup: false, userId: '' })

    const fabOptions: FabOption[] = [
        {
            icon: 'group',
            label: 'New Group',
            color: 'blue',
            onPress: () => setIsModalOpen(true)
        },
        {
            icon: 'person-add',
            label: 'New Contact',
            color: 'green',
            onPress: () => { }
        },
        {
            icon: 'settings',
            label: 'Settings',
            color: 'gray',
            onPress: () => navigation.navigate('Settings')
        }
    ]

    useEffect(() => {
        const fetchUserAndFamily = async () => {
            try {
                const { data: authData, error: authError } = await supabase.auth.getUser()
                if (authError || !authData?.user) {
                    console.error('Error getting auth user:', authError)
                    return
                }

                const authUserId = authData.user.id

                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authUserId)
                    .single()

                if (userError || !userData) {
                    console.error('Error fetching user details:', userError)
                    return
                }

                if (isMounted.current) {
                    setUser(userData)
                }

                if (!userData.family_id) {
                    console.warn('User has no family_id')
                    if (isMounted.current) {
                        setFamilyMembers([])
                    }
                    return
                }

                const { data: family, error: familyError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('family_id', userData.family_id)
                    .neq('id', userData.id)

                if (familyError) {
                    console.error('Error fetching family members:', familyError)
                }

                if (isMounted.current) {
                    setFamilyMembers(family || [])
                }
            } catch (error) {
                console.error('Error in fetchUserAndFamily:', error)
            }
        }

        fetchUserAndFamily()

        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (messages.length && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true })
            }, 100)
        }
    }, [messages])

    useEffect(() => {
        const keyboardWillShowSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: e.endCoordinates.height - insets.bottom,
                    useNativeDriver: false,
                }).start();
            }
        );

        const keyboardWillHideSub = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(keyboardHeight, {
                    duration: 250,
                    toValue: 0,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardWillShowSub.remove();
            keyboardWillHideSub.remove();
        };
    }, [insets.bottom]);

    useEffect(() => {
        const allMedia: MediaItem[] = [
            ...documents.map(doc => ({
                id: doc.id,
                uri: doc.uri,
                type: 'document' as const,
                name: doc.name,
                uploaded: doc.uploaded
            })),
            ...recordings.map(rec => ({
                id: rec.id,
                uri: rec.uri,
                type: 'audio' as const,
                name: rec.name,
                uploaded: rec.uploaded
            })),
            ...pictures.map(pic => ({
                id: pic.id,
                uri: pic.uri,
                type: 'image' as const,
                name: pic.name,
                uploaded: pic.uploaded
            }))
        ];
        setSharedMedia(allMedia);
    }, [documents, recordings, pictures]);

    const handleSelectChat = useCallback((chat: Chat) => {
        if (processingSelection.current) return;
        processingSelection.current = true;

        requestAnimationFrame(() => {
            setSelectedChat(prev => {
                if (prev?.id === chat.id) {
                    processingSelection.current = false;
                    return prev;
                }
                processingSelection.current = false;
                return chat;
            });
        });
    }, []);

    const handleSelectGroup = useCallback((group: Group) => {
        if (processingSelection.current) return;
        processingSelection.current = true;

        requestAnimationFrame(() => {
            setSelectedGroup(prev => {
                if (prev?.id === group.id) {
                    processingSelection.current = false;
                    return prev;
                }
                processingSelection.current = false;
                return group;
            });
        });
    }, []);

    const handleSendMessage = useCallback(async () => {
        if (!selectedChat?.id || !user?.id) return;

        try {
            if (documents.length > 0 || recordings.length > 0 || pictures.length > 0) {
                await handleSendAttachments();
            } else if (newMessage.trim()) {
                await sendMessage(newMessage);
                if (isMounted.current) {
                    setNewMessage('');
                }
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Error', 'Failed to send message');
        }
    }, [newMessage, selectedChat?.id, sendMessage, documents, recordings, pictures, user?.id]);

    const handleCreateGroup = useCallback(async (name: string, selectedContacts: string[], childId?: string) => {
        if (!user?.id) return
        try {
            await createGroup(name || '', selectedContacts)
            if (isMounted.current) {
                setShowGroupModal(false)
            }
        } catch (error) {
            console.error('Error creating group:', error)
            Alert.alert('Error', 'Failed to create group')
        }
    }, [user?.id, createGroup])

    const handleSendAttachments = useCallback(async () => {
        if (!selectedChat?.id || !user?.id) return;

        try {
            // Upload voice recordings first
            const voiceUrls = await Promise.all(
                recordings.filter(r => !r.uploaded).map(r => uploadRecording(r))
            );

            // Upload other attachments
            const docUrls = await Promise.all(
                documents.filter(d => !d.uploaded).map(d => uploadDocument(d))
            );
            const picUrls = await Promise.all(
                pictures.filter(p => !p.uploaded).map(p => uploadPicture(p))
            );

            // Combine all URLs
            const allUrls = [...voiceUrls, ...docUrls, ...picUrls].filter(url => url);

            // If we only have a single voice recording, send it as a special voice message
            if (voiceUrls.length === 1 && docUrls.length === 0 && picUrls.length === 0) {
                await sendMessage(voiceUrls[0]!); // Just send the voice URL directly
            }
            // Otherwise combine with text if available
            else if (allUrls.length > 0) {
                const messageContent = newMessage.trim()
                    ? `${newMessage}\n\n${allUrls.join('\n')}`
                    : allUrls.join('\n');
                await sendMessage(messageContent);
            }
            // Fallback to just text
            else if (newMessage.trim()) {
                await sendMessage(newMessage);
            }

            if (isMounted.current) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending attachments:', error);
            Alert.alert('Error', 'Failed to send attachments');
        }
    }, [documents, recordings, pictures, newMessage, sendMessage, selectedChat?.id, user?.id]);

    const toggleAttachmentOptions = () => {
        setShowAttachmentOptions(prev => !prev);
    };

    const renderMessageInput = () => (
        <Animated.View
            style={{
                padding: 12,
                backgroundColor: colors.background,
                borderTopWidth: 1,
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: keyboardHeight,
                paddingBottom: insets.bottom + 25,
            }}
        >
            {showAttachmentOptions && (
                <XStack space="$2" marginBottom="$2" justifyContent="center">
                    <Button
                        circular
                        size="$3"
                        icon={<MaterialIcons name="insert-photo" size={24} color={colors.primary} />}
                        onPress={() => {
                            pickImage();
                            setShowAttachmentOptions(false);
                        }}
                        backgroundColor="transparent"
                    />
                    <Button
                        circular
                        size="$3"
                        icon={<MaterialIcons name="camera-alt" size={24} color={colors.primary} />}
                        onPress={() => {
                            takePhoto();
                            setShowAttachmentOptions(false);
                        }}
                        backgroundColor="transparent"
                    />
                    <Button
                        circular
                        size="$3"
                        icon={<MaterialIcons name="attach-file" size={24} color={colors.primary} />}
                        onPress={() => {
                            pickDocument();
                            setShowAttachmentOptions(false);
                        }}
                        backgroundColor="transparent"
                    />
                </XStack>
            )}

            <XStack space="$2" alignItems="center">
                {/* Plus Icon */}
                <Button
                    circular
                    size="$3"
                    icon={<MaterialIcons name={showAttachmentOptions ? "close" : "add"} size={24} color={colors.primary} />}
                    onPress={toggleAttachmentOptions}
                    backgroundColor="transparent"
                />

                {/* Mic Icon Beside Plus */}
                <Button
                    circular
                    size="$3"
                    icon={<MaterialIcons name="mic" size={24} color={colors.primary} />}
                    onPress={() => {
                        if (isRecording) {
                            stopRecording();
                        } else {
                            startRecording();
                        }
                    }}
                    backgroundColor={isRecording ? '$red10' : 'transparent'}
                />

                {/* Text Input */}
                <Input
                    flex={1}
                    placeholder="Type a message..."
                    placeholderTextColor="$gray10"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    borderRadius="$10"
                    borderColor="black"
                    borderWidth={1}
                    backgroundColor="$background"
                    paddingVertical="$3"
                    color="$color"
                    onSubmitEditing={handleSendMessage}
                />

                {/* Send Button */}
                <Button
                    circular
                    size="$3"
                    icon={<MaterialIcons name="send" size={20} color="white" />}
                    backgroundColor={
                        newMessage.trim() ||
                            documents.length > 0 ||
                            recordings.length > 0 ||
                            pictures.length > 0
                            ? colors.secondary
                            : colors.secondary
                    }
                    disabled={
                        !newMessage.trim() &&
                        documents.length === 0 &&
                        recordings.length === 0 &&
                        pictures.length === 0
                    }
                    onPress={handleSendMessage}
                    pressStyle={{ opacity: 0.8 }}
                />
            </XStack>

            {/* Recording Indicator */}
            {isRecording && (
                <XStack alignItems="center" space="$2" padding="$2" justifyContent="center">
                    <MaterialIcons name="mic" size={24} color={colors.error} />
                    <Text color={colors.error}>Recording... Tap to stop</Text>
                    <Button
                        size="$2"
                        onPress={stopRecording}
                        backgroundColor="$red10"
                        color="white"
                    >
                        Stop
                    </Button>
                </XStack>
            )}

            {/* Preview Section */}
            {(documents.length > 0 || recordings.length > 0 || pictures.length > 0) && (
                <XStack flexWrap="wrap" marginTop="$2">
                    {documents.map(doc => (
                        <DocumentPreviews
                            key={doc.id}
                            doc={doc}
                            onRemove={() => removeDocument(doc.id)}
                        />
                    ))}
                    {recordings.map(rec => (
                        <RecordingPreview
                            key={rec.id}
                            rec={rec}
                            onRemove={() => deleteRecording(rec.id)}
                        />
                    ))}
                    {pictures.map(pic => (
                        <PicturePreview
                            key={pic.id}
                            pic={pic}
                            onRemove={() => removePicture(pic.id)}
                        />
                    ))}
                </XStack>
            )}
        </Animated.View>
    );

    const renderMessageItem = useCallback(({ item }: { item: Message }) => (
        <MessageItem msg={item} isCurrentUser={item.sender_id === user?.id} />
    ), [user?.id])

    const renderChatItem = useCallback(({ item }: { item: Chat }) => (
        <ChatListItem chat={item} onPress={() => handleSelectChat(item)} />
    ), [handleSelectChat])

    const renderGroupItem = useCallback(
        ({ item }: { item: Group }) => (
            <GroupListItem
                group={item}
                unreadCount={unreadCountsBySenderId[item.id] || 0}
                onPress={() => handleSelectGroup(item)}
            />
        ),
        [handleSelectGroup, unreadCountsBySenderId]
    )

    return (
        <YStack flex={1} backgroundColor={colors.background}>
            {selectedChat ? (
                <GoalBackground>
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }} />

                    <SafeAreaView>
                        <XStack
                            padding="$4"
                            mt="$7"
                            alignItems="center"
                            justifyContent="space-between"
                            borderBottomWidth={1}
                            borderBottomColor="gray"
                        >
                            <XStack alignItems="center" space="$3">
                                <Pressable onPress={() => setSelectedChat(null)}>
                                    <ChevronLeft
                                        size={24} color={colors.text as any} />
                                </Pressable>
                                <Avatar circular size="$3" borderWidth={1} borderColor="$borderColor">
                                    <Avatar.Image src={selectedChat.avatar} />
                                    <Avatar.Fallback backgroundColor="$blue8" />
                                </Avatar>
                                <YStack>
                                    <H4 color={colors.text} fontWeight="600">{selectedChat.name}</H4>
                                    <Text fontSize="$2" color={colors.text}>
                                        {selectedChat.isGroup ? 'Group' : 'Online'}
                                    </Text>
                                </YStack>
                            </XStack>
                            <XStack space="$3" p={2}>
                                <Pressable
                                    onPress={() => setShowMediaModal(true)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MaterialIcons
                                        name="menu-open"
                                        size={26}
                                        color={colors.text}
                                    />
                                </Pressable>
                            </XStack>
                        </XStack>
                    </SafeAreaView>

                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessageItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={{
                            paddingBottom: Platform.select({
                                ios: insets.bottom + 100,
                                android: insets.bottom + 80
                            })
                        }}
                        ListHeaderComponent={<View style={{ height: 16 }} />}
                        ListEmptyComponent={
                            <YStack padding="$10" alignItems="center" space="$3">
                                <MaterialIcons name="chat" size={32} color={colors.primary} />
                                <H4 color="$color">No messages yet</H4>
                                <Paragraph textAlign="center" color="$gray11">
                                    Start the conversation by sending your first message
                                </Paragraph>
                            </YStack>
                        }
                        keyboardDismissMode="interactive"
                        keyboardShouldPersistTaps="handled"
                        automaticallyAdjustKeyboardInsets={true}
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                        windowSize={5}
                        removeClippedSubviews={true}
                        onEndReachedThreshold={0.2}
                        onContentSizeChange={() => {
                            if (messages.length > 0) {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }
                        }}
                    />

                    {renderMessageInput()}
                </GoalBackground>

            ) : (
                <YStack flex={1}>
                    <GoalBackground>
                        <SafeAreaView>
                            <XStack
                                padding="$4"
                                mt="$7"
                                justifyContent="space-between"
                                alignItems="center"
                                borderBottomWidth={1}
                                borderBottomColor="$borderColor"
                            >
                                <Button
                                    unstyled
                                    circular
                                    pressStyle={{ opacity: 0.6 }}
                                    onPress={navigation.goBack}
                                    icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                                />
                                <Text
                                    color={colors.text}
                                    fontWeight="700"
                                    fontSize="$7"
                                    ta="center"
                                    flex={1}
                                    mx="$2"
                                >
                                    Chats
                                </Text>
                                <XStack space="$3">
                                    <MaterialIcons name="search" size={24} color={colors.text} />
                                    <MaterialIcons name="more-vert" size={24} color={colors.text} />
                                </XStack>
                            </XStack>
                        </SafeAreaView>

                        <FlatList
                            data={rawChats}
                            renderItem={renderChatItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingBottom: 80 }}
                            ListEmptyComponent={
                                <YStack padding="$4" space="$2">
                                    {familyMembers.length === 0 ? (
                                        <YStack alignItems="center" justifyContent="center" padding="$10" space="$3">
                                            <MaterialIcons name="group" size={32} color="$gray10" />
                                            <Paragraph color="$gray11">No family members to chat with.</Paragraph>
                                        </YStack>
                                    ) : (
                                        <YStack>
                                            {familyMembers.map((member) => {
                                                const unreadCount = unreadCountsBySenderId[member.id] || 0;
                                                return (
                                                    <ContactListItem
                                                        key={member.id}
                                                        member={member}
                                                        unreadCount={unreadCount}
                                                        onPress={() => {
                                                            const existingChat = rawChats.find(c => c.type === 'direct' && c.id === member.id);
                                                            setSelectedChat(existingChat || {
                                                                id: member.id,
                                                                type: 'direct',
                                                                name: member.full_name || member.email,
                                                                avatar: member.photo || AVATAR_DEFAULT,
                                                                lastMessage: '',
                                                                updatedAt: new Date().toISOString(),
                                                                unreadCount: unreadCount,
                                                                isGroup: false,
                                                            });
                                                        }}
                                                    />
                                                );
                                            })}
                                        </YStack>
                                    )}
                                </YStack>
                            }
                            initialNumToRender={10}
                            maxToRenderPerBatch={5}
                            windowSize={7}
                            removeClippedSubviews={true}
                        />
                    </GoalBackground>


                    <GroupModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onCreateGroup={handleCreateGroup}
                        userData={user}
                    />
                </YStack>
            )
            }

            <MediaModal
                open={showMediaModal}
                onClose={() => setShowMediaModal(false)}
                chatId={selectedChat?.id || ''}
            />
        </YStack >
    );
};