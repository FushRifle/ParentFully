import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import { Button, Card, Text, XStack, YStack } from "tamagui";

type AppliedTask = {
    id: string;
    title: string;
    time_slot?: string;
    templateName: string;
    applied_at: string;
};

type AppliedTasksSectionProps = {
    appliedTasks: AppliedTask[];
    colors: any;
    onDeleteTask: (taskId: string) => void;
    onDeleteRoutine: (templateId: string) => void;
};

export const AppliedTasksSection = ({
    appliedTasks,
    colors,
    onDeleteTask
}: AppliedTasksSectionProps) => {
    const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});

    if (appliedTasks.length === 0) return null;

    // Group tasks by templateName
    const tasksByTemplate = appliedTasks.reduce((acc, task) => {
        if (!acc[task.templateName]) {
            acc[task.templateName] = [];
        }
        acc[task.templateName].push(task);
        return acc;
    }, {} as Record<string, AppliedTask[]>);

    // Sort template names alphabetically
    const sortedTemplateNames = Object.keys(tasksByTemplate).sort();

    const toggleTemplate = (templateName: string) => {
        setExpandedTemplates(prev => ({
            ...prev,
            [templateName]: !prev[templateName]
        }));
    };

    function onDeleteRoutine(id: any): void {
        throw new Error("Function not implemented.");
    }

    return (
        <YStack space="$3" padding="$2" mt="$3">
            <YStack space="$3">
                {sortedTemplateNames.slice(0, 5).map((templateName) => (
                    <Card
                        key={templateName}
                        backgroundColor={colors.surface}
                        borderColor={colors.border}
                        borderWidth={1}
                        borderRadius="$4"
                        overflow="hidden"
                    >
                        <Pressable onPress={() => toggleTemplate(templateName)}>
                            <YStack>
                                {/* Template Header */}
                                <XStack
                                    padding="$3"
                                    space="$2"
                                    alignItems="center"
                                    justifyContent="space-between"
                                    backgroundColor={expandedTemplates[templateName] ? colors.primary : colors.surface}
                                >
                                    <YStack space="$1">
                                        <Text
                                            fontWeight="bold"
                                            color={expandedTemplates[templateName] ? colors.onPrimary : colors.primary}
                                        >
                                            {templateName}
                                        </Text>
                                        <Text
                                            color={expandedTemplates[templateName] ? colors.onPrimary : colors.primary}
                                            fontSize="$1"
                                        >
                                            ( {tasksByTemplate[templateName].length} ) tasks
                                        </Text>
                                    </YStack>

                                    <MaterialIcons
                                        name={expandedTemplates[templateName] ? "expand-less" : "expand-more"}
                                        size={20}
                                        color={expandedTemplates[templateName] ? colors.onPrimary : colors.primary}
                                    />
                                </XStack>

                                {/* Tasks List (shown when expanded) */}
                                {expandedTemplates[templateName] && (
                                    <YStack padding="$3" space="$2" backgroundColor={colors.surface}>
                                        {tasksByTemplate[templateName].map((task) => (
                                            <XStack
                                                key={task.id}
                                                space="$2"
                                                alignItems="center"
                                                paddingVertical="$2"
                                            >
                                                {/* Bullet Icon */}
                                                <MaterialIcons
                                                    name="lens"
                                                    size={10}
                                                    color={colors.primary}
                                                    style={{ marginRight: 4 }}
                                                />

                                                {/* Task Details */}
                                                <YStack flex={1}>
                                                    <Text color={colors.text}>{task.title}</Text>
                                                    {task.time_slot && (
                                                        <XStack space="$2" alignItems="center" marginTop="$1">
                                                            <MaterialIcons
                                                                name="access-time"
                                                                size={14}
                                                                color={colors.textSecondary}
                                                            />
                                                            <Text color={colors.textSecondary} fontSize="$2">
                                                                {task.time_slot}
                                                            </Text>
                                                        </XStack>
                                                    )}
                                                </YStack>

                                                {/* Bin/Delete Icon */}
                                                <Button
                                                    unstyled
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteTask(task.id);
                                                    }}
                                                    icon={
                                                        <MaterialIcons
                                                            name="delete"
                                                            size={20}
                                                            color={colors.error}
                                                        />
                                                    }
                                                />
                                            </XStack>
                                        ))}
                                    </YStack>

                                )}
                            </YStack>
                        </Pressable>
                    </Card>
                ))}
            </YStack>

            {sortedTemplateNames.length > 5 && (
                <Text color={colors.textSecondary} fontSize="$2">
                    + {sortedTemplateNames.length - 5} more templates
                </Text>
            )}
        </YStack>
    );
};