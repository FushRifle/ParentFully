import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/supabase/client';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

const VOICE_BUCKET = 'chat-voices';

type VoiceRecording = {
    id: string;
    uri: string;
    duration: number;
    name: string;
    uploaded: boolean;
    progress?: number;
    error?: string;
    storagePath?: string;
};

export const useVoice = (chatId: string) => {
    const { user } = useAuth();
    const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [bucketReady, setBucketReady] = useState(false);

    // Verify bucket exists and is accessible
    useEffect(() => {
        const verifyBucketAccess = async () => {
            try {
                // Simple check to verify bucket access
                const { data, error } = await supabase.storage
                    .from(VOICE_BUCKET)
                    .list();

                if (error && error.message.includes('not found')) {
                    Alert.alert(
                        'Configuration Needed',
                        'The voice messages bucket is not configured. Please create a public bucket named "chat-voices" in your Supabase Storage.',
                        [{ text: 'OK' }]
                    );
                    return;
                }

                setBucketReady(true);
            } catch (error) {
                console.error('Bucket verification failed:', error);
            }
        };

        verifyBucketAccess();
    }, []);

    // Clean up recording on unmount
    useEffect(() => () => {
        if (recording) {
            recording.stopAndUnloadAsync();
        }
    }, [recording]);

    const startRecording = useCallback(async () => {
        try {
            if (!bucketReady) {
                throw new Error('Voice messages not configured');
            }

            const [permissionResponse] = await Promise.all([
                Audio.requestPermissionsAsync(),
                Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                }),
            ]);

            if (!permissionResponse.granted) {
                throw new Error('Microphone permission not granted');
            }

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
        } catch (error) {
            console.error('Recording failed:', error);
            const message = error instanceof Error ? error.message : 'Recording failed';
            Alert.alert('Recording Error', message);
        }
    }, [bucketReady]);

    const stopRecording = useCallback(async () => {
        if (!recording) return;

        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            if (!uri) throw new Error('Recording file not found');

            const status = await recording.getStatusAsync();
            const newRecording: VoiceRecording = {
                id: Date.now().toString(),
                uri,
                duration: status.durationMillis || 0,
                name: `voice_${Date.now()}.m4a`,
                uploaded: false
            };

            setRecordings(prev => [...prev, newRecording]);
        } catch (error) {
            console.error('Stop recording failed:', error);
            Alert.alert('Recording Error', 'Failed to save recording');
        } finally {
            setRecording(null);
        }
    }, [recording]);

    const deleteRecording = useCallback(async (id: string) => {
        try {
            const recordingToDelete = recordings.find(r => r.id === id);
            if (!recordingToDelete) return;

            if (recordingToDelete.uploaded && recordingToDelete.storagePath) {
                const { error } = await supabase.storage
                    .from(VOICE_BUCKET)
                    .remove([recordingToDelete.storagePath]);

                if (error) throw error;
            }

            try {
                await FileSystem.deleteAsync(recordingToDelete.uri);
            } catch (fileError) {
                console.warn('Local file deletion failed:', fileError);
            }

            setRecordings(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Deletion failed:', error);
            const message = error instanceof Error ? error.message : 'Deletion failed';
            Alert.alert('Deletion Error', message);
        }
    }, [recordings]);

    const clearRecordings = useCallback(() => {
        // Clean up files in background
        recordings.forEach(async (rec) => {
            try {
                await FileSystem.deleteAsync(rec.uri);
            } catch (error) {
                console.warn('Local file cleanup failed:', error);
            }
        });
        setRecordings([]);
    }, [recordings]);

    const uploadRecording = useCallback(async (rec: VoiceRecording): Promise<string | null> => {
        if (!user?.id || !chatId || !bucketReady) {
            Alert.alert('Upload Error', 'Configuration incomplete');
            return null;
        }

        try {
            // Update with upload progress
            setRecordings(prev => prev.map(r =>
                r.id === rec.id ? { ...r, progress: 0 } : r
            ));

            // Read file as binary data (Uint8Array)
            const fileContent = await FileSystem.readAsStringAsync(rec.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const filePath = `chats/${chatId}/${user.id}/voice/${rec.name}`;

            // Convert base64 to ArrayBuffer
            const binaryString = atob(fileContent);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Attempt direct upload first
            const { error } = await supabase.storage
                .from(VOICE_BUCKET)
                .upload(filePath, bytes, {
                    contentType: 'audio/mp4',
                    upsert: false,
                    cacheControl: '3600',
                });

            if (error) {
                // If direct upload fails, try with signed URL
                const { data: signedUrl } = await supabase.storage
                    .from(VOICE_BUCKET)
                    .createSignedUrl(filePath, 3600);

                if (!signedUrl?.signedUrl) {
                    throw new Error('Failed to get signed URL');
                }

                const uploadResponse = await fetch(signedUrl.signedUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'audio/mp4',
                    },
                    body: bytes,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Signed URL upload failed');
                }
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(VOICE_BUCKET)
                .getPublicUrl(filePath);

            // Update recording state
            setRecordings(prev => prev.map(r =>
                r.id === rec.id ? {
                    ...r,
                    uploaded: true,
                    progress: 100,
                    storagePath: filePath
                } : r
            ));

            return publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            const message = error instanceof Error ? error.message : 'Upload failed';
            setRecordings(prev => prev.map(r =>
                r.id === rec.id ? {
                    ...r,
                    error: message,
                    progress: undefined
                } : r
            ));
            return null;
        }
    }, [chatId, user?.id, bucketReady]);

    return {
        recordings,
        isRecording,
        bucketReady,
        startRecording,
        stopRecording,
        uploadRecording,
        deleteRecording,
        clearRecordings,
    };
};