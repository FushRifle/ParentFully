import { useTheme } from '@/styles/ThemeContext';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    Form,
    Input,
    Label,
    Paragraph,
    Sheet,
    Spinner,
    Stack,
    Text,
    XStack,
    YStack
} from 'tamagui';

// Constants
const DEFAULT_SNAP_POINTS = [85];
const SHEET_ANIMATION = 'medium';
const CLOSE_ICON_SIZE = 20;
const SAVE_ICON_SIZE = 16;
const AVATAR_SIZE = 100;
const DEFAULT_AVATAR = require('@/assets/images/profile.jpg');

// Types
type UserProfile = {
    id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string | { uri: string } | null;
};

type EditProfileModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: UserProfile | null;
    onSave: (updatedData: {
        name: string;
        email: string;
        avatar?: string | { uri: string } | null;
    }) => Promise<void>;
};

export function EditProfileModal({ open, onOpenChange, user, onSave }: EditProfileModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: null as string | { uri: string } | null
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { colors } = useTheme();

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                avatar: user.avatar || null
            });
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user) {
            setError('No user data available');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (!formData.name.trim()) throw new Error('Name is required');
            if (!formData.email.trim()) throw new Error('Email is required');
            if (!/^\S+@\S+\.\S+$/.test(formData.email)) throw new Error('Please enter a valid email');

            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), 10000)); // 10s

            await Promise.race([
                onSave({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    avatar: formData.avatar
                }),
                timeout
            ]);

            onOpenChange(false);
        } catch (err) {
            console.error(err); // <-- log for debugging
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                setError('Permission to access photos is required');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets?.[0]?.uri) {
                setFormData(prev => ({ ...prev, avatar: { uri: result.assets[0].uri } }));
            }
        } catch {
            setError('Failed to select image');
        }
    };

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={DEFAULT_SNAP_POINTS}
            dismissOnSnapToBottom
            animation={SHEET_ANIMATION}
        >
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame padding="$4" space="$4">
                <XStack justifyContent="space-between" alignItems="center">
                    <Paragraph size="$6" fontWeight="bold">Edit Profile</Paragraph>
                    <Button
                        size="$2"
                        circular
                        icon={<MaterialIcons name="close" size={CLOSE_ICON_SIZE} />}
                        onPress={() => onOpenChange(false)}
                        disabled={isLoading}
                    />
                </XStack>

                <Form onSubmit={handleSubmit}>
                    <YStack space="$4" marginTop="$2" alignItems="center">
                        {/* Avatar Section */}
                        <Stack>
                            <Avatar circular size={AVATAR_SIZE} marginBottom="$2">
                                <Avatar.Image
                                    source={
                                        formData.avatar
                                            ? typeof formData.avatar === 'string'
                                                ? { uri: formData.avatar }
                                                : formData.avatar
                                            : DEFAULT_AVATAR
                                    }
                                />
                                <Avatar.Fallback backgroundColor="$gray5" delayMs={600} />
                            </Avatar>
                            <Button
                                size="$2"
                                onPress={handleImagePick}
                                disabled={isLoading}
                                theme="alt1"
                            >
                                {formData.avatar ? 'Change Photo' : 'Add Photo'}
                            </Button>
                        </Stack>

                        {/* Name Field */}
                        <YStack space="$2" width="100%">
                            <Label>Full Name</Label>
                            <Input
                                value={formData.name}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                                placeholder="Enter your name"
                                borderWidth={1}
                                borderColor={colors.primary}
                                disabled={isLoading}
                            />
                        </YStack>

                        {/* Email Field */}
                        <YStack space="$2" width="100%">
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                borderWidth={1}
                                borderColor={colors.primary}
                                placeholder="Enter your email"
                                disabled={isLoading}
                            />
                        </YStack>

                        {/* Username Display (read-only) */}
                        {user?.username && (
                            <YStack space="$2" width="100%">
                                <Label>Username</Label>
                                <Input
                                    value={user.username}
                                    borderWidth={1}
                                    borderColor="$gray5"
                                    placeholder="Username"
                                    editable={false}
                                    color="$gray10"
                                />
                                <Text fontSize="$1" color="$gray10">
                                    Username is generated from your email
                                </Text>
                            </YStack>
                        )}

                        {error && (
                            <Text color="$red10" textAlign="center">
                                {error}
                            </Text>
                        )}

                        <Form.Trigger asChild>
                            <Button
                                themeInverse
                                marginTop="$4"
                                icon={isLoading ? <Spinner /> : <Feather name="save" size={SAVE_ICON_SIZE} />}
                                disabled={isLoading}
                                width="100%"
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Form.Trigger>
                    </YStack>
                </Form>
            </Sheet.Frame>
        </Sheet>
    );
}