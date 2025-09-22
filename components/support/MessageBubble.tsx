import { MessageBubbleProps } from '@/types/support';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, colors }) => (
    <View
        style={[
            styles.messageBubble,
            message.sender === 'user'
                ? [styles.userMessage, { backgroundColor: colors.primary }]
                : [styles.supportMessage, { backgroundColor: colors.cardBackground }],
        ]}
    >
        <Text
            style={
                message.sender === 'user'
                    ? styles.userMessageText
                    : { color: colors.text }
            }
        >
            {message.text}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    userMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 0,
    },
    userMessageText: {
        color: 'white',
    },
    supportMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 0,
    },
});

export default React.memo(MessageBubble);