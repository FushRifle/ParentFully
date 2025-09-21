import { MaterialIcons } from "@expo/vector-icons";
import { Button, Paragraph, Text, XStack, YStack } from "tamagui";
import { TimeSlotDisplay } from "./TimeSlotDisplay";

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};


export const TaskItem = ({ task, colors, templateId, onDeleteTask }: {
    task: TemplateTask;
    colors: any;
    templateId?: string;
    onDeleteTask: (templateId: string, taskTitle: string) => void;
}) => (
    <XStack ai="center" space="$3" padding="$2" borderRadius="$2">
        <YStack flex={1} space="$1">
            <XStack jc="space-between" ai="center">
                <Text fontWeight="bold" color={colors.text}>
                    {task.title}
                </Text>
                {templateId && (
                    <Button
                        size="$1"
                        onPress={() => onDeleteTask(templateId, task.title)}
                        icon={<MaterialIcons name="delete" size={16} color={colors.error} />}
                        chromeless
                        circular
                    />
                )}
            </XStack>
            {task.description && (
                <Paragraph color={colors.textSecondary} fontSize="$3">
                    {task.description}
                </Paragraph>
            )}
            {task.time_slot && (
                <TimeSlotDisplay timeSlot={task.time_slot} colors={colors} />
            )}
        </YStack>
    </XStack>
);
