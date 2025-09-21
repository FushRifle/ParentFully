import { MaterialIcons } from '@expo/vector-icons';
import {
    Button,
    Card, Text, XStack,
    YStack
} from "tamagui";


export const NoTemplatesView = ({ colors, onViewUserTemplates, onBrowsePreloaded }: {
    colors: any;
    onViewUserTemplates: () => void;
    onBrowsePreloaded: () => void;
}) => (
    <Card elevate padding="$4" marginBottom="$4" backgroundColor={colors.background}>
        <YStack alignItems="center" space="$3">
            <MaterialIcons name="checklist" size={40} color={colors.textSecondary} />
            <Text textAlign="center" color={colors.text}>No template selected</Text>
            <XStack space="$3">
                <Button
                    onPress={onViewUserTemplates}
                    backgroundColor={colors.primary}
                    color={colors.onPrimary}
                    borderRadius="$2"
                >
                    View Your Templates
                </Button>
                <Button
                    onPress={onBrowsePreloaded}
                    backgroundColor={colors.secondary}
                    color={colors.onPrimary}
                    borderRadius="$2"
                >
                    Browse Preloaded
                </Button>
            </XStack>
        </YStack>
    </Card>
);