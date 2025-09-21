import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { requestPasswordReset, resetPassword } from "@/supabase/reset";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Check, CheckCircle, Phone, X } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    Button,
    H4,
    H5,
    Input,
    Spinner,
    Text,
    XStack,
    YStack
} from "tamagui";
type FormData = {
    displayName: string
    email: string
    password: string
    confirmPassword: string
    referralCode?: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

// Validation helpers
const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validatePassword = (password: string): string | null => {
    if (password.length < 8) return "Password must be at least 8 characters long";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    return null;
};


export default function ForgotPasswordFlow() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+234");
    const [userId, setUserId] = useState("");
    const [code, setCode] = useState(Array(6).fill(""));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<FormErrors>({})
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Refs for OTP input focus management
    const inputRefs = useRef<Array<any>>([]);
    const phoneInputRef = useRef<any>(null);

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
    }, [password, confirmPassword])

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSendResetCode = useCallback(async () => {
        const fullPhoneNumber = `${countryCode}${phoneNumber}`;

        if (!phoneNumber) {
            setError("Phone number is required");
            return;
        }

        if (!validatePhoneNumber(fullPhoneNumber)) {
            setError("Please enter a valid phone number");
            return;
        }

        setError("");
        setLoading(true);
        Keyboard.dismiss();

        try {
            // First check if user exists and get their ID
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id, phone")
                .eq("phone", fullPhoneNumber)
                .single();

            if (userError || !userData) {
                setError("No account found with this phone number");
                setLoading(false);
                return;
            }

            setUserId(userData.id);

            // Use your custom function to request password reset
            await requestPasswordReset(userData.id);
            setStep(2);
            setResendCooldown(60); // 60 seconds cooldown
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset code");
        }

        setLoading(false);
    }, [phoneNumber, countryCode]);

    const handleVerifyCode = useCallback(async () => {
        const otp = code.join("");
        if (otp.length < 5) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Verify the code
            const { data, error: verifyError } = await supabase
                .from("password_reset_codes")
                .select("*")
                .eq("user_id", userId)
                .eq("code", otp)
                .eq("used", false)
                .single();

            if (verifyError || !data) {
                setError("Verification code is incorrect. Please check and try again.");
                setLoading(false);
                return;
            }

            if (new Date(data.expires_at) < new Date()) {
                setError("Code has expired. Please request a new one.");
                setLoading(false);
                return;
            }

            setStep(3);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify code");
        }

        setLoading(false);
    }, [code, userId]);

    const handleCreatePassword = useCallback(async () => {
        // Password validation
        if (!password) {
            setError("Password is required");
            return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Use your custom function to reset password
            const otp = code.join("");
            await resetPassword(userId, otp, password);
            setStep(4);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update password. Please try again.");
        }

        setLoading(false);
    }, [password, confirmPassword, code, userId]);

    // Function to handle OTP input and auto-focus
    const handleCodeChange = useCallback((value: string, index: number) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const updatedCode = [...code];
            updatedCode[index] = value;
            setCode(updatedCode);

            // Auto-focus next input
            if (value && index < 5 && inputRefs.current[index + 1]?.focus) {
                inputRefs.current[index + 1].focus();
            }
        }
    }, [code]);

    // Function to handle back key in OTP inputs
    const handleKeyPress = useCallback((
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]?.focus) {
            inputRefs.current[index - 1].focus();
        }
    }, [code]);

    const handleResendCode = useCallback(async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        try {
            await requestPasswordReset(userId);
            setResendCooldown(60);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend code");
        }
        setLoading(false);
    }, [userId, resendCooldown]);

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const maskedPhone = fullPhoneNumber.slice(0, -4) + '****';

    return (
        <YStack f={1} p="$4" bg={colors.background}>

            {/* Header with Back + Title */}
            <XStack ai="center" jc="flex-start" mb="$4" space="$2" mt="$7">
                {step > 1 && step < 4 && (
                    <Button
                        onPress={() => setStep(step - 1)}
                        icon={<ArrowLeft size={20} />}
                        bg="transparent"
                        color={colors.text}
                        px="$2"
                    >
                        <Text fontWeight='700' color={colors.text}>
                            Back
                        </Text>
                    </Button>
                )}
            </XStack>

            {/* Slide 1: Phone Number */}
            {step === 1 && (
                <YStack space="$4" mt="$5">
                    <H4 color={colors.text}>Forgot Password</H4>
                    <Text color={colors.text}>
                        Enter your mobile number and we'll send you a verification code to reset your password.
                    </Text>

                    {/* Mobile Number */}
                    <YStack space="$2" mt="$6">
                        <Text fontSize="$4" color={colors.text} fontWeight="700">
                            Mobile Number
                        </Text>
                        <XStack
                            borderWidth={1}
                            borderColor={error ? colors.error : colors.border as any}
                            borderRadius="$4"
                            px="$3"
                            py="$2"
                            ai="center"
                            space="$2"
                            backgroundColor="white"
                        >
                            <Phone size={18} color={colors.text as any} />

                            {/* Country Code */}
                            <Input
                                placeholder="+234"
                                placeholderTextColor={colors.textSecondary}
                                width={70}
                                borderWidth={0}
                                p={0}
                                fontSize="$5"
                                backgroundColor="white"
                                value={countryCode}
                                onChangeText={setCountryCode}
                                keyboardType="phone-pad"
                            />

                            {/* Phone Number */}
                            <Input
                                ref={phoneInputRef}
                                placeholder="Enter your number"
                                placeholderTextColor={colors.textSecondary}
                                flex={1}
                                borderWidth={0}
                                p={0}
                                fontSize="$5"
                                backgroundColor="white"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                autoCapitalize="none"
                                onSubmitEditing={handleSendResetCode}
                                returnKeyType="send"
                            />
                        </XStack>
                        {error ? <Text color={colors.error}>{error}</Text> : null}
                    </YStack>

                    <Button
                        onPress={handleSendResetCode}
                        bg={colors.primary}
                        color="white"
                        borderRadius="$10"
                        size="$5"
                        mt="$5"
                        disabled={loading}
                        icon={loading ? <Spinner color="white" /> : undefined}
                    >
                        {loading ? 'Sending...' : 'Get Reset Code'}
                    </Button>

                    {/* Already have account */}
                    <XStack jc="flex-start" mt="$2" space="$3">
                        <Text fontSize="$5" color={colors.text}>
                            Remember Password?{' '}
                            <Text
                                textDecorationLine="underline"
                                color={colors.primary}
                                fontWeight="700"
                                onPress={() => navigation.navigate('Login' as never)}
                            >
                                Log In
                            </Text>
                        </Text>
                    </XStack>
                </YStack>
            )}

            {/* Slide 2: OTP */}
            {step === 2 && (
                <YStack space="$4" mt="$6">
                    <YStack space="$2" mb="$4">
                        <H5 color={colors.text} ta="left" fontSize="$8" fontWeight='700'>
                            Check your messages
                        </H5>
                        <Text color={colors.textSecondary} fontSize="$5" ta="left">
                            We've sent a 6-digit code to {maskedPhone}. Enter it below to verify your account.
                        </Text>
                    </YStack>

                    <YStack>
                        <Text color={colors.text} fontSize="$5" ta="left" fontWeight="600">
                            Enter Verification Code
                        </Text>
                    </YStack>

                    <XStack jc="space-between" mb="$2">
                        {code.map((digit, i) => (
                            <Input
                                key={i}
                                ref={(ref) => { inputRefs.current[i] = ref; }}
                                value={digit}
                                onChangeText={(val: string) => handleCodeChange(val, i)}
                                onKeyPress={(e: any) => handleKeyPress(e, i)}
                                maxLength={1}
                                keyboardType="number-pad"
                                textAlign="center"
                                fontSize="$9"
                                fontWeight='700'
                                w={62}
                                h={68}
                                borderWidth={1}
                                borderColor={error ? colors.error : colors.border as any}
                                color={colors.text}
                                bg='white'
                            />
                        ))}
                    </XStack>

                    {error ? <Text color={colors.error}>{error}</Text> : null}

                    <XStack jc="flex-start" mt="$3" mb="$4">
                        <Text fontSize="$5" color={colors.text}>
                            Didn't receive the code?{" "}
                        </Text>
                        {resendCooldown > 0 ? (
                            <Text color={colors.textSecondary} fontSize="$5">
                                Resend in {resendCooldown}s
                            </Text>
                        ) : (
                            <Text
                                color={colors.primary}
                                fontWeight="600"
                                fontSize="$5"
                                onPress={handleResendCode}
                            >
                                Resend
                            </Text>
                        )}
                    </XStack>

                    <Button
                        onPress={handleVerifyCode}
                        bg={colors.primary}
                        color="white"
                        borderRadius='$10'
                        size='$5'
                        disabled={loading}
                        icon={loading ? <Spinner color="white" /> : undefined}
                    >
                        {loading ? "Verifying..." : "Verify Code"}
                    </Button>
                </YStack>
            )}

            {/* Slide 3: Create Password */}
            {step === 3 && (
                <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={5} keyboardOpeningTime={0}>

                    <YStack space="$4" mt="$2">
                        <YStack space="$2">
                            <H5 color={colors.text} fontWeight='700' fontSize='$8'>
                                Create new password
                            </H5>
                            <Text color={colors.text}>
                                Your new password must be different from previously used passwords.
                            </Text>
                        </YStack>

                        <YStack space="$2">
                            <Text fontSize="$4" fontWeight="600" color={colors.text}>
                                New Password
                            </Text>
                            <XStack
                                borderWidth={1}
                                borderColor={error ? colors.error : colors.border as any}
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor="white"
                            >
                                <Input
                                    placeholder="Enter new password"
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$5"
                                    backgroundColor="white"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    onSubmitEditing={handleCreatePassword}
                                    returnKeyType="done"
                                />
                                <Button
                                    unstyled
                                    onPress={() => setShowPassword(!showPassword)}
                                    hoverStyle={{ opacity: 0.7 }}
                                    padding="$2"
                                    icon={showPassword ?
                                        <Text textDecorationLine="underline">Hide</Text> :
                                        <Text textDecorationLine="underline">Show</Text>}
                                />
                            </XStack>
                        </YStack>

                        <YStack space="$2">
                            <Text fontSize="$4" fontWeight="600" color={colors.text}>
                                Confirm Password
                            </Text>
                            <XStack
                                borderWidth={1}
                                borderColor={error ? colors.error : colors.border as any}
                                borderRadius="$4"
                                px="$3"
                                py="$2"
                                ai="center"
                                space="$2"
                                backgroundColor="white"
                            >
                                <Input
                                    placeholder="Confirm new password"
                                    flex={1}
                                    borderWidth={0}
                                    p={0}
                                    fontSize="$5"
                                    backgroundColor="white"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    onSubmitEditing={handleCreatePassword}
                                    returnKeyType="done"
                                />
                                <Button
                                    unstyled
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    padding="$2"
                                    icon={showConfirmPassword ?
                                        <Text textDecorationLine="underline">Hide</Text> :
                                        <Text textDecorationLine="underline">Show</Text>}
                                />
                            </XStack>
                        </YStack>

                        {error ? <Text color={colors.error}>{error}</Text> : null}

                        {/* Rules (only show if user has started typing) */}
                        {password.length > 0 && (
                            <YStack mt="$5" space='$2'>
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

                        <Button
                            onPress={handleCreatePassword}
                            bg={colors.primary}
                            color="white"
                            borderRadius='$10'
                            size='$5'
                            mt='$4'
                            disabled={loading}
                            icon={loading ? <Spinner color="white" /> : undefined}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </YStack>
                </KeyboardAwareScrollView>
            )}

            {/* Slide 4: Success */}
            {step === 4 && (
                <YStack ai="center" space="$4" px="$4" mt="$6">
                    <CheckCircle size={64} color={colors.primary as any} />

                    <YStack ai="center" space="$2">
                        <H4 color={colors.text} ta="center">
                            Password Updated Successfully!
                        </H4>
                        <Text color={colors.text} ta="center">
                            Your password has been reset successfully. Use your new password to log in to your account.
                        </Text>
                    </YStack>

                    <Button
                        bg={colors.primary}
                        color="white"
                        borderRadius='$10'
                        size='$5'
                        onPress={() => navigation.navigate("Login" as never)}
                        w="100%"
                    >
                        Continue to Login
                    </Button>
                </YStack>
            )}
        </YStack>
    );
}