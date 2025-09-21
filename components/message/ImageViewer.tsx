import { useAuth } from '@/hooks/auth/useAuth'
import { supabase } from '@/supabase/client'
import { MaterialIcons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import React, { useEffect, useState } from 'react'
import { Alert, Modal, TouchableWithoutFeedback } from 'react-native'
import { Button, Image, Spinner, styled, Text, XStack, YStack } from 'tamagui'

interface ImageDisplayProps {
    path: string
    bucket?: string
    width?: number | string
    height?: number | string
    borderRadius?: number
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
    onPress?: () => void
    onDelete?: () => Promise<void>
    showDelete?: boolean
}

export const ImageDisplay = ({
    path,
    bucket = 'chat-images',
    width = '100%',
    height = 200,
    borderRadius = 0,
    resizeMode = 'cover',
    onPress,
    onDelete,
    showDelete = false,
}: ImageDisplayProps) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions()
    const { user } = useAuth()

    useEffect(() => {
        const fetchImage = async () => {
            if (!path) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)

                if (path.startsWith('http')) {
                    setImageUrl(path)
                    return
                }

                const { data: publicData } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(path)

                if (publicData?.publicUrl) {
                    setImageUrl(publicData.publicUrl)
                    return
                }

                const { data: signedData } = await supabase.storage
                    .from(bucket)
                    .createSignedUrl(path, 3600)

                if (signedData?.signedUrl) {
                    setImageUrl(signedData.signedUrl)
                }
            } catch (error) {
                console.error('Error fetching image:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchImage()
    }, [path, bucket, user?.id])

    const handleSaveImage = async () => {
        if (!imageUrl) return

        try {
            // Request permissions if not granted
            if (permissionResponse?.status !== 'granted') {
                await requestPermission()
            }

            // Download the image
            const downloadResumable = FileSystem.createDownloadResumable(
                imageUrl,
                FileSystem.documentDirectory + `downloaded_${Date.now()}.jpg`,
                {}
            )

            const downloadResult = await downloadResumable.downloadAsync()
            const localUri = downloadResult?.uri

            if (!localUri) {
                throw new Error('Failed to download image')
            }

            // Save to media library
            await MediaLibrary.saveToLibraryAsync(localUri)

            Alert.alert('Success', 'Image saved to your photos!')
        } catch (error) {
            console.error('Error saving image:', error)
            Alert.alert('Error', 'Failed to save image')
        }
    }

    const handlePress = () => {
        if (onPress) {
            onPress()
        } else {
            setModalVisible(true)
        }
    }

    const handleDelete = async () => {
        if (!onDelete) return

        try {
            setDeleting(true)
            await onDelete()
            setModalVisible(false)
        } catch (error) {
            console.error('Error deleting image:', error)
            Alert.alert('Error', 'Failed to delete image')
        } finally {
            setDeleting(false)
        }
    }

    const confirmDelete = () => {
        Alert.alert(
            'Delete Image',
            'Are you sure you want to delete this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: handleDelete }
            ]
        )
    }

    if (loading) {
        return (
            <YStack
                width={width}
                height={height}
                ai="center"
                jc="center"
                borderRadius={borderRadius}
                backgroundColor="$backgroundHover"
            >
                <Spinner size="large" />
            </YStack>
        )
    }

    if (!imageUrl) {
        return (
            <YStack
                width={width}
                height={height}
                borderRadius={borderRadius}
                backgroundColor="$backgroundHover"
            />
        )
    }

    return (
        <>
            <TouchableWithoutFeedback onPress={handlePress}>
                <YStack>
                    <Image
                        source={{ uri: imageUrl }}
                        width={width}
                        height={height}
                        borderRadius={borderRadius}
                        resizeMode={resizeMode}
                    />
                </YStack>
            </TouchableWithoutFeedback>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <YStack flex={1} bg="rgba(0,0,0,0.9)" jc="center" ai="center">
                    <XStack position="absolute" top={40} right={20} space="$2" zIndex={10}>
                        <Button
                            circular
                            icon={<MaterialIcons name="save-alt" size={24} color="white" />}
                            onPress={handleSaveImage}
                            bg="rgba(0,0,0,0.5)"
                        />
                        {showDelete && (
                            <Button
                                circular
                                icon={<MaterialIcons name="delete" size={24} color="white" />}
                                onPress={confirmDelete}
                                bg="rgba(0,0,0,0.5)"
                                disabled={deleting}
                            />
                        )}
                        <Button
                            circular
                            icon={<MaterialIcons name="close" size={24} color="white" />}
                            onPress={() => setModalVisible(false)}
                            bg="rgba(0,0,0,0.5)"
                        />
                    </XStack>

                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <Image
                            source={{ uri: imageUrl }}
                            width="90%"
                            height="80%"
                            resizeMode="contain"
                        />
                    </TouchableWithoutFeedback>
                    {deleting && (
                        <YStack position="absolute" bottom={40} ai="center">
                            <Spinner size="large" color="$red10" />
                            <Text color="white" marginTop="$2">Deleting...</Text>
                        </YStack>
                    )}
                </YStack>
            </Modal>
        </>
    )
}

export const AvatarImage = styled(ImageDisplay, {
    name: 'AvatarImage',
    borderRadius: 100,
    width: 80,
    height: 80,
    resizeMode: 'cover',
})