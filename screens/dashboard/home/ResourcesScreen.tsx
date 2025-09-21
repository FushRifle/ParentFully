import { useTheme } from '@/styles/ThemeContext';
import { Article } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
    Button, Card, ScrollView, Stack,
    Text,
    View,
    XStack, YStack
} from 'tamagui';

interface ResourcesScreenProps {
    navigation: ResourcesScreenNavigationProp;
}

type ResourcesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Resources'>;

type RootStackParamList = {
    Resources: undefined;
    Onboarding: undefined;
    Support: undefined;
    Community: undefined;
};

const articles: Article[] = [
    {
        id: '1',
        title: 'Managing Toddler Tantrums',
        excerpt: 'Learn effective strategies to handle tantrums with patience and understanding',
        category: 'Behavior',
        readingTime: 5
    },
    {
        id: '2',
        title: 'Nutrition Guide for 1-2 Year Olds',
        excerpt: 'Essential nutrients and meal ideas for your growing toddler',
        category: 'Nutrition',
        readingTime: 8
    },
    {
        id: '3',
        title: 'Sleep Training Methods',
        excerpt: 'Compare different approaches to help your child sleep through the night',
        category: 'Sleep',
        readingTime: 10
    }
];

const ResourcesScreen = ({ navigation }: ResourcesScreenProps) => {
    const { colors } = useTheme();
    const headerHeight = useHeaderHeight();

    return (
        <ScrollView
            flex={1}
            backgroundColor={colors.background}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View mb="$1" mx="$4" mt='$2'>
                <XStack ai="center" space="$4" mt="$7" mb="$5">
                    {/* Back Button */}
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} 
                        color={colors.text} />}
                    />

                    {/* Center Title (absolute center) */}
                    <YStack
                        ai="center"
                        pointerEvents="none"
                    >
                        <Text color={colors.text} fontWeight="700" fontSize="$7" ta="center">
                            Parenting Resources
                        </Text>
                    </YStack>
                </XStack>
            </View>

            {articles.map((item) => (
                <Card key={item.id} mx={16} mb={16} p={20} borderRadius={12} backgroundColor={colors.card}>
                    <YStack>
                        <Text fontSize={18} fontWeight="600" mb={8} lh={24} 
                        color={colors.text}>
                            {item.title}
                        </Text>
                        <Text fontSize={15} mb={12} lh={22} opacity={0.8} 
                        color={colors.text}>
                            {item.excerpt}
                        </Text>
                        <XStack jc="space-between" ai="center">
                            <Stack
                                borderRadius={6}
                                px={8}
                                py={4}
                                backgroundColor={colors.primary}
                            >
                                <Text fontSize={13} fontWeight="500" color={colors.onPrimary}>
                                    {item.category}
                                </Text>
                            </Stack>
                            <Text fontSize={13} color={colors.primary}>
                                {item.readingTime} min read
                            </Text>
                        </XStack>
                    </YStack>
                </Card>
            ))}

            <YStack
                mx={16}
                mt={8}
                mb={125}
                p={20}
                borderRadius={14}
                ai="center"
                backgroundColor={colors.card}
            >
                <Text fontSize={18} fontWeight="600" mb={8} ta="center" color={colors.text}>
                    Join Our Parenting Community
                </Text>
                <Text fontSize={14} ta="center" mb={16} lh={20} opacity={0.8} color={colors.secondary}>
                    Connect with thousands of parents sharing tips and support
                </Text>
                <Button
                    fd="row"
                    ai="center"
                    py={12}
                    px={24}
                    borderRadius={25}
                    backgroundColor={colors.primary}
                    onPress={() => navigation.navigate("Community")}
                >
                    <Text color={colors.onPrimary} fontWeight="600" mr={8}>
                        Visit Community
                    </Text>
                    <FontAwesome name="group" size={16} color={colors.onPrimary} />
                </Button>
            </YStack>
        </ScrollView>
    );
};

export default ResourcesScreen;