import { useTheme } from "@/styles/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView, TouchableOpacity, View } from "react-native";
import { Text, XStack } from "tamagui";

export const RoutineDetailsHeader = ({
    mode,
    navigation,
    handleCancel,
    handleReorder,
    handleSaveReorder,
    icon,
    title,
}: {
    mode: "view" | "edit";
    navigation: any;
    handleCancel: () => void;
    handleReorder: () => void;
    handleSaveReorder: () => void;
    icon: string;
    title: string;
}) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={{ backgroundColor: colors.secondary }}>
            <XStack
                ai="center"
                jc="space-between"
                width="100%"
                paddingTop="$4"
                paddingBottom="$4"
                px="$3"
            >
                {/* Back/Cancel button */}
                <TouchableOpacity
                    onPress={() => (mode === "view" ? navigation.goBack() : handleCancel())}
                >
                    <MaterialCommunityIcons
                        name={mode === "view" ? "arrow-left" : "close"}
                        size={26}
                        color="white"
                    />
                </TouchableOpacity>

                {/* Title + Icon */}
                <XStack jc="flex-start" ai="center" space="$3">
                    <View
                        style={{
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#005A31",
                        }}
                    >
                        <MaterialCommunityIcons name={icon as any} size={26} color="yellow" />
                    </View>
                    <Text fontSize="$8" fontWeight="700" color="white">
                        {title}
                    </Text>
                </XStack>

                {/* Right action */}
                <XStack>
                    {mode === "view" ? (
                        <TouchableOpacity onPress={handleReorder}>
                            <MaterialCommunityIcons name="reorder-horizontal" size={26} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={handleSaveReorder}>
                            <MaterialCommunityIcons name="check" size={26} color="white" />
                        </TouchableOpacity>
                    )}
                </XStack>
            </XStack>
        </SafeAreaView>
    );
};
