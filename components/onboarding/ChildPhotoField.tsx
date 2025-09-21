import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Button, Image, Progress, XStack, YStack } from 'tamagui';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const COMPRESSED_WIDTH = 800;
const COMPRESSION_QUALITY = 0.7;

export const ChildPhotoField = ({
    photoUrl,
    uploadProgress,
    onPhotoSelected,
    onRemovePhoto,
}: {
    photoUrl: string | null;
    uploadProgress: number;
    onPhotoSelected: (uri: string) => void;
    onRemovePhoto: () => void;
}) => {
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'We need access to your photos to continue.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (result.canceled) return;

        if (result.assets[0].fileSize && result.assets[0].fileSize > MAX_IMAGE_SIZE) {
            Alert.alert('Image too large', 'Please select an image smaller than 5MB');
            return;
        }

        try {
            const compressedImage = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: COMPRESSED_WIDTH } }],
                {
                    compress: COMPRESSION_QUALITY,
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );

            onPhotoSelected(compressedImage.uri);
        } catch (error) {
            console.error('Image compression failed:', error);
            Alert.alert('Error', 'Failed to process the image');
        }
    };

    return (
        <YStack space="$2">
            <XStack justifyContent="center">
                <Button
                    circular
                    width={150}
                    height={150}
                    onPress={pickImage}
                    position="relative"
                    borderStyle="dashed"
                >
                    {photoUrl ? (
                        <>
                            <Image
                                source={{ uri: photoUrl }}
                                width={150}
                                height={150}
                                borderRadius={75}
                            />
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <YStack
                                    position="absolute"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                    bg="rgba(0,0,0,0.5)"
                                    borderRadius={75}
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    <Progress value={uploadProgress}>
                                        <Progress.Indicator animation="bouncy" />
                                    </Progress>
                                </YStack>
                            )}
                        </>
                    ) : (
                        <Ionicons name="camera" size={32} />
                    )}
                </Button>

                {photoUrl && (
                    <Button
                        position="absolute"
                        right={0}
                        bottom={0}
                        circular
                        bg="$red10"
                        width={30}
                        height={30}
                        onPress={onRemovePhoto}
                    >
                        <Ionicons name="trash" size={16} color="white" />
                    </Button>
                )}
            </XStack>
        </YStack>
    );
};