import { useGoalStore } from '@/store/useGoalStore';
import { useTheme } from '@/styles/ThemeContext';
import { fonts } from '@/styles/theme';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export const GoalSummaryScreen = () => {
    const { colors } = useTheme();
    const { selectedGoals } = useGoalStore();

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <FlatList
                data={selectedGoals}
                renderItem={({ item }) => (
                    <View style={[styles.goalCard, { backgroundColor: colors.surface }]}>
                        <Text style={[fonts.subtitle, { color: colors.text }]}>
                            {item.area}
                        </Text>
                        <Text style={[fonts.body, { color: colors.text }]}>
                            {item.goal}
                        </Text>
                        <Text style={[fonts.caption, { color: colors.textSecondary }]}>
                            Status: {item.status} | Expires: {item.expiryDate}
                        </Text>
                    </View>
                )}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <Text style={[fonts.body, { color: colors.text, textAlign: 'center' }]}>
                        No goals saved yet
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    goalCard: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
});