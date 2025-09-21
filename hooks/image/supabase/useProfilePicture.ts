// hooks/useUploadPhoto.ts
import { supabase } from '@/supabase/client'
import * as FileSystem from 'expo-file-system'
import { useState } from 'react'

type UploadType = 'user' | 'child'

export function useUploadPhoto() {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const uploadPhoto = async (fileUri: string, id: string, type: UploadType) => {
        try {
            setUploading(true)
            setError(null)

            const bucket = type === 'user' ? 'user-photos' : 'child-photos'
            const fileExt = fileUri.split('.').pop()
            const fileName = `${id}_${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Convert local file to a Blob (for RN with Expo)
            const fileData = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            })
            const fileBlob = decodeBase64ToBlob(fileData, `image/${fileExt}`)

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, fileBlob, {
                    upsert: true,
                    contentType: `image/${fileExt}`,
                })

            if (uploadError) throw uploadError

            // Get public URL
            const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
            return data.publicUrl
        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Failed to upload photo')
            return null
        } finally {
            setUploading(false)
        }
    }

    return { uploadPhoto, uploading, error }
}

// helper for RN to convert base64 string to Blob
function decodeBase64ToBlob(base64: string, type: string) {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type })
}
