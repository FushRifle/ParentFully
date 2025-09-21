import { Pressable } from 'react-native'
import { Avatar, H4, Paragraph, Text, XStack, YStack } from 'tamagui'

export const ChatListItem = ({
    name,
    lastMessage,
    time,
    unreadCount,
    isOnline,
    avatar,
    onPress,
}: {
    name: string
    lastMessage: string
    time: string
    unreadCount: number
    isOnline: boolean
    avatar: string
    onPress: () => void
}) => {
    return (
        <Pressable onPress={onPress}>
            <XStack
                paddingVertical="$3"
                paddingHorizontal="$4"
                space="$3"
                alignItems="center"
                borderBottomWidth={1}
                borderBottomColor="$gray4"
                backgroundColor="$background"
            >
                <Avatar circular size="$5" position="relative">
                    <Avatar.Image src={avatar} />
                    <Avatar.Fallback backgroundColor="$blue8" />
                    {isOnline && (
                        <YStack
                            position="absolute"
                            bottom={0}
                            right={0}
                            width="$1"
                            height="$1"
                            borderRadius="$12"
                            backgroundColor="$green9"
                            borderWidth={2}
                            borderColor="$background"
                        />
                    )}
                </Avatar>

                <YStack flex={1} space="$1">
                    <XStack alignItems="center">
                        <H4 flex={1} numberOfLines={1}>
                            {name}
                        </H4>
                        <Text color="$gray10Light" fontSize="$2">
                            {time}
                        </Text>
                    </XStack>

                    <XStack alignItems="center" space="$2">
                        <Paragraph
                            color="$gray10"
                            flex={1}
                            numberOfLines={1}
                            fontSize="$3"
                            opacity={unreadCount > 0 ? 1 : 0.6}
                            fontWeight={unreadCount > 0 ? '600' : 'normal'}
                        >
                            {lastMessage}
                        </Paragraph>
                        {unreadCount > 0 && (
                            <YStack
                                borderRadius="$12"
                                backgroundColor="$green9"
                                paddingHorizontal="$2"
                                paddingVertical={2}
                                justifyContent="center"
                                alignItems="center"
                                minWidth={20}
                            >
                                <Text color="white" fontSize="$1" fontWeight="bold">
                                    {unreadCount}
                                </Text>
                            </YStack>
                        )}
                    </XStack>
                </YStack>
            </XStack>
        </Pressable>
    )
}
