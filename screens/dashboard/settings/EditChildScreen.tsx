import useImageUpload from '@/hooks/image/cloudinary/cloudinary';
import { RootStackParamList } from '@/navigation/MainNavigator';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
    Button,
    Image,
    Input,
    Spinner,
    Text,
    TextArea,
    YStack
} from 'tamagui';

type ChildProfile = {
    id: string;
    name: string;
    age: number;
    photo: string | null;
    notes?: string;
    interests?: string[];
    allergies?: string[];
    developmentstage?: string;
};

type ChildEditRouteProp = RouteProp<RootStackParamList, 'ChildEdit'>;

const ChildEditScreen: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<ChildEditRouteProp>();
    const { childId } = route.params;

    const [child, setChild] = useState<ChildProfile | null>(null);
    const [editedName, setEditedName] = useState('');
    const [editedAge, setEditedAge] = useState('');
    const [editedNotes, setEditedNotes] = useState('');
    const [editedInterests, setEditedInterests] = useState('');
    const [editedAllergies, setEditedAllergies] = useState('');
    const [editedStage, setEditedStage] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [loadError, setLoadError] = useState(false);

    const { pickImage, tempImage, isUploading, setTempImage } = useImageUpload();

    // 🔹 Load child from Supabase
    useEffect(() => {
        const fetchChild = async () => {
            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('id', childId)
                .single();

            if (error) {
                console.error(error);
                return;
            }

            if (data) {
                setChild(data);
                setEditedName(data.name);
                setEditedAge(data.age?.toString() || '');
                setEditedNotes(data.notes || '');
                setEditedInterests((data.interests || []).join(', '));
                setEditedAllergies((data.allergies || []).join(', '));
                setEditedStage(data.developmentstage || '');
                setTempImage(data.photo || null);
            }
        };

        fetchChild();
    }, [childId]);

    const handleSave = async () => {
        if (!child) return;
        setIsSaving(true);

        try {
            let photoUrl = child.photo;
            if (tempImage && tempImage !== child.photo) {
                photoUrl = tempImage;
            }

            const updatedChild: ChildProfile = {
                ...child,
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
                .eq('id', child.id);

            if (error) {
                console.error('Update failed:', error);
            } else {
                setChild(updatedChild);
                navigation.goBack(); // ✅ return after save
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const renderProfileImage = () => {
        const imageUri = tempImage || child?.photo;
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
                        <Button
                            color={colors.onPrimary}
                            backgroundColor={colors.primary}
                            marginTop="$3"
                            onPress={pickImage}
                        >
                            Change Photo
                        </Button>
                    </>
                )}
            </YStack>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <YStack space="$4">
                    <Text fontSize="$6" fontWeight="bold" color={colors.primary}>
                        Edit Child Profile
                    </Text>

                    {renderProfileImage()}

                    <YStack space="$3">
                        <Input
                            value={editedName}
                            onChangeText={setEditedName}
                            placeholder="Child's name"
                            borderColor={colors.border as any}
                        />
                        <Input
                            value={editedAge}
                            onChangeText={setEditedAge}
                            keyboardType="numeric"
                            placeholder="Child's age"
                            borderColor={colors.border as any}
                        />
                        <TextArea
                            value={editedNotes}
                            onChangeText={setEditedNotes}
                            placeholder="Notes"
                            height={100}
                            borderColor={colors.border as any}
                        />
                        <Input
                            value={editedInterests}
                            onChangeText={setEditedInterests}
                            placeholder="Interests (comma separated)"
                            borderColor={colors.border as any}
                        />
                        <Input
                            value={editedAllergies}
                            onChangeText={setEditedAllergies}
                            placeholder="Allergies (comma separated)"
                            borderColor={colors.border as any}
                        />
                        <Input
                            value={editedStage}
                            onChangeText={setEditedStage}
                            placeholder="Development Stage"
                            borderColor={colors.border as any}
                        />
                    </YStack>

                    <Button
                        marginTop="$4"
                        backgroundColor={colors.primary}
                        onPress={handleSave}
                        disabled={isSaving}
                        icon={isSaving ? <Spinner size="small" color="white" /> : undefined}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </YStack>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ChildEditScreen;
