import { createInviteLink } from '@/hooks/auth/useInvites';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState } from 'react';
import { Linking, Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {
    Button,
    H2,
    Input,
    Paragraph,
    Sheet,
    Spinner,
    XStack,
    YStack,
    useTheme,
} from 'tamagui';

type SocialIconName =
    | 'whatsapp'
    | 'sms'
    | 'twitter'
    | 'instagram'
    | 'share'
    | 'content-copy'
    | 'check'
    | 'autorenew'
    | 'camera-outline'
    | 'refresh'
    | 'error-outline'
    | 'close'
    | 'email-outline';
const SocialIcon = ({
    name,
    size = 16,
    color,
}: {
    name: SocialIconName;
    size?: number;
    color?: string;
}) => <MaterialCommunityIcons name={name as any} size={size} color={color} />;

type QRCodeModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
};

export function QRCodeModal({ open, onOpenChange, userId }: QRCodeModalProps) {
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        if (open && userId) {
            generateInviteLink();
        } else {
            setInviteLink(null);
            setError(null);
            setCopied(false);
        }
    }, [open]);

    const generateInviteLink = async () => {
        try {
            setLoading(true);
            setError(null);
            const link = await createInviteLink(userId);
            setInviteLink(link);
        } catch (err) {
            console.error('Failed to create invite link:', err);
            setError('Could not generate invite. Try again later.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!inviteLink) return;
        await Clipboard.setStringAsync(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = async () => {
        if (!inviteLink) return;
        const message = `Join our family group on Parentfully: ${inviteLink}`;
        try {
            await Share.share({
                message,
                url: inviteLink,
                title: 'Parentfully Invite',
            });
        } catch (err) {
            console.error('Share failed:', err);
        }
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

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[75]}
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay animation="medium" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
            <Sheet.Handle backgroundColor="$gray8" />
            <Sheet.Frame
                padding="$4"
                space="$4"
                borderTopLeftRadius="$6"
                borderTopRightRadius="$6"
                backgroundColor="$background"
            >
                <XStack justifyContent="space-between" alignItems="center">
                    <H2 size="$6" fontWeight="bold" color="$color">
                        Invite Another Parent or Guardian
                    </H2>
                    <Button
                        size="$3"
                        circular
                        chromeless
                        icon={<SocialIcon name="close" size={20} color={theme.color.val} />}
                        onPress={() => onOpenChange(false)}
                    />
                </XStack>

                <YStack alignItems="center" space="$5" marginTop="$4" flex={1}>
                    {loading ? (
                        <YStack flex={1} justifyContent="center" alignItems="center" space="$3">
                            <Spinner size="large" color="$blue10" />
                            <Paragraph theme="alt2">Generating invite...</Paragraph>
                        </YStack>
                    ) : error ? (
                        <YStack flex={1} justifyContent="center" alignItems="center" space="$4">
                            <SocialIcon name="error-outline" size={48} color={theme.red10.val} />
                            <Paragraph color="$red10" textAlign="center">
                                {error}
                            </Paragraph>
                            <Button onPress={generateInviteLink} theme="red" icon={<SocialIcon name="refresh" />}>
                                Try Again
                            </Button>
                        </YStack>
                    ) : inviteLink ? (
                        <>
                            <YStack backgroundColor="white" padding="$4" borderRadius="$4" elevation="$1">
                                <QRCode value={inviteLink} size={180} backgroundColor="white" color="black" />
                            </YStack>

                            <Paragraph textAlign="center" theme="alt2" marginTop="$2" mb="$3">
                                Scan the QR code or share the Referral code:
                            </Paragraph>

                            <XStack width="50%" alignItems="center" space="$2">
                                <Input flex={1} value={inviteLink}
                                    editable={false}
                                    selectTextOnFocus
                                    fontSize="$2"
                                    borderWidth={1}
                                    borderColor={'black'}

                                />
                                <Button
                                    onPress={copyToClipboard}
                                    theme={copied ? 'green' : 'alt1'}
                                    width="$6"
                                    icon={
                                        copied ? (
                                            <SocialIcon name="check" size={16} />
                                        ) : (
                                            <SocialIcon name="content-copy"
                                                size={16}
                                            />
                                        )
                                    }
                                />
                            </XStack>


                            <YStack width="100%" space="$4" marginTop="$4">
                                <Paragraph
                                    size="$3"
                                    theme="alt2"
                                    textAlign="center"
                                    marginBottom="$1"
                                    color="$gray10"
                                >
                                    OR Share this invite via:
                                </Paragraph>

                                <XStack
                                    space="$1"
                                    flexWrap="wrap"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {/* WhatsApp */}
                                    <Button
                                        size="$5"
                                        onPress={socialLinks.whatsapp}
                                        backgroundColor="#25D366"
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
                                        onPress={socialLinks.sms}
                                        backgroundColor="#34B7F1"
                                        icon={<SocialIcon name="email-outline" size={18} color="white" />}
                                        hoverStyle={{ opacity: 0.9, backgroundColor: "#1DA8E6" }}
                                        pressStyle={{ scale: 0.97 }}
                                        borderRadius="$10"
                                    >
                                        SMS
                                    </Button>
                                </XStack>

                            </YStack>

                            <XStack
                                mt="$6">
                                <Button
                                    size="$5"
                                    chromeless
                                    borderWidth={1}
                                    borderColor={'black'}
                                    onPress={generateInviteLink}
                                    icon={<SocialIcon name="autorenew" size={16} />}
                                    theme="alt2"
                                >
                                    Generate new link
                                </Button>
                            </XStack>
                        </>
                    ) : (
                        <Paragraph>No invite generated yet.</Paragraph>
                    )}
                </YStack>
            </Sheet.Frame>
        </Sheet>
    );
}
