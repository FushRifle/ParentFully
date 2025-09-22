import { Button } from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import { ChildGoal, useChildGoals } from '@/hooks/tools/useChildGoals';
import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const GoalSetting = () => {
    const { colors } = useTheme();
    const {
        childGoals,
        newGoalTitle,
        setNewGoalTitle,
        newGoalType,
        setNewGoalType,
        newMilestones,
        addChildGoal,
        toggleMilestone,
        addMilestoneField,
        updateMilestoneField,
        removeMilestoneField
    } = useChildGoals();

    return (
        <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Child-Specific Goals</Text>

            {childGoals.map(goal => (
                <ChildGoalCard
                    key={goal.id}
                    goal={goal}
                    onToggleMilestone={toggleMilestone}
                    colors={colors}
                />
            ))}

            <View style={styles.addGoalForm}>
                <Text style={[styles.subsectionTitle, { color: colors.text }]}>Add New Goal</Text>

                <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text }]}
                    placeholder="Goal title"
                    value={newGoalTitle}
                    onChangeText={setNewGoalTitle}
                />

                <View style={styles.typeSelector}>
                    <Text style={{ color: colors.text }}>Type:</Text>
                    <View style={styles.typeOptions}>
                        {(['behavioral', 'learning', 'emotional'] as const).map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeOption,
                                    newGoalType === type && { backgroundColor: colors.primaryLight }
                                ]}
                                onPress={() => setNewGoalType(type)}
                            >
                                <Text style={{ color: colors.text }}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <Text style={[styles.subsectionTitle, { color: colors.text }]}>Milestones (up to 5)</Text>

                {newMilestones.map((milestone, index) => (
                    <View key={index} style={styles.milestoneInputContainer}>
                        <TextInput
                            style={[
                                styles.input,
                                styles.milestoneInput,
                                { backgroundColor: colors.inputBackground, color: colors.text }
                            ]}
                            placeholder={`Milestone ${index + 1}`}
                            value={milestone}
                            onChangeText={(text) => updateMilestoneField(text, index)}
                        />
                        {index > 0 && (
                            <TouchableOpacity onPress={() => removeMilestoneField(index)}>
                                <MaterialIcons name="remove-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                <Button
                    title="Create Goal"
                    onPress={addChildGoal}
                    style={styles.createButton}
                />
            </View>
        </Card>
    );
};

const ChildGoalCard = ({
    goal,
    onToggleMilestone,
    colors
}: {
    goal: ChildGoal;
    onToggleMilestone: (goalId: string, milestoneId: string) => void;
    colors: any;
}) => {
    return (
        <View style={[styles.childGoalCard, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.goalHeader}>
                <Text style={[styles.goalTitle, { color: colors.text }]}>{goal.title}</Text>
                <View style={[
                    styles.goalTypeBadge,
                    {
                        backgroundColor:
                            goal.type === 'behavioral' ? 'white' :
                                goal.type === 'learning' ? '#BAE1FF' :
                                    '#FFC9BA'
                    }
                ]}>
                    <Text style={{
                        color:
                            goal.type === 'behavioral' ? '#E6B800' :
                                goal.type === 'learning' ? '#0066CC' :
                                    '#CC3300'
                    }}>
                        {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                    </Text>
                </View>
            </View>

            <View style={styles.milestonesContainer}>
                {goal.milestones.map(milestone => (
                    <View key={milestone.id} style={styles.milestoneItem}>
                        <Checkbox
                            value={milestone.completed}
                            onValueChange={() => onToggleMilestone(goal.id, milestone.id)}
                            color={milestone.completed ? colors.primary : undefined}
                        />
                        <Text style={[
                            styles.milestoneText,
                            {
                                color: colors.text,
                                textDecorationLine: milestone.completed ? 'line-through' : 'none'
                            }
                        ]}>
                            {milestone.description}
                        </Text>
                    </View>
                ))}
            </View>

            <View style={styles.progressContainer}>
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
                <Text style={{ color: colors.text }}>{goal.progress}% complete</Text>
            </View>
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

export default GoalSetting;