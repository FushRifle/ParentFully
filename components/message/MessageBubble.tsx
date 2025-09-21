import { MaterialIcons } from '@expo/vector-icons';
import { Paragraph, XStack, YStack } from 'tamagui';

export const MessageBubble = ({
    message,
    isCurrentUser,
}: {
    message: {
        id: string;
        sender: string;
        content: string;
        timestamp: string;
        isTemplate: boolean;
    };
    isCurrentUser: boolean;
}) => {
    return (
        <XStack justifyContent={isCurrentUser ? 'flex-end' : 'flex-start'} px="$3">
            <YStack
                backgroundColor={isCurrentUser ? '$blue5' : '$gray3'}
                padding="$3"
                borderRadius="$4"
                borderBottomLeftRadius={isCurrentUser ? '$4' : '$1'}
                borderBottomRightRadius={isCurrentUser ? '$1' : '$4'}
                maxWidth="80%"
                width="auto"
                alignSelf={isCurrentUser ? 'flex-end' : 'flex-start'}
                animation="quick"
                enterStyle={{ opacity: 0, y: 10, scale: 0.9 }}
                space="$2"
            >
                {!isCurrentUser && (
                    <Paragraph fontWeight="bold" color="$blue10">
                        {message.sender}
                    </Paragraph>
                )}

                <Paragraph fontSize="$4">{message.content}</Paragraph>

                <XStack justifyContent="flex-end" alignItems="center" space="$1">
                    <Paragraph fontSize="$1" color="$gray10" opacity={0.7}>
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Paragraph>

                    {isCurrentUser && (
                        <MaterialIcons
                            name={message.isTemplate ? 'schedule' : 'done-all'}
                            size={14}
                            color="#888" // Fallback in case Tamagui token doesn't work
                        />
                    )}
                </XStack>
            </YStack>
        </XStack>
    );
};
