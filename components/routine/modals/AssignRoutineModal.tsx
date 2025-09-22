import { useTheme } from "@/styles/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Modal } from "react-native";
import { Button, Text, View, YStack } from "tamagui";

const CelebrationModal = ({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) => {
    const { colors } = useTheme();

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                }}
            >
                <YStack
                    bg="white"
                    p="$5"
                    br="$6"
                    width="90%"
                    ai="center"
                    space="$4"
                >
                    <MaterialCommunityIcons
                        name="party-popper"
                        size={48}
                        color={colors.primary}
                    />
                    <Text fontSize="$7" fontWeight="700" color={colors.primary}>
                        🎉 Routine Saved!
                    </Text>
                    <Text fontSize="$4" ta="center" color="#444">
                        Great job! Your child’s new routine has been created successfully.
                    </Text>
                    <Button
                        bg={colors.primary}
                        color="white"
                        br="$4"
                        onPress={onClose}
                    >
                        Awesome!
                    </Button>
                </YStack>
            </View>
        </Modal>
    );
};

const SaveRoutineButton = ({ handleSave, loading }: any) => {
    const { colors } = useTheme();
    const [showCelebration, setShowCelebration] = useState(false);

    const handlePress = async () => {
        try {
            await handleSave(); // call your save logic
            setShowCelebration(true); // then show modal
        } catch (err) {
            console.error("Error saving:", err);
        }
    };

    return (
        <>
            <Button
                flex={1}
                backgroundColor={colors.primary}
                borderRadius={8}
                padding={16}
                marginLeft={12}
                disabled={loading}
                opacity={loading ? 0.6 : 1}
                onPress={handlePress}
                unstyled
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text
                        color="white"
                        textAlign="center"
                        fontSize={16}
                        fontWeight="600"
                    >
                        Save Routine
                    </Text>
                )}
            </Button>

            {/* Celebratory Modal */}
            <CelebrationModal
                visible={showCelebration}
                onClose={() => setShowCelebration(false)}
            />
        </>
    );
};

export default SaveRoutineButton;
