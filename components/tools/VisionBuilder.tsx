import { Button } from '@/components/ui/Buttons';
import Card from '@/components/ui/Card';
import { useParentingVision } from '@/hooks/tools/useParentingVision';
import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const VisionBuilder = () => {
    const { colors } = useTheme();
    const {
        isCoParenting,
        setIsCoParenting,
        alignmentScore,
        setAlignmentScore,
        parentingValues,
        newValue,
        setNewValue,
        parentingGoals,
        newGoal,
        setNewGoal,
        addParentingValue,
        addParentingGoal,
        removeParentingValue
    } = useParentingVision();

    return (
        <View>
            <Card style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Core Parenting Values</Text>
                <View style={styles.valuesContainer}>
                    {parentingValues.map(item => (
                        <View key={item.id} style={[styles.valueItem, { backgroundColor: colors.primary }]}>
                            <Text style={{ color: colors.onPrimary }}>{item.value}</Text>
                            {item.isCustom && (
                                <TouchableOpacity onPress={() => removeParentingValue(item.id)}>
                                    <MaterialIcons name="close" size={20} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>
                <View style={styles.addValueContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Add your own value"
                        value={newValue}
                        onChangeText={setNewValue}
                    />
                    <Button
                        title="Add"
                        onPress={addParentingValue}
                        style={styles.smallButton}
                    />
                </View>
            </Card>

            <Card style={styles.sectionCard}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Long-term Parenting Goals</Text>
                <View style={styles.coParentingToggle}>
                    <Text style={{ color: colors.text }}>Co-parenting?</Text>
                    <Switch
                        value={isCoParenting}
                        onValueChange={setIsCoParenting}
                        thumbColor={colors.primary}
                        trackColor={{ false: '#767577', true: colors.primaryLight }}
                    />
                </View>

                {isCoParenting && (
                    <View style={styles.alignmentContainer}>
                        <Text style={{ color: colors.text }}>Alignment Score: {alignmentScore}%</Text>
                        <View style={styles.sliderContainer}>
                            <Text style={{ color: colors.text }}>0%</Text>
                            <View style={styles.sliderTrack}>
                                <View
                                    style={[
                                        styles.sliderProgress,
                                        {
                                            width: `${alignmentScore}%`,
                                            backgroundColor: colors.primary
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={{ color: colors.text }}>100%</Text>
                        </View>
                    </View>
                )}

                {parentingGoals.map(goal => (
                    <View key={goal.id} style={styles.goalItem}>
                        <Text style={{ color: colors.text }}>{goal.description}</Text>
                        {goal.isShared && (
                            <Text style={{ color: colors.primary }}>
                                {goal.alignmentScore}% aligned
                            </Text>
                        )}
                    </View>
                ))}

                <View style={styles.addGoalContainer}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                        placeholder="Add a parenting goal"
                        value={newGoal}
                        onChangeText={setNewGoal}
                    />
                    <Button
                        title="Add"
                        onPress={addParentingGoal}
                        style={styles.smallButton}
                    />
                </View>
            </Card>
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

export default VisionBuilder;