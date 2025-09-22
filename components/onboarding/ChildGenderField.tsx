import { Select, YStack } from 'tamagui';

export const ChildGenderField = ({
    gender,
    onGenderChange,
}: {
    gender: string;
    onGenderChange: (gender: string) => void;
}) => {
    return (
        <YStack space="$2">
            <Select onValueChange={onGenderChange} value={gender}>
                <Select.Trigger>
                    <Select.Value placeholder="Select Gender" />
                </Select.Trigger>
                <Select.Content>
                    <Select.Viewport>
                        <Select.Item index={0} value="Male">
                            <Select.ItemText>Male</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={1} value="Female">
                            <Select.ItemText>Female</Select.ItemText>
                        </Select.Item>
                        <Select.Item index={2} value="Other">
                            <Select.ItemText>Other</Select.ItemText>
                        </Select.Item>
                    </Select.Viewport>
                </Select.Content>
            </Select>
        </YStack>
    );
};