import { Text } from '@/context/GlobalText';
import { useTheme } from "@/styles/ThemeContext";
import { ExpenseCardBaseProps, NavigationProp } from "@/types/Budget";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Card, XStack, YStack } from "tamagui";

const ExpenseCard = ({
    expenseId,
    title,
    amount,
    currency = "₦",
    childName,
    date,
    category,
    categoryColor,
    status,
    splitInfo,
    reimbursedBy,
}:
    ExpenseCardBaseProps) => {
    const navigation = useNavigation<NavigationProp>();
    const { colors } = useTheme();

    const statusColors: Record<string, string> = {
        "Pending Approval": "#FFF0D5",
        "Approved": "#4ade80",
        "Rejected": "#f87171",
        "Paid": "#4ade80",
        "Pending": "#FFF0D5",
        "Reimburser": "#3b82f6",
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("ExpenseDetails", { expenseId })}
        >
            <Card
                br="$4"
                p="$3"
                w='100%'
                height={160}
                mb='$3'
                borderTopColor="#f97316"
                borderTopWidth={8}
                bg="white"
            >
                <YStack space="$2" f={1}>
                    <XStack jc="space-between" ai="center">
                        <YStack>
                            <Text fow="500" color={colors.text}>
                                {title}
                            </Text>
                            <Text fos='$1' color={colors.text}>
                                For {childName}
                            </Text>
                        </YStack>
                        <Text fow="600" color={colors.text}>
                            {currency}
                            {amount.toLocaleString()}.00
                        </Text>
                    </XStack>

                    {/* Middle Row */}
                    <XStack space="$2" ai="center" jc="space-between" flexWrap="wrap">
                        <XStack ai="center" space="$1">
                            <Feather name="calendar" size={14} color="#6b7280" />
                            <Text color={colors.text} fos="$1">{date}</Text>
                        </XStack>

                        <Text bg={categoryColor} color="white" px="$2" fos='$1' br="$2" fow="400">
                            {category}
                        </Text>

                        <Text
                            bg={statusColors[status] || "#FFF0D5"}
                            color="black"
                            px="$2"
                            py={2}
                            br="$2"
                            fos="$1"
                            fow="600"
                        >
                            {status}
                        </Text>
                    </XStack>

                    {/* Bottom Row */}
                    <XStack jc="space-between" ai="center" mt="$2">
                        <YStack>
                            <Text color={colors.text} fos="$1">{splitInfo}</Text>
                            {reimbursedBy && (
                                <Text color={colors.text} fos="$1">Reimbursed By: {reimbursedBy}</Text>
                            )}
                        </YStack>
                        <XStack ai="center" space="$1">
                            <Text color="#059669" fow="600" fos="$1">View Details</Text>
                        </XStack>
                    </XStack>
                </YStack>
            </Card>
        </TouchableOpacity>
    );
};

export default ExpenseCard;
