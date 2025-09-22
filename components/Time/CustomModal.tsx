import { useTheme } from "@/styles/ThemeContext"
import { Check } from "@tamagui/lucide-icons"
import { useState } from "react"
import { Button, Sheet, Text, XStack, YStack } from "tamagui"

export function CustomRepeatModal({
    open,
    onOpenChange,
    setRepeat,
}: {
    open: boolean
    onOpenChange: (val: boolean) => void
    setRepeat: (val: "None" | "Once" | "Daily" | "Mon-Fri" | "Custom") => void
}) {
    const { colors } = useTheme();
    const repeatOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const [customDays, setCustomDays] = useState<string[]>([])

    const toggleOption = (day: string) => {
        setCustomDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        )
    }

    const handleSave = () => {
        setRepeat("Custom")
        console.log("Custom Days:", customDays)
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange} snapPointsMode="fit" modal>
            <Sheet.Overlay />
            <Sheet.Frame p="$4" br="$6" bg="$background">
                <YStack space="$5">
                    <Text fontSize="$6" fontWeight="700" textAlign="center" mb='$3'>
                        Customize
                    </Text>

                    {repeatOptions.map((day) => {
                        const isSelected = customDays.includes(day)
                        return (
                            <XStack
                                key={day}
                                space='$6'
                                ai="center"
                                jc="space-between"
                                p="$3"
                                br="$4"
                                pressStyle={{ bg: "$backgroundHover" }}
                                onPress={() => toggleOption(day)}
                            >
                                <Text fontSize="$5" fontWeight="600">{day}</Text>

                                {/* Custom Round Checkbox */}
                                <XStack
                                    w={24}
                                    h={24}
                                    br={9999}
                                    ai="center"
                                    jc="center"
                                    bg={isSelected ? "green" : "transparent"}
                                    borderWidth={2}
                                    borderColor={isSelected ? "green" : colors.text}
                                >
                                    {isSelected && <Check size={18} color="white" />}
                                </XStack>
                            </XStack>
                        )
                    })}

                    <XStack space="$4" width="100%" mt="$4" maxWidth={400}>
                        <Button
                            f={1}
                            backgroundColor="transparent"
                            borderColor={colors.primary}
                            borderWidth={2}
                            color={colors.primary}
                            borderRadius="$4"
                            onPress={() => onOpenChange(false)}
                            height="$5"
                        >
                            Cancel
                        </Button>
                        <Button
                            f={1}
                            backgroundColor={colors.primary}
                            color={colors.onPrimary}
                            borderRadius="$4"
                            onPress={handleSave}
                            height="$5"
                        >
                            Ok
                        </Button>
                    </XStack>
                </YStack>
            </Sheet.Frame>
        </Sheet>
    )
}
