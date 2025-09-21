// components/SuccessSheet.tsx
import { useNavigation } from '@react-navigation/native'
import { CheckCircle2 } from '@tamagui/lucide-icons'
import React, { useEffect } from 'react'
import { Button, Sheet, Text } from 'tamagui'

type SuccessSheetProps = {
    open: boolean
    onOpenChange: (val: boolean) => void
    message?: string
    redirectTo?: string
}

export const SuccessSheet: React.FC<SuccessSheetProps> = ({
    open,
    onOpenChange,
    message = 'Action completed successfully!',
    redirectTo = 'Home',
}) => {
    const navigation = useNavigation()

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => {
                onOpenChange(false)
                navigation.navigate(redirectTo as never)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [open])

    return (
        <Sheet
            forceRemoveScrollEnabled={open}
            modal
            open={open}
            onOpenChange={onOpenChange}
            dismissOnSnapToBottom
            snapPoints={[40]} // 40% of screen height
        >
            <Sheet.Overlay />
            <Sheet.Frame ai="center" jc="center" gap="$4" p="$5">
                <CheckCircle2 size={48} color="green" />
                <Text fontSize="$6" fontWeight="700" textAlign="center">
                    Success
                </Text>
                <Text fontSize="$4" textAlign="center" color="$colorSubtle">
                    {message}
                </Text>
                <Button mt="$3" onPress={() => onOpenChange(false)}>
                    Close Now
                </Button>
            </Sheet.Frame>
        </Sheet>
    )
}
