import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

type FileType = 'pdf' | 'word' | 'excel' | 'powerpoint' | 'image' | 'text' | 'other';

interface DocumentViewerProps {
    uri: string;
    name: string;
    type: string;
    onClose: () => void;
    onDelete?: () => void;
}

export const DocumentViewer = ({ uri, name, type, onClose, onDelete }: DocumentViewerProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localUri, setLocalUri] = useState<string | null>(null);

    const downloadFile = async (): Promise<string> => {
        const fileUri = `${FileSystem.cacheDirectory}${name}`;
        const downloadResumable = FileSystem.createDownloadResumable(uri, fileUri, {});
        const downloadResult = await downloadResumable.downloadAsync();
        if (!downloadResult?.uri) throw new Error('Failed to download file');
        return downloadResult.uri;
    };

    const handleOpenWith = async (): Promise<void> => {
        try {
            setLoading(true);
            setError('');

            const downloadedUri = await downloadFile();
            setLocalUri(downloadedUri);

            if (Platform.OS === 'android') {
                await Sharing.shareAsync(downloadedUri, {
                    mimeType: type || '*/*',
                    dialogTitle: `Open ${name}`,
                    UTI: type // iOS only
                });
            } else {
                // For iOS
                await Sharing.shareAsync(downloadedUri, {
                    mimeType: type || '*/*',
                    dialogTitle: `Open ${name}`,
                    UTI: type // iOS only
                });
            }

            setLoading(false);
        } catch (err) {
            console.error('Error opening document:', err);
            setError(err instanceof Error ? err.message : 'Failed to open document');
            setLoading(false);
        }
    };

    const handleShare = async (): Promise<void> => {
        try {
            setLoading(true);
            const downloadedUri = localUri || await downloadFile();
            setLocalUri(downloadedUri);

            await Sharing.shareAsync(downloadedUri, {
                mimeType: type || '*/*',
                dialogTitle: `Share ${name}`,
                UTI: type // iOS only
            });

            setLoading(false);
        } catch (err) {
            console.error('Error sharing document:', err);
            setError(err instanceof Error ? err.message : 'Failed to share document');
            setLoading(false);
        }
    };

    return (
        <Modal visible={true} transparent animationType="fade">
            <Pressable style={styles.modalBackground} onPress={onClose}>
                <YStack
                    width="90%"
                    height="60%"
                    backgroundColor="$background"
                    borderRadius="$4"
                    padding="$4"
                    onPress={(e) => e.stopPropagation()}
                >
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
                        <Text fontSize="$5" fontWeight="bold" numberOfLines={1} flex={1}>
                            {name}
                        </Text>
                        <XStack space="$2">
                            {onDelete && (
                                <Button
                                    circular
                                    icon={<MaterialIcons name="delete" size={24} color="red" />}
                                    onPress={onDelete}
                                    theme="red"
                                />
                            )}
                            <Button
                                circular
                                icon={<MaterialIcons name="close" size={24} />}
                                onPress={onClose}
                            />
                        </XStack>
                    </XStack>

                    {loading ? (
                        <YStack flex={1} justifyContent="center" alignItems="center">
                            <Spinner size="large" />
                            <Text marginTop="$2">Preparing document...</Text>
                        </YStack>
                    ) : error ? (
                        <YStack flex={1} justifyContent="center" alignItems="center">
                            <MaterialIcons name="error" size={40} color="red" />
                            <Text marginTop="$2">{error}</Text>
                            <Button marginTop="$2" onPress={handleOpenWith}>
                                Retry
                            </Button>
                        </YStack>
                    ) : (
                        <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
                            <MaterialIcons name="description" size={60} color="#666" />
                            <Text fontSize="$6" marginBottom="$4">
                                {name}
                            </Text>

                            <XStack space="$2" justifyContent="center" marginTop="$4">
                                <Button
                                    icon={<MaterialIcons name="open-in-new" size={20} />}
                                    onPress={handleOpenWith}
                                    theme="blue"
                                >
                                    Open With
                                </Button>
                                <Button
                                    icon={<MaterialIcons name="share" size={20} />}
                                    onPress={handleShare}
                                    theme="green"
                                >
                                    Share
                                </Button>
                            </XStack>
                        </YStack>
                    )}
                </YStack>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});