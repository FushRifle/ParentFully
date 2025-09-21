import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type FormData = {
    email: string;
    relationship: string;
    message: string;
};

type InviteScreenProps = {
    onComplete: () => void | Promise<void>;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const RELATIONSHIP_OPTIONS = [
    { label: 'Parent', value: 'parent' },
    { label: 'Child', value: 'child' },
    { label: 'Spouse', value: 'spouse' },
    { label: 'Guardian', value: 'guardian' },
    { label: 'Other', value: 'other' },
];

export default function InviteScreen({ onComplete }: InviteScreenProps) {
    const { colors } = useTheme();
    const router = useRouter();
    const [qrCodeValue, setQrCodeValue] = useState('');
    const [showQrModal, setShowQrModal] = useState(false);
    const [inviteLink, setInviteLink] = useState('');

    const [form, setForm] = useState<FormData>({
        email: '',
        relationship: 'parent',
        message: 'Join our family account!',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Generate a unique family code when component mounts
    useEffect(() => {
        const generateFamilyCode = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;

                if (user) {
                    const code = `${user.id.slice(0, 8)}-${Math.random().toString(36).substring(2, 8)}`;
                    const link = `https://yourapp.com/join-family?code=${code}`;
                    setQrCodeValue(link);
                    setInviteLink(link);

                    // Store the code in the database
                    const { error: upsertError } = await supabase
                        .from('family_codes')
                        .upsert({
                            user_id: user.id,
                            code: code,
                            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                        });

                    if (upsertError) throw upsertError;
                }
            } catch (error) {
                console.error('Error generating family code:', error);
            }
        };

        generateFamilyCode();
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        // Only validate email if it's provided
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form.email]);

    const handleChange = useCallback((field: keyof FormData, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        // Clear error when typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const handleInvite = useCallback(async () => {
        if (!validate()) return;

        try {
            setLoading(true);

            // If no email provided, just complete the flow
            if (!form.email.trim()) {
                await onComplete();
                return;
            }

            const { error } = await supabase.rpc('send_family_invitation', {
                invitee_email: form.email.trim().toLowerCase(),
                relationship_type: form.relationship,
                invitation_message: form.message.trim(),
                invite_link: inviteLink
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                onComplete();
                router.back();
            }, 2000);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    }, [form, validate, onComplete, router, inviteLink]);

    const copyInviteLink = useCallback(async () => {
        try {
            if (!inviteLink) {
                Alert.alert('Error', 'Invite link not ready yet');
                return;
            }
            await Clipboard.setStringAsync(inviteLink);
            Alert.alert('Copied!', 'Invitation link copied to clipboard');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            Alert.alert('Error', 'Failed to copy invitation link');
        }
    }, [inviteLink]);

    const shareInviteLink = useCallback(async () => {
        try {
            if (!inviteLink) {
                Alert.alert('Error', 'Invite link not ready yet');
                return;
            }
            await Share.share({
                message: `Join my family account on AppName: ${inviteLink}\n\n${form.message}`,
                title: 'Family Account Invitation'
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, [inviteLink, form.message]);

    const inputStyle = (field: keyof FormErrors) => [
        styles.input,
        {
            borderColor: errors[field] ? colors.error : colors.border,
            backgroundColor: colors.inputBackground,
            color: colors.text,
        }
    ];

    if (success) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.successContainer}>
                    <MaterialIcons name="check-circle" size={60} color={colors.primary} />
                    <Text style={[styles.title, { color: colors.text }]}>Invitation Sent!</Text>
                    <Text style={[styles.subtitle, { color: colors.text }]}>
                        An invitation has been sent to {form.email}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[styles.container, { backgroundColor: colors.background }]}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.content}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Invite someone to join your family account (optional)
                        </Text>

                        {/* QR Code Section */}
                        <View style={[styles.qrSection, { backgroundColor: colors.card }]}>
                            <Text style={[styles.label, { color: colors.text }]}>QR Code Invitation</Text>
                            <TouchableOpacity
                                onPress={() => setShowQrModal(true)}
                                style={[styles.qrCodeContainer, { backgroundColor: colors.background }]}
                                disabled={!qrCodeValue}
                            >
                                {qrCodeValue ? (
                                    <QRCode
                                        value={qrCodeValue}
                                        size={120}
                                        color={colors.text as any}
                                        backgroundColor="transparent"
                                    />
                                ) : (
                                    <ActivityIndicator size="large" color={colors.primary} />
                                )}
                            </TouchableOpacity>
                            <View style={styles.qrActions}>
                                <TouchableOpacity
                                    onPress={copyInviteLink}
                                    style={[styles.qrButton, { backgroundColor: colors.primary }]}
                                    disabled={!qrCodeValue || loading}
                                >
                                    <Text style={[styles.buttonText, { color: colors.buttonText }]}>Copy Link</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={shareInviteLink}
                                    style={[styles.qrButton, { borderColor: colors.primary, borderWidth: 1 }]}
                                    disabled={!qrCodeValue || loading}
                                >
                                    <Text style={[styles.qrButtonText, { color: colors.primary }]}>Share</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={[styles.sectionDivider, { color: colors.text }]}>OR</Text>

                        {/* Email Invitation Section */}
                        <TextInput
                            placeholder="Email Address (optional)"
                            placeholderTextColor={colors.primary}
                            style={inputStyle('email') as any}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={form.email}
                            onChangeText={(text) => handleChange('email', text)}
                            editable={!loading}
                        />
                        {errors.email && <Text style={[styles.error, { color: colors.error }]}>{errors.email}</Text>}

                        {form.email.trim() && (
                            <>
                                <Text style={[styles.label, { color: colors.text }]}>Relationship</Text>
                                <View style={styles.radioGroup}>
                                    {RELATIONSHIP_OPTIONS.map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            style={styles.radioOption}
                                            onPress={() => handleChange('relationship', option.value)}
                                            disabled={loading}
                                        >
                                            <View style={[
                                                styles.radio,
                                                {
                                                    borderColor: colors.primary,
                                                    backgroundColor: form.relationship === option.value ? colors.primary : 'transparent'
                                                }
                                            ]}>
                                                {form.relationship === option.value && (
                                                    <MaterialIcons name="check" size={16} color={colors.background} />
                                                )}
                                            </View>
                                            <Text style={[styles.radioLabel, { color: colors.text }]}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.label, { color: colors.text }]}>Personal Message (Optional)</Text>
                                <TextInput
                                    placeholder="Add a personal message"
                                    placeholderTextColor={colors.primary}
                                    style={[
                                        styles.input,
                                        styles.messageInput,
                                        {
                                            borderColor: errors.message ? colors.error : colors.border,
                                            backgroundColor: colors.inputBackground,
                                            color: colors.text,
                                        }
                                    ] as any}
                                    multiline
                                    value={form.message}
                                    onChangeText={(text) => handleChange('message', text)}
                                    editable={!loading}
                                />
                            </>
                        )}

                        <TouchableOpacity
                            onPress={handleInvite}
                            disabled={loading}
                            style={[
                                styles.button,
                                {
                                    backgroundColor: colors.primary,
                                    opacity: loading ? 0.7 : 1
                                }
                            ]}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.buttonText} />
                            ) : (
                                <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                                    {form.email.trim() ? 'Send Invitation' : 'Continue'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        {form.email.trim() && (
                            <TouchableOpacity
                                onPress={onComplete}
                                disabled={loading}
                                style={[
                                    styles.skipButton,
                                    {
                                        borderColor: colors.primary,
                                        opacity: loading ? 0.7 : 1
                                    }
                                ]}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.skipButtonText, { color: colors.primary }]}>
                                    Skip for Now
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* QR Code Modal */}
            <Modal
                visible={showQrModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowQrModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Scan to Join Family</Text>
                        <View style={[styles.qrCodeLarge, { backgroundColor: colors.background }]}>
                            {qrCodeValue ? (
                                <QRCode
                                    value={qrCodeValue}
                                    size={200}
                                    color={colors.text as any}
                                    backgroundColor="transparent"
                                />
                            ) : (
                                <ActivityIndicator size="large" color={colors.primary} />
                            )}
                        </View>
                        <Text style={[styles.inviteLink, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
                            {inviteLink || 'Generating link...'}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={copyInviteLink}
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                disabled={!qrCodeValue}
                            >
                                <Text style={[styles.buttonText, { color: colors.buttonText }]}>Copy Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowQrModal(false)}
                                style={[styles.modalButton, { borderColor: colors.primary, borderWidth: 1 }]}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.primary }]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        marginTop: 40,
        padding: 20,
    },
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 6,
        fontSize: 16,
    },
    messageInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    error: {
        marginBottom: 10,
        fontSize: 12,
        marginLeft: 4,
    },
    radioGroup: {
        marginBottom: 16,
        gap: 12,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioLabel: {
        fontSize: 16,
    },
    button: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    skipButton: {
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
    },
    skipButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    qrSection: {
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        borderRadius: 12,
    },
    qrCodeContainer: {
        padding: 16,
        borderRadius: 12,
        marginVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
        width: '100%',
    },
    qrButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    qrButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    sectionDivider: {
        textAlign: 'center',
        marginVertical: 16,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    qrCodeLarge: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inviteLink: {
        marginBottom: 20,
        fontSize: 14,
        maxWidth: '100%',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalButtonText: {
        fontWeight: '600',
        fontSize: 16,
    },
});