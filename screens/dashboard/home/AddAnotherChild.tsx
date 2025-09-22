import { interestOptions } from '@/constants/InterestsandAllerg'
import useImageUpload from '@/hooks/image/cloudinary/cloudinary'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useNavigation } from '@react-navigation/native'
import { Calendar } from '@tamagui/lucide-icons'
import { router } from 'expo-router'
import { MotiView } from 'moti'
import { MotiPressable } from 'moti/interactions'
import React, { useEffect, useState } from 'react'
import {
    Alert,
    Animated,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform
} from 'react-native'
import {
    Button, Card, H3,
    H4,
    Image, Input,
    Paragraph,
    ScrollView,
    Text,
    View, XStack, YStack
} from 'tamagui'

type AddChildScreenProps = {
    onComplete?: () => void
}

type FormStep = 'basic' | 'interests'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

type ChildData = {
    name: string
    gender: string
    birth_date: Date
    interests: string[]
    allergies: string[]
}

export default function AddChildScreen({ onComplete }: AddChildScreenProps) {
    const { colors } = useTheme()
    const navigation = useNavigation()
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [currentStep, setCurrentStep] = useState<FormStep>('basic')
    const [keyboardVisible, setKeyboardVisible] = useState(false)
    const [currentChildIndex, setCurrentChildIndex] = useState(0)
    const { pickImage, tempImage, isUploading, setTempImage, uploadError } = useImageUpload()
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [children, setChildren] = useState<ChildData[]>([
        {
            name: '',
            gender: '',
            birth_date: new Date(),
            interests: [],
            allergies: [],
        },
    ])
    const [isPremiumUser, setIsPremiumUser] = useState(false)
    const fadeAnim = useState(new Animated.Value(0))[0]
    const childData = children[currentChildIndex]

    const setChildData = (data: ChildData) => {
        const newChildren = [...children]
        newChildren[currentChildIndex] = data
        setChildren(newChildren)
    }

    const calculateAge = (birthDate: Date): string => {
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }

        return age.toString()
    }

    useEffect(() => {
        const checkPremiumStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setIsPremiumUser(data.is_premium)
                }
            }
        }

        checkPremiumStatus()

        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setKeyboardVisible(true)
        )
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => setKeyboardVisible(false)
        )

        return () => {
            keyboardDidShowListener.remove()
            keyboardDidHideListener.remove()
        }
    }, [])

    const animateModal = () => {
        fadeAnim.setValue(0)
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start()
    }

    const validateBasicInfo = (): boolean => {
        if (!childData.name.trim()) {
            Alert.alert('Required Field', 'Please enter a name')
            return false
        }
        if (!childData.gender.trim()) {
            Alert.alert('Required Field', 'Please select a gender')
            return false
        }
        return true
    }

    const toggleInterest = (interest: string) => {
        const newInterests = childData.interests.includes(interest)
            ? childData.interests.filter(i => i !== interest)
            : [...childData.interests, interest]
        setChildData({ ...childData, interests: newInterests })
    }

    const goToNextStep = () => {
        if (currentStep === 'basic' && !validateBasicInfo()) return
        setCurrentStep(currentStep === 'basic' ? 'interests' : 'basic')
    }

    const addAnotherChild = async () => {
        if (children.length >= 1 && !isPremiumUser) {
            Alert.alert(
                'Premium Feature',
                'You need to subscribe to our premium plan to add multiple children.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Subscribe',
                        onPress: () => router.push('/subscription' as any),
                    },
                ]
            )
            return
        }

        setChildren([
            ...children,
            {
                name: '',
                gender: '',
                birth_date: new Date(),
                interests: [],
                allergies: [],
            },
        ])
        setCurrentChildIndex(children.length)
        setCurrentStep('basic')
    }

    const switchChild = (index: number) => {
        setCurrentChildIndex(index)
        setCurrentStep('basic')
    }

    const handleImageError = async () => {
        setTempImage(null)
    }

    const handleSubmit = async () => {
        if (!validateBasicInfo()) return
        setLoading(true)
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) throw new Error('User not authenticated')
            const age = calculateAge(childData.birth_date)
            const { error } = await supabase.from('children').insert([{
                user_id: user.id,
                name: childData.name,
                age: age,
                gender: childData.gender,
                birth_date: childData.birth_date.toISOString(),
                interests: childData.interests,
                allergies: childData.allergies,
            }])
            if (error) throw error
            if (onComplete) onComplete()
        } catch (err) {
            Alert.alert('Error', err instanceof Error ? err.message : 'Could not save child data.')
        } finally {
            setLoading(false)
        }
    }

    const renderBasicInfoStep = () => (
        <YStack space="$5" px="$4" mt="$9">
            {/* Header */}
            <XStack ai="center" jc="space-between" w="100%" mt="$3">
                <YStack>
                    <H4 color="$color">
                        Create Your Child's Profile
                    </H4>
                    <Text color="$colorSecondary" mt="$2">
                        Please setup to continue
                    </Text>
                </YStack>
            </XStack>

            {/* Upload photo */}
            <YStack mt='$5'>
                <Text fontSize='$5' fontWeight="700" mb="$2">Add photo</Text>
                <XStack jc='center' alignItems='center'>
                    <MotiPressable
                        onPress={pickImage}
                        animate={({ pressed }) => {
                            'worklet'
                            return {
                                scale: pressed ? 0.98 : 1,
                                opacity: pressed ? 0.8 : 1,
                            }
                        }}
                        transition={{
                            type: 'timing',
                            duration: 150,
                        }}
                    >
                        <View
                            borderStyle="dotted"
                            borderWidth={2}
                            borderColor="$borderColor"
                            borderRadius={9999}
                            w={215}
                            h={215}
                            bg='white'
                            jc="center"
                            ai="center"
                            overflow="hidden"
                        >
                            {tempImage ? (
                                <MotiView
                                    from={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: 'spring', damping: 10 }}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    <Image
                                        source={{ uri: tempImage }}
                                        style={{ width: '100%', height: '100%', borderRadius: 9999 }}
                                        onError={handleImageError}
                                    />
                                </MotiView>
                            ) : uploadError ? (
                                <YStack ai="center" space="$3" p="$3">
                                    <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
                                    <Text color={colors.error} textAlign="center" fontSize="$2">
                                        Upload failed
                                    </Text>
                                    <Button
                                        onPress={pickImage}
                                        size="$2"
                                        bg={colors.primary}
                                    >
                                        <Text color={colors.onPrimary}>Try Again</Text>
                                    </Button>
                                </YStack>
                            ) : (
                                <MotiView
                                    from={{ opacity: 0, translateY: 10 }}
                                    animate={{ opacity: 1, translateY: 0 }}
                                    transition={{ delay: 100 }}
                                >
                                    <YStack ai="center" space="$2">
                                        <Ionicons name="camera-outline" size={28} color="black" />
                                        <Text color={colors.primary}>Upload Image</Text>
                                        <Text color="$colorSecondary" fontSize="$2">
                                            PNG, JPEG (Max 5MB)
                                        </Text>
                                    </YStack>
                                </MotiView>
                            )}
                        </View>
                    </MotiPressable>
                </XStack>
            </YStack>

            {/* Child name with entry animation */}
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 150 }}
            >
                <YStack space="$2">
                    <Text fontWeight="700" fontSize='$5'>Child's Name</Text>
                    <Input
                        placeholder="Enter name"
                        value={childData.name}
                        onChangeText={(val) => setChildData({ ...childData, name: val })}
                        h={50}
                        px="$3"
                        borderRadius="$4"
                        bg='white'
                    />
                </YStack>
            </MotiView>

            {/* Birth Date */}
            <YStack space="$2">
                <Text color={colors.text} fontSize="$5">
                    Birth Date (Age: {calculateAge(childData.birth_date)})
                </Text>

                <XStack
                    ai="center"
                    h={50}
                    bg="white"
                    borderWidth={1}
                    borderColor={colors.border as any}
                    borderRadius="$4"
                >
                    <Input
                        flex={1}
                        placeholder="Select birth date"
                        value={childData.birth_date.toLocaleDateString()}
                        editable={false}
                        borderWidth={0}
                        bg="white"
                        onPressIn={() => setShowDatePicker(true)}
                    />

                    <Button
                        chromeless
                        size="$3"
                        onPress={() => setShowDatePicker(true)}
                        aria-label="Pick date"
                    >
                        <Calendar size={20} color={colors.text as any} />
                    </Button>
                </XStack>

                {showDatePicker && (
                    <DateTimePicker
                        value={childData.birth_date}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false)
                            if (selectedDate) {
                                setChildData({ ...childData, birth_date: selectedDate })
                            }
                        }}
                    />
                )}
            </YStack>

            {/* Gender */}
            <YStack space="$2">
                <Text fontWeight="600" fontSize='$5'>Select Gender</Text>
                <XStack space="$3" mt="$1">
                    {[
                        { key: "Female", icon: "female-outline", color: "#ff4da6" },
                        { key: "Male", icon: "male-outline", color: "#00bfff" },
                        { key: "Other", icon: "transgender-outline", color: "#a64dff" },
                    ].map((g) => (
                        <Button
                            key={g.key}
                            flex={1}
                            h={100}
                            br="$6"
                            bg="white"
                            borderWidth={3}
                            borderColor={childData.gender === g.key ? colors.primary : "transparent"}
                            onPress={() => setChildData({ ...childData, gender: g.key })}
                        >
                            <YStack ai="center" jc="center" space="$2">
                                <Ionicons name={g.icon as any} size={32} color={g.color} />
                                <Text color="$color" fontSize="$3">{g.key}</Text>
                            </YStack>
                        </Button>
                    ))}
                </XStack>
            </YStack>
        </YStack>
    )

    const renderInterestsStep = () => (
        <YStack flex={1} bg={colors.background}>
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <MotiView
                    from={{ opacity: 0, translateY: 10 }}
                    animate={{ opacity: 1, translateY: 0 }}
                >
                    <YStack mt="$7">
                        <H4 color="$color">Create Your Child's Profile</H4>
                        <Text color="$colorSecondary" mt="$2">
                            Please setup to continue
                        </Text>
                    </YStack>
                </MotiView>

                <XStack mt='$5'>
                    <Text fontSize='$6'>
                        Child's Interests:
                    </Text>
                </XStack>

                <XStack flexWrap="wrap" jc="space-between" mt="$5">
                    {interestOptions.map((interest, index) => {
                        const isSelected = childData.interests.includes(interest.label);

                        return (
                            <MotiView
                                key={interest.label}
                                from={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 40 }}
                                style={{ width: "30%", marginBottom: 16 }}
                            >
                                <MotiPressable
                                    onPress={() => toggleInterest(interest.label)}
                                    animate={({ pressed, hovered }) => {
                                        "worklet";
                                        return {
                                            scale: pressed ? 0.96 : hovered ? 1.02 : 1,
                                        };
                                    }}
                                >
                                    <Card
                                        bg={isSelected ? colors.card : "white"}
                                        borderWidth={1}
                                        borderRadius="$5"
                                        borderColor={colors.border as any}
                                        p="$4"
                                        w={115}
                                        h={128}
                                        br={8}
                                        jc="center"
                                        ai="center"
                                        position="relative"
                                        space="$3"
                                    >
                                        {/* Corner check circle */}
                                        <View
                                            position="absolute"
                                            top={10}
                                            right={10}
                                            w={16}
                                            h={16}
                                            borderRadius={11}
                                            borderWidth={2}
                                            borderColor={isSelected ? "$onPrimary" : colors.disabled as any}
                                            backgroundColor={isSelected ? colors.primary : "transparent"}
                                        />

                                        {/* Icon / Emoji */}
                                        <Text fontSize={36}>{interest.icon}</Text>

                                        {/* Label */}
                                        <Text
                                            textAlign="center"
                                            fontSize="$4"
                                            color={isSelected ? "$onPrimary" : "$color"}
                                            mt="$2"
                                        >
                                            {interest.label}
                                        </Text>
                                    </Card>
                                </MotiPressable>
                            </MotiView>
                        );
                    })}
                </XStack>
            </ScrollView>
        </YStack>
    );

    return (
        <YStack f={1} bg={colors.background}>
            {children.length > 1 && (
                <XStack px="$4" py="$2" space="$2" bg={colors.background}>
                    {children.map((child, index) => (
                        <MotiView
                            key={index}
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 50 }}
                        >
                            <Button
                                onPress={() => switchChild(index)}
                                backgroundColor={index === currentChildIndex ? "$primary" : "$card"}
                                borderWidth={1}
                                borderColor="$borderColor"
                                borderRadius="$4"
                                px="$3"
                                py="$1"
                            >
                                <Text color={index === currentChildIndex ? "$onPrimary" : "$color"}>
                                    {child.name || `Child ${index + 1}`}
                                </Text>
                            </Button>
                        </MotiView>
                    ))}
                </XStack>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {currentStep === 'interests' && (
                        <XStack jc='flex-start' mt='$8'>
                            <MotiPressable
                                animate={({ pressed }) => ({
                                    scale: pressed ? 0.95 : 1,
                                })}
                            >
                                <Button
                                    bg='transparent'
                                    justifyContent="center"
                                    onPress={() => setCurrentStep('basic')}
                                    icon={<Ionicons name="arrow-back" size={20} color={colors.text} />}
                                >
                                    <Text color={colors.text} fontWeight='700'>
                                        Back
                                    </Text>
                                </Button>
                            </MotiPressable>
                        </XStack>
                    )}
                    {currentStep === 'basic' ? renderBasicInfoStep() : renderInterestsStep()}
                </ScrollView>
            </KeyboardAvoidingView>

            {!keyboardVisible && (
                <MotiView
                    from={{ translateY: 50, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', damping: 20 }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: colors.background,
                        padding: 20,
                        marginTop: 20,
                    }}
                >
                    <YStack space="$3" alignItems="center" width="100%">
                        <MotiPressable
                            animate={({ pressed }) => ({
                                scale: pressed ? 0.95 : 1,
                            })}
                            style={{ width: '100%' }}
                        >
                            <Button
                                w="100%"
                                size='$5'
                                bg={colors.primary}
                                br={9999}
                                onPress={currentStep === 'basic' ? goToNextStep : handleSubmit}
                                backgroundColor={colors.primary}
                                disabled={loading}
                            >
                                <Text flex={1} textAlign="center" color={colors.onPrimary} fontSize='$5' fontWeight="600">
                                    {currentStep === 'basic' ? 'Continue' : 'Done'}
                                </Text>
                            </Button>
                        </MotiPressable>
                    </YStack>
                </MotiView>
            )
            }

            <Modal visible={modalVisible} transparent animationType="fade">
                <Animated.View style={{
                    flex: 1, justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)', opacity: fadeAnim
                }}>
                    <YStack bg="$card" p="$4" borderRadius="$4" mx="$4" space="$4" alignItems="center">
                        <View bg="$success" p="$3" borderRadius={50}>
                            <Ionicons name="checkmark" size={36} color={colors.text} />
                        </View>
                        <H3 textAlign="center">{children.length > 1 ? 'Children Added Successfully!' : 'Child Added Successfully!'}</H3>
                        <Paragraph textAlign="center" color="$colorSecondary">
                            {children.length > 1
                                ? 'All children have been added to your profile.'
                                : 'Your child has been added to your profile.'}
                        </Paragraph>
                        <Button
                            onPress={() => navigation.navigate('MainTabs' as never)}
                            backgroundColor="$primary"
                            width="100%"
                        >
                            Continue
                        </Button>
                    </YStack>
                </Animated.View>
            </Modal>
        </YStack >
    )
}