import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Calendar, Wallet2 } from "@tamagui/lucide-icons";
import { useCallback, useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { Button, Card, Text, View, XStack, YStack } from "tamagui";

export type RequestType = {
    id: string;
    title: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    due_date: string;
    raw_due_date?: string;
    requesterEmail: string;
    requestedFromName: string;
};

const STATUS_COLORS: Record<string, string> = {
    Pending: "#FFA726",
    Approved: "#388E3C",
    Rejected: "#E53935",
};

export const PaymentRequestCard = () => {
    const { colors } = useTheme();
    const [requests, setRequests] = useState<RequestType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async (): Promise<RequestType[]> => {
        const { data, error } = await supabase
            .from("payment_requests")
            .select(`
        id,
        title,
        description,
        amount,
        currency,
        status,
        due_date,
        requester_id,
        requested_from:family_contacts!payment_requests_requested_from_id_fkey (
          id,
          name
        )
      `);

        if (error) {
            console.error("Error fetching requests:", error);
            return [];
        }

        if (!data) return [];

        const formattedRequests: RequestType[] = data.map((req: any) => ({
            id: req.id,
            title: req.title,
            description: req.description,
            amount: req.amount,
            currency: req.currency || "₦",
            status: req.status,
            due_date: req.due_date
                ? new Date(req.due_date).toLocaleDateString()
                : "N/A",
            raw_due_date: req.due_date,
            requesterEmail: req.requester?.email || "Unknown",
            requestedFromName: req.requested_from?.name || "Unknown",
        }));

        return formattedRequests;
    }, []);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await fetchRequests();
            setRequests(data);
            setLoading(false);
        };
        load();
    }, [fetchRequests]);

    if (loading) return <Text>Loading...</Text>;

    return (
        <ScrollView contentContainerStyle={{ padding: 16, marginBottom: 100 }}>
            {requests.length > 0 ? (
                requests.map((req) => (
                    <Card
                        key={req.id}
                        backgroundColor="#fff"
                        borderRadius={12}
                        padding={16}
                        marginBottom={12}
                        elevation={2}
                    >
                        <YStack space='$3'>
                            <XStack justifyContent="space-between" alignItems="center">
                                <View
                                    style={{
                                        alignSelf: "flex-start",
                                        backgroundColor: colors.primary,
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 18,
                                    }}
                                >
                                    <Text
                                        color="white"
                                        fontSize={14}
                                        fontWeight="600"
                                        style={{ textTransform: "uppercase" }}
                                    >
                                        {req.status} Request
                                    </Text>
                                </View>

                                <Text fontSize='$7' fontWeight="600">
                                    {req.currency}{req.amount}.00
                                </Text>
                            </XStack>

                            <YStack space='$2'>
                                <Text fontSize='$5' fontWeight="700">{req.title}</Text>
                                <Text>Requested From: {req.requestedFromName}</Text>
                            </YStack>

                            <XStack justifyContent="space-between" alignItems="center">
                                <Text fontSize={13} color="#555">
                                    <Calendar size={12} />  {req.due_date}
                                </Text>
                                <View
                                    style={{
                                        alignSelf: "flex-start",
                                        backgroundColor: '#FFF0D5',
                                        paddingHorizontal: 6,
                                        paddingVertical: 6,
                                        borderRadius: 18,
                                    }}
                                >
                                    <Text
                                        color="#B35D00"
                                        fontSize='$3'
                                        fontWeight="600"
                                    >
                                        Needs Approval
                                    </Text>
                                </View>
                            </XStack>

                            <Button
                                onPress={() => console.log("Take action for", req)}
                                backgroundColor="transparent"
                                color={colors.primary}
                                borderWidth={1}
                                borderColor="#FFA726"
                                br={8}
                                py={8}
                            >
                                Take Action
                            </Button>
                        </YStack>
                    </Card>
                ))
            ) : (
                <YStack ai="center" jc="center" mt="$4">
                    <Card
                        backgroundColor="#f0f0f0"
                        padding="$6"
                        borderRadius={12}
                        elevation={2}
                        ai="center"
                        jc="center"
                        width="90%"
                        space="$3"
                    >
                        <Wallet2 size={36} color="#FFA726" />
                        <Text fontSize={16} color="#888" fontWeight="600">
                            No Request has been Created
                        </Text>
                    </Card>
                </YStack>
            )}
        </ScrollView>
    );
};
