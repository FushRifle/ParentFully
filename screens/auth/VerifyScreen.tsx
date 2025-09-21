import { useAuth } from "@/hooks/auth/useAuth";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, CheckCircle, Phone } from "@tamagui/lucide-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";
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

interface VerifyScreenProps {
    userId: string;
    email: string;
    onComplete: () => void;
    onSkip: () => void;
}

const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const PhoneVerification: React.FC<VerifyScreenProps> = ({ userId, email, onComplete, onSkip }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { user } = useAuth(); // Get the current authenticated user

    const [step, setStep] = useState(1);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState("+1");
    const [code, setCode] = useState(Array(6).fill(""));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    const inputRefs = useRef<Array<any>>([]);
    const phoneInputRef = useRef<any>(null);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleSendVerificationCode = useCallback(async () => {
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
            // First update the user's phone number in the database
            const { error: updateError } = await supabase
                .from("users")
                .update({ phone: fullPhoneNumber })
                .eq("id", userId);

            if (updateError) {
                setError(updateError.message || "Failed to update phone number");
                setLoading(false);
                return;
            }

            // Then update the auth user's phone number
            const { error: authUpdateError } = await supabase.auth.updateUser({
                phone: fullPhoneNumber
            });

            if (authUpdateError) {
                setError(authUpdateError.message || "Failed to update authentication");
                setLoading(false);
                return;
            }

            // Now send the verification code using the phone auth API
            const { error: otpError } = await supabase.auth.signInWithOtp({
                phone: fullPhoneNumber,
            });

            if (!otpError) {
                setStep(2);
                setResendCooldown(60);
            } else {
                setError(otpError.message || "Failed to send verification code");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send verification code");
        }

        setLoading(false);
    }, [phoneNumber, countryCode, userId]);

    const handleVerifyCode = useCallback(async () => {
        const otp = code.join("");
        if (otp.length < 6) {
            setError("Please enter the full 6-digit code");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;

            // Verify the code using the phone auth API
            const { data, error } = await supabase.auth.verifyOtp({
                phone: fullPhoneNumber,
                token: otp,
                type: 'sms',
            });

            if (!error && data.session) {
                // Update the user's phone verification status
                const { error: updateError } = await supabase
                    .from("users")
                    .update({
                        phone: fullPhoneNumber,
                        phone_verified: true
                    })
                    .eq("id", userId);

                if (updateError) {
                    console.error("Error updating phone verification status:", updateError.message);
                }

                setStep(3);
            } else {
                setError(error?.message || "Invalid verification code. Please try again.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to verify code");
        }

        setLoading(false);
    }, [code, userId, phoneNumber, countryCode]);

    const handleResendCode = useCallback(async () => {
        if (resendCooldown > 0) return;

        setLoading(true);
        try {
            const fullPhoneNumber = `${countryCode}${phoneNumber}`;

            // Resend the verification code
            const { error } = await supabase.auth.signInWithOtp({
                phone: fullPhoneNumber,
            });

            if (!error) {
                setResendCooldown(60);
                setError("");
            } else {
                setError(error.message || "Failed to resend code");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to resend code");
        }
        setLoading(false);
    }, [resendCooldown, countryCode, phoneNumber]);

    const handleCodeChange = useCallback((value: string, index: number) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const updatedCode = [...code];
            updatedCode[index] = value;
            setCode(updatedCode);

            if (value && index < 5 && inputRefs.current[index + 1]?.focus) {
                inputRefs.current[index + 1].focus();
            }
        }
    }, [code]);

    const handleKeyPress = useCallback((
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0 && inputRefs.current[index - 1]?.focus) {
            inputRefs.current[index - 1].focus();
        }
    }, [code]);

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    const maskedPhone = fullPhoneNumber.slice(0, -4) + '****';

    return (
        <YStack f={1} p="$4" bg={colors.background}>
            <XStack ai="center" jc="flex-start" mb="$4" space="$2" mt="$7">
                {step > 1 && step < 3 && (
                    <Button
                        onPress={() => setStep(step - 1)}
                        icon={<ArrowLeft size={20} />}
                        bg="transparent"
                        color={colors.text}
                        px="$2"
                    >
                        <Text fontWeight='700' color={colors.text}>Back</Text>
                    </Button>
                )}
            </XStack>
            {step === 1 && (
                <XStack jc='flex-end'>
                    <Button
                        onPress={onSkip}
                        color={colors.primaryDark}
                        bg='transparent'
                        size="$6"
                    >
                        Skip
                    </Button>
                </XStack>
            )}

            {step === 1 && (
                <YStack space="$4" mt="$5">
                    <H4 color={colors.text}>Verify Your Phone</H4>
                    <Text color={colors.text}>
                        Add your phone number for account security and faster login.
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
                                placeholder="+1"
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
                                onSubmitEditing={handleSendVerificationCode}
                                returnKeyType="send"
                            />
                        </XStack>
                        {error ? <Text color={colors.error}>{error}</Text> : null}
                    </YStack>

                    <Button
                        onPress={handleSendVerificationCode}
                        bg={colors.primary}
                        color="white"
                        borderRadius="$10"
                        size="$5"
                        mt="$5"
                        disabled={loading}
                        icon={loading ? <Spinner color="white" /> : undefined}
                    >
                        {loading ? 'Sending...' : 'Send Verification Code'}
                    </Button>
                </YStack>
            )}

            {step === 2 && (
                <YStack space="$4" mt="$6">
                    <YStack space="$2" mb="$4">
                        <H5 color={colors.text} ta="left" fontSize="$8" fontWeight='700'>
                            Verify your number
                        </H5>
                        <Text color={colors.textSecondary} fontSize="$5" ta="left">
                            We've sent a 6-digit code to {maskedPhone}. Enter it below to verify your phone number.
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
                                w={50}
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

            {step === 3 && (
                <YStack ai="center" space="$4" px="$4" mt="$6">
                    <CheckCircle size={64} color={colors.primary as any} />
                    <YStack ai="center" space="$2">
                        <H4 color={colors.text} ta="center">
                            Phone Verified Successfully!
                        </H4>
                        <Text color={colors.text} ta="center">
                            Your phone number has been verified and added to your account for enhanced security.
                        </Text>
                    </YStack>
                    <Button
                        bg={colors.primary}
                        color="white"
                        borderRadius='$10'
                        size='$5'
                        onPress={onComplete}
                        w="100%"
                    >
                        Continue
                    </Button>
                </YStack>
            )}
        </YStack>
    );
};

export default PhoneVerification;