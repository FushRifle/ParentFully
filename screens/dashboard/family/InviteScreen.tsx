import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { Stack, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Linking, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import {
    Adapt,
    Button,
    Card,
    H3,
    Input,
    Paragraph,
    ScrollView,
    Separator,
    Sheet,
    SizableText,
    Spinner,
    Text,
    XStack,
    YStack
} from "tamagui";

type FormData = {
    email: string;
    relationship: string;
    message: string;
};

type SocialIconName =
    | "whatsapp"
    | "sms"
    | "twitter"
    | "instagram"
    | "share"
    | "content-copy"
    | "check"
    | "autorenew"
    | "camera-outline"
    | "refresh"
    | "error-outline"
    | "close"
    | "email-outline";

interface SocialIconProps {
    name: SocialIconName;
    size?: number;
    color?: string;
    label?: string;
}

const SocialIcon = ({ name, size = 16, color, label }: SocialIconProps) => (
    <XStack ai="center" space="$2">
        <MaterialCommunityIcons name={name as any} size={size} color={color} />
        {label && (
            <Text fontSize={14} color={color || "black"}>
                {label}
            </Text>
        )}
    </XStack>
);

const RELATIONSHIP_OPTIONS = [
    { label: "Parent", value: "parent" },
    { label: "Child", value: "child" },
    { label: "Spouse", value: "spouse" },
    { label: "Guardian", value: "guardian" },
    { label: "Other", value: "other" },
];

export default function InviteScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const navigation = useNavigation();
    const [qrCodeValue, setQrCodeValue] = useState("");
    const [inviteLink, setInviteLink] = useState("");
    const [showQrSheet, setShowQrSheet] = useState(false);
    const [copied, setCopied] = useState(false);
    const [form, setForm] = useState<FormData>({
        email: "",
        relationship: "parent",
        message: "Join our family account!",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    useEffect(() => {
        const generateFamilyCode = async () => {
            try {
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();
                if (userError) throw userError;

                if (user) {
                    const code = `${user.id.slice(0, 8)}-${Math.random()
                        .toString(36)
                        .substring(2, 8)}`;
                    const link = `https://yourapp.com/join-family?code=${code}`;
                    setQrCodeValue(link);
                    setInviteLink(link);

                    await supabase.from("family_codes").upsert({
                        user_id: user.id,
                        code,
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    });
                }
            } catch (err: any) {
                console.error("Error generating code:", err.message);
                setErrorText("Could not generate invite link");
            }
        };

        generateFamilyCode();
    }, []);

    const copyToClipboard = async () => {
        if (!inviteLink) return;
        await Clipboard.setStringAsync(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openLink = (url: string) =>
        Linking.openURL(url).catch(err => console.error('Link error:', err));

    const socialLinks = {
        whatsapp: () =>
            inviteLink &&
            openLink(
                `whatsapp://send?text=${encodeURIComponent(
                    `Join our family group on Parentfully: ${inviteLink}`
                )}`
            ),
        sms: () =>
            inviteLink &&
            openLink(
                `sms:?body=${encodeURIComponent(
                    `Join our family group on Parentfully: ${inviteLink}`
                )}`
            ),
        twitter: () =>
            inviteLink &&
            openLink(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Join our family on Parentfully! ${inviteLink}`
                )}`
            ),
        instagram: () => openLink(`instagram://`), // placeholder
    };

    const handleChange = (field: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errorText) setErrorText(null);
    };

    const handleInvite = useCallback(async () => {
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setErrorText("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            if (!form.email.trim()) {
                router.back();
                return;
            }

            const { error } = await supabase.rpc("send_family_invitation", {
                invitee_email: form.email.trim().toLowerCase(),
                relationship_type: form.relationship,
                invitation_message: form.message.trim(),
                invite_link: inviteLink,
            });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                router.back();
            }, 2000);
        } catch (err: any) {
            setErrorText(err.message || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    }, [form, inviteLink]);

    const copyInviteLink = async () => {
        if (!inviteLink) return;
        await Clipboard.setStringAsync(inviteLink);
    };

    const shareInviteLink = async () => {
        if (!inviteLink) return;
        // hook into Share API here
    };

    if (success) {
        return (
            <YStack f={1} jc="center" ai="center" p="$6" bg={colors.background}>
                <Text fontSize="$10" fontWeight="800" color={colors.primary}>
                    ✅ Invitation Sent!
                </Text>
                <Paragraph mt="$2" ta="center" color={colors.text}>
                    An invitation has been sent to {form.email}
                </Paragraph>
            </YStack>
        );
    }

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                f={1}
                bg={colors.background}
                p="$4"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <XStack space="$4" ai="center" mt='$7' mb='$3'>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                    </TouchableOpacity>
                    <Text fontSize="$6" fontWeight="700" color={colors.text as any}>
                        Back
                    </Text>
                </XStack>

                <YStack space="$4" mt="$4">
                    <YStack space='$3'>
                        <H3 ta="left">
                            Invite Co-parent or Third party
                        </H3>
                        <Text>
                            Share this code to start colaboarting in your parenting journey together
                        </Text>
                    </YStack>


                    {/* QR Section */}
                    <Card p="$4" br="$4" bg='transparent'>
                        <YStack ai="center" space="$3">
                            {qrCodeValue ? (
                                <YStack
                                    onPress={() => setShowQrSheet(true)}
                                    ai="center"
                                    jc="center"
                                    height={274}
                                    width={274}
                                    p="$3"
                                    br="$4"
                                    borderWidth={2}
                                    borderColor={colors.primary}
                                >
                                    <QRCode
                                        value={qrCodeValue}
                                        size={220}
                                        color={colors.text as any}
                                        backgroundColor="transparent"
                                    />
                                </YStack>
                            ) : (
                                <Spinner size="large" color={colors.primary as any} />
                            )}

                            <Text fontSize='$5' color={colors.textSecondary}>
                                Scan the QR code or share the referal code
                            </Text>

                            <XStack
                                width="90%"
                                height={72}
                                alignItems="center"
                                space="$2"
                            >
                                <Input flex={1} value={inviteLink}
                                    editable={false}
                                    selectTextOnFocus
                                    fontSize="$7"
                                    borderWidth={1}
                                    borderColor={colors.primary}
                                />
                                <Button
                                    onPress={copyToClipboard}
                                    bc={copied ? "green" : colors.primary}
                                    color="white"
                                    width="$7"
                                >
                                    <XStack ai="center" space="$2">
                                        {copied ? (
                                            <SocialIcon name="check" size={16} color="white" />
                                        ) : (
                                            <SocialIcon name="content-copy" size={16} color="white" />
                                        )}
                                        <Text color="white">{copied ? "Copied" : "Copy"}</Text>
                                    </XStack>
                                </Button>

                            </XStack>

                            <YStack width="100%" space="$4" marginTop="$4">
                                <Paragraph
                                    size="$3"
                                    textAlign="center"
                                    marginBottom="$1"
                                    color={colors.textSecondary}
                                >
                                    OR Share via:
                                </Paragraph>

                                <Separator alignSelf="center" w={100} />

                                <XStack
                                    space="$1"
                                    flexWrap="wrap"
                                    justifyContent="space-between"
                                    alignItems="center"
                                >
                                    {/* WhatsApp */}
                                    <Button
                                        size="$5"
                                        width='48%'
                                        onPress={socialLinks.whatsapp}
                                        backgroundColor="#25D366"
                                        color={colors.onPrimary}
                                        icon={<SocialIcon name="whatsapp" size={18} color="white" />}
                                        hoverStyle={{ opacity: 0.9, backgroundColor: "#1EBE53" }}
                                        pressStyle={{ scale: 0.97 }}
                                        borderRadius="$10"
                                    >
                                        WhatsApp
                                    </Button>

                                    {/* SMS */}
                                    <Button
                                        size="$5"
                                        width='48%'
                                        onPress={socialLinks.sms}
                                        backgroundColor="#34B7F1"
                                        color={colors.onPrimary}
                                        icon={<SocialIcon name="email-outline" size={18} color="white" />}
                                        hoverStyle={{ opacity: 0.9, backgroundColor: "#1DA8E6" }}
                                        pressStyle={{ scale: 0.97 }}
                                        borderRadius="$10"
                                    >
                                        SMS
                                    </Button>
                                </XStack>
                            </YStack>

                            {/* WhatsApp 
                            <XStack space="$3" w="100%">
                                <Button flex={1} onPress={copyInviteLink} disabled={!qrCodeValue}>
                                    Copy Link
                                </Button>
                                <Button
                                    flex={1}
                                    variant="outlined"
                                    onPress={shareInviteLink}
                                    disabled={!qrCodeValue}
                                >
                                    Share
                                </Button>
                            </XStack>
                            */}
                        </YStack>
                    </Card>


                    {/* Email field
                    <Input
                        placeholder="Email Address (optional)"
                        value={form.email}
                        onChangeText={(text) => handleChange("email", text)}
                        editable={!loading}
                    />

                    {form.email.trim() && (
                        <>
                            <Label>Relationship</Label>
                            <RadioGroup
                                value={form.relationship}
                                onValueChange={(val) => handleChange("relationship", val)}
                            >
                                <YStack space="$2">
                                    {RELATIONSHIP_OPTIONS.map((option) => (
                                        <XStack key={option.value} ai="center" space="$2">
                                            <RadioGroup.Item value={option.value} id={option.value} />
                                            <Label htmlFor={option.value}>{option.label}</Label>
                                        </XStack>
                                    ))}
                                </YStack>
                            </RadioGroup>

                            <Label>Personal Message</Label>
                            <Input
                                multiline
                                h={100}
                                value={form.message}
                                onChangeText={(text) => handleChange("message", text)}
                            />
                        </>
                    )}

                    {errorText && <Text color="red">{errorText}</Text>}
                     */}

                    <Button
                        onPress={handleInvite}
                        disabled={loading}
                        bg='transparent'
                        color={colors.primary}
                        borderColor={colors.primary}
                    >
                        {loading ? (
                            <Spinner color="white" />
                        ) : form.email ? (
                            "Send Invitation"
                        ) : (
                            "Generate New Code"
                        )}
                    </Button>
                </YStack>
            </ScrollView>

            {/* QR Code Sheet */}
            <Adapt when="sm" platform="touch">
                <Sheet open={showQrSheet} onOpenChange={setShowQrSheet}>
                    <Sheet.Frame ai="center" jc="center" p="$4">
                        <Text fontWeight="700" mb="$3">
                            Scan to Join Family
                        </Text>
                        {qrCodeValue ? (
                            <QRCode
                                value={qrCodeValue}
                                size={200}
                                color={colors.text as any}
                                backgroundColor="transparent"
                            />
                        ) : (
                            <Spinner size="large" color={colors.primary as any} />
                        )}
                        <SizableText mt="$3" numberOfLines={1} ellipsizeMode="middle">
                            {inviteLink || "Generating link..."}
                        </SizableText>
                        <XStack space="$3" mt="$4">
                            <Button flex={1} onPress={copyInviteLink}>
                                Copy
                            </Button>
                            <Button
                                flex={1}
                                variant="outlined"
                                onPress={() => setShowQrSheet(false)}
                            >
                                Close
                            </Button>
                        </XStack>
                    </Sheet.Frame>
                </Sheet>
            </Adapt>
        </>
    );
}
