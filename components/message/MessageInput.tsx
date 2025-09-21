import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import { Button, Input, XStack } from 'tamagui';

interface MessageInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onAttach: () => void;
}

export const MessageInput = ({ value, onChangeText, onSend, onAttach }: MessageInputProps) => {
    const { colors } = useTheme();
    return (
        <XStack
            padding="$3"
            space="$2"
            backgroundColor={colors.primary}
            borderTopWidth={1}
            borderTopColor={colors.onPrimary}
        >
            <Button
                icon={<MaterialIcons name="attach-file" size={24} />}
                circular
                onPress={onAttach}
                chromeless
            />
            <Input
                flex={1}
                placeholder="Type a message..."
                value={value}
                onChangeText={onChangeText}
                multiline
                numberOfLines={1}
            />
            <Button
                icon={value.trim() ? <MaterialIcons name="send" size={24} /> : <MaterialIcons name="mic" size={24} />}
                circular
                onPress={value.trim() ? onSend : () => { }}
                backgroundColor={value.trim() ? colors.primary : colors.secondary}
                color={value.trim() ? colors.onPrimary : colors.text}
            />
        </XStack>
    );
};