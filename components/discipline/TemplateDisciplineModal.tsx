import { useTheme } from '@/styles/ThemeContext';
import type { DisciplinePlan } from "@/types/discipline";
import { useCallback, useEffect, useState } from 'react';
import { Button, Label, ScrollView, Sheet, Spinner, Text, TextArea, XStack, YStack } from 'tamagui';

type DisciplineModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childId: string;
    childName?: string;
    initialData?: DisciplinePlan | null;
    onSave: (plan: DisciplinePlan) => Promise<void> | void;
};

export function TemplateDisciplineModal({
    open,
    onOpenChange,
    childId,
    childName,
    initialData,
    onSave
}: DisciplineModalProps) {
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<DisciplinePlan>(() => ({
        child_id: childId,
        strategy: initialData?.strategy || '',
        name: initialData?.name || '',
        consequences: initialData?.consequences || '',
        rewards: initialData?.rewards || '',
        notes: initialData?.notes || '',
        id: initialData?.id || ''

    }));

    // Reset form when initialData changes
    useEffect(() => {
        if (open) {
            setPlan({
                child_id: childId,
                name: initialData?.name || '',
                strategy: initialData?.strategy || '',
                consequences: initialData?.consequences || '',
                rewards: initialData?.rewards || '',
                notes: initialData?.notes || '',
                id: initialData?.id || ''
            });
        }
    }, [open, childId, initialData]);

    const handleSave = useCallback(async () => {
        setLoading(true);
        try {
            await onSave(plan);
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }, [onSave, plan, onOpenChange]);

    const handleFieldChange = useCallback((field: keyof Omit<DisciplinePlan, 'id' | 'child_id'>) =>
        (text: string) => setPlan(prev => ({ ...prev, [field]: text })),
        []);

    const formFields = [
        {
            label: 'Rules',
            field: 'strategy',
            placeholder: 'Positive reinforcement, time-outs, etc.'
        },
        {
            label: 'Consequences',
            field: 'consequences',
            placeholder: 'What happens when rules are broken'
        },
        {
            label: 'Rewards System',
            field: 'rewards',
            placeholder: 'Incentives for good behavior'
        },
        {
            label: 'Additional Notes',
            field: 'notes',
            placeholder: 'Any other important notes'
        }
    ] as const;

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[90]}
            dismissOnSnapToBottom
        >
            <Sheet.Overlay />
            <Sheet.Handle backgroundColor={colors.border} />
            <Sheet.Frame padding="$4" space backgroundColor={colors.background}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack space="$4">
                        <Text fontSize="$8" fontWeight="bold" textAlign="center">
                            {childName ? `${childName}'s Discipline Plan` : 'Discipline Plan'}
                        </Text>

                        {formFields.map(({ label, field, placeholder }) => (
                            <YStack key={field} space="$2">
                                <Label fontSize="$4">{label}</Label>
                                <TextArea
                                    placeholder={placeholder}
                                    value={plan[field]}
                                    onChangeText={handleFieldChange(field)}
                                    minHeight={field === 'notes' ? 80 : 100}
                                    backgroundColor={colors.cardBackground}
                                    borderColor={colors.border as any}
                                />
                            </YStack>
                        ))}

                        <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                            <Button
                                onPress={() => onOpenChange(false)}
                                theme="alt1"
                                backgroundColor={colors.error}
                                color={colors.onPrimary}
                                borderColor={colors.border as any}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleSave}
                                backgroundColor={colors.primary}
                                color="white"
                                disabled={loading}
                                icon={loading ? <Spinner color="white" /> : undefined}
                            >
                                Save Plan
                            </Button>
                        </XStack>
                    </YStack>
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
}