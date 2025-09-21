import { useTheme } from '@/styles/ThemeContext';
import type { Contact } from '@/types/messaging';
import { MaterialIcons } from '@expo/vector-icons';
import { SizableText, XStack, YStack } from 'tamagui';

interface ContactItemProps {
    contact: Contact;
    isSelected: boolean;
    onPress: () => void;
}

export const ContactItem = ({ contact, isSelected, onPress }: ContactItemProps) => {
    const { colors } = useTheme();
    return (
        <XStack
            backgroundColor={isSelected ? colors.primary : colors.primary}
            borderRadius="$4"
            padding="$3"
            alignItems="center"
            space="$3"
            onPress={onPress}
            hoverStyle={{ backgroundColor: colors.secondary }}
            pressStyle={{ backgroundColor: colors.onPrimary }}
        >
            <YStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={colors.primary}
                justifyContent="center"
                alignItems="center"
            >
                <MaterialIcons name="person" size={20} color={colors.onPrimary} />
            </YStack>
            <YStack flex={1}>
                <SizableText fontWeight="bold">{contact.name}</SizableText>
                <SizableText size="$2" color={colors.text}>{contact.role}</SizableText>
            </YStack>
            {isSelected && (
                <MaterialIcons name="check" size={24} color={colors.primary} />
            )}
        </XStack>
    );
};