import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'
import {
    Avatar,
    Button,
    Form,
    H4,
    Input,
    Label,
    Spinner,
    Text,
    View,
    XStack,
    YStack
} from 'tamagui'

const AVATAR_SIZE = 100
const SAVE_ICON_SIZE = 16

type UserProfile = {
    id: string
    name: string
    email: string
    username: string
    avatar_url?: string | null
}

export default function EditUserScreen() {
    const { colors } = useTheme()
    const navigation = useNavigation()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        avatar: null as string | { uri: string } | null
    })
    const [user, setUser] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch current user profile
    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true)
            try {
                const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
                if (authError || !authUser) {
                    setError('No authenticated user found')
                    setIsLoading(false)
                    return
                }

                const { data, error: userError } = await supabase
                    .from('users')
                    .select('id, full_name, email, username, avatar_url')
                    .eq('id', authUser.id)
                    .single()

                if (userError) {
                    setError(userError.message)
                } else if (data) {
                    const userProfile: UserProfile = {
                        id: data.id,
                        name: data.full_name || '',
                        email: data.email || '',
                        username: data.username || '',
                        avatar_url: data.avatar_url
                    }

                    setUser(userProfile)
                    setFormData({
                        name: data.full_name || '',
                        email: data.email || '',
                        avatar: data.avatar_url || null
                    })
                }
            } catch (err) {
                setError('Failed to fetch user data')
                console.error('Fetch user error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [])

    const handleSubmit = async () => {
        if (!user) return

        try {
            if (!formData.name.trim()) throw new Error('Name is required')
            if (!formData.email.trim()) throw new Error('Email is required')

            setIsLoading(true)
            setError(null)

            const updateData: any = {
                full_name: formData.name.trim(),
                email: formData.email.trim()
            }

            if (formData.avatar && typeof formData.avatar === 'object' && 'uri' in formData.avatar) {
                updateData.avatar_url = formData.avatar.uri
            } else if (formData.avatar === null) {
                updateData.avatar_url = null
            }

            const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', user.id)

            if (updateError) throw updateError

            const { error: authError } = await supabase.auth.updateUser({
                data: { display_name: formData.name.trim() }
            })
            if (authError) console.warn('Failed to update auth metadata:', authError.message)

            alert('Profile updated successfully ✅')
            navigation.goBack()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile')
            console.error('Update error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleImagePick = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (!permissionResult.granted) {
                setError('Permission to access photos is required')
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8
            })

            if (!result.canceled && result.assets?.[0]?.uri) {
                setFormData(prev => ({ ...prev, avatar: { uri: result.assets[0].uri } }))
            }
        } catch (err) {
            setError('Failed to select image')
            console.error('Image pick error:', err)
        }
    }

    const handleRemoveAvatar = () => {
        setFormData(prev => ({ ...prev, avatar: null }))
    }

    const getInitials = (name: string) => {
        if (!name || !name.trim()) return '?'
        const names = name.trim().split(' ')
        return names.length === 1
            ? names[0].charAt(0).toUpperCase()
            : (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }

    if (isLoading && !user) {
        return (
            <YStack f={1} jc="center" ai="center">
                <Spinner size="large" />
                <Text mt="$2">Loading profile...</Text>
            </YStack>
        )
    }

    return (
        <YStack f={1} bg={colors.background} p="$4" space="$4">
            <XStack justifyContent="flex-start" mt="$6" space="$4">
                <Button
                    unstyled
                    onPress={() => navigation.goBack()}
                    icon={<Feather name="chevron-left" size={23} color={colors.text} />}
                    pressStyle={{ opacity: 0.8 }}
                />
                <H4 fontWeight="700" color={colors.text}> Edit Profile</H4>
            </XStack>

            <Form onSubmit={handleSubmit}>
                <YStack space="$4" mt="$2" ai="center">

                    {/* Avatar Section */}
                    <YStack ai="center" space="$2">
                        <View position="relative">
                            <Avatar circular size={AVATAR_SIZE}>
                                {formData.avatar ? (
                                    <Avatar.Image
                                        source={
                                            typeof formData.avatar === 'string'
                                                ? { uri: formData.avatar }
                                                : formData.avatar
                                        }
                                    />
                                ) : (
                                    <Avatar.Fallback
                                        backgroundColor="$gray5"
                                        delayMs={600}
                                        justifyContent="center"
                                        alignItems="center"
                                    >
                                        <Text fontWeight="700" fontSize={32} color={colors.text} textAlign="center">
                                            {getInitials(formData.name)}
                                        </Text>
                                    </Avatar.Fallback>
                                )}
                            </Avatar>
                        </View>

                        <XStack space="$2">
                            <Button
                                size="$2"
                                onPress={handleImagePick}
                                disabled={isLoading}
                                theme="alt1"
                            >
                                {formData.avatar ? 'Change' : 'Add Photo'}
                            </Button>
                            {formData.avatar && (
                                <Button
                                    size="$2"
                                    onPress={handleRemoveAvatar}
                                    disabled={isLoading}
                                    theme="red"
                                >
                                    Remove
                                </Button>
                            )}
                        </XStack>
                    </YStack>

                    {/* Name */}
                    <YStack space="$2" w="100%">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
                            placeholder="Enter your name"
                            borderWidth={1}
                            borderColor={colors.border as any}
                            disabled={isLoading}
                        />
                    </YStack>

                    {/* Email */}
                    <YStack space="$2" w="100%">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={formData.email}
                            onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            borderWidth={1}
                            borderColor={colors.border as any}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                    </YStack>

                    {error && (
                        <Text color="$red10" textAlign="center">
                            {error}
                        </Text>
                    )}

                    <XStack space="$2" w="100%" mt="$4">
                        <Button
                            flex={1}
                            onPress={() => navigation.goBack()}
                            disabled={isLoading}
                            theme="gray"
                        >
                            Cancel
                        </Button>
                        <Form.Trigger asChild>
                            <Button
                                flex={1}
                                bg={colors.primary}
                                color={colors.onPrimary}
                                icon={isLoading ? <Spinner /> : <Feather name="save" size={SAVE_ICON_SIZE} />}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Form.Trigger>
                    </XStack>
                </YStack>
            </Form>
        </YStack>
    )
}