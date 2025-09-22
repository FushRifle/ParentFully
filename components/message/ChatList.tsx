import { Button, Card, H3, Image, Paragraph, XStack, YStack } from 'tamagui';

const MOCK_CHATS = [
    {
        id: '1',
        name: 'Alex Johnson',
        lastMessage: 'Did you see the school report card?',
        timestamp: '2:30 PM',
        avatar: 'https://placekitten.com/203/203',
        unreadCount: 2,
        status: 'online',
    },
    {
        id: '2',
        name: 'Sarah Miller',
        lastMessage: 'The homework is due tomorrow',
        timestamp: 'Yesterday',
        avatar: 'https://placekitten.com/204/204',
        unreadCount: 0,
        status: 'last seen today at 1:45 PM',
    },
    {
        id: '3',
        name: 'Dr. James Wilson',
        lastMessage: 'The appointment is confirmed',
        timestamp: 'Monday',
        avatar: 'https://placekitten.com/205/205',
        unreadCount: 0,
        status: 'last seen yesterday',
    },
];

export const ChatList = ({ onSelectChat }: { onSelectChat: (id: string) => void }) => {
    return (
        <YStack space="$3" padding="$3">
            {MOCK_CHATS.map((chat) => (
                <Card
                    key={chat.id}
                    elevate
                    size="$4"
                    bordered
                    onPress={() => onSelectChat(chat.id)}
                    animation="bouncy"
                    hoverStyle={{ scale: 0.975 }}
                    pressStyle={{ scale: 0.95 }}
                >
                    <Card.Header padded>
                        <XStack alignItems="center" justifyContent="space-between" space="$3">
                            {/* Avatar + Name + Last Message */}
                            <XStack alignItems="center" space="$3" flex={1}>
                                <Image
                                    source={{ uri: chat.avatar }}
                                    width={50}
                                    height={50}
                                    borderRadius={25}
                                />
                                <YStack>
                                    <H3 color="$blue10">{chat.name}</H3>
                                    <Paragraph theme="alt2">{chat.lastMessage}</Paragraph>
                                    <Paragraph theme="alt1" fontSize="$1">
                                        {chat.status}
                                    </Paragraph>
                                </YStack>
                            </XStack>

                            {/* Timestamp + Unread Badge */}
                            <YStack alignItems="flex-end" minWidth={60}>
                                <Paragraph theme="alt1" size="$2">
                                    {chat.timestamp}
                                </Paragraph>
                                {chat.unreadCount > 0 && (
                                    <Button
                                        size="$1"
                                        circular
                                        backgroundColor="$red10"
                                        color="white"
                                        marginTop="$2"
                                    >
                                        {chat.unreadCount}
                                    </Button>
                                )}
                            </YStack>
                        </XStack>
                    </Card.Header>
                </Card>
            ))}
        </YStack>
    );
};
