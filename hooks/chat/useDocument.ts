import { useAuth } from '@/hooks/auth/useAuth';
import { supabase } from '@/supabase/client';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

type SharedDocument = {
    id: string;
    name: string;
    uri: string;
    size: number;
    type: string;
    uploaded: boolean;
    progress?: number;
    error?: string;
    storagePath?: string;
};

type DocumentSharingHook = {
    documents: SharedDocument[];
    pickDocument: () => Promise<void>;
    uploadDocument: (doc: SharedDocument) => Promise<string | null>;
    removeDocument: (id: string) => Promise<void>;
    clearDocuments: () => void;
    isUploading: boolean;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DOCUMENTS_BUCKET = 'chat-documents';

export const useDocumentSharing = (chatId: string): DocumentSharingHook => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<SharedDocument[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const pickDocument = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
                multiple: false,
            });

            if (result.canceled || !result.assets?.[0]) return;

            const file = result.assets[0];
            const fileInfo = await FileSystem.getInfoAsync(file.uri);

            if (!fileInfo.exists) {
                Alert.alert('Error', 'File does not exist');
                return;
            }

            if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE) {
                Alert.alert('Error', 'File too large. Maximum size is 10MB');
                return;
            }

            const newDoc: SharedDocument = {
                id: `${Date.now()}-${file.name}`,
                name: file.name,
                uri: file.uri,
                size: file.size || 0,
                type: file.mimeType || 'application/octet-stream',
                uploaded: false,
            };

            setDocuments(prev => [...prev, newDoc]);
        } catch (error) {
            console.error('Document picker error:', error);
            Alert.alert('Error', 'Failed to select document');
        }
    }, []);

    const uploadDocument = useCallback(async (doc: SharedDocument): Promise<string | null> => {
        if (!user?.id || !chatId) {
            Alert.alert('Error', 'User not authenticated or chat not selected');
            return null;
        }

        try {
            setIsUploading(true);
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? { ...d, progress: 0 } : d
            ));

            const filePath = `chats/${chatId}/${user.id}/documents/${Date.now()}-${doc.name}`;

            // Read file as base64
            const base64Data = await FileSystem.readAsStringAsync(doc.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Convert to ArrayBuffer
            const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

            // Upload to Supabase
            const { data, error } = await supabase.storage
                .from(DOCUMENTS_BUCKET)
                .upload(filePath, buffer, {
                    contentType: doc.type,
                    upsert: false,
                    cacheControl: '3600',
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(DOCUMENTS_BUCKET)
                .getPublicUrl(filePath);

            // Update document state
            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? {
                    ...d,
                    uploaded: true,
                    progress: 100,
                    storagePath: filePath
                } : d
            ));

            return publicUrl;
        } catch (error) {
            console.error('Upload failed:', error);
            const message = error instanceof Error ? error.message : 'Upload failed';

            setDocuments(prev => prev.map(d =>
                d.id === doc.id ? {
                    ...d,
                    error: message,
                    progress: undefined
                } : d
            ));

            Alert.alert('Upload Error', message);
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [chatId, user?.id]);

    const removeDocument = useCallback(async (id: string) => {
        try {
            const docToRemove = documents.find(d => d.id === id);
            if (!docToRemove) return;

            // Delete from storage if uploaded
            if (docToRemove.uploaded && docToRemove.storagePath) {
                const { error } = await supabase.storage
                    .from(DOCUMENTS_BUCKET)
                    .remove([docToRemove.storagePath]);

                if (error) throw error;
            }

            // Delete local file
            try {
                await FileSystem.deleteAsync(docToRemove.uri);
            } catch (fileError) {
                console.warn('Local file deletion failed:', fileError);
            }

            setDocuments(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error('Deletion failed:', error);
            Alert.alert('Error', 'Failed to remove document');
        }
    }, [documents]);

    const clearDocuments = useCallback(() => {
        // Clean up files in background
        documents.forEach(async (doc) => {
            try {
                await FileSystem.deleteAsync(doc.uri);
            } catch (error) {
                console.warn('Local file cleanup failed:', error);
            }
        });
        setDocuments([]);
    }, [documents]);

    return {
        documents,
        pickDocument,
        uploadDocument,
        removeDocument,
        clearDocuments,
        isUploading,
    };

};