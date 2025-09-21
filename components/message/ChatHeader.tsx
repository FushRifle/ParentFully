import { MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, H4, Text, XStack, YStack } from 'tamagui'

export const ChatHeader = ({
    name,
    isOnline,
    avatar,
    onBack,
}: {
    name: string
    isOnline: boolean
    avatar: string
    onBack: () => void
}) => {
    return (
        <SafeAreaView>
            <XStack
                backgroundColor="$green9"
                paddingVertical="$3"
                paddingHorizontal="$3"
                alignItems="center"
                justifyContent="space-between"
                space="$3"
            >
                <XStack alignItems="center" space="$3">
                    <MaterialIcons name="arrow-back" size={24} color="white" onPress={onBack} />

                    <Avatar circular size="$3" position="relative">
                        <Avatar.Image src={avatar} />
                        <Avatar.Fallback backgroundColor="$blue8" />
                        {isOnline && (
                            <YStack
                                position="absolute"
                                bottom={0}
                                right={0}
                                width="$0.75"
                                height="$0.75"
                                borderRadius="$12"
                                backgroundColor="$green9"
                                borderWidth={2}
                                borderColor="$background"
                            />
                        )}
                    </Avatar>

                    <YStack>
                        <H4 color="white">{name}</H4>
                        <Text fontSize="$2" color="white" opacity={0.75}>
                            {isOnline ? 'online' : 'last seen today at 12:45 PM'}
                        </Text>
                    </YStack>
                </XStack>

                <XStack space="$3">
                    <MaterialIcons name="videocam" size={22} color="white" />
                    <MaterialIcons name="call" size={22} color="white" />
                    <MaterialIcons name="more-vert" size={22} color="white" />
                </XStack>
            </XStack>
        </SafeAreaView>
    )
}
