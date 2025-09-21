import { Button, TextArea, XStack, YStack } from 'tamagui';

const COMMON_ALLERGIES = [
    'Peanuts',
    'Tree Nuts',
    'Milk',
    'Eggs',
    'Wheat',
    'Soy',
    'Fish',
    'Shellfish',
];

export const ChildAllergiesField = ({
    value,
    onChangeText,
}: {
    value: string;
    onChangeText: (text: string) => void;
}) => {
    const handleAddAllergy = (allergy: string) => {
        const existing = value.toLowerCase();
        if (!existing.includes(allergy.toLowerCase())) {
            const newText = value.trim() ? `${value}, ${allergy}` : allergy;
            onChangeText(newText);
        }
    };

    return (
        <YStack space="$3">
            <XStack flexWrap="wrap" gap="$2">
                {COMMON_ALLERGIES.map((allergy) => (
                    <Button
                        key={allergy}
                        size="$2"
                        onPress={() => handleAddAllergy(allergy)}
                    >
                        {allergy}
                    </Button>
                ))}
            </XStack>

            <TextArea
                placeholder="Describe allergies or medical conditions..."
                value={value}
                onChangeText={onChangeText}
                numberOfLines={3}
            />
        </YStack>
    );
};
