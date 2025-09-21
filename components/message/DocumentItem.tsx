import type { Document } from '@/types/messaging';
import { MaterialIcons } from '@expo/vector-icons';
import { SizableText, XStack, YStack } from 'tamagui';

interface DocumentItemProps {
    document: Document;
}

export const DocumentItem = ({ document }: DocumentItemProps) => {
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    };

    return (
        <XStack
            backgroundColor="$gray2"
            borderRadius="$3"
            padding="$3"
            alignItems="center"
            space="$3"
        >
            <MaterialIcons name="insert-drive-file" size={24} color="$gray9" />
            <YStack flex={1}>
                <SizableText fontWeight="500">{document.name}</SizableText>
                <XStack space="$2">
                    <SizableText size="$1" color="$gray10">{document.category}</SizableText>
                    <SizableText size="$1" color="$gray10">•</SizableText>
                    <SizableText size="$1" color="$gray10">{formatFileSize(document.size)}</SizableText>
                </XStack>
            </YStack>
        </XStack>
    );
};