import { SuccessSheet } from '@/components/auth/SuccessModal'
import { useAuth } from '@/context/AuthContext'
import { AuthStackParamList } from '@/navigation/AuthNavigator'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { AlertOctagon, Check, Lock, Mail, Phone, User, X } from '@tamagui/lucide-icons'
import { useNavigation, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
    Button,
    H2,
    Checkbox,
    H4,
    Image,
    Input,
    Separator,
    Text,
    XStack,
    YStack
} from 'tamagui'

type FormData = {
    displayName: string
    email: string
    phone: string
    password: string
    confirmPassword: string
    referralCode?: string
}


type FormErrors = Partial<Record<keyof FormData, string>>


type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList>

export const RegisterScreen = () => {
    const navigation = useNavigation<SignupScreenNavigationProp>()
    const { colors, isDark } = useTheme()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [terms, setterms] = useState(false);
    const [phone, setPhone] = useState('')
    const [referralCode, setReferralCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [Terms, setTerms] = useState(false)

    const [error, setError] = useState('')
    const [errors, setErrors] = useState<FormErrors>({})
    const { googleSignIn } = useAuth()


    const [showSuccess, setShowSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState<FormData>({
        displayName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        referralCode: ''
    })

    // Validation checks
    const rules = [
        { label: "At least 8 Characters", valid: password.length >= 8 },
        { label: "One Uppercase Letter (A-Z)", valid: /[A-Z]/.test(password) },
        { label: "One Lowercase Letter (a-z)", valid: /[a-z]/.test(password) },
        { label: "One Number (0-9)", valid: /[0-9]/.test(password) },
        { label: "One Special Character", valid: /[^A-Za-z0-9]/.test(password) },
    ]

    const validate = useCallback((): boolean => {
        const newErrors: FormErrors = {}

        if (!name.trim()) newErrors.displayName = 'Display name is required'

        if (!email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email format'
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required'
        } else if (!/^\+?\d{10,15}$/.test(phone.trim())) {
            newErrors.phone = 'Invalid phone number format'
        }

        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters'
        } else if (!/[A-Z]/.test(password)) {
            newErrors.password = 'Password must contain at least one uppercase letter'
        } else if (!/[0-9]/.test(password)) {
            newErrors.password = 'Password must contain at least one number'
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [name, email, phone, password, confirmPassword])

    const handleRegister = useCallback(async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            const sanitizedInput = {
                email: email.trim().toLowerCase(),
                password: password.trim(),
                displayName: name.replace(/[<>%$]/g, "").trim(),
                phone: phone.trim(),
                referralCode: referralCode.trim(),
            };

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: sanitizedInput.email,
                password: sanitizedInput.password,
                options: {
                    data: {
                        display_name: sanitizedInput.displayName,
                        phone: sanitizedInput.phone,
                        referral_code: sanitizedInput.referralCode
                    },
                },
            });

            if (authError) throw new Error(authError.message);
            if (!authData.user?.id) throw new Error("User creation failed");

        } catch (error: any) {
            console.error("Registration error:", error);
            Alert.alert("Error", error.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }, [name, email, password, confirmPassword, phone, referralCode, navigation, validate]);

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
            <YStack flex={1} p="$4" space="$4" maw={600} alignSelf="center" w="100%" mt="$2">
                {/* Logo & Header */}
                <YStack ai="center" space="$3">
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={{ width: 230, height: 124 }}
                        resizeMode="contain"
                    />
                    <YStack jc='center' alignItems='center' mb='$3' mt='$2'>
                        <H4 fontWeight="600" fontSize="$6" color={colors.text}>
                            Create Account
                        </H4>
                        <Text
                            mt="$3"
                            fontSize="$4"
                            fontWeight="500"
                            color={colors.textSecondary}
                            textAlign="center"
                            flexShrink={1}
                            flexWrap="wrap"
                        >
                            Join Parentfully to better coordinate parenting efforts with your co-parent
                        </Text>
                    </YStack>

                    {/* Social Login */}
                    <XStack space="$5" jc="center">
                        <Button
                            size="$4"
                            flex={1}
                            backgroundColor="white"
                            borderWidth={1}
                            borderColor={colors.border as any}
                            borderRadius="$4"
                            pressStyle={{ scale: 0.98 }}
                            onPress={googleSignIn}
                            icon={
                                <Image
                                    source={require("@/assets/icons/google.png")}
                                    style={{ width: 20, height: 20 }}
                                    resizeMode="contain"
                                />
                            }
                            space="$4"
                        >
                            <Text color={colors.text} fontWeight="700">
                                Continue with Google
                            </Text>
                        </Button>
                    </XStack>
                </YStack>

                {/* Divider */}
                <XStack jc="center" ai="center" space="$3" my="$1">
                    <Separator />
                    <Text color={colors.text}>
                        OR
                    </Text>
                    <Separator />
                </XStack>

                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={15}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{ paddingBottom: 50 }}>

                    <YStack space="$4">
                        {/* Error */}
                        {error ? <Text color="red">{error}</Text> : null}

                        {/* Full Name */}
                        <YStack space="$1">
                            <Text color={colors.text} fontWeight="600">
                                Full Name
                            </Text>
                            <XStack
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor={colors.card}
                            >
                                <User size={18} color="$colorHover" />
                                <Input
                                    placeholder="Enter your full name"
                                    placeholderTextColor={colors.text}
                                    value={name}
                                    onChangeText={setName}
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$4"
                                    backgroundColor={colors.card}
                                />
                            </XStack>
                        </YStack>

                        {/* Email */}
                        <YStack space="$1">
                            <Text color={colors.text} fontWeight="600">
                                Email Address
                            </Text>
                            <XStack
                                borderWidth={1}
                                borderColor={colors.border as any}
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor={colors.card}
                            >
                                <Mail size={18} color="$colorHover" />
                                <Input
                                    placeholder="Enter your email"
                                    placeholderTextColor="$colorPlaceholder"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$4"
                                    backgroundColor={colors.card}
                                />
                            </XStack>
                        </YStack>

                        {/* Phone Number */}
                        <YStack space="$1">
                            <Text color={colors.text} fontWeight="600">
                                Phone Number
                            </Text>
                            <XStack
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor="$background"
                            >
                                <Phone size={18} color="$colorHover" />
                                <Input
                                    placeholder="Enter your phone number"
                                    placeholderTextColor="$colorPlaceholder"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$4"
                                    backgroundColor={colors.card}
                                />
                            </XStack>
                        </YStack>

                        {/* Referral Code */}
                        <YStack space="$1">
                            <Text color={colors.text} fontWeight="600">
                                Referral Code (optional)
                            </Text>
                            <XStack
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor="$background"
                            >
                                <AlertOctagon size={18} color="$colorHover" />
                                <Input
                                    placeholder="Enter referral code"
                                    placeholderTextColor="$colorPlaceholder"
                                    value={referralCode}
                                    onChangeText={setReferralCode}
                                    autoCapitalize="characters"
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$4"
                                    backgroundColor={colors.card}
                                />
                            </XStack>
                        </YStack>

                        {/* Password */}
                        <YStack space="$1">
                            <Text color={colors.text} fontWeight="600">
                                Password
                            </Text>
                            <XStack
                                borderWidth={1}
                                borderColor={colors.border as any}
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor={colors.card}
                            >
                                <Lock size={18} color="$colorHover" />
                                <Input
                                    placeholder="Create a password"
                                    placeholderTextColor="$colorPlaceholder"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$4"
                                    backgroundColor={colors.card}
                                />
                                <Button unstyled onPress={() => setShowPassword(!showPassword)} padding="$2">
                                    {showPassword ? (
                                        <Text textDecorationLine="underline">Hide</Text>
                                    ) : (
                                        <Text textDecorationLine="underline">Show</Text>
                                    )}
                                </Button>
                            </XStack>
                        </YStack>

                        {/* Confirm Password */}
                        <YStack space="$1" mt="$3">
                            <Text color={colors.text} fontWeight="600">
                                Confirm Password
                            </Text>
                            <XStack
                                borderWidth={1}
                                borderColor={colors.border as any}
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor="$background"
                            >
                                <Lock size={18} color="$colorHover" />
                                <Input
                                    placeholder="Confirm password"
                                    placeholderTextColor="$colorPlaceholder"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$4"
                                    backgroundColor={colors.card}
                                />
                                <Button unstyled onPress={() => setShowConfirmPassword(!showConfirmPassword)} padding="$2">
                                    {showConfirmPassword ? (
                                        <Text textDecorationLine="underline">Hide</Text>
                                    ) : (
                                        <Text textDecorationLine="underline">Show</Text>
                                    )}
                                </Button>
                            </XStack>

                            {/* 👇 Error message under Confirm Password */}
                            {confirmPassword.length > 0 && password !== confirmPassword && (
                                <Text color="red" fontWeight="500" fontSize="$3" mt="$1">
                                    Passwords do not match
                                </Text>
                            )}
                        </YStack>

                        {/* Rules (only show if user has started typing) */}
                        {password.length > 0 && (
                            <YStack mt="$2" space='$2'>
                                <Text>
                                    Your Password must include:
                                </Text>
                                {rules.map((rule, i) => (
                                    <XStack key={i} ai="center" space="$2" mb="$2">
                                        <XStack
                                            w={20}
                                            h={20}
                                            jc="center"
                                            ai="center"
                                            br="$10"
                                            bg={rule.valid ? "green" : "red"}
                                        >
                                            {rule.valid ? (
                                                <Check size={14} color="white" />
                                            ) : (
                                                <X size={14} color="white" />
                                            )}
                                        </XStack>

                                        <Text fontSize="$4" color={rule.valid ? "green" : "red"}>
                                            {rule.label}
                                        </Text>
                                    </XStack>
                                ))}
                            </YStack>
                        )}

                        {/* Terms */}
                        <XStack mt="$2" ai="center" space="$3">
                            <Checkbox
                                size="$4"
                                id="remember"
                                checked={Terms}
                                onCheckedChange={(val) => setTerms(!!val)}
                                borderColor={colors.text}
                                backgroundColor="transparent"
                            >
                                <Checkbox.Indicator backgroundColor={colors.primary} />
                            </Checkbox>


                            <Text
                                color={colors.text}
                                flexShrink={1}
                                flexWrap="wrap"
                            >
                                By signing up, you agree to our{' '}
                                <Text
                                    color={colors.primary}
                                    fontWeight="600"
                                    onPress={() => router.push('/terms' as never)}
                                >
                                    Terms of Service
                                </Text>{' '}
                                and{' '}
                                <Text
                                    color={colors.primary}
                                    fontWeight="600"
                                    onPress={() => router.push('/privacy' as never)}
                                >
                                    Privacy Policy
                                </Text>
                            </Text>
                        </XStack>

                        {/* Signup Button */}
                        <Button
                            size="$5"
                            backgroundColor={colors.primary}
                            borderRadius="$10"
                            onPress={handleRegister}
                            hoverStyle={{ backgroundColor: '$accentHover' }}
                            pressStyle={{ scale: 0.98 }}
                            mt="$3"
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text color="white" fontWeight="600" fontSize="$4">
                                    Continue
                                </Text>
                            )}
                        </Button>

                        {/* Already have account */}
                        <XStack jc="center" mt="$2">
                            <Text fontSize="$5" color="$color">
                                Already have an account?{' '}
                                <Text
                                    textDecorationLine="underline"
                                    color={colors.primary}
                                    fontWeight="700"
                                    onPress={() => navigation.navigate('Login' as never)}
                                >
                                    Sign In
                                </Text>
                            </Text>
                        </XStack>
                    </YStack>
                </KeyboardAwareScrollView>
            </YStack>

            <SuccessSheet
                open={showSuccess}
                onOpenChange={setShowSuccess}
                message="Account created successfully!"
                redirectTo="Login"
            />
        </ScrollView>
    )
}