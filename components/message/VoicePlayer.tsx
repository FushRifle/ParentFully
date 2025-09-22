import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { Button, Slider, Text, XStack, YStack } from 'tamagui';

export const VoiceMessagePlayer = ({ uri }: { uri: string }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const { colors } = useTheme();
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [localUri, setLocalUri] = useState<string>(uri);
    const animation = useRef(new Animated.Value(1)).current;
    const isMounted = useRef(true);

    const isRemote = uri.startsWith('http');

    // Animate waveform
    const startWaveform = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1.2,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.ease,
                }),
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                    easing: Easing.ease,
                }),
            ])
        ).start();
    };

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync().catch(err => console.error('Unload error:', err));
            }
            isMounted.current = false;
        };
    }, [sound]);

    // Cache remote audio locally if needed
    useEffect(() => {
        const prepareAudio = async () => {
            try {
                setIsLoading(true);
                setError(null);

                if (isRemote) {
                    const filename = uri.split('/').pop() || `audio_${Date.now()}`;
                    if (!FileSystem.cacheDirectory) {
                        throw new Error('Cache directory is not available');
                    }
                    const fileUri = FileSystem.cacheDirectory + filename;
                    const fileInfo = await FileSystem.getInfoAsync(fileUri);

                    if (!fileInfo.exists) {
                        const download = FileSystem.createDownloadResumable(uri, fileUri);
                        const result = await download.downloadAsync();
                        if (!result || !result.uri) throw new Error('Download failed');
                        setLocalUri(result.uri);
                    } else {
                        setLocalUri(fileUri);
                    }
                }
            } catch (err) {
                console.error('Caching error:', err);
                setError('Failed to cache audio');
            } finally {
                setIsLoading(false);
            }
        };

        prepareAudio();
    }, [uri]);

    // Load audio once localUri is ready
    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                setError(null);

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });

                const { sound: loadedSound, status } = await Audio.Sound.createAsync(
                    { uri: localUri },
                    {
                        shouldPlay: false,
                        isMuted: false,
                        isLooping: false,
                        volume: 1.0,
                        rate: 1.0,
                        shouldCorrectPitch: false,
                    },
                    onPlaybackStatusUpdate
                );

                if (isMounted.current) {
                    setSound(loadedSound);
                    if (status.isLoaded && typeof status.durationMillis === 'number') {
                        setDuration(status.durationMillis);
                    }
                }
            } catch (err) {
                console.error('Error loading audio:', err);
                if (isMounted.current) setError('Playback not supported');
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };

        if (localUri) load();
    }, [localUri]);

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            if (status.error) {
                console.error('Playback error:', status.error);
                setError('Playback error');
                setIsPlaying(false);
            }
            return;
        }

        setPosition(status.positionMillis ?? 0);
        setIsPlaying(status.isPlaying ?? false);

        if (status.didJustFinish) {
            setIsPlaying(false);
            sound?.setPositionAsync(0).catch(err => console.error('Reset error:', err));
        }
    };

    const playPause = async () => {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
                startWaveform();
            }
        } catch (err) {
            console.error('Play/pause error:', err);
            setError('Playback failed');
        }
    };

    const onSeek = async (val: number) => {
        if (!sound || duration <= 0) return;

        try {
            const seekMs = Math.floor(val * duration);
            await sound.setPositionAsync(seekMs);
        } catch (err) {
            console.error('Seek error:', err);
        }
    };

    const formatTime = (ms: number) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <YStack width={200}>
            <XStack alignItems="center" space="$2">
                <Button
                    circular
                    size="$2"
                    icon={
                        isLoading ? (
                            <MaterialIcons name="hourglass-empty" size={20} color="white" />
                        ) : error ? (
                            <MaterialIcons name="error" size={20} color="white" />
                        ) : (
                            <MaterialIcons
                                name={isPlaying ? 'pause' : 'play-arrow'}
                                size={20}
                                color="white"
                            />
                        )
                    }
                    onPress={playPause}
                    backgroundColor={error ? '$red10' : '$blue10'}
                    disabled={isLoading}
                />
                {!isLoading && !error && (
                    <Animated.View
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 6,
                            backgroundColor: isPlaying ? '#007AFF' : '#ccc',
                            transform: [{ scale: animation }],
                        }}
                    />
                )}
                <Text fontSize="$2" color={error ? '$red10' : '$color'}>
                    {error ? 'Error' : `${formatTime(position)} / ${formatTime(duration)}`}
                </Text>
            </XStack>

            {!error && (
                <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={[duration > 0 ? position / duration : 0]}
                    onValueChange={([val]) => onSeek(val)}
                    width="100%"
                    marginTop="$2"
                    disabled={isLoading || duration <= 0}
                />
            )}
        </YStack>
    );
};
