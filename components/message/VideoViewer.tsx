import { useTheme } from '@/styles/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';

type VideoViewerProps = {
    uri: string;
    name: string;
    onClose: () => void;
    onDownload?: (uri: string) => Promise<void>;
    onShare?: (uri: string) => Promise<void>;
};

export const VideoViewer = ({ uri, name, onClose, onDownload, onShare }: VideoViewerProps) => {
    const { colors } = useTheme();
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<any>({});
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setWindowDimensions(window);
        });
        return () => subscription?.remove();
    }, []);

    const handleDownload = async () => {
        if (!onDownload) return;

        try {
            setIsDownloading(true);
            await onDownload(uri);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        if (!onShare) return;

        try {
            setIsSharing(true);
            await onShare(uri);
        } catch (error) {
            console.error('Share failed:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const videoHeight = Math.min(windowDimensions.height * 0.7, windowDimensions.width * 1.5);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Button
                position="absolute"
                top={40}
                right={20}
                zIndex={10}
                circular
                onPress={onClose}
                backgroundColor="rgba(255,255,255,0.2)"
                icon={<Feather name="x" size={24} color="white" />}
            />

            <Video
                ref={videoRef}
                style={[styles.video, { height: videoHeight }]}
                source={{ uri }}
                useNativeControls
                isLooping
                onPlaybackStatusUpdate={setStatus}
            />

            <YStack position="absolute" bottom={40} alignItems="center" width="100%">
                <Text color="white" fontSize="$5" marginBottom="$2">
                    {name}
                </Text>

                <XStack space="$3" justifyContent="center">
                    {onDownload && (
                        <Button
                            onPress={handleDownload}
                            backgroundColor="rgba(255,255,255,0.2)"
                            icon={isDownloading ? <Spinner /> : <Feather name="download" color="white" />}
                        >
                            <Text color="white">Download</Text>
                        </Button>
                    )}

                    {onShare && (
                        <Button
                            onPress={handleShare}
                            backgroundColor="rgba(255,255,255,0.2)"
                            icon={isSharing ? <Spinner /> : <Feather name="share-2" color="white" />}
                        >
                            <Text color="white">Share</Text>
                        </Button>
                    )}
                </XStack>
            </YStack>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.9)'
    },
    video: {
        width: '100%',
        alignSelf: 'center',
    },
});