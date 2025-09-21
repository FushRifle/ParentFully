import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Lock, Mail } from '@tamagui/lucide-icons'
import { useNavigation } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    Keyboard,
    ScrollView,
    TouchableWithoutFeedback
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
    Button,
    Checkbox,
    H2,
    Image,
    Input,
    Label,
    Separator,
    Spinner,
    Text,
    XStack,
    YStack
} from 'tamagui'

export default function LoginScreen() {
    const { colors } = useTheme()
    const navigation = useNavigation();
    const { setUser } = useAuth();

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Load saved credentials
    useEffect(() => {
        const loadSavedCredentials = async () => {
            try {
                const saved = await AsyncStorage.getItem('savedCredentials')
                if (saved) {
                    const { email, password, rememberMe } = JSON.parse(saved)
                    setEmail(email)
                    setPassword(password)
                    setRememberMe(rememberMe)
                }
            } catch (err) {
                console.error('Failed to load saved credentials', err)
            }
        }
        loadSavedCredentials()
    }, [])

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }
        setLoading(true)
        setError(null)
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
            if (authError) throw authError

            if (rememberMe) {
                await AsyncStorage.setItem(
                    'savedCredentials',
                    JSON.stringify({ email, password, rememberMe })
                )
            } else {
                await AsyncStorage.removeItem('savedCredentials')
            }
            // No need for setUser — context will update automatically
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = () => {
        if (!email) {
            setError('Please enter your email first')
            return
        }

        navigation.navigate('ForgotPassword' as never)
    }

    return (
        <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={5}
            keyboardOpeningTime={0}
            style={{ flex: 1, backgroundColor: colors.background }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <YStack flex={1} p="$5" space="$4" maw={600} alignSelf="center" w="100%" mt="$8">

                        {/* Logo & Header */}
                        <YStack ai="center" space="$3" mb="$2">
                            <Image
                                source={require('@/assets/images/icon.png')}
                                style={{ width: 230, height: 124 }}
                                resizeMode="contain"
                            />
                            <YStack jc='center' alignItems='center' mb='$3' mt='$2'>
                                <H2 fontWeight="700" fontFamily='interBold' fontSize="$8" color={colors.text}>
                                    Welcome back
                                </H2>
                                <Text color={colors.text} fontSize="$4" fontWeight="500">
                                    Log In to continue grooming your child
                                </Text>
                            </YStack>

                            {/* Social Login */}
                            <XStack space="$5" jc="center">
                                <Button
                                    size="$4"
                                    flex={1}
                                    backgroundColor="white"
                                    borderRadius="$4"
                                    pressStyle={{ scale: 0.98 }}
                                    icon={
                                        <Image
                                            source={require("@/assets/icons/google.png")}
                                            style={{ width: 20, height: 20 }}
                                            resizeMode="contain"
                                        />
                                    }
                                    space="$4"
                                >
                                    <Text color={colors.text} fontWeight="700" fontFamily='interBold'>
                                        Continue with Google
                                    </Text>
                                </Button>
                            </XStack>
                        </YStack>

                        {/* Divider */}
                        <XStack jc="center" ai="center" space="$3" my="$1">
                            <Separator />
                            <Text color={colors.text} fontSize="$6" fontWeight="500">OR</Text>
                            <Separator />
                        </XStack>

                        {/* Form */}
                        <YStack space="$3">

                            {error && <Text color="red" fontWeight="500" fontSize="$4">{error}</Text>}

                            {/* Email */}
                            <YStack space="$2">
                                <Text fontSize="$4" color={colors.text} fontFamily='interBold' fontWeight="700">Email Address</Text>
                                <XStack
                                    borderRadius="$4"
                                    px="$3"
                                    py="$2"
                                    ai="center"
                                    space="$2"
                                    backgroundColor="white"
                                >
                                    <Mail size={18} color="$colorHover" />
                                    <Input
                                        placeholder="Enter your email"
                                        placeholderTextColor="$colorPlaceholder"
                                        flex={1}
                                        borderWidth={0}
                                        p={0}
                                        fontSize="$5"
                                        backgroundColor="white"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </XStack>
                            </YStack>

                            {/* Password */}
                            <YStack space="$1">
                                <Text fontSize="$4" color={colors.text} fontFamily='interBold' fontWeight="700">Password</Text>
                                <XStack
                                    borderRadius="$4"
                                    px="$3"
                                    py="$2"
                                    ai="center"
                                    space="$2"
                                    backgroundColor="white"
                                >
                                    <Lock size={18} color="$colorHover" />
                                    <Input
                                        placeholder="Enter your password"
                                        placeholderTextColor="$colorPlaceholder"
                                        secureTextEntry={!showPassword}
                                        flex={1}
                                        borderWidth={0}
                                        p={0}
                                        fontSize="$5"
                                        backgroundColor="white"
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <Button unstyled onPress={() => setShowPassword(!showPassword)} hoverStyle={{ opacity: 0.7 }} padding="$2">
                                        <Text textDecorationLine="underline">{showPassword ? 'Hide' : 'Show'}</Text>
                                    </Button>
                                </XStack>
                            </YStack>

                            {/* Remember & Forgot */}
                            <XStack ai="center" jc="space-between">
                                <XStack ai="center" space="$3">
                                    <Checkbox size="$4" id="remember" checked={rememberMe} onCheckedChange={(val) => setRememberMe(!!val)} backgroundColor="white">
                                        <Checkbox.Indicator backgroundColor={colors.primary} />
                                    </Checkbox>
                                    <Label htmlFor="remember" fontSize="$3" color={colors.text}>
                                        Remember me
                                    </Label>
                                </XStack>

                                <Button unstyled onPress={handleForgotPassword}>
                                    <Text color={colors.text} fontSize="$4" fontWeight="700">Forgot password?</Text>
                                </Button>
                            </XStack>

                            {/* Login Button */}
                            <Button
                                size="$5"
                                mt="$5"
                                backgroundColor={colors.primary}
                                borderRadius="$10"
                                onPress={handleLogin}
                                pressStyle={{ scale: 0.98 }}
                            >
                                {loading ? <Spinner color="white" /> : <Text color={colors.onPrimary} fontWeight="600" fontSize="$4">Log In</Text>}
                            </Button>

                        </YStack>

                        {/* Sign up */}
                        <XStack jc="center" mt="$3">
                            <Text fontSize="$5" color="$color">
                                Don't have an account?{' '}
                                <Text textDecorationLine="underline" color={colors.primary} fontWeight="700" onPress={() => navigation.navigate("Register" as never)}>
                                    Sign Up
                                </Text>
                            </Text>
                        </XStack>

                    </YStack>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
    )
}
