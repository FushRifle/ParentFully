import { fonts, spacing } from '@/styles/theme';
import { useTheme } from '@/styles/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from './ProgressBar';

interface PlanCategory {
    key: string;
    label: string;
    icon: string;
    screen: string;
    color: string;
}

interface PlanData {
    [key: string]: {
        progress: number;
        lastUpdated: string;
    };
}

interface ParentingPlanSectionProps {
    plan: PlanData;
}

const ParentingPlanSection = ({ plan }: ParentingPlanSectionProps) => {
    const categories: PlanCategory[] = useMemo(
        () => [
            { key: 'learning', label: 'Learning', icon: '📚', screen: 'Learning', color: '#E3F2FD' },
            { key: 'messaging', label: 'Messaging', icon: '💬', screen: 'Messaging', color: '#E8F5E9' },
            { key: 'support', label: 'Support', icon: '🆘', screen: 'Support', color: '#FFF3E0' },
            { key: 'budgeting', label: 'Budgeting', icon: '💰', screen: 'Budgeting', color: '#F3E5F5' },
            { key: 'documents', label: 'Documents', icon: '📄', screen: 'Documents', color: '#E0F7FA' },
            { key: 'events', label: 'Events', icon: '📅', screen: 'Events', color: '#F1F8E9' },
            { key: 'goals', label: 'Goals', icon: '🎯', screen: 'Goals', color: '#FFECB3' },
            { key: 'activities', label: 'Activities', icon: '🏃', screen: 'Activities', color: '#FFCCBC' },
        ],
        []
    );

    const { colors } = useTheme();
    const navigation = useNavigation();

    const handleCategoryPress = (screen: string) => {
        navigation.navigate(screen as never);
    };

    return (
        <View style={styles.container}>
            <Text
                style={{
                    ...fonts.title,
                    color: colors.text,
                    marginBottom: spacing.medium,
                }}
            >
                Strategic Roadmap for Holistic Development
            </Text>

            <View style={styles.categoriesContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.categoryCard,
                            {
                                backgroundColor: '#fff',
                                borderLeftWidth: 4,
                                borderLeftColor: getBorderColor(category.key),
                            },
                        ]}
                        onPress={() => handleCategoryPress(category.screen)}
                        activeOpacity={0.7}
                        accessible={true}
                        accessibilityLabel={`Go to ${category.label}`}
                    >
                        <Text style={[styles.categoryIcon, { color: colors.primary }]}>{category.icon}</Text>
                        <Text style={[styles.categoryLabel, { color: colors.primary }]}>{category.label}</Text>
                        <ProgressBar progress={plan[category.key]?.progress ?? 0} />
                        <Text style={[styles.updateText, { color: colors.primary }]}>
                            Updated {plan[category.key]?.lastUpdated ?? 'recently'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const getBorderColor = (key: string) => {
    const colors: Record<string, string> = {
        learning: '#2196F3',
        messaging: '#4CAF50',
        support: '#FF9800',
        budgeting: '#9C27B0',
        documents: '#00BCD4',
        events: '#8BC34A',
        goals: '#FFC107',
        activities: '#FF5722',
    };
    return colors[key] || '#2196F3';
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.large,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.small,
    },
    categoryCard: {
        width: '48%',
        borderRadius: 12,
        padding: spacing.medium,
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: spacing.small,
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: spacing.small,
    },
    categoryLabel: {
        ...fonts.bodyBold,
        marginBottom: spacing.small,
        textAlign: 'center',
    },
    updateText: {
        ...fonts.small,
        marginTop: spacing.small,
    },
});

export default ParentingPlanSection;
