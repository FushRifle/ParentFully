import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../Themed';

interface MilestoneStatsCardProps {
    projectId?: string;
    onPress?: () => void;
}

const MilestoneStatsCard: React.FC<MilestoneStatsCardProps> = ({ projectId, onPress }) => {
    const { colors } = useTheme();
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        active: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMilestoneStats = async () => {
            try {
                setLoading(true);

                // Get the current user
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    throw new Error('User not authenticated');
                }

                const currentUserId = user.id;

                // Base query
                let query = supabase
                    .from('milestones')
                    .select('id, completed', { count: 'exact' });

                // Apply filters
                if (projectId) query = query.eq('project_id', projectId);
                query = query.eq('user_id', currentUserId);  // <- Use logged-in user

                const { data, count, error: supabaseError } = await query;

                if (supabaseError) throw supabaseError;

                const completed = data?.filter(m => m.completed).length || 0;
                const active = (count || 0) - completed;

                setStats({
                    total: count || 0,
                    completed,
                    active
                });
            } catch (err) {
                console.error('Error fetching milestone stats:', err);
                setError('Failed to load milestone stats');
            } finally {
                setLoading(false);
            }
        };

        fetchMilestoneStats();
    }, [projectId]);


    const CardContent = () => (
        <View style={styles.content}>
            <View style={styles.statItem}>
                <Icon name="calculate" size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Total</Text>
            </View>

            <View style={styles.statItem}>
                <Icon name="bolt" size={24} color={colors.primary} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.active}</Text>
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Active</Text>
            </View>

            <View style={styles.statItem}>
                <Icon name="check-circle" size={24} color={colors.success} />
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.completed}</Text>
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Completed</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.card, styles.errorCard, { backgroundColor: colors.surface }]}>
                <Icon name="alert-circle" size={20} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            </View>
        );
    }

    return (
        <Card
            style={[styles.card, { backgroundColor: colors.cardBackground }]}
        >
            <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={0.9}
            >
                <Text style={[styles.title, { color: colors.text }]}>Milestone Progress: </Text>
                <CardContent />
            </TouchableOpacity>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    errorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        marginVertical: 4,
    },
    statLabel: {
        fontSize: 12,
    },
    errorText: {
        fontSize: 14,
    },
});

export default MilestoneStatsCard;