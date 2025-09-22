import { CelebrateBackground } from '@/constants/CelebrateBackground'
import { useTheme } from '@/styles/ThemeContext'
import { RootStackParamList } from '@/types'
import { RouteProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { Download, X } from '@tamagui/lucide-icons'
import { Image } from 'react-native'
import { Button, Card, Text, XStack, YStack } from 'tamagui'

type CertificateRouteProp = RouteProp<RootStackParamList, 'Certificate'>
type CertificateNavProp = StackNavigationProp<RootStackParamList, 'Certificate'>

interface CertificateProps {
    route: CertificateRouteProp
    navigation: CertificateNavProp
}

export const CertificateScreen = ({ route, navigation }: CertificateProps) => {
    const { colors } = useTheme();
    const { childName, skill, reward, date } = route.params

    return (
        <YStack f={1} ai="center" jc="center" bg={colors.background} p="$6" space="$4">
            <CelebrateBackground />

            {/* Header */}
            <XStack ai="center" jc="space-between" w="100%">
                <Image
                    source={require('@/assets/images/icon.png')}
                    style={{ width: 120, height: 40, resizeMode: 'contain' }}
                />
                <Image
                    source={require('@/assets/images/profile.jpg')}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                />
            </XStack>

            <Text fontSize='$7' fontWeight="800" mt="$4" textAlign="center">
                🎉 Certificate of Achievement
            </Text>

            <Text textAlign="center" fontSize='$7' color={colors.text} mt="$2">
                This certifies that
            </Text>

            <Text fontSize={22} fontWeight="900" my="$2" textAlign="center">
                {childName}
            </Text>

            <Text textAlign="center" color={colors.text} mb="$2">
                Has successfully mastered
            </Text>

            <Card bg="#DFFFD6" p="$3" br="$6" mb="$3" elevate>
                <Text fontWeight="700" fontSize={20} color="green" textAlign="center">
                    {skill}
                </Text>
            </Card>

            <Text textAlign="center" color={colors.text} mb="$2">
                and has earned
            </Text>

            <Card bg="#FFF4CC" p="$3" br="$6" mb="$3" elevate>
                <XStack ai="center" jc="center">
                    <Text fontWeight="700" fontSize={20} color="orange">
                        {reward}
                    </Text>
                </XStack>
            </Card>

            <Text textAlign="center" color={colors.text} mb="$4">
                Completed on {date}
            </Text>

            <XStack jc="space-around" w="100%" mt="$4" space="$4">
                <Button
                    icon={X}
                    variant="outlined"
                    borderColor="orange"
                    color="orange"
                    flexGrow={1}
                    onPress={() => navigation.goBack()}
                >
                    Close
                </Button>
                <Button
                    icon={Download}
                    bg="orange"
                    color="white"
                    flexGrow={1}
                    onPress={() => console.log('Download logic')}
                >
                    Download
                </Button>
            </XStack>
        </YStack>
    )
}
