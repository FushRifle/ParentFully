import { useNavigation } from "@react-navigation/native"
import { CheckCircle2 } from "@tamagui/lucide-icons"
import { Modal } from "react-native"
import { Button, Card, Text, YStack } from "tamagui"

type SuccessModalProps = {
    visible: boolean
    message?: string
    onClose: () => void
}

export const SuccessModal = ({ visible, message = "Expense added successfully!", onClose }: SuccessModalProps) => {
    const navigation = useNavigation(); // <- added

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <YStack f={1} jc="center" ai="center" bg="rgba(0,0,0,0.4)">
                <Card w={350} h='50%'
                    p="$6"
                    br="$6"
                    ai="center"
                    jc="center"
                    bg="white"
                >
                    <CheckCircle2 size={60} color="#FF8C01" />
                    <Text mt="$4" fontSize="$6" fontWeight="700" textAlign="center">
                        {message}
                    </Text>

                    <Button
                        size="$5"
                        mt="$9"
                        w="100%"
                        bg="#FF8C01"
                        color="white"
                        br="$4"
                        onPress={() => (navigation as any).navigate("ExpenseRecords")}
                    >
                        View Expense
                    </Button>

                    <Button
                        size='$5'
                        mt="$5"
                        variant='outlined'
                        borderColor='#FF8C01'
                        w="100%"
                        color='#FF8C01'
                        br="$4"
                        onPress={onClose}
                    >
                        Done
                    </Button>

                </Card>
            </YStack>
        </Modal>
    )
}
