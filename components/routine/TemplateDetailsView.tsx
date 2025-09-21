import { MaterialIcons } from '@expo/vector-icons';
import {
    Button, H4, ScrollView, Sheet, Text,
    XStack, YStack
} from 'tamagui';

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

type RoutineSection = {
    id: string;
    name: string;
    timeSlot: string;
    tasks: TemplateTask[];
    templateId?: string;
};

type RoutineTemplate = {
    id: string;
    name: string;
    ageRange: string;
    description?: string;
    tasks: (string | TemplateTask)[];
};

type TemplateDetailsViewProps = {
    colors: any;
    selectedTemplate: RoutineTemplate | null;
    childName: string;
    childId: string | null;
    routineSections: RoutineSection[];
    onEdit: () => void;
    onApply: () => void;
    onDeleteTask: (templateId: string, taskTitle: string) => void;
    onClose: () => void;
    visible: boolean;
};

export const TemplateDetailsView = ({
    colors,
    selectedTemplate,
    childName,
    childId,
    routineSections,
    onEdit,
    onApply,
    onDeleteTask,
    onClose,
    visible
}: TemplateDetailsViewProps) => (
    <Sheet
        open={visible}
        onOpenChange={onClose}
        snapPoints={[85]}
        modal
        dismissOnSnapToBottom
        animation="medium"
    >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame
            backgroundColor={colors.card}
            borderTopLeftRadius={16}
            borderTopRightRadius={16}
            padding={16}
        >
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
                <YStack>
                    <H4 color={colors.text}>{selectedTemplate?.name}</H4>
                    {childName && (
                        <Text color={colors.textSecondary} fontSize={14}>
                            For {childName}
                        </Text>
                    )}
                </YStack>
                <Button
                    unstyled
                    onPress={onClose}
                    icon={<MaterialIcons name="close" size={24} color={colors.text} />}
                />
            </XStack>

            {/* Task Groups */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <YStack space={16}>
                    {routineSections.map((section) => (
                        <YStack key={section.id} space={8}>
                            {/* Tasks List */}
                            <YStack space={4}>
                                {section.tasks.map((task, index) => (
                                    <XStack
                                        key={index}
                                        alignItems="flex-start"
                                        justifyContent="space-between"
                                        paddingVertical={8}
                                    >
                                        {/* Bullet + Task Details */}
                                        <XStack flex={1} alignItems="flex-start" space={8}>
                                            <MaterialIcons
                                                name="lens"
                                                size={10}
                                                color={colors.primary}
                                                style={{ marginTop: 4 }}
                                            />

                                            <YStack flex={1}>
                                                <Text color={colors.text}>{task.title}</Text>
                                                {task.description && (
                                                    <Text color={colors.textSecondary} fontSize={12}>
                                                        {task.description}
                                                    </Text>
                                                )}
                                                {task.time_slot && (
                                                    <XStack alignItems="center" space={4} marginTop={4}>
                                                        <MaterialIcons
                                                            name="access-time"
                                                            size={14}
                                                            color={colors.textSecondary}
                                                        />
                                                        <Text color={colors.textSecondary} fontSize={12}>
                                                            {task.time_slot}
                                                        </Text>
                                                    </XStack>
                                                )}
                                            </YStack>
                                        </XStack>
                                    </XStack>
                                ))}
                            </YStack>
                        </YStack>
                    ))}
                </YStack>
            </ScrollView>

            {/* Action Buttons */}
            <XStack space={12} marginTop={20}>
                <Button
                    onPress={() => {
                        onEdit();
                        onClose();
                    }}
                    backgroundColor={colors.primary}
                    color={colors.onPrimary}
                    flex={1}
                    height={44}
                    borderRadius={8}
                    icon={<MaterialIcons name="edit" size={18} />}
                >
                    Edit
                </Button>
                <Button
                    onPress={() => {
                        onApply();
                        onClose();
                    }}
                    backgroundColor={colors.success}
                    color="white"
                    flex={1}
                    height={44}
                    borderRadius={8}
                    icon={<MaterialIcons name="check" size={18} />}
                >
                    Apply
                </Button>
            </XStack>
        </Sheet.Frame>
    </Sheet>
);