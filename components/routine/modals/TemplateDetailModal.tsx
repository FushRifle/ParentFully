import { useTheme } from '@/styles/ThemeContext';
import { RoutineTemplate } from '@/types/routine';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, View } from 'react-native';
import {
    Button,
    H4,
    Paragraph,
    ScrollView,
    Text,
    XStack,
    YStack
} from 'tamagui';

type TemplateDetailModalProps = {
    visible: boolean;
    onClose: () => void;
    template: RoutineTemplate | null;
    onEdit: () => void;
    onDelete?: () => void;
    onApply?: () => void;
    isOwner?: boolean;
};

export function TemplateDetailModal({
    visible,
    onClose,
    template,
    onEdit,
    onDelete,
    onApply,
    isOwner = false
}: TemplateDetailModalProps) {
    const { colors } = useTheme();

    if (!template) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <View style={{
                    backgroundColor: colors.cardBackground,
                    margin: 20,
                    borderRadius: 10,
                    padding: 20,
                    maxHeight: '80%'
                }}>
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                        <H4>
                            {template.name}
                            {!isOwner && (
                                <Text fontSize="$1" color={colors.textSecondary}> (Preloaded)</Text>
                            )}
                        </H4>
                        <Button
                            unstyled
                            onPress={onClose}
                            icon={<MaterialIcons name="close" size={24} color={colors.text} />}
                        />
                    </XStack>

                    <ScrollView>
                        <YStack space="$3">
                            <XStack justifyContent="space-between">
                                <Text color={colors.textSecondary}>Age Range:</Text>
                                <Text>{template.ageRange}</Text>
                            </XStack>

                            {template.description && (
                                <YStack space="$2">
                                    <Text color={colors.textSecondary}>Description:</Text>
                                    <Paragraph>{template.description}</Paragraph>
                                </YStack>
                            )}

                            <YStack space="$2">
                                <Text color={colors.textSecondary}>Tasks:</Text>
                                <YStack space="$1" paddingLeft="$2">
                                    {template.tasks.map((task, i) => (
                                        <Text key={i} color={colors.text}>• {task}</Text>
                                    ))}
                                </YStack>
                            </YStack>

                            {template.notes && (
                                <YStack space="$2">
                                    <Text color={colors.textSecondary}>Notes:</Text>
                                    <Paragraph fontStyle="italic">{template.notes}</Paragraph>
                                </YStack>
                            )}

                            <XStack space="$2" marginTop="$4">
                                {isOwner && onDelete && (
                                    <Button
                                        onPress={onDelete}
                                        backgroundColor={colors.error}
                                        color="white"
                                        flex={1}
                                    >
                                        Delete
                                    </Button>
                                )}
                                {isOwner && (
                                    <Button
                                        onPress={onEdit}
                                        backgroundColor={colors.primary}
                                        color={colors.onPrimary}
                                        flex={1}
                                    >
                                        Edit
                                    </Button>
                                )}
                                {onApply && (
                                    <Button
                                        onPress={onApply}
                                        backgroundColor={colors.success}
                                        color="white"
                                        flex={1}
                                    >
                                        Apply
                                    </Button>
                                )}
                            </XStack>
                        </YStack>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}