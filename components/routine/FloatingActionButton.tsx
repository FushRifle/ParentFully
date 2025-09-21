import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Button, Card, YStack } from "tamagui";

export const FloatingActionButton = ({
    colors,
    onCreateTemplate,
    onBrowseTemplates,
    onViewYourTemplates
}: {
    colors: any;
    onCreateTemplate: () => void;
    onBrowseTemplates: () => void;
    onViewYourTemplates: () => void;
}) => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    return (
        <>
            {/* Backdrop to detect outside touch */}
            {isMenuVisible && (
                <Button
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    zIndex={8}
                    onPress={() => setIsMenuVisible(false)}
                />
            )}

            {/* FAB button */}
            <Button
                position="absolute"
                bottom={20}
                right={20}
                circular
                size="$6"
                backgroundColor={colors.primary}
                onPress={() => setIsMenuVisible(!isMenuVisible)}
                icon={
                    <MaterialIcons
                        name={isMenuVisible ? "close" : "add"}
                        size={24}
                        color="white"
                    />
                }
                shadowColor="#000"
                shadowRadius={10}
                shadowOffset={{ width: 0, height: 4 }}
                shadowOpacity={0.2}
                animation="quick"
                pressStyle={{ scale: 0.95 }}
                zIndex={10}
            />

            {/* Popup Menu */}
            {isMenuVisible && (
                <Card
                    position="absolute"
                    bottom={80}
                    right={5}
                    width={250}
                    backgroundColor={colors.surface}
                    shadowColor="#000"
                    shadowRadius={10}
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.1}
                    padding="$3"
                    zIndex={9}
                    enterStyle={{ opacity: 0, y: 20 }}
                    exitStyle={{ opacity: 0, y: 20 }}
                    animation="quick"
                >
                    <YStack space="$2">
                        <Button
                            onPress={() => {
                                onCreateTemplate();
                                setIsMenuVisible(false);
                            }}
                            justifyContent="flex-start"
                            backgroundColor="transparent"
                            color={colors.text}
                            icon={
                                <MaterialIcons
                                    name="create"
                                    size={20}
                                    color={colors.primary}
                                />
                            }
                        >
                            Create A Template
                        </Button>

                        <Button
                            onPress={() => {
                                onBrowseTemplates();
                                setIsMenuVisible(false);
                            }}
                            justifyContent="flex-start"
                            backgroundColor="transparent"
                            color={colors.text}
                            icon={
                                <MaterialIcons
                                    name="search"
                                    size={20}
                                    color={colors.primary}
                                />
                            }
                        >
                            Browse Templates
                        </Button>

                        <Button
                            onPress={() => {
                                onViewYourTemplates();
                                setIsMenuVisible(false);
                            }}
                            justifyContent="flex-start"
                            backgroundColor="transparent"
                            color={colors.text}
                            icon={
                                <MaterialIcons
                                    name="folder"
                                    size={20}
                                    color={colors.primary}
                                />
                            }
                        >
                            View Your Templates
                        </Button>
                    </YStack>
                </Card>
            )}
        </>
    );
};
