import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RoutineTemplate } from '@/types/routine';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, View } from 'react-native';
import {
    Button,
    Card,
    H4,
    ScrollView,
    Spinner,
    Text,
    XStack,
    YStack
} from 'tamagui';

type UserTemplatesModalProps = {
    visible: boolean;
    onClose: () => void;
    onTemplateSelected: (template: RoutineTemplate) => void;
    onEditTemplate: (template: RoutineTemplate) => void;
    onNewTemplate: () => void;
};

export function UserTemplatesModal({
    visible,
    onClose,
    onTemplateSelected,
    onEditTemplate,
    onNewTemplate
}: UserTemplatesModalProps) {
    const { colors } = useTheme();
    const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('routine_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTemplates(data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) fetchTemplates();
    }, [visible]);

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
                        <H4>Your Templates</H4>
                        <XStack space="$2">
                            <Button
                                onPress={onNewTemplate}
                                backgroundColor={colors.primary}
                                color={colors.onPrimary}
                                size="$2"
                            >
                                New
                            </Button>
                            <Button
                                unstyled
                                onPress={onClose}
                                icon={<MaterialIcons name="close" size={24} color={colors.text} />}
                            />
                        </XStack>
                    </XStack>

                    {error && (
                        <Text color={colors.error} textAlign="center" marginBottom="$2">
                            {error}
                        </Text>
                    )}

                    {loading ? (
                        <Spinner size="large" />
                    ) : (
                        <ScrollView>
                            <YStack space="$3">
                                {templates.length === 0 ? (
                                    <Text textAlign="center" color={colors.textSecondary}>
                                        No templates found. Create your first one!
                                    </Text>
                                ) : (
                                    templates.map((template) => (
                                        <Card
                                            key={template.id}
                                            padding="$3"
                                            borderWidth={1}
                                            borderColor={colors.border as any}
                                            marginBottom="$4"
                                        >
                                            <YStack space="$2">
                                                <XStack justifyContent="space-between" alignItems="center">
                                                    <Text fontWeight="bold">{template.name}</Text>
                                                    <Button
                                                        unstyled
                                                        onPress={() => onEditTemplate(template)}
                                                        icon={<MaterialIcons name="edit" size={18} color={colors.textSecondary} />}
                                                    />
                                                </XStack>
                                                <Text color={colors.textSecondary}>{template.ageRange}</Text>
                                                <Button
                                                    onPress={() => onTemplateSelected(template)}
                                                    backgroundColor={colors.primary}
                                                    color={colors.onPrimary}
                                                >
                                                    Use Template
                                                </Button>
                                            </YStack>
                                        </Card>
                                    ))
                                )}
                            </YStack>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}