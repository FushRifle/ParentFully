import { Download, X } from '@tamagui/lucide-icons';
import { Image } from 'react-native';
import { Button, Card, Text, XStack, YStack } from 'tamagui';

interface CertificateProps {
    childName?: string;
    skill?: string;
    reward?: string;
    date?: string;
}

export const Certificate = ({
    childName = "Josh",
    skill = "Practice Piano",
    reward = "New Adventure Book",
    date = "Sept 12, 2025"
}: CertificateProps) => {
    return (
        <YStack f={1} ai="center" jc="center" bg="white" p="$4" br="$4">
            {/* Logo */}
            <XStack ai="center" jc="space-between" w="100%">
                <Image source={require('@/assets/logo.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} />
                <Image source={require('@/assets/avatar.png')} style={{ width: 40, height: 40, borderRadius: 20 }} />
            </XStack>

            {/* Title */}
            <Text fontSize={22} fontWeight="700" mt="$4" mb="$2" textAlign="center">
                Certificate of Achievement
            </Text>

            <Text textAlign="center" color="$gray10" mb="$2">
                This certifies that
            </Text>

            <Text fontSize={20} fontWeight="900" mb="$2">
                {childName}
            </Text>

            <Text textAlign="center" color="$gray10" mb="$2">
                Has successfully Mastered
            </Text>

            {/* Skill */}
            <Card bg="#DFFFD6" p="$3" br="$4" mb="$3">
                <Text fontWeight="700" fontSize={18} color="green" textAlign="center">
                    {skill}
                </Text>
            </Card>

            <Text textAlign="center" color="$gray10" mb="$2">
                and has earned
            </Text>

            {/* Reward */}
            <Card bg="#E6FFB8" p="$3" br="$4" mb="$3">
                <XStack ai="center" jc="center" space="$2">
                    <Image source={require('@/assets/icons/gift.png')} style={{ width: 20, height: 20 }} />
                    <Text fontWeight="700" fontSize={18} color="green">
                        {reward}
                    </Text>
                </XStack>
            </Card>

            <Text textAlign="center" color="$gray10" mb="$4">
                Completed on {date}
            </Text>

            {/* Buttons */}
            <XStack jc="space-around" w="100%" mt="$4" space="$4">
                <Button
                    icon={X}
                    color="orange"
                    borderColor="orange"
                    borderWidth={1}
                    bg="transparent"
                    flex={1}
                >
                    Close
                </Button>
                <Button
                    icon={Download}
                    bg="orange"
                    color="white"
                    flex={1}
                >
                    Download
                </Button>
            </XStack>
        </YStack>
    );
};
