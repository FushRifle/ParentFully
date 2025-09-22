
import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme } from '@/styles/ThemeContext';
import { RootStackParamList } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

type PlanScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ParentingPlan'>;

interface PlanScreenProps {
    navigation: PlanScreenNavigationProp;
}

const PlanScreen: React.FC<PlanScreenProps> = ({ navigation }) => {
    const { colors, fonts } = useTheme();

    // Sample data - replace with your actual data
    const planCategories = [
        {
            id: '1',
            title: 'Academics',
            progress: 65,
            lastUpdated: '2 days ago',
            description: 'Educational development and learning milestones',
            goals: ['Improve math skills', 'Read 20 minutes daily']
        },
        {
            id: '2',
            title: 'Health & Wellness',
            progress: 80,
            lastUpdated: '1 week ago',
            description: 'Physical health, nutrition, and exercise',
            goals: ['Establish bedtime routine', 'Eat 5 servings of vegetables']
        },
        {
            id: '3',
            title: 'Emotional Development',
            progress: 45,
            lastUpdated: '3 days ago',
            description: 'Emotional intelligence and self-regulation',
            goals: ['Practice naming emotions', 'Deep breathing exercises']
        },
        {
            id: '4',
            title: 'Social Skills',
            progress: 60,
            lastUpdated: '5 days ago',
            description: 'Interpersonal relationships and communication',
            goals: ['Playdate weekly', 'Practice sharing']
        }
    ];

    return (

        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[fonts.body as TextStyle, { color: colors.textSecondary }]}>
                    Strategic roadmap for your child's development
                </Text>
            </View>

            {planCategories.map(category => (
                <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { backgroundColor: colors.surface }]}
                >
                    <View style={styles.categoryHeader}>
                        <Text style={[fonts.subheader as TextStyle, { color: colors.text }]}>{category.title}</Text>
                        <Text style={[fonts.small as TextStyle, { color: colors.textSecondary }]}>
                            Updated {category.lastUpdated}
                        </Text>
                    </View>

                    <Text style={[fonts.body as TextStyle, { color: colors.text, marginVertical: 8 }]}>
                        {category.description}
                    </Text>

                    <ProgressBar progress={category.progress} />

                    <View style={styles.goalsPreview}>
                        <MaterialIcons name="emoji-events" size={16} color={colors.primary} />
                        <Text style={[fonts.small as TextStyle, { color: colors.text, marginLeft: 4 }]}>
                            {category.goals.length} active goals
                        </Text>
                    </View>
                </TouchableOpacity>
            ))}
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddCategory' as never)}
            >
                <Text style={[fonts.bodyBold as TextStyle, { color: colors.onPrimary }]}>Add New Category</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    categoryCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalsPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    addButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 45
    },
});

export default PlanScreen;