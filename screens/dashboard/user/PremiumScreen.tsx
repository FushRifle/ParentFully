import { useTheme } from '@/styles/ThemeContext';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { MessageCircle, Users, Users2, Wallet } from '@tamagui/lucide-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { Button, Card, H4, Text, XStack, YStack } from 'tamagui';

export default function PremiumScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();


    const benefits = [
        {
            icon: <Wallet size={24} color="white" />,
            title: 'Budget',
            description: 'View a log of action and update across family account',
            bgColor: '#00D4AA',
        },
        {
            icon: <Users2 size={24} color="white" />,
            title: 'Family',
            description: 'Invite family members, third party and mediators',
            bgColor: '#00D4AA',
        },
        {
            icon: <Users size={24} color="white" />,
            title: 'Community',
            description: 'Connect, share and learn from other parents',
            bgColor: '#4A90FF',
        },
        {
            icon: <MessageCircle size={24} color="white" />,
            title: 'Chat',
            description: 'Send and recieve messages instantly with your co-parent',
            bgColor: '#00D4AA',
            badge: '5',
        },
    ];

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#FFF4E8', }}>
            <YStack padding="$4" space="$4">
                {/* Header */}
                <XStack space="$4" ai="center" mt='$7' mb='$3'>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                    </TouchableOpacity>
                    <Text fontSize="$6" fontWeight="700" color={colors.text as any}>
                        Back
                    </Text>
                </XStack>

                <YStack alignItems="center" space="$2" marginBottom="$4" mt='$7'>
                    <XStack alignItems="center" space="$2">
                        <Text fontSize="$6" fontWeight="bold" color={colors.text}>
                            Parentfully{' '}
                        </Text>
                        <Text
                            fontSize="$6"
                            fontWeight="bold"
                            color={colors.primary || '#FFD700'}
                            backgroundColor="#FFF3C1"
                            paddingHorizontal="$2"
                            borderRadius="$2"
                        >
                            Premium 👑
                        </Text>
                    </XStack>
                    <Text fontSize="$5" color="$gray10" textAlign="center" marginTop="$2">
                        From managing to <Text color="#F76C2B">thriving</Text>, unlock Premium parenting tools.
                    </Text>
                </YStack>

                {/* Plans */}
                <YStack space="$3">
                    {/* Monthly Plan */}
                    <Card padding="$4" borderRadius="$4" backgroundColor="white">
                        <YStack space="$2">
                            <Text fontSize="$5" color="$gray10">
                                Monthly
                            </Text>
                            <H4 fontWeight="bold" color="$gray12">
                                $9.99 /month
                            </H4>
                            <Button
                                backgroundColor="white"
                                borderWidth={1}
                                borderColor={colors.border as any}
                                height="$5"
                                borderRadius="$3"
                                pressStyle={{ backgroundColor: '$gray3' }}
                            >
                                Select Plan
                            </Button>
                        </YStack>
                    </Card>

                    <XStack jc='flex-end' ai='flex-end'>
                        <Text
                            fontSize="$3"
                            color="$green11"
                            backgroundColor="#D0F0C6"
                            alignSelf="flex-start"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                        >
                            Save 50%
                        </Text>
                    </XStack>

                    {/* Yearly Plan */}
                    <Card padding="$4" borderRadius="$4" backgroundColor="#DFF5E0" borderWidth={1} borderColor="#0C7B2D">
                        <YStack space="$2">
                            <Text fontSize="$5" color="$green9">
                                Yearly
                            </Text>
                            <H4 fontSize="$8" fontWeight="bold" color="$green11">
                                $59.99 /year
                            </H4>
                            <Button
                                backgroundColor="$green9"
                                color="white"
                                height="$5"
                                borderRadius="$3"
                                pressStyle={{ opacity: 0.8 }}
                            >
                                Select Plan
                            </Button>
                        </YStack>
                    </Card>
                </YStack>

                {/* Subscribe Button */}
                <Button
                    backgroundColor="#FF8C00"
                    color="white"
                    fontWeight="bold"
                    height="$5"
                    borderRadius="$3"
                    marginTop="$4"
                    pressStyle={{ opacity: 0.8 }}
                >
                    Subscribe
                </Button>

                {/* Benefits List */}
                <YStack space="$3" marginTop="$4" mb='$8'>
                    <Text fontSize="$6" fontWeight="bold" color="$gray12">
                        Exclusive Benefits
                    </Text>

                    {benefits.map((item, index) => (
                        <Card
                            key={index}
                            padding="$3"
                            borderRadius="$3"
                            backgroundColor="white"
                            marginBottom="$2"
                        >
                            <XStack alignItems="center" space="$3">
                                <YStack
                                    width={40}
                                    height={40}
                                    borderRadius={10}
                                    backgroundColor={item.bgColor}
                                    justifyContent="center"
                                    alignItems="center"
                                    position="relative"
                                >
                                    {item.icon}
                                    {item.badge && (
                                        <YStack
                                            position="absolute"
                                            top={-4}
                                            right={-4}
                                            width={16}
                                            height={16}
                                            borderRadius={8}
                                            backgroundColor="orange"
                                            justifyContent="center"
                                            alignItems="center"
                                        >
                                            <Text fontSize="$2" color="white" fontWeight="bold">
                                                {item.badge}
                                            </Text>
                                        </YStack>
                                    )}
                                </YStack>
                                <YStack>
                                    <Text fontWeight="bold" fontSize="$4" color="$gray12">
                                        {item.title}
                                    </Text>
                                    <Text fontSize="$3" color="$gray10">
                                        {item.description}
                                    </Text>
                                </YStack>
                            </XStack>
                        </Card>
                    ))}
                </YStack>
            </YStack>
        </ScrollView>
    );
}
