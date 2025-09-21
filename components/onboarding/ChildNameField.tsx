import { Ionicons } from '@expo/vector-icons';
import { Button, Input, XStack, YStack } from 'tamagui';

export const ChildNameField = ({
    name,
    onNameChange,
    onAddAnotherChild,
}: {
    name: string;
    onNameChange: (text: string) => void;
    onAddAnotherChild: () => void;
}) => {
    return (
        <YStack space="$2">
            <XStack justifyContent="space-between" alignItems="center">
                <Input
                    flex={1}
                    placeholder="Child's name"
                    value={name}
                    onChangeText={onNameChange}
                    autoFocus
                    returnKeyType="next"
                />
                <Button
                    icon={<Ionicons name="add-circle" size={24} />}
                    onPress={onAddAnotherChild}
                    chromeless
                />
            </XStack>
        </YStack>
    );
};