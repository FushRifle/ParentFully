import { ChatInputProps } from "@/types/support";
import { Plus, Send } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Input, XStack } from "tamagui";

const ChatInput: React.FC<ChatInputProps> = ({
    message,
    setMessage,
    handleSendMessage,
    colors,
}) => {
    return (
        <XStack
            ai="center"
            jc="space-between"
            bg={colors.card}
            br={25}
            px="$3"
            py="$2"
            mx="$3"
            space="$2"
        >
            {/* Attachment Button */}
            <Button
                size="$4"
                circular
                icon={Plus}
                color={colors.text}
                bg={colors.inputBackground}
                onPress={() => console.log("Open attachments")}
            />

            {/* Message Input */}
            <Input
                flex={1}
                br={20}
                size="$4"
                placeholder="Type your message..."
                placeholderTextColor={colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                bg={colors.inputBackground || "transparent"}
                color={colors.text}
            />

            {/* Send Button */}
            <Button
                size="$3"
                circular
                bg={colors.primary}
                onPress={handleSendMessage}
                disabled={!message.trim()}
                icon={<Send color="white" size={18} />}
            />
        </XStack>
    );
};

export default React.memo(ChatInput);
