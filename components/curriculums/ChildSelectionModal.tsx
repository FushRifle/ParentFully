import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Modal } from 'react-native'
import {
    Button,
    Card,
    H4,
    Paragraph,
    SizableText,
    XStack,
    YStack,
} from 'tamagui'

type Child = {
    id: string
    name: string
    age: number
}

type ChildSelectionModalProps = {
    visible: boolean
    children: Child[]
    onSelectChild: (childId: string) => void
    onClose: () => void
}

const ChildSelectionModal = ({
    visible,
    children,
    onSelectChild,
    onClose,
}: ChildSelectionModalProps) => {
    return (
        <Modal
            animationType="fade"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <YStack
                flex={1}
                justifyContent="center"
                alignItems="center"
                backgroundColor="rgba(0,0,0,0.4)"
            >
                <Card
                    width="90%"
                    padding="$4"
                    borderRadius="$6"
                    elevate
                    backgroundColor="$background"
                >
                    {/* Header */}
                    <XStack justifyContent="space-between" alignItems="center" mb="$4">
                        <H4>Select a Child</H4>
                        <Button
                            circular
                            size="$2"
                            onPress={onClose}
                            icon={<MaterialIcons name="close" size={25} color="red" borderWidth={1} borderColor="$borderColor" />}
                        />
                    </XStack>

                    {/* Child List */}
                    <YStack space="$3">
                        {children.length > 0 ? (
                            children.map((child) => (
                                <Button
                                    key={child.id}
                                    onPress={() => onSelectChild(child.id)}
                                    size="$4"
                                    justifyContent="flex-start"
                                    borderColor="$borderColor"
                                    borderWidth={1}
                                    backgroundColor="$background"
                                    hoverStyle={{
                                        backgroundColor: '$gray2',
                                    }}
                                >
                                    <XStack space="$3" alignItems="center">
                                        <MaterialIcons name="child-care" size={24} color="#555" />
                                        <YStack>
                                            <SizableText size="$4" fontWeight="600">
                                                {child.name}
                                            </SizableText>
                                            <SizableText size="$2" color="$gray10">
                                                Age: {child.age}
                                            </SizableText>
                                        </YStack>
                                    </XStack>
                                </Button>
                            ))
                        ) : (
                            <Paragraph textAlign="center" color="$gray10">
                                No children available.
                            </Paragraph>
                        )}
                    </YStack>
                </Card>
            </YStack>
        </Modal>
    )
}

export default ChildSelectionModal
