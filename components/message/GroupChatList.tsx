import { Button, Card, H3, Image, Paragraph, XStack, YStack } from 'tamagui';

const MOCK_GROUPS = [
    {
        id: '1',
        name: 'Family Group',
        lastMessage: 'Alex: See you at the school play!',
        timestamp: '2:30 PM',
        avatar: 'https://placekitten.com/200/200',
        unreadCount: 3,
    },
    {
        id: '2',
        name: 'School Parents',
        lastMessage: 'Sarah: Don\'t forget the field trip tomorrow',
        timestamp: 'Yesterday',
        avatar: 'https://placekitten.com/201/201',
        unreadCount: 0,
    },
    {
        id: '3',
        name: 'Sports Team',
        lastMessage: 'Coach: Practice canceled this weekend',
        timestamp: 'Monday',
        avatar: 'https://placekitten.com/202/202',
        unreadCount: 5,
    },
];

export const GroupChatList = ({ onSelectGroup }: { onSelectGroup: (id: string) => void }) => {
    return (
        <YStack space="$3" padding="$3">
            {MOCK_GROUPS.map((group) => (
                <Card
                    key={group.id}
                    elevate
                    size="$4"
                    bordered
                    onPress={() => onSelectGroup(group.id)}
                    animation="bouncy"
                    hoverStyle={{ scale: 0.975 }}
                    pressStyle={{ scale: 0.95 }}
                >
                    <Card.Header padded>
                        <XStack alignItems="center" space="$3">
                            <Image
                                source={{ uri: group.avatar }}
                                width={50}
                                height={50}
                                borderRadius={25}
                            />
                            <YStack flex={1}>
                                <H3 color="$blue10">{group.name}</H3>
                                <Paragraph theme="alt2">{group.lastMessage}</Paragraph>
                            </YStack>
                            <YStack alignItems="flex-end">
                                <Paragraph theme="alt1">{group.timestamp}</Paragraph>
                                {group.unreadCount > 0 && (
                                    <Button
                                        size="$1"
                                        circular
                                        backgroundColor="$red10"
                                        color="white"
                                    >
                                        {group.unreadCount}
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