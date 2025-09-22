import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import React, { useEffect, useState } from 'react'
import { Alert, RefreshControl } from 'react-native'
import { Modal } from 'react-native-paper'
import {
    Button,
    Card,
    Image,
    Input,
    ScrollView,
    Spinner,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui'

interface ChildProfile {
    id: string
    name: string
    age: number
    photo: string
    notes?: string
}

interface CombinedChildProfileProps {
    children: ChildProfile[]
    selectedChild: ChildProfile
    onSelectChild: (child: ChildProfile) => void
    onEditChild: (updatedChild: ChildProfile) => void
}

const fallbackImage = '@/assets/images/profile.jpg'

const CombinedChildProfile: React.FC<CombinedChildProfileProps> = ({
    children,
    selectedChild,
    onSelectChild,
    onEditChild
}) => {
    const { colors } = useTheme()
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editedName, setEditedName] = useState(selectedChild.name)
    const [editedAge, setEditedAge] = useState(selectedChild.age.toString())
    const [editedNotes, setEditedNotes] = useState(selectedChild.notes || '')
    const [isUploading, setIsUploading] = useState(false)
    const [tempImage, setTempImage] = useState<string | null>(null)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        setEditedName(selectedChild.name)
        setEditedAge(selectedChild.age.toString())
        setEditedNotes(selectedChild.notes || '')
    }, [selectedChild])

    const pickImage = async () => {
        setIsUploading(true)
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            })

            if (!result.canceled && result.assets.length > 0) {
                setTempImage(result.assets[0].uri)
            }
        } catch (error) {
            console.error('Image picker error:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const uriToBlob = async (uri: string): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.onload = () => resolve(xhr.response)
            xhr.onerror = () => reject(new TypeError('Network request failed'))
            xhr.responseType = 'blob'
            xhr.open('GET', uri, true)
            xhr.send(null)
        })
    }

    const uploadImageToSupabase = async (uri: string) => {
        const filename = `${selectedChild.id}-${Date.now()}.jpg`
        const blob = await uriToBlob(uri)

        const { error } = await supabase.storage
            .from('child-photos')
            .upload(filename, blob, {
                contentType: 'image/jpeg',
                upsert: true
            })

        if (error) throw error

        const { data: { publicUrl } } = supabase
            .storage
            .from('child-photos')
            .getPublicUrl(filename)

        return publicUrl || fallbackImage
    }

    const handleSave = async () => {
        try {
            let photoUrl = selectedChild.photo

            if (tempImage) {
                photoUrl = await uploadImageToSupabase(tempImage)
            }

            const updatedChild = {
                ...selectedChild,
                name: editedName,
                age: parseInt(editedAge) || selectedChild.age,
                notes: editedNotes,
                photo: photoUrl
            }

            const { error } = await supabase
                .from('children')
                .update({
                    name: updatedChild.name,
                    age: updatedChild.age,
                    notes: updatedChild.notes,
                    photo_url: updatedChild.photo,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedChild.id)

            if (error) throw error

            onEditChild(updatedChild)
            setEditMode(false)
            setTempImage(null)
        } catch (error) {
            console.error('Save error:', error)
            Alert.alert('Error', 'Could not save changes. Check image upload permissions.')
        }
    }

    const renderImage = (uri?: string) => (
        <Image
            source={{ uri: uri || fallbackImage }}
            width={50}
            height={50}
            borderRadius={30}
            borderWidth={2}
            borderColor={colors.primary}
            marginRight="$4"
        />
    )

    return (
        <ScrollView
            flexGrow={1}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} />
            }
        >
            <Card
                elevate
                bordered
                borderRadius="$4"
                padding="$4"
                marginBottom="$4"
                minHeight={140}
                backgroundColor={colors.surface}
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                borderColor={colors.border as any}
                borderWidth={1}
            >
                <XStack alignItems="center" flex={1}>
                    {editMode ? (
                        <Button onPress={pickImage} disabled={isUploading} unstyled padding={0}>
                            {isUploading ? (
                                <View
                                    width={60}
                                    height={60}
                                    borderRadius={30}
                                    justifyContent="center"
                                    alignItems="center"
                                    backgroundColor="$gray5"
                                >
                                    <Spinner size="small" color={colors.primary as any} />
                                </View>
                            ) : renderImage(tempImage || selectedChild.photo)}
                        </Button>
                    ) : renderImage(selectedChild.photo)}

                    {editMode ? (
                        <YStack flex={1} marginRight="$2">
                            <Input
                                value={editedName}
                                onChangeText={setEditedName}
                                placeholder="Child's name"
                                borderColor={colors.primary}
                                marginBottom="$2"
                            />
                            <XStack alignItems="center" marginBottom="$2">
                                <Input
                                    flex={1}
                                    value={editedAge}
                                    onChangeText={setEditedAge}
                                    placeholder="Age"
                                    keyboardType="numeric"
                                    borderColor={colors.primary}
                                    marginRight="$2"
                                />
                                <Button
                                    circular
                                    size="$3"
                                    backgroundColor={colors.primary}
                                    onPress={handleSave}
                                    icon={<MaterialIcons name="check" size={18} color={colors.onPrimary} />}
                                />
                            </XStack>
                            <Input
                                value={editedNotes}
                                onChangeText={setEditedNotes}
                                placeholder="Notes"
                                multiline
                                numberOfLines={4}
                                borderColor={colors.primary}
                                height={80}
                            />
                        </YStack>
                    ) : (
                        <YStack flex={1}>
                            <Text fontSize="$5" fontWeight="600" color={colors.text}>
                                {selectedChild.name}
                            </Text>
                            <Text fontSize="$3" color={colors.text}>
                                {selectedChild.age} years old
                            </Text>
                            {selectedChild.notes && (
                                <Text fontSize="$2" color={colors.text} fontStyle="italic">
                                    {selectedChild.notes}
                                </Text>
                            )}
                        </YStack>
                    )}

                    {!editMode && (
                        <Button
                            circular
                            size="$3"
                            backgroundColor={colors.primary}
                            onPress={() => setEditMode(true)}
                            marginLeft="$2"
                            icon={<MaterialIcons name="edit" size={18} color={colors.onPrimary} />}
                        />
                    )}
                </XStack>

                <Button
                    circular
                    size="$3"
                    borderColor={colors.border as any}
                    onPress={() => setDropdownVisible(true)}
                    marginLeft="$2"
                    icon={<MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} />}
                />

                <Modal visible={dropdownVisible} onDismiss={() => setDropdownVisible(false)}>
                    <Button
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        backgroundColor="rgba(0,0,0,0.5)"
                        onPress={() => setDropdownVisible(false)}
                        unstyled
                    />
                    <View
                        position="absolute"
                        top="25%"
                        left="15%"
                        right="15%"
                        maxHeight="60%"
                        backgroundColor={colors.surface}
                        borderRadius="$4"
                        padding="$2"
                    >
                        <ScrollView>
                            {children.map(child => (
                                <Button
                                    key={child.id}
                                    onPress={() => {
                                        onSelectChild(child)
                                        setDropdownVisible(false)
                                    }}
                                    backgroundColor={
                                        selectedChild.id === child.id ? colors.primaryContainer : 'transparent'
                                    }
                                    borderColor={colors.border as any}
                                    borderWidth={1}
                                    borderRadius="$2"
                                    marginBottom="$1"
                                    padding="$3"
                                    justifyContent="flex-start"
                                >
                                    <XStack alignItems="center" space="$3">
                                        {renderImage(child.photo)}
                                        <Text fontSize="$4" fontWeight="500" color={colors.text}>
                                            {child.name}
                                        </Text>
                                    </XStack>
                                </Button>
                            ))}
                        </ScrollView>
                    </View>
                </Modal>
            </Card>
        </ScrollView>
    )
}

export default CombinedChildProfile
