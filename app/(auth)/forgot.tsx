import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { requestPasswordReset, resetPassword } from "@/supabase/reset";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, CheckCircle, Mail } from "@tamagui/lucide-icons";
import React, { useRef, useState } from "react";
import { NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
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

export default function ForgotPasswordFlow() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState("");
    const [code, setCode] = useState(Array(5).fill(""));
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Refs for OTP input focus management
    const inputRefs = useRef([]);

    const handleSendResetLink = async () => {
        if (!email) {
            setError("Email is required");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // First check if user exists and get their ID
            const { data: userData, error: userError } = await supabase
                .from("users")
                .select("id")
                .eq("email", email)
                .single();

            if (userError || !userData) {
                setError("No account found with this email address");
                setLoading(false);
                return;
            }

            setUserId(userData.id);

            // Use your custom function to request password reset
            await requestPasswordReset(userData.id, email);
            setStep(2);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || "Failed to send reset code");
            } else {
                setError("Failed to send reset code");
            }
        }

        setLoading(false);
    };

    const handleVerifyCode = async () => {
        const otp = code.join("");
        if (otp.length < 5) {
            setError("Please enter the full 5-digit code");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Verify the code using your custom logic
            // We'll just check if it's valid here, actual password reset happens in next step
            const { data, error: verifyError } = await supabase
                .from("password_reset_codes")
                .select("*")
                .eq("user_id", userId)
                .eq("code", otp)
                .eq("used", false)
                .single();

            if (verifyError || !data) {
                setError("Invalid or expired code");
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
            if (err instanceof Error) {
                setError(err.message || "Failed to verify code");
            } else {
                setError("Failed to verify code");
            }
        }

        setLoading(false);
    };

    const handleCreatePassword = async () => {
        // Password validation
        if (!password) {
            setError("Password is required");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
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
            if (err instanceof Error) {
                setError(err.message || "Failed to update password. Please try again.");
            } else {
                setError("Failed to update password. Please try again.");
            }
        }

        setLoading(false);
    };

    // Function to handle OTP input and auto-focus
    const handleCodeChange = (value: string, index: number) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const updatedCode = [...code];
            updatedCode[index] = value;
            setCode(updatedCode);

            // Auto-focus next input
            if (
                value &&
                index < 4 &&
                inputRefs.current[index + 1] &&
                typeof (inputRefs.current[index + 1] as { focus?: () => void }).focus === "function"
            ) {
                (inputRefs.current[index + 1] as { focus: () => void }).focus();
            }
        }
    }
    // Function to handle back key in OTP inputs
    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (
            e.nativeEvent.key === 'Backspace' &&
            !code[index] &&
            index > 0 &&
            inputRefs.current[index - 1] &&
            typeof (inputRefs.current[index - 1] as { focus?: () => void }).focus === "function"
        ) {
            (inputRefs.current[index - 1] as { focus: () => void }).focus();
        }
    };

    return (
        <YStack f={1} p="$4" bg={colors.background}>
            {/* Header with Back + Title */}
            <XStack ai="center" jc="flex-start"
                mb="$4" space="$2" mt='$7'
            >
                {step > 1 && step < 4 && (
                    <Button
                        onPress={() => setStep(step - 1)}
                        icon={<ArrowLeft size={20} />}
                        bg="white"
                        color={colors.text}
                        px="$2"
                    >
                        <Text
                            fontWeight='700'
                            color={colors.text}
                        >
                            Back
                        </Text>
                    </Button>
                )}
            </XStack>

            {/* Slide 1: Email */}
            {step === 1 && (
                <YStack space="$4" mt='$5'>
                    <H4 color={colors.text}>
                        Forgot Password
                    </H4>
                    <Text color={colors.text}>
                        Enter your email address and we'll send you a verification code to reset your password.
                    </Text>
                    <Text color={colors.text}>
                        Don't be scared, follow this simple process to set a new one
                    </Text>

                    {/* Email */}
                    <YStack space="$2" mt='$6'>
                        <Text fontSize="$4" color={colors.text} fontWeight="600">
                            Email Address
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
                            <Mail size={18} color={colors.primary as any} />
                            <Input
                                placeholder="Enter your email"
                                placeholderTextColor={colors.textSecondary}
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

                    {error ? <Text color={colors.error}>{error}</Text> : null}

                    <Button
                        onPress={handleSendResetLink}
                        bg={colors.primary}
                        color="white"
                        borderRadius='$10'
                        size='$5'
                        mt='$8'
                        disabled={loading}
                        icon={loading ? <Spinner color="white" /> : undefined}
                    >
                        {loading ? "Sending..." : "Get Reset Code"}
                    </Button>

                    {/* Already have account */}
                    <XStack jc="center" mt="$2">
                        <Text fontSize="$5" color={colors.text}>
                            Remember Password?{' '}
                            <Text
                                textDecorationLine="underline"
                                color={colors.primary}
                                fontWeight="700"
                                onPress={() => navigation.navigate('login' as never)}
                            >
                                Log In
                            </Text>
                        </Text>
                    </XStack>
                </YStack>
            )}

            {/* Slide 2: OTP */}
            {step === 2 && (
                <YStack space="$4" mt='$6'>
                    <YStack space="$2" mb='$4'>
                        <H5 color={colors.text} ta="left" fontSize='$8' fontWeight='700'>
                            Check your inbox
                        </H5>
                        <Text color={colors.text} fontSize='$5' ta="left">
                            We've sent a 5-digit code to your {email}. Enter it below to verify your account.
                        </Text>
                    </YStack>

                    <YStack>
                        <Text color={colors.text} fontSize='$5' ta="left" fontWeight="600">
                            Enter Verification Code
                        </Text>
                    </YStack>

                    <XStack jc="space-between" mb='$2'>
                        {code.map((digit, i) => (
                            <Input
                                key={i}
                                // @ts-expect-error: Type mismatch for ref, but this is safe for TextInput
                                ref={(ref: any) => { inputRefs.current[i] = ref; }}
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

                    <XStack jc="flex-start" mt='$3' mb='$4'>
                        <Text fontSize='$5' color={colors.text}>
                            Didn't receive the code?{" "}
                        </Text>
                        <Text
                            color={colors.primary}
                            fontWeight="600"
                            fontSize='$5'
                            onPress={handleSendResetLink}
                        >
                            Resend
                        </Text>
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
                <YStack space="$4" mt="$2">
                    <YStack space="$2">
                        <H5 color={colors.text}
                            fontWeight='700'
                            fontSize='$8'
                        >
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
                            />
                            <Button
                                unstyled
                                onPress={() => setShowPassword(!showPassword)}
                                hoverStyle={{ opacity: 0.7 }}
                                padding="$2"
                            >
                                {showPassword ? (
                                    <Text textDecorationLine="underline">Hide</Text>
                                ) : (
                                    <Text textDecorationLine="underline">Show</Text>
                                )}
                            </Button>
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
                            />
                            <Button unstyled onPress={() => setShowConfirmPassword(!showConfirmPassword)} padding="$2">
                                {showConfirmPassword ? (
                                    <Text textDecorationLine="underline">Hide</Text>
                                ) : (
                                    <Text textDecorationLine="underline">Show</Text>
                                )}
                            </Button>
                        </XStack>
                    </YStack>

                    <YStack space="$1" mt="$2">
                        <Text fontSize="$3" color={colors.textSecondary}>
                            • Must be at least 8 characters
                        </Text>
                        <Text fontSize="$3" color={colors.textSecondary}>
                            • Must contain uppercase and lowercase letters
                        </Text>
                        <Text fontSize="$3" color={colors.textSecondary}>
                            • Must contain at least one number
                        </Text>
                    </YStack>

                    {error ? <Text color={colors.error}>{error}</Text> : null}

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
            )}

            {/* Slide 4: Success */}
            {step === 4 && (
                <YStack ai="center" space="$4" px="$4" mt="$6">
                    <CheckCircle size={64} color={colors.success as any} />

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