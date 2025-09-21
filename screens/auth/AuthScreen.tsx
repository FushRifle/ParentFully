import { supabase } from '@/supabase/client';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
    Button,
    H2,
    Input,
    Label,
    ScrollView,
    Separator,
    Tabs,
    Text,
    XStack,
    YStack
} from 'tamagui';

type UserRole = 'parent' | 'child' | 'admin';

export const AuthScreen = () => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Shared fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Signup specific
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [role, setRole] = useState<UserRole>('parent');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Load saved credentials
    useEffect(() => {
        const loadCredentials = async () => {
            const saved = await AsyncStorage.getItem('savedCredentials');
            if (saved) {
                const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
                setEmail(savedEmail);
                setPassword(savedPassword);
                setRememberMe(true);
            }
        };
        loadCredentials();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        setErrors({});

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            if (rememberMe) {
                await AsyncStorage.setItem('savedCredentials', JSON.stringify({ email, password }));
            } else {
                await AsyncStorage.removeItem('savedCredentials');
            }

            router.replace('/(tabs)');
        } catch (error) {
            setErrors({ login: error instanceof Error ? error.message : 'Login failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        const newErrors: Record<string, string> = {};
        if (!firstName) newErrors.firstName = 'Required';
        if (!lastName) newErrors.lastName = 'Required';
        if (!email) newErrors.email = 'Required';
        if (!password) newErrors.password = 'Required';
        if (password.length < 6) newErrors.password = 'Min 6 characters';
        if (role === 'parent' && !familyName) newErrors.familyName = 'Required for parents';
        if (!agreeToTerms) newErrors.agreeToTerms = 'You must agree';

        setErrors(newErrors);
        if (Object.keys(newErrors).length) return;

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role,
                        family_name: familyName,
                    }
                }
            });

            if (error) throw error;

            Alert.alert(
                'Confirm Your Email',
                'Check your email to confirm your account',
                [{ text: 'OK', onPress: () => setActiveTab('login') }]
            );
        } catch (error) {
            setErrors({ signup: error instanceof Error ? error.message : 'Signup failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrors({ login: 'Enter your email first' });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;
            Alert.alert('Reset Email Sent', `Check ${email} for instructions`);
        } catch (error) {
            setErrors({ login: error instanceof Error ? error.message : 'Failed to send reset' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView>
            <YStack f={1} p="$4" jc="center" space="$4">
                <H2 ta="center" mb="$2">
                    {activeTab === 'login' ? 'Welcome Back' : 'Create Account'}
                </H2>

                <Tabs
                    value={activeTab}
                    onValueChange={(val) => {
                        setActiveTab(val as 'login' | 'signup');
                        setErrors({});
                    }}
                >
                    <Tabs.List>
                        <Tabs.Tab value="login" f={1}>
                            <Text>Login</Text>
                        </Tabs.Tab>
                        <Tabs.Tab value="signup" f={1}>
                            <Text>Sign Up</Text>
                        </Tabs.Tab>
                    </Tabs.List>

                    <Separator />

                    <Tabs.Content value="login">
                        <YStack space="$3" pt="$4">
                            {errors.login && (
                                <Text color="$red10" ta="center">{errors.login}</Text>
                            )}

                            <YStack space="$2">
                                <Label htmlFor="loginEmail">Email</Label>
                                <Input
                                    id="loginEmail"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </YStack>

                            <YStack space="$2">
                                <Label htmlFor="loginPassword">Password</Label>
                                <XStack position="relative">
                                    <Input
                                        id="loginPassword"
                                        placeholder="••••••••"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        flex={1}
                                    />
                                    <Button
                                        position="absolute"
                                        right="$2"
                                        top="$2"
                                        size="$2"
                                        circular
                                        icon={
                                            <MaterialIcons
                                                name={showPassword ? 'visibility-off' : 'visibility'}
                                                size={16}
                                            />
                                        }
                                        onPress={() => setShowPassword(!showPassword)}
                                        chromeless
                                    />
                                </XStack>
                                <Button
                                    alignSelf="flex-end"
                                    size="$1"
                                    chromeless
                                    onPress={handleForgotPassword}
                                >
                                    Forgot password?
                                </Button>
                            </YStack>

                            <XStack ai="center" space="$2">
                                <Button
                                    size="$1"
                                    circular
                                    onPress={() => setRememberMe(!rememberMe)}
                                    bg={rememberMe ? '$blue10' : 'transparent'}
                                    borderColor="$blue10"
                                    borderWidth={1}
                                    icon={rememberMe ? <MaterialIcons name="check" size={14} color="white" /> : undefined}
                                />
                                <Text fontSize="$2">Remember me</Text>
                            </XStack>

                            <Button
                                onPress={handleLogin}
                                theme="blue"
                                disabled={loading || !email || !password}
                                icon={loading ? <MaterialIcons name="hourglass-empty" size={16} /> : undefined}
                            >
                                {loading ? 'Signing in...' : 'Login'}
                            </Button>
                        </YStack>
                    </Tabs.Content>

                    <Tabs.Content value="signup">
                        <YStack space="$3" pt="$4">
                            {errors.signup && (
                                <Text color="$red10" ta="center">{errors.signup}</Text>
                            )}

                            <XStack space="$2">
                                <YStack flex={1} space="$2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        value={firstName}
                                        onChangeText={setFirstName}
                                    />
                                    {errors.firstName && <Text color="$red10" fontSize="$1">{errors.firstName}</Text>}
                                </YStack>

                                <YStack flex={1} space="$2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChangeText={setLastName}
                                    />
                                    {errors.lastName && <Text color="$red10" fontSize="$1">{errors.lastName}</Text>}
                                </YStack>
                            </XStack>

                            {role === 'parent' && (
                                <YStack space="$2">
                                    <Label htmlFor="familyName">Family Name</Label>
                                    <Input
                                        id="familyName"
                                        placeholder="The Smiths"
                                        value={familyName}
                                        onChangeText={setFamilyName}
                                    />
                                    {errors.familyName && <Text color="$red10" fontSize="$1">{errors.familyName}</Text>}
                                </YStack>
                            )}

                            <YStack space="$2">
                                <Label htmlFor="signupEmail">Email</Label>
                                <Input
                                    id="signupEmail"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {errors.email && <Text color="$red10" fontSize="$1">{errors.email}</Text>}
                            </YStack>

                            <YStack space="$2">
                                <Label htmlFor="signupPassword">Password</Label>
                                <XStack position="relative">
                                    <Input
                                        id="signupPassword"
                                        placeholder="••••••••"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        flex={1}
                                    />
                                    <Button
                                        position="absolute"
                                        right="$2"
                                        top="$2"
                                        size="$2"
                                        circular
                                        icon={
                                            <MaterialIcons
                                                name={showPassword ? 'visibility-off' : 'visibility'}
                                                size={16}
                                            />
                                        }
                                        onPress={() => setShowPassword(!showPassword)}
                                        chromeless
                                    />
                                </XStack>
                                {errors.password && <Text color="$red10" fontSize="$1">{errors.password}</Text>}
                            </YStack>

                            <YStack space="$2">
                                <Label>Account Type</Label>
                                <XStack space="$2">
                                    {(['parent', 'child', 'admin'] as UserRole[]).map((r) => (
                                        <Button
                                            key={r}
                                            f={1}
                                            theme={role === r ? 'blue' : 'gray'}
                                            onPress={() => setRole(r)}
                                        >
                                            {r.charAt(0).toUpperCase() + r.slice(1)}
                                        </Button>
                                    ))}
                                </XStack>
                            </YStack>

                            <XStack ai="center" space="$2">
                                <Button
                                    size="$1"
                                    circular
                                    onPress={() => setAgreeToTerms(!agreeToTerms)}
                                    bg={agreeToTerms ? '$blue10' : 'transparent'}
                                    borderColor="$blue10"
                                    borderWidth={1}
                                    icon={agreeToTerms ? <MaterialIcons name="check" size={14} color="white" /> : undefined}
                                />
                                <Text fontSize="$2">I agree to terms</Text>
                            </XStack>
                            {errors.agreeToTerms && <Text color="$red10" fontSize="$1">{errors.agreeToTerms}</Text>}

                            <Button
                                onPress={handleSignup}
                                theme="blue"
                                disabled={loading}
                                icon={loading ? <MaterialIcons name="hourglass-empty" size={16} /> : undefined}
                            >
                                {loading ? 'Creating account...' : 'Sign Up'}
                            </Button>
                        </YStack>
                    </Tabs.Content>
                </Tabs>

                <XStack jc="center" mt="$2">
                    <Text>
                        {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
                    </Text>
                    <Text
                        color="$blue10"
                        textDecorationLine="underline"
                        onPress={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')}
                    >
                        {activeTab === 'login' ? 'Sign up' : 'Login'}
                    </Text>
                </XStack>
            </YStack>
        </ScrollView>
    );
};