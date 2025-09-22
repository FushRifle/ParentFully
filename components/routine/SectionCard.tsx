import { MaterialIcons } from "@expo/vector-icons";
import {
    Card,
    Text,
    XStack,
    YStack
} from "tamagui";
import { TaskCountBadge } from "./TaskCountBadge";
import { TaskItem } from "./TaskItem";

type RoutineSection = {
    id: string;
    name: string;
    timeSlot: string;
    tasks: TemplateTask[];
    isExpanded: boolean;
    icon?: string;
    color?: string;
    templateId?: string;
    templateName?: string;
};

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

export const SectionCard = ({ section, colors, onToggleSection, onDeleteTask }: {
    section: RoutineSection;
    colors: any;
    onToggleSection: (sectionId: string) => void;
    onDeleteTask: (templateId: string, taskTitle: string) => void;
}) => (
    <Card
        padding="$0"
        borderWidth={1}
        borderColor={colors.border}
        backgroundColor={colors.surface}
        borderRadius="$4"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={3}
    >
        <YStack>
            <XStack
                padding="$4"
                backgroundColor={colors.surface}
                jc="space-between"
                ai="center"
                onPress={() => onToggleSection(section.id)}
                borderBottomWidth={section.isExpanded ? 1 : 0}
                borderBottomColor={colors.border}
            >
                <XStack ai="center" space="$3">
                    <MaterialIcons
                        name={section.isExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
                        size={24}
                        color={colors.primary}
                    />
                    <YStack>
                        <Text fontWeight="bold" color={colors.text}>
                            {section.name}
                        </Text>
                        {section.timeSlot !== 'Unscheduled' && (
                            <Text color={colors.textSecondary} fontSize="$2">
                                {section.timeSlot}
                            </Text>
                        )}
                    </YStack>
                </XStack>
                <TaskCountBadge count={section.tasks.length} colors={colors} />
            </XStack>

            {section.isExpanded && (
                <YStack padding="$4" space="$3">
                    {section.tasks.map((task, index) => (
                        <TaskItem
                            key={`${task.title}-${index}`}
                            task={task}
                            colors={colors}
                            templateId={section.templateId}
                            onDeleteTask={onDeleteTask}
                        />
                    ))}
                </YStack>
            )}
        </YStack>
    </Card>
);