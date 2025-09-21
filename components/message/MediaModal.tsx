import { useChatMedia } from '@/hooks/chat/useFetchMedia';
import { useTheme } from '@/styles/ThemeContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, Pressable, View } from 'react-native';
import {
    Button,
    H4,
    Image,
    Paragraph,
    Portal,
    ScrollView,
    Sheet,
    Spinner,
    Text,
    XStack,
    YStack,
} from 'tamagui';

type MediaModalProps = {
    open: boolean;
    onClose: () => void;
    chatId: string;
};

export const MediaModal = ({ open, onClose, chatId }: MediaModalProps) => {
    const { colors } = useTheme();
    const { media, loading, error } = useChatMedia(chatId);
    const [previewItem, setPreviewItem] = useState<typeof media[0] | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const mediaSections = [
        {
            title: 'Photos',
            items: media.filter(item =>
                ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].some(ext =>
                    item.name.toLowerCase().endsWith(ext)
                )
            ),
            icon: 'image',
        },
        {
            title: 'Videos',
            items: media.filter(item =>
                ['mp4', 'mov', 'avi', 'mkv', 'webm'].some(ext =>
                    item.name.toLowerCase().endsWith(ext)
                )
            ),
            icon: 'video',
        },
        {
            title: 'Audio',
            items: media.filter(item =>
                ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'].some(ext =>
                    item.name.toLowerCase().endsWith(ext)
                )
            ),
            icon: 'music',
        },
        {
            title: 'Documents',
            items: media.filter(item =>
                ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].some(ext =>
                    item.name.toLowerCase().endsWith(ext)
                )
            ),
            icon: 'file',
        },
    ];

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return { icon: 'picture-as-pdf', color: '#f40f02' };
            case 'doc':
            case 'docx':
                return { icon: 'description', color: '#2b579a' };
            case 'xls':
            case 'xlsx':
                return { icon: 'grid-on', color: '#217346' };
            case 'ppt':
            case 'pptx':
                return { icon: 'slideshow', color: '#d24726' };
            case 'mp3':
            case 'm4a':
                return { icon: 'audiotrack', color: '#ff5722' };
            case 'mp4':
            case 'mov':
                return { icon: 'videocam', color: '#e91e63' };
            default:
                return { icon: 'insert-drive-file', color: colors.primary };
        }
    };

    const handlePreview = useCallback(async (item: typeof media[0]) => {
        try {
            const name = item.name.toLowerCase();

            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => name.endsWith(ext)) ||
                ['mp4', 'mov'].some(ext => name.endsWith(ext))) {
                setPreviewItem(item);
                return;
            }

            if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].some(ext => name.endsWith(ext))) {
                try {
                    await WebBrowser.openBrowserAsync(item.uri);
                } catch {
                    if (Platform.OS === 'android') {
                        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', { data: item.uri });
                    } else {
                        Alert.alert('Cannot open file', 'No suitable app installed');
                    }
                }
                return;
            }

            if (['mp3', 'm4a', 'wav'].some(ext => name.endsWith(ext))) {
                setIsDownloading(true);
                const download = await FileSystem.downloadAsync(item.uri, FileSystem.documentDirectory + item.name);
                setIsDownloading(false);
                Alert.alert('Audio downloaded', `Ready to play: ${item.name}`);
                return;
            }

            Alert.alert('Open File', 'What would you like to do?', [
                { text: 'Download', onPress: () => handleDownload(item) },
                { text: 'Share', onPress: () => handleShare(item) },
                { text: 'Cancel', style: 'cancel' },
            ]);
        } catch (err) {
            console.error('Preview error:', err);
            Alert.alert('Error', 'Could not open file');
        }
    }, []);

    const handleDownload = useCallback(async (item: typeof media[0]) => {
        try {
            setIsDownloading(true);
            const download = await FileSystem.downloadAsync(item.uri, FileSystem.documentDirectory + item.name);
            Alert.alert('Download complete', `Saved to: ${download.uri}`);
        } catch (err: any) {
            Alert.alert('Download failed', err.message ?? 'Unknown error');
        } finally {
            setIsDownloading(false);
        }
    }, []);

    const handleShare = useCallback(async (item: typeof media[0]) => {
        Alert.alert('Share', `Sharing ${item.name}`);
    }, []);

    const renderMediaItem = (item: typeof media[0]) => {
        const { icon, color } = getFileIcon(item.name);
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif']
            .some(ext => item.name.toLowerCase().endsWith(ext));

        return (
            <Pressable
                key={item.id || item.uri}
                onPress={() => handlePreview(item)}
                onLongPress={() => Alert.alert('File Options', item.name, [
                    { text: 'Preview', onPress: () => handlePreview(item) },
                    { text: 'Download', onPress: () => handleDownload(item) },
                    { text: 'Share', onPress: () => handleShare(item) },
                    { text: 'Cancel', style: 'cancel' },
                ])}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.8 : 1,
                    width: '32%',
                    marginBottom: 8,
                })}
            >
                <YStack
                    space="$2"
                    padding="$2"
                    borderRadius="$3"
                    backgroundColor={colors.cardBackground}
                    alignItems="center"
                >
                    {isImage ? (
                        <Image
                            source={{ uri: item.uri }}
                            width={80}
                            height={80}
                            borderRadius="$2"
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: colors.cardBackground,
                                borderRadius: 8,
                            }}
                        >
                            <MaterialIcons name={icon as any} size={32} color={color} />
                            {['mp4', 'mov'].some(ext => item.name.toLowerCase().endsWith(ext)) && (
                                <MaterialIcons
                                    name="play-circle-filled"
                                    size={24}
                                    color="white"
                                    style={{
                                        position: 'absolute',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        borderRadius: 20,
                                    }}
                                />
                            )}
                        </View>
                    )}
                    <Text numberOfLines={1} fontSize="$3" fontWeight="500" color={colors.text} textAlign="center">
                        {item.name.length > 15
                            ? `${item.name.substring(0, 12)}...${item.name.split('.').pop()}`
                            : item.name}
                    </Text>
                    <Text fontSize="$1" color={colors.textSecondary}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </Text>
                </YStack>
            </Pressable>
        );
    };

    useEffect(() => {
        if (!open) {
            setPreviewItem(null);
        }
    }, [open]);

    return (
        <>
            <Sheet
                open={open}
                onOpenChange={(val: any) => {
                    if (!val) {
                        onClose();
                        setPreviewItem(null);
                    }
                }}
                snapPoints={[85]}
                dismissOnSnapToBottom
                modal
            >
                <Sheet.Frame
                    padding="$4"
                    backgroundColor={colors.background}
                    borderTopLeftRadius="$6"
                    borderTopRightRadius="$6"
                >
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                        <H4 fontSize="$6" fontWeight="700">Shared Media</H4>
                        <Button unstyled onPress={onClose} circular padding="$2" hoverStyle={{ backgroundColor: colors.cardBackground }}>
                            <Feather name="x" size={20} color={colors.text} />
                        </Button>
                    </XStack>

                    {loading ? (
                        <YStack alignItems="center" padding="$8">
                            <Paragraph>Loading shared files...</Paragraph>
                        </YStack>
                    ) : error ? (
                        <YStack alignItems="center" padding="$8">
                            <Paragraph color="$red10">{error}</Paragraph>
                        </YStack>
                    ) : media.length === 0 ? (
                        <YStack alignItems="center" padding="$8" space="$2">
                            <Feather name="folder" size={40} color={colors.textSecondary} />
                            <Paragraph color="$gray10">No files shared yet</Paragraph>
                        </YStack>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {mediaSections.map(section =>
                                section.items.length > 0 && (
                                    <YStack key={section.title} marginBottom="$3">
                                        <XStack alignItems="center" space="$2" marginBottom="$3" mt="$5">
                                            <Feather name={section.icon as any} size={16} color={colors.primary} />
                                            <Text fontSize="$4" fontWeight="600" color={colors.text}>
                                                {section.title} · {section.items.length}
                                            </Text>
                                        </XStack>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                            {section.items.map(renderMediaItem)}
                                        </View>
                                    </YStack>
                                )
                            )}
                        </ScrollView>
                    )}
                </Sheet.Frame>
            </Sheet>

            {/* Preview Modal */}
            {previewItem && (
                <Portal>
                    <View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.95)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 999,
                        }}
                    >
                        <Button
                            position="absolute"
                            top={40}
                            right={20}
                            circular
                            onPress={() => setPreviewItem(null)}
                            backgroundColor="rgba(255,255,255,0.2)"
                        >
                            <Feather name="x" size={24} color="white" />
                        </Button>

                        {['jpg', 'jpeg', 'png', 'gif'].some(ext => previewItem.name.toLowerCase().endsWith(ext)) ? (
                            <Image source={{ uri: previewItem.uri }} style={{ width: '100%', height: '70%' }} resizeMode="contain" />
                        ) : ['mp4', 'mov'].some(ext => previewItem.name.toLowerCase().endsWith(ext)) ? (
                            <Video source={{ uri: previewItem.uri }} style={{ width: '100%', height: '70%' }} useNativeControls isLooping />
                        ) : null}

                        <YStack position="absolute" bottom={40} alignItems="center">
                            <Text color="white" fontSize="$5" marginBottom="$2">
                                {previewItem.name}
                            </Text>
                            <XStack space="$3">
                                <Button onPress={() => handleDownload(previewItem)} icon={isDownloading ? <Spinner /> : <Feather name="download" />}>
                                    Download
                                </Button>
                                <Button onPress={() => handleShare(previewItem)} icon={<Feather name="share-2" />}>
                                    Share
                                </Button>
                            </XStack>
                        </YStack>
                    </View>
                </Portal>
            )}
        </>
    );
};
