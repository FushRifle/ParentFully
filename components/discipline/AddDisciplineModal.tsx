import { useTheme } from '@/styles/ThemeContext';
import type { DisciplinePlan } from "@/types/discipline";
import { useCallback, useEffect, useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
    Button, Label,
    Sheet, Spinner,
    Text, TextArea, XStack, YStack
} from 'tamagui';


type DisciplineModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    childId: string;
    childName?: string;
    initialData?: DisciplinePlan | null;
    onSave: (plan: DisciplinePlan) => Promise<void>;
    onDelete?: (id: string) => Promise<void>;
    allowDelete?: boolean;
};

export function DisciplineModal({
    open,
    onOpenChange,
    childId,
    childName,
    initialData,
    onSave,
    onDelete,
    allowDelete = false,
}: DisciplineModalProps) {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [plan, setPlan] = useState<DisciplinePlan>({
        id: initialData?.id || '',
        child_id: childId,
        name: initialData?.name || '',
        strategy: initialData?.strategy || '',
        consequences: initialData?.consequences || '',
        rewards: initialData?.rewards || '',
        notes: initialData?.notes || '',
    });

    useEffect(() => {
        if (open) {
            setPlan({
                id: initialData?.id || '',
                child_id: childId,
                name: initialData?.name || '',
                strategy: initialData?.strategy || '',
                consequences: initialData?.consequences || '',
                rewards: initialData?.rewards || '',
                notes: initialData?.notes || '',
            });
        }
    }, [open]);


    const handleSave = useCallback(async () => {
        setLoading(true);
        try {
            await onSave(plan);
            onOpenChange(false);
        } finally {
            setLoading(false);
        }
    }, [onSave, plan, onOpenChange]);

    const handleDelete = useCallback(async () => {
        if (!plan.id || !onDelete) return;

        setDeleteLoading(true);
        try {
            await onDelete(plan.id);
            onOpenChange(false);
        } finally {
            setDeleteLoading(false);
        }
    }, [plan.id, onDelete, onOpenChange]);

    const handleFieldChange = useCallback((field: keyof Omit<DisciplinePlan, 'id' | 'child_id'>) =>
        (text: string) => setPlan(prev => ({ ...prev, [field]: text })),
        []);

    const formFields = [
        {
            label: 'Rules',
            field: 'name',
            placeholder: 'Positive reinforcement, time-outs, etc.',
            description: 'Describe the approaches to encourage good behavior'
        },
        {
            label: 'Consequences',
            field: 'consequences',
            placeholder: 'What happens when rules are broken',
            description: 'Clear consequences for misbehavior'
        },
        {
            label: 'Parent Notes',
            field: 'notes',
            placeholder: 'Any other important notes',
            description: 'Additional context or special considerations'
        }
    ] as const;

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[90]}
            dismissOnSnapToBottom
            animationConfig={{
                type: 'spring',
                damping: 20,
                mass: 1.2,
                stiffness: 250,
            }}
        >
            <Sheet.Overlay />
            <Sheet.Handle backgroundColor={colors.background} />
            <Sheet.Frame padding="$4" space backgroundColor={colors.background}>
                <KeyboardAwareScrollView
                    enableOnAndroid
                    extraScrollHeight={20}
                    keyboardOpeningTime={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    <YStack space="$4">
                        <Text fontSize="$8" fontWeight="bold" textAlign="center" color={colors.primary}>
                            {childName ? `${childName}'s Discipline Plan` : 'Family Discipline Plan'}
                        </Text>

                        {formFields.map(({ label, field, placeholder, description }) => (
                            <YStack key={field} space="$2">
                                <XStack alignItems="center" space="$2">
                                    <Label fontSize="$4" color={colors.text}>
                                        {label}
                                    </Label>
                                    {description && (
                                        <Text fontSize="$1" color={colors.textSecondary}>
                                            {description}
                                        </Text>
                                    )}
                                </XStack>
                                <TextArea
                                    placeholder={placeholder}
                                    value={plan[field]}
                                    onChangeText={handleFieldChange(field)}
                                    minHeight={100}
                                    backgroundColor={colors.cardBackground}
                                    borderColor={colors.border as any}
                                    color={colors.text}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </YStack>
                        ))}

                        <XStack space="$2" justifyContent="flex-end" marginTop="$4">
                            {allowDelete && plan.id && (
                                <Button
                                    onPress={handleDelete}
                                    theme="alt1"
                                    backgroundColor={colors.error}
                                    color={colors.onPrimary}
                                    borderColor={colors.border as any}
                                    disabled={deleteLoading}
                                    icon={deleteLoading ? <Spinner color="white" /> : undefined}
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </Button>
                            )}
                            <Button
                                onPress={() => onOpenChange(false)}
                                theme="alt1"
                                backgroundColor={colors.surface}
                                color={colors.text}
                                borderColor={colors.border as any}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onPress={handleSave}
                                backgroundColor={colors.primary}
                                color={isDark ? 'black' : colors.onPrimary}
                                disabled={loading}
                            >
                                {loading ? (
                                    <XStack ai="center" space="$2">
                                        <Spinner size="small" color={isDark ? colors.primary : colors.onPrimary as any} />
                                        <Text>Saving...</Text>
                                    </XStack>
                                ) : (
                                    "Save Plan"
                                )}
                            </Button>

                        </XStack>
                    </YStack>
                </KeyboardAwareScrollView>
            </Sheet.Frame>
        </Sheet>
    );
}