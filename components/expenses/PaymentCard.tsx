import { NavigationProp, PaymentCardProps } from "@/types/Budget";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Card, Text, XStack, YStack } from "tamagui";

const PaymentCard = ({
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
    paymentData,
}: PaymentCardProps) => {
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
        if (paymentData) {
            navigation.navigate("ConfirmPayment", {
                expense: {
                    id: expenseId,
                    title,
                    amount,
                    currency,
                    category,
                    date,
                    status,
                    children: { name: childName },
                },
                payment: paymentData,
            });
        } else {
            navigation.navigate("ExpenseDetails", { expenseId });
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
                borderTopColor="#3b82f6"
                borderTopWidth={8}
                bg="white"
            >
                <YStack space="$3" f={1}>
                    <XStack jc="space-between" ai="center">
                        <YStack>
                            <Text fow="700" fos="$5" color="$gray12">
                                {title}
                            </Text>
                            <Text color="$gray10" fos="$3">For {childName}</Text>
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
                            <Text color="$gray10" fos="$2">{splitInfo}</Text>
                            {reimbursedBy && <Text color="$gray10" fos="$2">Paid to: {reimbursedBy}</Text>}
                        </YStack>
                        <XStack ai="center" space="$1">
                            <Text color="#059669" fow="600" fos="$2">View Payment</Text>
                            <Feather name="credit-card" size={14} color="#059669" />
                        </XStack>
                    </XStack>
                </YStack>
            </Card>
        </TouchableOpacity>
    );
};

export default PaymentCard;
