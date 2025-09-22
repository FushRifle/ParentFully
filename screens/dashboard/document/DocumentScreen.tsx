import { useFileOptionsSheet } from '@/components/document/OptionsModal';
import { useFilePreviewSheet } from '@/components/document/PreviewModal';
import { useAuth } from '@/hooks/auth/useAuth';
import type { RootStackParamList } from '@/navigation/MainNavigator';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import {
    Button,
    Paragraph,
    ScrollView,
    Spinner,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui';

type DocumentScreenProps = NativeStackScreenProps<RootStackParamList, 'Documents'>;

const DOCUMENT_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'
];

export const DocumentScreen = ({ navigation }: DocumentScreenProps) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<any>(null);

    // Initialize the modal sheets
    const { openOptionsSheet, OptionsSheet } = useFileOptionsSheet({
        onPreview: () => {
            openPreviewSheet(selectedFile);
        },
        onDownload: async () => { await handleDownload(selectedFile); },
        onDelete: async () => { await handleDelete(selectedFile); },
        onShare: async () => {
            // You may want to implement sharing logic here
            // For now, just show an alert or do nothing
            Alert.alert('Share', 'Share functionality is not implemented yet.');
        },
    });

    const { openPreviewSheet, PreviewSheet } = useFilePreviewSheet({
        file: selectedFile,
        onDownload: () => handleDownload(selectedFile),
    });

    useEffect(() => {
        if (!user?.id) return;

        const fetchDocuments = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data, error: fetchError } = await supabase
                    .from('direct_messages')
                    .select('id, content, created_at, sender_id, receiver_id')
                    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;

                const filteredDocs = (data || [])
                    .filter(msg => {
                        const content = msg.content?.toString() || '';
                        return DOCUMENT_EXTENSIONS.some(ext =>
                            content.toLowerCase().includes(ext)
                        )
                    })
                    .map(msg => {
                        const content = msg.content.toString();
                        const fileName = content.split('/').pop() || 'file';
                        const isFromCurrentUser = msg.sender_id === user.id;

                        return {
                            id: msg.id,
                            uri: content,
                            name: fileName,
                            type: 'document',
                            createdAt: msg.created_at,
                            isFromCurrentUser
                        };
                    });

                setDocuments(filteredDocs);
            } catch (err) {
                console.error('Error fetching documents:', err);
                setError('Failed to load shared documents');
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();

        const channel = supabase
            .channel('documents-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'direct_messages',
                    filter: `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
                },
                (payload) => {
                    const newContent = payload.new.content;
                    if (DOCUMENT_EXTENSIONS.some(ext =>
                        newContent.toLowerCase().includes(ext))) {
                        setDocuments(prev => [{
                            id: payload.new.id,
                            uri: newContent,
                            name: newContent.split('/').pop() || 'file',
                            type: 'document',
                            createdAt: payload.new.created_at,
                            isFromCurrentUser: payload.new.sender_id === user.id
                        }, ...prev]);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const handleLongPress = useCallback((item: any) => {
        setSelectedFile(item);
        openOptionsSheet();
    }, [openOptionsSheet]);

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return { icon: 'picture-as-pdf', color: '#f40f02' };
            case 'doc': case 'docx': return { icon: 'description', color: '#2b579a' };
            case 'xls': case 'xlsx': return { icon: 'grid-on', color: '#217346' };
            case 'ppt': case 'pptx': return { icon: 'slideshow', color: '#d24726' };
            default: return { icon: 'insert-drive-file', color: colors.primary };
        }
    };

    const handleDownload = useCallback(async (item: any) => {
        try {
            setIsDownloading(true);
            const download = await FileSystem.downloadAsync(
                item.uri,
                FileSystem.documentDirectory + item.name
            );
            Alert.alert('Download complete', `Saved to: ${download.uri}`);
        } catch (err) {
            Alert.alert('Download failed', 'Unable to download file.');
        } finally {
            setIsDownloading(false);
        }
    }, []);

    const handleDelete = useCallback(async (item: any) => {
        Alert.alert(
            'Delete Document',
            `Are you sure you want to delete ${item.name}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('direct_messages')
                                .delete()
                                .eq('id', item.id);

                            if (error) throw error;

                            setDocuments(prev => prev.filter(doc => doc.id !== item.id));
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete document');
                        }
                    },
                },
            ]
        );
    }, []);

    const handlePreview = useCallback((item: any) => {
        setSelectedFile(item);
        openOptionsSheet();
    }, [openOptionsSheet]);

    const renderDocumentItem = useCallback((item: any) => {
        const { icon, color } = getFileIcon(item.name);
        const fileExt = item.name.split('.').pop();
        const shortName = item.name.length > 30
            ? `${item.name.substring(0, 27)}...${fileExt}`
            : item.name;

        return (
            <Pressable
                key={item.id}
                onPress={() => handlePreview(item)}
                onLongPress={() => handleLongPress(item)}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    width: '100%',
                    marginBottom: 10,
                    elevation: 15,
                    marginTop: 10
                })}
            >
                <XStack
                    alignItems="center"
                    borderRadius="$3"
                    elevation={10}
                    shadowColor={colors.onPrimary}
                    backgroundColor={item.isFromCurrentUser ? colors.primary : colors.card}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    space="$2"
                >
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            backgroundColor: colors.cardBackground,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <MaterialIcons name={icon as any} size={20} color={color} />
                    </View>

                    <YStack flex={1}>
                        <Text
                            numberOfLines={1}
                            fontSize="$4"
                            fontWeight="600"
                            color={item.isFromCurrentUser ? colors.onPrimary : colors.text}
                        >
                            {shortName}
                        </Text>
                        <Text
                            fontSize="$2"
                            color={item.isFromCurrentUser ? colors.onPrimary : colors.textSecondary}
                        >
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                        </Text>
                    </YStack>
                </XStack>
            </Pressable>
        );
    }, [handlePreview, handleLongPress, colors]);

    return (
        <View flex={1} backgroundColor={colors.background} padding="$4">
            {/* Header */}
            <XStack
                padding="$2"
                mt="$5"
                justifyContent="space-between"
                alignItems="center"
                backgroundColor={colors.background}
            >
                <Button
                    unstyled
                    circular
                    pressStyle={{ opacity: 0.6 }}
                    onPress={navigation.goBack}
                    icon={<Feather name="chevron-left" size={24} color={colors.primary} />}
                />
                <Text
                    color={colors.primary}
                    fontWeight="700"
                    fontSize="$6"
                    ta="center"
                    flex={1}
                    mx="$2"
                >
                    My Documents
                </Text>
                <XStack space="$6">
                    <MaterialIcons name="search" size={27} color={colors.primary} />
                    <MaterialIcons name="more-vert" size={27} color={colors.primary} />
                </XStack>
            </XStack>

            {/* Content */}
            {loading ? (
                <YStack alignItems="center" padding="$8">
                    <Spinner size="large" color={colors.primary as any} />
                    <Paragraph marginTop="$2">Loading documents...</Paragraph>
                </YStack>
            ) : error ? (
                <YStack alignItems="center" padding="$8">
                    <Paragraph color="$red10">{error}</Paragraph>
                    <Button
                        onPress={() => navigation.goBack()}
                        marginTop="$2"
                        backgroundColor={colors.primary}
                        color={colors.onPrimary}
                    >
                        Go Back
                    </Button>
                </YStack>
            ) : documents.length === 0 ? (
                <YStack alignItems="center" padding="$8" space="$2">
                    <Feather name="file" size={40} color={colors.textSecondary} />
                    <Paragraph color="$gray10">No documents shared yet</Paragraph>
                    <Button
                        onPress={() => navigation.goBack()}
                        marginTop="$2"
                        backgroundColor={colors.primary}
                        color={colors.onPrimary}
                    >
                        Go Back
                    </Button>
                </YStack>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack marginBottom="$3" mt="$4">
                        {documents.map(renderDocumentItem)}
                    </YStack>
                </ScrollView>
            )}

            {/* Render the modal sheets */}
            <OptionsSheet />
            <PreviewSheet />
        </View>
    );
};