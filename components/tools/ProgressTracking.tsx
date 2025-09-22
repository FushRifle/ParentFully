import Card from '@/components/ui/Card';
import { useChildGoals } from '@/hooks/tools/useChildGoals';
import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

const ProgressTracking = () => {
    const { colors } = useTheme();
    const { childGoals, updateGoalNotes } = useChildGoals();

    return (
        <View>
            {childGoals.map(goal => (
                <Card key={goal.id} style={styles.progressCard}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                        <Text style={{ color: colors.text }}>{goal.progress}% complete</Text>
                    </View>

                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${goal.progress}%`,
                                        backgroundColor: colors.primary
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <Text style={[styles.subsectionTitle, { color: colors.text }]}>Notes</Text>
                    <TextInput
                        style={[
                            styles.notesInput,
                            {
                                backgroundColor: colors.inputBackground,
                                color: colors.text,
                                borderColor: colors.border as import('react-native').ColorValue
                            }
                        ]}
                        placeholder="Add your observations or reflections..."
                        value={goal.notes}
                        onChangeText={(text) => updateGoalNotes(goal.id, text)}
                        multiline
                    />
                </Card>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    backButton: {
        marginBottom: 16,
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    sectionCard: {
        marginBottom: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    subsectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 16,
    },
    valuesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    valueItem: {
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    addValueContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    smallButton: {
        paddingHorizontal: 12,
    },
    coParentingToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    alignmentContainer: {
        marginBottom: 16,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    sliderTrack: {
        flex: 1,
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
    },
    sliderProgress: {
        height: '100%',
    },
    goalItem: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    addGoalContainer: {
        marginTop: 16,
        flexDirection: 'row',
        gap: 8,
    },
    childGoalCard: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    goalTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    milestonesContainer: {
        marginBottom: 12,
    },
    milestoneItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    milestoneText: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
    },
    addGoalForm: {
        marginTop: 16,
    },
    typeSelector: {
        marginVertical: 12,
    },
    typeOptions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    typeOption: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    milestoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    milestoneInput: {
        flex: 1,
    },
    createButton: {
        marginTop: 16,
    },
    progressCard: {
        padding: 16,
        marginBottom: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    progressBarContainer: {
        marginBottom: 16,
    },
    notesInput: {
        height: 100,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        textAlignVertical: 'top',
    },
});

export default ProgressTracking;