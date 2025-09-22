import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RoutineTemplate } from '@/types/routine';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import {
    Button,
    Input,
    Label,
    ScrollView,
    Sheet,
    Spinner,
    Text,
    TextArea,
    XStack,
    YStack
} from 'tamagui';
type EditTemplateModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: RoutineTemplate | null;
    children?: Array<{ id: string; name: string }>;
    onTemplateUpdated: () => void;
};

export function EditTemplateModal({
    open,
    onOpenChange,
    template,
    children,
    onTemplateUpdated
}: EditTemplateModalProps) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [editedTemplate, setEditedTemplate] = useState<RoutineTemplate | null>(null);

    useEffect(() => {
        if (template) {
            setEditedTemplate({ ...template });
        }
    }, [template]);

    const handleSave = async () => {
        if (!editedTemplate) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const templateData = {
                name: editedTemplate.name,
                description: editedTemplate.description,
                age_range: editedTemplate.ageRange,
                notes: editedTemplate.notes,
                tasks: editedTemplate.tasks,
            };

            if (editedTemplate.id) {
                const { error: updateError } = await supabase
                    .from('routine_templates')
                    .update(templateData)
                    .eq('id', editedTemplate.id);

                if (updateError) throw updateError;
            } else {
                // Create new template
                const { error: insertError } = await supabase
                    .from('routine_templates')
                    .insert(templateData);

                if (insertError) throw insertError;
            }

            onOpenChange(false);
            onTemplateUpdated();
        } catch (err) {
            console.error('Error saving template:', err);
            setError(err instanceof Error ? err.message : 'Failed to save template');
        } finally {
            setLoading(false);
        }
    };

    if (!template || !editedTemplate) return null;

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[90]}
            dismissOnSnapToBottom
            animation="quick"
        >
            <Sheet.Overlay />
            <Sheet.Handle backgroundColor={colors.border} />
            <Sheet.Frame padding="$4" space backgroundColor={colors.background}>
                <KeyboardAvoidingView
                    behavior="padding"
                >
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <YStack space="$4">
                            <Text fontSize="$6" fontWeight="bold" textAlign="center">
                                {editedTemplate.id ? 'Edit' : 'Create'} Routine Template
                            </Text>

                            {error && (
                                <Text color={colors.error} textAlign="center">
                                    {error}
                                </Text>
                            )}

                            <YStack space="$2">
                                <Label>Template Name *</Label>
                                <Input
                                    value={editedTemplate.name}
                                    onChangeText={(text) => setEditedTemplate(prev =>
                                        prev ? { ...prev, name: text } : null
                                    )}
                                    backgroundColor={colors.cardBackground}
                                    borderColor={colors.border as any}
                                    placeholder="Morning Routine"
                                    returnKeyType="next"
                                />
                            </YStack>

                            <YStack space="$2">
                                <Label>Description</Label>
                                <TextArea
                                    value={editedTemplate.description || ''}
                                    onChangeText={(text) => setEditedTemplate(prev =>
                                        prev ? { ...prev, description: text } : null
                                    )}
                                    numberOfLines={4}
                                    backgroundColor={colors.cardBackground}
                                    borderColor={colors.border as any}
                                    placeholder="Describe this routine"
                                    returnKeyType="next"
                                />
                            </YStack>

                            <YStack space="$2">
                                <Label>Age Range *</Label>
                                <Input
                                    value={editedTemplate.ageRange}
                                    onChangeText={(text) => setEditedTemplate(prev =>
                                        prev ? { ...prev, ageRange: text } : null
                                    )}
                                    backgroundColor={colors.cardBackground}
                                    borderColor={colors.border as any}
                                    placeholder="e.g., 2-4 years"
                                    returnKeyType="next"
                                />
                            </YStack>

                            <YStack space="$2">
                                <Label>Notes</Label>
                                <TextArea
                                    value={editedTemplate.notes || ''}
                                    onChangeText={(text) => setEditedTemplate(prev =>
                                        prev ? { ...prev, notes: text } : null
                                    )}
                                    numberOfLines={3}
                                    backgroundColor={colors.cardBackground}
                                    borderColor={colors.border as any}
                                    placeholder="Additional notes"
                                    returnKeyType="next"
                                />
                            </YStack>

                            <YStack space="$2">
                                <Label>Tasks *</Label>
                                {editedTemplate.tasks.map((task, index) => (
                                    <XStack key={index} alignItems="center" space="$2">
                                        <MaterialIcons
                                            name="lens"
                                            size={10}
                                            color={colors.primary}
                                            style={{ marginTop: 4 }}
                                        />
                                        <Input
                                            flex={1}
                                            value={typeof task === 'string' ? task : (task?.title ?? '')}
                                            onChangeText={(text) => {
                                                const newTasks = [...editedTemplate.tasks];
                                                newTasks[index] = text;
                                                setEditedTemplate(prev =>
                                                    prev ? { ...prev, tasks: newTasks } : null
                                                );
                                            }}
                                            backgroundColor={colors.card}
                                            color={colors.text}
                                            placeholder="Task description"
                                            returnKeyType={index === editedTemplate.tasks.length - 1 ? "done" : "next"}
                                        />
                                        <Button
                                            icon={<MaterialIcons name="delete" size={20} color={colors.error} />}
                                            onPress={() => {
                                                const newTasks = editedTemplate.tasks.filter((_, i) => i !== index);
                                                setEditedTemplate(prev =>
                                                    prev ? { ...prev, tasks: newTasks } : null
                                                );
                                            }}
                                            unstyled
                                        />
                                    </XStack>
                                ))}
                                <Button
                                    onPress={() => {
                                        setEditedTemplate(prev =>
                                            prev ? { ...prev, tasks: [...prev.tasks, ''] } : null
                                        );
                                    }}
                                    marginTop="$3"
                                    backgroundColor={colors.primary}
                                    color={colors.onPrimary}
                                >
                                    Add Task
                                </Button>
                            </YStack>

                            <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                                <Button
                                    onPress={() => onOpenChange(false)}
                                    theme="alt1"
                                    borderColor={colors.border as any}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onPress={handleSave}
                                    backgroundColor={colors.primary}
                                    color="white"
                                    disabled={loading || !editedTemplate.name || !editedTemplate.ageRange || editedTemplate.tasks.length === 0}
                                >
                                    {loading ? <Spinner color="white" /> : 'Save Template'}
                                </Button>
                            </XStack>
                        </YStack>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Sheet.Frame>
        </Sheet>
    );
}