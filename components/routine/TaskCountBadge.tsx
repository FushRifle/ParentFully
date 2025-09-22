import { Text, XStack } from "tamagui";

export const TaskCountBadge = ({ count, colors }: { count: number; colors: any }) => (
    <XStack
        backgroundColor={colors.surface}
        paddingHorizontal="$2"
        paddingVertical="$1"
        borderRadius="$2"
        borderWidth={1}
        borderColor={colors.border}
    >
        <Text color={colors.text} fontSize="$2">
            {count} {count === 1 ? 'task' : 'tasks'}
        </Text>
    </XStack>
);