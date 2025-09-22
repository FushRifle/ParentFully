import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Adapt, Button, Input, Label, Paragraph, Select, Sheet, Spinner, XStack, YStack } from 'tamagui';

type CoParentData = {
    name: string;
    email: string;
    relation: string;
};

type AddCoParentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAddCoParent: (coParent: CoParentData) => void;
};

const relationOptions = [
    { name: 'Co-parent', value: 'co-parent' },
    { name: 'Guardian', value: 'guardian' },
    { name: 'Grandparent', value: 'grandparent' },
    { name: 'Teacher', value: 'teacher' },
    { name: 'Pediatrician', value: 'pediatrician' },
    { name: 'Other', value: 'other' },
];

export function AddCoParentModal({ open, onOpenChange, onAddCoParent }: AddCoParentModalProps) {
    const [formData, setFormData] = useState<CoParentData>({
        name: '',
        email: '',
        relation: 'co-parent',
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field: keyof CoParentData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            onAddCoParent(formData);
            setIsLoading(false);
            onOpenChange(false);
            setFormData({ name: '', email: '', relation: 'co-parent' });
        }, 1000);
    };

    const isValid = formData.name.trim() && formData.email.trim();

    return (
        <Sheet
            modal
            open={open}
            onOpenChange={onOpenChange}
            snapPoints={[85]}
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay />
            <Sheet.Handle />
            <Sheet.Frame padding="$4" space="$4">
                <XStack justifyContent="space-between" alignItems="center">
                    <Paragraph size="$6" fontWeight="bold">
                        Add Co-Parent/Guardian
                    </Paragraph>
                    <Button
                        size="$2"
                        circular
                        icon={<MaterialIcons name="close" size={20} />}
                        onPress={() => onOpenChange(false)}
                    />
                </XStack>

                <YStack space="$4">
                    <YStack space="$2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            placeholder="Enter full name"
                            value={formData.name}
                            onChangeText={text => handleChange('name', text)}
                        />
                    </YStack>

                    <YStack space="$2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            placeholder="Enter email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={text => handleChange('email', text)}
                        />
                    </YStack>

                    <YStack space="$2">
                        <Label htmlFor="relation">Relationship</Label>
                        <Select
                            id="relation"
                            value={formData.relation}
                            onValueChange={value => handleChange('relation', value)}
                        >
                            <Select.Trigger width="100%">
                                <Select.Value placeholder="Select relationship" />
                            </Select.Trigger>

                            <Adapt when="sm" platform="touch">
                                <Sheet modal dismissOnSnapToBottom>
                                    <Sheet.Frame>
                                        <Sheet.ScrollView>
                                            <Adapt.Contents />
                                        </Sheet.ScrollView>
                                    </Sheet.Frame>
                                    <Sheet.Overlay />
                                </Sheet>
                            </Adapt>

                            <Select.Content>
                                <Select.ScrollUpButton />
                                <Select.Viewport>
                                    {relationOptions.map((option, i) => (
                                        <Select.Item index={i} key={option.value} value={option.value}>
                                            <Select.ItemText>{option.name}</Select.ItemText>
                                        </Select.Item>
                                    ))}
                                </Select.Viewport>
                                <Select.ScrollDownButton />
                            </Select.Content>
                        </Select>
                    </YStack>

                    <Button
                        themeInverse
                        marginTop="$4"
                        onPress={handleSubmit}
                        disabled={!isValid || isLoading}
                        icon={isLoading ? <Spinner /> : undefined}
                    >
                        {isLoading ? 'Inviting...' : 'Invite Co-Parent'}
                    </Button>
                </YStack>
            </Sheet.Frame>
        </Sheet>
    );
}