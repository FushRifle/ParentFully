import { NavigationProp, RequestCardProps } from "@/types/Budget";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";

const RequestCard = ({
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
    requestData,
}: RequestCardProps) => {
    const navigation = useNavigation<NavigationProp>();

    const statusColors: Record<string, string> = {
        "Pending Approval": "#FFF0D5",
        "Approved": "#4ade80",
        "Rejected": "#f87171",
        "Paid": "#4ade80",
        "Pending": "#FFF0D5",
        "Reimburser": "#3b82f6",
    };

    const handlePress = () => {
        if (requestData) {
            navigation.navigate("ConfirmRequest", {
                requestId: requestData.id,
                title,
                description: title,
                amount: requestData.amount || amount,
                currency: requestData.currency || currency,
                requestedFromId: requestData.requested_from_id,
                requestedFromName: requestData.contactName || reimbursedBy,
                dueDate: requestData.due_date || date,
                status: requestData.status || status,
                fileName: requestData.fileName,
            });
        } else if (expenseId) {
            navigation.navigate("ExpenseDetails", { expenseId });
        } else {
            console.warn("No expenseId available for navigation");
        }
    };

    return (
        <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
            <Card
                br="$4"
                p="$4"
                bw={1}
                height={176}
                borderColor="$gray5"
                borderTopColor="#8b5cf6"
                borderTopWidth={8}
                bg="white"
            >
                <YStack space="$3" f={1}>
                    <XStack jc="space-between" ai="center">
                        <YStack>
                            <Text fow="700" fos="$5" color="$gray12">
                                {title}
                            </Text>
                            <Text>
                                {splitInfo}
                            </Text>
                        </YStack>
                        <Text fow="700" fos="$6" color="$gray12">
                            {currency}{amount.toLocaleString()}.00
                        </Text>
                    </XStack>

                    <XStack space="$2" ai="center" jc="space-between" flexWrap="wrap">
                        <XStack ai="center" space="$1">
                            <Feather name="calendar" size={14} color="#6b7280" />
                            <Text color="$gray10" fos="$2">{date}</Text>
                        </XStack>

                        <Text bg={categoryColor} color="white" px="$2" py={2} br="$2" fos="$2" fow="600">
                            {category}
                        </Text>

                        <Text bg={statusColors[status]} color="black" px="$2" py={2} br="$2" fos="$2" fow="600">
                            {status}
                        </Text>
                    </XStack>

                    <XStack jc="space-between" ai="center" mt="$2">
                        <YStack>
                            {reimbursedBy && <Text color="$gray10" fos="$2">By: {reimbursedBy}</Text>}
                        </YStack>
                        <XStack ai="center" space="$1">
                            <Text color="#059669" fow="600" fos="$2">View Request</Text>
                            <Feather name="send" size={14} color="#059669" />
                        </XStack>
                    </XStack>
                </YStack>
            </Card>
        </TouchableOpacity>
    );
};

export default RequestCard;
