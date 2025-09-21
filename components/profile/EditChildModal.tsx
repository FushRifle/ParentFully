import useImageUpload from '@/hooks/image/cloudinary/cloudinary';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import 'react-native-get-random-values';
import {
    Button,
    Image,
    Input,
    Sheet,
    Spinner,
    Text,
    TextArea,
    XStack,
    YStack,
} from 'tamagui';

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo: any;
    notes?: string;
    interests?: string[];
    allergies?: string[];
    developmentstage?: string;
}

interface ChildOptionsModalProps {
    modalVisible: boolean;
    setModalVisible: (visible: boolean) => void;
    currentChild: ChildProfile | null;
    onNavigate: (screen: 'routine' | 'goals' | 'discipline') => void;
    onSave: (updatedChild: ChildProfile) => void;
}

const ChildOptionsModal: React.FC<ChildOptionsModalProps> = ({
    modalVisible,
    setModalVisible,
    currentChild,
    onNavigate,
    onSave,
}) => {
    const { colors } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedAge, setEditedAge] = useState('');
    const [editedNotes, setEditedNotes] = useState('');
    const [editedInterests, setEditedInterests] = useState('');
    const [editedAllergies, setEditedAllergies] = useState('');
    const [editedStage, setEditedStage] = useState('');
    const [loadError, setLoadError] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { pickImage, tempImage, isUploading, setTempImage } = useImageUpload();

    useEffect(() => {
        if (currentChild) {
            setEditedName(currentChild.name);
            setEditedAge(currentChild.age.toString());
            setEditedNotes(currentChild.notes || '');
            setEditedInterests((currentChild.interests || []).join(', '));
            setEditedAllergies((currentChild.allergies || []).join(', '));
            setEditedStage(currentChild.developmentstage || '');
            if (currentChild.photo) {
                setTempImage(currentChild.photo);
            }
            setIsEditing(false);
            setLoadError(false);
        }
    }, [currentChild]);

    const resetFormFields = () => {
        if (!currentChild) return;
        setEditedName(currentChild.name);
        setEditedAge(currentChild.age.toString());
        setEditedNotes(currentChild.notes || '');
        setEditedInterests((currentChild.interests || []).join(', '));
        setEditedAllergies((currentChild.allergies || []).join(', '));
        setEditedStage(currentChild.developmentstage || '');
        setTempImage(currentChild.photo || null);
        setIsEditing(false);
        setLoadError(false);
    };

    const handleSave = async () => {
        if (!currentChild) return;

        setIsSaving(true);

        try {
            let photoUrl = currentChild.photo;
            if (tempImage && tempImage !== currentChild.photo) {
                photoUrl = tempImage;
            }

            const updatedChild: ChildProfile = {
                ...currentChild,
                name: editedName.trim(),
                age: parseInt(editedAge, 10) || 0,
                notes: editedNotes.trim(),
                photo: photoUrl,
                interests: editedInterests.split(',').map(i => i.trim()).filter(Boolean),
                allergies: editedAllergies.split(',').map(a => a.trim()).filter(Boolean),
                developmentstage: editedStage,
            };

            const { error } = await supabase
                .from('children')
                .update(updatedChild)
                .eq('id', currentChild.id);

            if (error) {
                console.error('Supabase update error:', error);
            } else {
                onSave(updatedChild);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error saving child profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const renderEditControls = () => (
        <XStack space="$2">
            <Button
                size="$3"
                variant="outlined"
                onPress={resetFormFields}
                backgroundColor={colors.error}
                color={colors.onPrimary}
                disabled={isSaving}
            >
                Cancel
            </Button>
            <Button
                size="$3"
                themeInverse
                onPress={handleSave}
                backgroundColor={colors.primary}
                disabled={isSaving}
                icon={isSaving ? <Spinner size="small" color="white" /> : undefined}
            >
                {isSaving ? 'Saving...' : 'Save'}
            </Button>
        </XStack>
    );

    const renderViewControls = () => (
        <Button
            size="$3"
            borderWidth={1}
            borderColor={colors.primary}
            icon={<MaterialIcons name="edit" size={20} color={colors.primary} />}
            onPress={() => setIsEditing(true)}
            backgroundColor="transparent"
        >
            Edit
        </Button>
    );

    const renderProfileImage = () => {
        const imageUri = tempImage || currentChild?.photo;
        const shouldShowFallback = loadError || !imageUri;

        return (
            <YStack alignItems="center" marginBottom="$4">
                {isUploading ? (
                    <Spinner size="large" color={colors.primary as any} />
                ) : (
                    <>
                        <Image
                            source={
                                shouldShowFallback
                                    ? require('@/assets/images/profile.jpg')
                                    : { uri: imageUri }
                            }
                            width={120}
                            height={120}
                            borderRadius={60}
                            borderWidth={2}
                            borderColor={colors.primary}
                            onError={() => setLoadError(true)}
                        />
                        {isEditing && (
                            <Button
                                color={colors.onPrimary}
                                backgroundColor={colors.primary}
                                borderWidth={1}
                                marginTop="$5"
                                onPress={pickImage}
                                hoverStyle={{ opacity: 0.8 }}
                            >
                                Change Photo
                            </Button>
                        )}
                    </>
                )}
            </YStack>
        );
    };

    const renderEditForm = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={100}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <YStack space="$4" padding="$4">
                    {renderProfileImage()}

                    <YStack space="$3">
                        <YStack space="$1.5">
                            <Text fontSize="$3" color={colors.textSecondary}>
                                Name
                            </Text>
                            <Input
                                value={editedName}
                                onChangeText={setEditedName}
                                borderColor={colors.border as any}
                                placeholder="Child's name"
                            />
                        </YStack>

                        <YStack space="$1.5">
                            <Text fontSize="$3" color={colors.textSecondary}>
                                Age
                            </Text>
                            <Input
                                value={editedAge}
                                onChangeText={setEditedAge}
                                keyboardType="numeric"
                                borderColor={colors.border as any}
                                placeholder="Child's age"
                            />
                        </YStack>

                        <YStack space="$1.5">
                            <Text fontSize="$3" color={colors.textSecondary}>
                                Notes
                            </Text>
                            <TextArea
                                value={editedNotes}
                                onChangeText={setEditedNotes}
                                height={120}
                                borderColor={colors.border as any}
                                placeholder="Any important notes about your child"
                                numberOfLines={4}
                            />
                        </YStack>
                    </YStack>
                </YStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );

    const renderProfileDetails = () => (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <YStack space="$2">
                {renderProfileImage()}

                <YStack space="$3" paddingHorizontal="$2">
                    <YStack alignItems="center" marginBottom="$2">
                        <Text fontSize="$6" fontWeight="bold" color={colors.primary}>
                            {currentChild?.name}
                        </Text>
                        <XStack space="$2" marginTop="$1">
                            <Text fontSize="$4" color={colors.textSecondary}>
                                Age: {currentChild?.age}
                            </Text>
                            {!!currentChild?.developmentstage && (
                                <Text fontSize="$4" color={colors.textSecondary}>
                                    | Stage: {currentChild?.developmentstage}
                                </Text>
                            )}
                        </XStack>
                    </YStack>

                    {!!currentChild?.notes && (
                        <YStack
                            backgroundColor={colors.surface}
                            padding="$3"
                            borderRadius="$2"
                            marginBottom="$2"
                        >
                            <Text fontSize="$3" color={colors.text}>
                                {currentChild.notes}
                            </Text>
                        </YStack>
                    )}

                    <YStack space="$2" marginTop="$3">
                        <Text fontSize="$4" fontWeight="600" color={colors.primary}>
                            Interests / Hobbies:
                        </Text>
                        <XStack flexWrap="wrap" space="$3" rowGap="$3">
                            {currentChild?.interests?.length ? (
                                currentChild.interests.map((interest, i) => (
                                    <YStack
                                        key={i}
                                        padding="$2"
                                        borderRadius="$2"
                                        backgroundColor={colors.success}
                                        flexDirection="row"
                                        alignItems="center"
                                        marginBottom="$2"
                                    >
                                        <MaterialCommunityIcons name="heart" size={12} color="white" />
                                        <Text fontSize="$3" color="white" marginLeft="$2">
                                            {interest}
                                        </Text>
                                    </YStack>
                                ))
                            ) : (
                                <Text fontSize="$3" color={colors.textSecondary}>
                                    None specified
                                </Text>
                            )}
                        </XStack>
                    </YStack>

                    <YStack space="$2" marginTop="$4">
                        <Text fontSize="$4" fontWeight="600" color={colors.primary}>
                            Allergies / Medical Flags:
                        </Text>
                        <XStack flexWrap="wrap" space="$2" rowGap="$2">
                            {currentChild?.allergies?.length ? (
                                currentChild.allergies.map((allergy, i) => (
                                    <YStack
                                        key={i}
                                        padding="$2"
                                        borderRadius="$2"
                                        backgroundColor={colors.error}
                                        flexDirection="row"
                                        alignItems="center"
                                        marginBottom="$2"
                                    >
                                        <MaterialCommunityIcons name="doctor" size={12} color="white" />
                                        <Text fontSize="$3" color="white" marginLeft="$2">
                                            {allergy}
                                        </Text>
                                    </YStack>
                                ))
                            ) : (
                                <Text fontSize="$3" color={colors.textSecondary}>
                                    None specified
                                </Text>
                            )}
                        </XStack>
                    </YStack>

                </YStack>
            </YStack>
        </ScrollView >
    );

    return (
        <Sheet
            modal
            open={modalVisible}
            onOpenChange={setModalVisible}
            snapPoints={[90]}
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame padding="$4" backgroundColor={colors.background}>
                <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
                    <Text fontSize="$6" fontWeight="bold" color={colors.primary}>
                        {isEditing ? 'Edit Profile' : `${currentChild?.name}'s Profile`}
                    </Text>
                    {isEditing ? renderEditControls() : renderViewControls()}
                </XStack>

                {isEditing ? renderEditForm() : renderProfileDetails()}

                {!isEditing && (
                    <Button
                        marginTop="$4"
                        variant="outlined"
                        color={colors.onPrimary}
                        backgroundColor={colors.error}
                        onPress={() => setModalVisible(false)}
                        hoverStyle={{ backgroundColor: colors.error }}
                    >
                        Close
                    </Button>
                )}
            </Sheet.Frame>
        </Sheet>
    );
};

export default ChildOptionsModal;