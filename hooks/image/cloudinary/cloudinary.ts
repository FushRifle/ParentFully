import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

const CLOUDINARY_UPLOAD_PRESET = 'parentfully';
const CLOUDINARY_CLOUD_NAME = 'dug6225go';

export default function useImageUpload() {
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [uploadError, setuploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const pickImage = async () => {
        setIsUploading(true);
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images as any,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets.length > 0) {
                const image = result.assets[0];
                const file = {
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: 'child.jpg',
                };

                const formData = new FormData();
                formData.append('file', file as any);
                formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
                formData.append('folder', 'parentfully/images');

                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.secure_url) {
                    setTempImage(data.secure_url);
                } else {
                    console.error('Cloudinary Upload Error:', data);
                }
            }
        } catch (error) {
            console.error('Image picking/upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return {
        pickImage,
        tempImage,
        isUploading,
        uploadError,
        setTempImage,
    };
}