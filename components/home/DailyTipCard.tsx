import { Text } from '@/context/GlobalText';
import { useTheme } from '@/styles/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Card, View, YStack } from 'tamagui';

const tipsList = [
    'Encourage your child to read for 15 minutes daily.',
    'Plan a family walk after dinner to bond and get fresh air.',
    'Praise effort, not just results—it builds resilience.',
    'Cook a meal together to teach life skills and teamwork.',
    'Set aside 10 minutes of uninterrupted playtime with your child.',
    'Listen actively to your child’s concerns without interrupting.',
    'Establish a consistent bedtime routine for better sleep.',
    'Spend a few minutes each day asking about their favorite part of the day.',
    'Limit screen time before bed to help them relax.',
    'Practice gratitude together—share one thing you’re thankful for each day.',
];

const DailyTipCard: React.FC = () => {
    const { colors, isDark } = useTheme();

    const [tipPrimary, tipSecondary] = useMemo(() => {
        const dayIndex = new Date().getDate() % tipsList.length;
        const nextIndex = (dayIndex + 1) % tipsList.length;
        return [tipsList[dayIndex], tipsList[nextIndex]];
    }, []);

    const renderCard = (tip: string, bgColor: string) => (
        <Card
            key={tip}
            width="100%"
            borderRadius="$4"
            padding="$3"
            backgroundColor={bgColor}
        >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                    style={{
                        width: 40,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 12,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#FFFFFF20' : '#FFFFFF20',
                    }}
                >
                    <MaterialCommunityIcons
                        name="lightbulb-on-outline"
                        size={25}
                        color={colors.onPrimary as any}
                    />
                </View>

                <Text
                    textAlign="left"
                    lineHeight={20}
                    color={colors.onPrimary}
                    flex={1}
                >
                    {tip}
                </Text>
            </View>
        </Card>
    );

    return (
        <YStack space="$3" mb="$2">
            {renderCard(tipPrimary, colors.primary as any)}
            {renderCard(tipSecondary, colors.secondary as any)}
        </YStack>
    );
};

export default DailyTipCard;
