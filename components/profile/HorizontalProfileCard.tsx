import { useTheme } from '@/styles/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Avatar } from 'react-native-paper';
import { Button, Card, ScrollView, Text, XStack, YStack } from 'tamagui';

type RootStackParamList = {
    ChildProfile: { child: ChildProfile };
};

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo?: string;
    notes?: string;
    points?: number;
}

interface CombinedChildProfileProps {
    children: ChildProfile[];
    selectedChild: ChildProfile;
    onSelectChild: (child: ChildProfile) => void;
    onEditChild: (updatedChild: ChildProfile) => void;
    setChildren: (children: ChildProfile[]) => void;
}

const CombinedChildProfile: React.FC<CombinedChildProfileProps> = ({
    children,
    onSelectChild,
    onEditChild,
    setChildren,
}) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const openEditModal = (child: ChildProfile) => {
        setCurrentChild(child);
        setModalVisible(true);
    };

    const handleSelectChild = (child: ChildProfile) => {
        onSelectChild(child);
        navigation.navigate('ChildProfile', { child });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
            >
                {children.map((child) => (
                    <XStack key={child.id} space="$3">
                        <Card
                            width={146}
                            height={190}
                            borderRadius="$3"
                            borderWidth={0.5}
                            borderColor="#C9C9C9"
                            mr="$2"
                            backgroundColor={colors.card}
                            pressStyle={{ opacity: 0.9 }}
                            padding="$3"
                            onPress={() => handleSelectChild(child)}
                            alignItems="center"
                            justifyContent="center"
                            overflow="hidden"
                        >
                            <YStack alignItems="center" mt="$3" space="$2">
                                {child.photo ? (
                                    <Avatar.Image
                                        size={68}
                                        source={
                                            child.photo
                                                ? { uri: child.photo, cache: 'force-cache' }
                                                : require('@/assets/images/profile.jpg')
                                        }
                                        style={{ backgroundColor: colors.accent }}
                                    />
                                ) : (
                                    <YStack
                                        width={68}
                                        height={68}
                                        borderRadius={50}
                                        borderWidth={2}
                                        borderColor={colors.primary}
                                        backgroundColor={colors.secondaryContainer}
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        <Text color="white" fontSize="$8" fontWeight="600">
                                            {getInitials(child.name)}
                                        </Text>
                                    </YStack>
                                )}

                                <YStack mt="$2" space="$1" ai="center" jc="center">
                                    <Text
                                        fontSize="$5"
                                        fontWeight="600"
                                        color={colors.text}
                                        style={{ flexShrink: 1, flexWrap: 'wrap' }}
                                    >
                                        {child.name}
                                    </Text>

                                    <Text fontSize="$3" color={colors.textSecondary}>
                                        Age: {child.age} y/o
                                    </Text>

                                    <XStack mt="$2">
                                        <Button
                                            chromeless
                                            onPress={() => handleSelectChild(child)}
                                            br={8}
                                            size="$2"
                                            bg={colors.secondaryContainer}
                                            px="$4"
                                        >
                                            <Text color="white" fontSize="$3" fontWeight="500">
                                                View Profile
                                            </Text>
                                        </Button>
                                    </XStack>
                                </YStack>
                            </YStack>
                        </Card>
                    </XStack>
                ))}
            </ScrollView>
        </>
    );
};

export default CombinedChildProfile;
