import { useTheme } from '@/styles/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Avatar } from 'react-native-paper';
import { Button, Card, ScrollView, Text, XStack, YStack } from 'tamagui';
import { Dimensions } from 'react-native';

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

const { width: screenWidth } = Dimensions.get('window');
// Adjust margin/padding to calculate card width dynamically
const CARD_MARGIN = 5;
const CARD_WIDTH = (screenWidth - CARD_MARGIN * 1) / 3; // 2 cards per screen width

const CombinedChildProfile: React.FC<CombinedChildProfileProps> = ({
    children,
    onSelectChild,
}) => {
    const { colors } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);

    const handleSelectChild = (child: ChildProfile) => {
        onSelectChild(child);
        navigation.navigate('ChildProfile', { child });
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack space={CARD_MARGIN}>
                {children.map((child) => (
                    <Card
                        key={child.id}
                        width={CARD_WIDTH}
                        borderRadius="$3"
                        borderWidth={0.5}
                        borderColor="#C9C9C9"
                        backgroundColor={colors.card}
                        pressStyle={{ opacity: 0.9 }}
                        padding="$1"
                        onPress={() => handleSelectChild(child)}
                        alignItems="center"
                        justifyContent="center"
                        overflow="hidden"
                    >
                        <YStack alignItems="center" mt="$3" space="$2">
                            {child.photo ? (
                                <Avatar.Image
                                    size={60}
                                    source={{ uri: child.photo, cache: 'force-cache' }}
                                    style={{ backgroundColor: colors.accent }}
                                />
                            ) : (
                                <YStack
                                    width={60}
                                    height={60}
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
                                    fontSize="$3"
                                    fontWeight="600"
                                    color={colors.text}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                    style={{ textAlign: 'center' }}
                                >
                                    {child.name}
                                </Text>

                                <Text fontSize="$3" color={colors.textSecondary}>
                                    Age: {child.age} y/o
                                </Text>

                                <Button
                                    chromeless
                                    onPress={() => handleSelectChild(child)}
                                    br={8}
                                    size="$2"
                                    bg={colors.secondaryContainer}
                                    px="$3"
                                    mt="$2"
                                    mb='$2'
                                >
                                    <Text color="white" fontSize="$1" fontWeight="500">
                                        View Profile
                                    </Text>
                                </Button>
                            </YStack>
                        </YStack>
                    </Card>
                ))}
            </XStack>
        </ScrollView>
    );
};

export default CombinedChildProfile;
