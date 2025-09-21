import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Milestone } from '@/types';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface MilestoneTimelineProps {
    projectId?: string;
    milestones: Milestone[];
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({ projectId }) => {
    const { colors } = useTheme();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                setLoading(true);

                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError) throw userError;
                if (!user) throw new Error('User not authenticated');

                let query = supabase
                    .from('milestones')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (projectId) {
                    query = query.eq('project_id', projectId);
                }

                const { data, error: supabaseError } = await query;

                if (supabaseError) throw supabaseError;

                setMilestones(data || []);
            } catch (err) {
                console.error('Error fetching milestones:', err);
                setError('Failed to load milestones');
            } finally {
                setLoading(false);
            }
        };

        fetchMilestones();
    }, [projectId]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
                <Icon name="warning-outline" size={24} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            </View>
        );
    }

    if (milestones.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
                <Icon name="alert-circle-outline" size={24} color={colors.lightText} />
                <Text style={[styles.emptyText, { color: colors.lightText }]}>
                    No milestones found
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {milestones.map((milestone, index) => (
                <View key={milestone.id} style={styles.milestoneItem}>
                    <View style={styles.timeline}>
                        {index !== 0 && (
                            <View style={[styles.timelineLine, { backgroundColor: colors.lightText }]} />
                        )}
                        <View style={[
                            styles.iconContainer,
                            {
                                backgroundColor: milestone.completed
                                    ? colors.success
                                    : `${String(colors.lightText)}30`
                            }
                        ]}>
                            <Icon
                                name={milestone.completed ? "checkmark" : "time-outline"}
                                size={16}
                                color={milestone.completed ? 'white' : colors.lightText}
                            />
                        </View>
                        {index !== milestones.length - 1 && (
                            <View style={[styles.timelineLine, { backgroundColor: colors.lightText }]} />
                        )}
                    </View>
                    <View style={styles.milestoneContent}>
                        <Text style={[styles.milestoneTitle, { color: colors.text }]}>
                            {milestone.title}
                        </Text>
                        {milestone.completed && milestone.updated_at && (
                            <Text style={[styles.milestoneDate, { color: colors.lightText }]}>
                                Completed on {new Date(milestone.updated_at).toLocaleDateString()}
                            </Text>
                        )}
                        {typeof milestone.due_date === 'string' && !milestone.completed && (
                            <Text style={[styles.milestoneDate, { color: colors.lightText }]}>
                                Due: {new Date(milestone.due_date).toLocaleDateString()}
                            </Text>
                        )}
                    </View>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 8,
        paddingTop: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 10,
        textAlign: 'center',
    },
    emptyText: {
        marginTop: 10,
        textAlign: 'center',
    },
    milestoneItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    timeline: {
        alignItems: 'center',
        width: 24,
        marginRight: 16,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        opacity: 0.3,
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 4,
    },
    milestoneContent: {
        flex: 1,
        paddingBottom: 16,
    },
    milestoneTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 4,
    },
    milestoneDate: {
        fontSize: 12,
    },
});

export default MilestoneTimeline;
