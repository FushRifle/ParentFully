import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';

interface GoalCardProps {
    goal: {
        id: string;
        title: string;
        progress: number;
        dueDate: string;
        parentResponsibilities?: string[];
        childResponsibilities?: string[];
    };
    onPress: () => void;
    style?: any;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onPress, style }) => {
    const { colors, fonts } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: colors.surface },
                style
            ]}
            onPress={onPress}
        >
            <View style={styles.cardHeader}>
                <Text style={[fonts.bodyBold as TextStyle, { color: colors.text }]}>{goal.title}</Text>
                <View style={styles.dueDate}>
                    <MaterialIcons name="calendar-today" size={16} color={colors.textSecondary} />
                    <Text style={[fonts.small as TextStyle, { color: colors.textSecondary, marginLeft: 4 }]}>
                        {goal.dueDate}
                    </Text>
                </View>
            </View>

            <ProgressBar progress={goal.progress} />

            <View style={styles.responsibilities}>
                {goal.parentResponsibilities && goal.parentResponsibilities.length > 0 && (
                    <View style={styles.responsibilityGroup}>
                        <Text style={[fonts.bodyBold as TextStyle, { color: colors.textSecondary }]}>Parents:</Text>
                        {goal.parentResponsibilities.map((resp, index) => (
                            <View key={index} style={styles.responsibilityItem}>
                                <MaterialIcons name="check-circle" size={14} color={colors.primary} />
                                <Text style={[fonts.small as TextStyle, { color: colors.text, marginLeft: 4 }]}>
                                    {resp}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {goal.childResponsibilities && goal.childResponsibilities.length > 0 && (
                    <View style={styles.responsibilityGroup}>
                        <Text style={[fonts.bodyBold as TextStyle, { color: colors.textSecondary }]}>Child:</Text>
                        {goal.childResponsibilities.map((resp, index) => (
                            <View key={index} style={styles.responsibilityItem}>
                                <MaterialIcons name="check-circle" size={14} color={colors.primary} />
                                <Text style={[fonts.small as TextStyle, { color: colors.text as string, marginLeft: 4 }]}>
                                    {resp}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dueDate: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    responsibilities: {
        marginTop: 12,
    },
    responsibilityGroup: {
        marginTop: 8,
    },
    responsibilityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
});

export default GoalCard;