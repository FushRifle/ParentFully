import * as FileSystem from 'expo-file-system';
import React from 'react';
import { Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import {
    Adapt, Button, Dialog,
    Paragraph,
    Sheet,
    Spinner,
    View,
    XStack,
    YStack
} from 'tamagui';

export const useFilePreviewSheet = ({
    file,
    onDownload,
}: {
    file: any;
    onDownload: () => void;
}) => {
    const [open, setOpen] = React.useState(false);
    const [localUri, setLocalUri] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);

    const openPreviewSheet = async (fileToPreview: any) => {
        try {
            setLoading(true);
            setOpen(true);

            // For PDFs and other viewable documents, we can try to display directly
            if (fileToPreview.uri.match(/\.pdf$/i)) {
                // No need to download for PDFs - WebView can handle them directly
                return;
            }

            // For other file types, try to download a temporary copy
            const tempUri = `${FileSystem.cacheDirectory}${fileToPreview.name}`;
            await FileSystem.downloadAsync(fileToPreview.uri, tempUri);
            setLocalUri(tempUri);
        } catch (error) {
            Alert.alert('Preview Error', 'Could not open this file type for preview');
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const closePreviewSheet = () => {
        setOpen(false);
        if (localUri) {
            setTimeout(() => {
                FileSystem.deleteAsync(localUri).catch(() => { });
                setLocalUri(null);
            }, 1000);
        }
    };

    const getPreviewSource = () => {
        if (!file) return { uri: '' };

        if (file.uri.match(/\.pdf$/i)) {
            return { uri: file.uri };
        }

        if (localUri) {
            return { uri: localUri };
        }

        return { uri: file.uri };
    };

    const PreviewSheet = () => (
        <Dialog modal open={open} onOpenChange={setOpen}>
            <Adapt when="sm" platform="touch">
                <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
                    <Sheet.Frame padding="$4" space>
                        <Adapt.Contents />
                    </Sheet.Frame>
                    <Sheet.Overlay
                        animation="lazy"
                        enterStyle={{ opacity: 0 }}
                        exitStyle={{ opacity: 0 }}
                    />
                </Sheet>
            </Adapt>

            <Dialog.Portal>
                <Dialog.Content
                    bordered
                    elevate
                    key="content"
                    animateOnly={['transform', 'opacity']}
                    animation={[
                        'quick',
                        {
                            opacity: {
                                overshootClamping: true,
                            },
                        },
                    ]}
                    enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
                    exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
                    space
                    width="90%"
                    height="80%"
                >
                    <YStack flex={1} space="$3">
                        <Dialog.Title>{file?.name || 'Document Preview'}</Dialog.Title>

                        {loading ? (
                            <YStack flex={1} alignItems="center" justifyContent="center">
                                <Spinner size="large" />
                                <Paragraph marginTop="$2">Loading document...</Paragraph>
                            </YStack>
                        ) : (
                            <View flex={1}>
                                <WebView
                                    source={getPreviewSource()}
                                    style={{ flex: 1 }}
                                    startInLoadingState={true}
                                    scalesPageToFit={true}
                                    allowsInlineMediaPlayback={true}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    onError={(syntheticEvent) => {
                                        console.error('WebView error:', syntheticEvent.nativeEvent);
                                        Alert.alert('Error', 'Could not display this document');
                                        closePreviewSheet();
                                    }}
                                    renderError={(errorDomain, errorCode, errorDesc) => (
                                        <YStack flex={1} alignItems="center" justifyContent="center">
                                            <Paragraph>Could not display document</Paragraph>
                                            <Paragraph>{errorDesc}</Paragraph>
                                        </YStack>
                                    )}
                                />
                            </View>
                        )}

                        <XStack space="$2" justifyContent="center">
                            <Button
                                theme="green"
                                onPress={() => {
                                    onDownload();
                                    closePreviewSheet();
                                }}
                            >
                                Download
                            </Button>
                            <Button
                                theme="blue"
                                onPress={closePreviewSheet}
                            >
                                Close
                            </Button>
                        </XStack>
                    </YStack>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );

    return {
        openPreviewSheet,
        closePreviewSheet,
        PreviewSheet,
    };
};