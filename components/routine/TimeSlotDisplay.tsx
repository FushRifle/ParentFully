import { MaterialIcons } from "@expo/vector-icons";
import { Text, XStack } from "tamagui";

export const TimeSlotDisplay = ({ timeSlot, colors }: { timeSlot: string; colors: any }) => (
    <XStack ai="center" space="$2" mt="$1">
        <MaterialIcons name="access-time" size={14} color={colors.textSecondary} />
        <Text color={colors.textSecondary} fontSize="$2">
            {timeSlot}
        </Text>
    </XStack>
);