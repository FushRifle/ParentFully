import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/supabase/client';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type Picture = {
    id: string;
    uri: string;
    name: string;
    width: number;
    height: number;
    uploaded: boolean;
    progress?: number;
    error?: string;
    size?: number;
    mimeType?: string;
};

type PicturesHook = {
    pictures: Picture[];
    isUploading: boolean;
    pickImage: () => Promise<void>;
    takePhoto: () => Promise<void>;
    uploadPicture: (picture: Picture) => Promise<string | null>;
    removePicture: (id: string) => Promise<void>;
    clearPictures: () => Promise<void>;
};


const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_BUCKET = 'chat-images';

export const usePictures = (chatId: string): PicturesHook => {
    const { user } = useAuth();
    const [pictures, setPictures] = useState<Picture[]>([]);
    const [bucketReady, setBucketReady] = useState(false);
    const isUploading = pictures.some(p => !p.uploaded && p.progress && p.progress < 100);

    // Verify bucket exists and is accessible
    useEffect(() => {
        const verifyBucketAccess = async () => {
            try {
                // Simple check to verify bucket access
                const { data, error } = await supabase.storage
                    .from(IMAGE_BUCKET)
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

    const requestPermissions = useCallback(async () => {
        const [cameraStatus, libraryStatus] = await Promise.all([
            ImagePicker.requestCameraPermissionsAsync(),
            ImagePicker.requestMediaLibraryPermissionsAsync()
        ]);

        if (cameraStatus.status !== 'granted' || libraryStatus.status !== 'granted') {
            Alert.alert(
                'Permission required',
                'We need camera and gallery access for this feature'
            );
            return false;
        }
        return true;
    }, []);

    const processImage = useCallback(async (result: ImagePicker.ImagePickerResult) => {
        if (result.canceled || !result.assets?.[0]) return;

        const asset = result.assets[0];
        const fileInfo = await FileSystem.getInfoAsync(asset.uri);

        if (!fileInfo.exists) {
            Alert.alert('Error', 'Selected file does not exist');
            return;
        }

        // Check file size immediately
        if (fileInfo.size && fileInfo.size > MAX_IMAGE_SIZE) {
            Alert.alert('Error', 'Image is too large (max 10MB)');
            return;
        }

        // Get file extension from URI
        const extension = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

        const newPicture: Picture = {
            id: `${Date.now()}`,
            uri: asset.uri,
            name: `photo-${Date.now()}.${extension}`,
            width: asset.width || 0,
            height: asset.height || 0,
            uploaded: false,
            size: fileInfo.size,
            mimeType
        };

        setPictures(prev => [...prev, newPicture]);
    }, []);

    const pickImage = useCallback(async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                exif: false, // Don't include EXIF data for privacy
            });

            await processImage(result);
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    }, [processImage, requestPermissions]);

    const takePhoto = useCallback(async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) return;

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                exif: false,
            });

            await processImage(result);
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    }, [processImage, requestPermissions]);

    const removePicture = useCallback(async (id: string) => {
        try {
            const pictureToRemove = pictures.find(p => p.id === id);
            if (!pictureToRemove) return;

            // Delete local file
            try {
                await FileSystem.deleteAsync(pictureToRemove.uri);
            } catch (fileError) {
                console.warn('Failed to delete local file:', fileError);
            }

            setPictures(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to remove picture:', error);
            Alert.alert('Error', 'Failed to remove picture');
        }
    }, [pictures]);

    const clearPictures = useCallback(async () => {
        try {
            // Delete all local files
            await Promise.all(
                pictures.map(pic =>
                    FileSystem.deleteAsync(pic.uri).catch(e =>
                        console.warn(`Failed to delete ${pic.uri}:`, e)
                    )
                )
            );
            setPictures([]);
        } catch (error) {
            console.error('Failed to clear pictures:', error);
            Alert.alert('Error', 'Failed to clear pictures');
        }
    }, [pictures]);

    const uploadPicture = useCallback(async (pic: Picture): Promise<string | null> => {
        if (!user?.id) {
            Alert.alert('Error', 'User not authenticated');
            return null;
        }

        try {
            // Verify file exists before upload
            const fileInfo = await FileSystem.getInfoAsync(pic.uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            // Update with upload progress
            setPictures(prev => prev.map(p =>
                p.id === pic.id ? { ...p, progress: 0 } : p
            ));

            // Create proper file path with user ID
            const filePath = `chats/${chatId}/${user.id}/images/${Date.now()}-${pic.name}`;

            // Read file as base64
            const base64Data = await FileSystem.readAsStringAsync(pic.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert to Uint8Array
            const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

            // Get current session
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                throw new Error('Not authenticated');
            }

            // Create signed upload URL with proper token
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                .from(IMAGE_BUCKET)
                .createSignedUploadUrl(filePath, {
                    upsert: false,
                });

            if (signedUrlError || !signedUrlData?.signedUrl) {
                throw signedUrlError || new Error('Failed to get signed URL');
            }

            // Upload using fetch with progress tracking
            const xhr = new XMLHttpRequest();
            const uploadPromise = new Promise<void>((resolve, reject) => {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setPictures(prev => prev.map(p =>
                            p.id === pic.id ? { ...p, progress } : p
                        ));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                };

                xhr.onerror = () => reject(new Error('Upload failed'));

                xhr.open('PUT', signedUrlData.signedUrl, true);
                xhr.setRequestHeader('Content-Type', pic.mimeType || 'image/jpeg');
                xhr.send(buffer);
            });

            await uploadPromise;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(IMAGE_BUCKET)
                .getPublicUrl(filePath);

            // Update state
            setPictures(prev => prev.map(p =>
                p.id === pic.id ? {
                    ...p,
                    uploaded: true,
                    progress: 100,
                    storagePath: filePath
                } : p
            ));

            return publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            const message = error instanceof Error ? error.message : 'Upload failed';

            setPictures(prev => prev.map(p =>
                p.id === pic.id ? {
                    ...p,
                    error: message,
                    progress: undefined
                } : p
            ));

            Alert.alert('Upload Error', message);
            return null;
        }
    }, [chatId, user?.id]);

    return {
        pictures,
        isUploading,
        pickImage,
        takePhoto,
        uploadPicture,
        removePicture,
        clearPictures,
    };
};