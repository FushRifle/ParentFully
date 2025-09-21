import GoalCard from '@/components/home/GoalCard';
import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme } from '@/styles/ThemeContext';
import { RootStackParamList } from '@/types';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

type CategoryDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryDetails'>;
type CategoryDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CategoryDetails'>;

interface CategoryDetailsScreenProps {
    navigation: CategoryDetailsScreenNavigationProp;
    route: CategoryDetailsScreenRouteProp;
}

const CategoryDetailsScreen: React.FC<CategoryDetailsScreenProps> = ({ navigation, route }) => {
    const { colors, fonts } = useTheme();
    const { categoryId } = route.params;

    // Sample data - replace with your actual data fetching
    const categoryDetails = {
        id: '1',
        title: 'Academics',
        progress: 65,
        lastUpdated: '2 days ago',
        description: 'Educational development and learning milestones',
        goals: [
            {
                id: '1',
                title: 'Improve math skills',
                progress: 60,
                dueDate: '2023-12-15',
                parentResponsibilities: ['Mom: Help with homework', 'Dad: Math games'],
                childResponsibilities: ['Complete worksheets']
            },
            {
                id: '2',
                title: 'Read daily',
                progress: 75,
                dueDate: '2023-11-30',
                parentResponsibilities: ['Read bedtime stories'],
                childResponsibilities: ['Read 20 minutes']
            }
        ]
    };

    const handleGoalPress = (goal: any) => {
        navigation.navigate('GoalDetails', { goal });
    };

    const handleAddGoal = () => {
        navigation.navigate('AddGoal' as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={[fonts.header, { color: colors.text }]}>{categoryDetails.title}</Text>
                    <Text style={[fonts.body as TextStyle, { color: colors.textSecondary }]}>
                        {categoryDetails.description}
                    </Text>
                </View>

                <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
                    <View style={styles.progressHeader}>
                        <Text style={[fonts.subheader as TextStyle, { color: colors.text }]}>Overall Progress</Text>
                        <Text style={[fonts.body as TextStyle, { color: colors.textSecondary }]}>
                            Updated {categoryDetails.lastUpdated}
                        </Text>
                    </View>
                    <ProgressBar progress={categoryDetails.progress} />
                    <Text style={[fonts.small as TextStyle, { color: colors.textSecondary, marginTop: 4 }]}>
                        {categoryDetails.progress}% complete
                    </Text>
                </View>

                <View style={styles.goalsHeader}>
                    <Text style={[fonts.subheader as TextStyle, { color: colors.text }]}>Active Goals</Text>
                    <TouchableOpacity onPress={handleAddGoal}>
                        <Text style={[fonts.body as TextStyle, { color: colors.primary }]}>Add Goal</Text>
                    </TouchableOpacity>
                </View>

                {categoryDetails.goals.map(goal => (
                    <GoalCard
                        key={goal.id}
                        goal={goal}
                        onPress={() => handleGoalPress(goal)}
                        style={{ marginBottom: 16 }}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    header: {
        marginBottom: 24,
    },
    progressSection: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
});

export default CategoryDetailsScreen;