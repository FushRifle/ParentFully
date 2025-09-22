import RewardCard from '@/components/rewards/RewardCard';
import RewardModal from '@/components/rewards/RewardModal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type { Reward } from '@/types/rewards';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Platform, RefreshControl, ScrollView,
    StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type FilterType = 'all' | 'claimed' | 'unclaimed';

const RewardScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [totalPoints, setTotalPoints] = useState(0);
    const [availablePoints, setAvailablePoints] = useState(0);
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [hasUnseenRewards, setHasUnseenRewards] = useState(false);

    // Fetch rewards from Supabase
    const fetchRewards = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('rewards')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setRewards(data || []);
            applyFilter(activeFilter, data || []);

            // Calculate points
            const points = data?.reduce((sum, reward) => sum + (reward.points_value || 0), 0) || 0;
            const unclaimedPoints = data?.reduce((sum, reward) =>
                sum + (!reward.claimed ? (reward.points_value || 0) : 0), 0) || 0;

            setTotalPoints(points);
            setAvailablePoints(unclaimedPoints);

            // Check for unseen rewards
            const unseen = data?.some(reward => !reward.seen) || false;
            setHasUnseenRewards(unseen);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply filter to rewards
    const applyFilter = (filter: FilterType, rewardsList: Reward[] = rewards) => {
        let filtered: Reward[] = [];

        switch (filter) {
            case 'claimed':
                filtered = rewardsList.filter(reward => reward.claimed);
                break;
            case 'unclaimed':
                filtered = rewardsList.filter(reward => !reward.claimed);
                break;
            default:
                filtered = [...rewardsList];
        }

        setFilteredRewards(filtered);
    };

    // Handle filter change
    const handleFilterChange = (filter: FilterType) => {
        setActiveFilter(filter);
        applyFilter(filter);
    };

    // Mark reward as seen
    const markRewardAsSeen = async (rewardId: string) => {
        try {
            const { error } = await supabase
                .from('rewards')
                .update({ seen: true })
                .eq('id', rewardId);

            if (error) throw error;

            setRewards(prev => prev.map(r =>
                r.id === rewardId ? { ...r, seen: true } : r
            ));

            // Update filtered rewards if needed
            applyFilter(activeFilter);

            // Check if there are still unseen rewards
            const unseen = rewards.some(r => !r.seen && r.id !== rewardId);
            setHasUnseenRewards(unseen);
        } catch (error) {
            console.error('Error marking reward as seen:', error);
        }
    };

    // Claim a reward
    const claimReward = async (rewardId: string) => {
        try {
            const { error } = await supabase
                .from('rewards')
                .update({ claimed: true })
                .eq('id', rewardId);

            if (error) throw error;

            setRewards(prev => prev.map(r =>
                r.id === rewardId ? { ...r, claimed: true } : r
            ));

            // Update available points
            const claimedReward = rewards.find(r => r.id === rewardId);
            if (claimedReward) {
                setAvailablePoints(prev => prev - (claimedReward.points_value || 0));
            }

            // Reapply filter
            applyFilter(activeFilter);
        } catch (error) {
            console.error('Error claiming reward:', error);
        }
    };

    // Pull-to-refresh handler
    const onRefresh = () => {
        setRefreshing(true);
        fetchRewards();
    };

    // Setup realtime subscription
    useEffect(() => {
        if (!user) return;

        fetchRewards();

        const subscription = supabase
            .channel('rewards')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rewards',
                filter: `user_id=eq.${user.id}`
            }, (payload) => {
                // Handle new reward notification
                if (payload.eventType === 'INSERT' && !payload.new.seen) {
                    setHasUnseenRewards(true);
                }
                fetchRewards();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user]);

    const handleSelectReward = (reward: Reward) => {
        setSelectedReward(reward);
        setIsModalVisible(true);
        if (!reward.seen) {
            markRewardAsSeen(reward.id);
        }
    };

    const handleClaimReward = async () => {
        if (selectedReward) {
            await claimReward(selectedReward.id);
            setIsModalVisible(false);
        }
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={colors.primary ? [colors.primary] : undefined}
                />
            }
        >
            {/* Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.primary }]}>
                        Your Rewards
                    </Text>
                    {hasUnseenRewards && (
                        <View style={[styles.notificationBadge, { backgroundColor: colors.notification }]} />
                    )}
                </View>
                <View style={styles.pointsContainer}>
                    <Text style={[styles.pointsText, { color: colors.primary }]}>
                        Total Points: {totalPoints}
                    </Text>
                    <Text style={[styles.pointsText, { color: colors.primary }]}>
                        Available: {availablePoints}
                    </Text>
                </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'all' && styles.activeFilterButton,
                        activeFilter === 'all' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleFilterChange('all')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        activeFilter === 'all' && { color: colors.background }
                    ]}>
                        All
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'unclaimed' && styles.activeFilterButton,
                        activeFilter === 'unclaimed' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleFilterChange('unclaimed')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        activeFilter === 'unclaimed' && { color: colors.background }
                    ]}>
                        Unclaimed
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        activeFilter === 'claimed' && styles.activeFilterButton,
                        activeFilter === 'claimed' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleFilterChange('claimed')}
                >
                    <Text style={[
                        styles.filterButtonText,
                        activeFilter === 'claimed' && { color: colors.background }
                    ]}>
                        Claimed
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Rewards List */}
            {filteredRewards.length > 0 ? (
                filteredRewards.map(reward => (
                    <RewardCard
                        key={reward.id}
                        reward={reward}
                        onSelect={() => handleSelectReward(reward)}
                        currentPoints={availablePoints}
                        onClaim={claimReward}
                    />
                ))
            ) : (
                <View style={styles.emptyContainer}>
                    <Icon name="trophy-outline" size={48} color={colors.primary} />
                    <Text style={[styles.emptyText, { color: colors.primary }]}>
                        {activeFilter === 'all'
                            ? 'No rewards yet. Complete milestones to earn rewards!'
                            : activeFilter === 'claimed'
                                ? 'No claimed rewards yet'
                                : 'No unclaimed rewards'}
                    </Text>
                </View>
            )}

            {/* Reward Details Modal */}
            <RewardModal
                visible={isModalVisible}
                reward={selectedReward}
                currentPoints={availablePoints}
                onClose={() => setIsModalVisible(false)}
                onClaim={handleClaimReward}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    headerContainer: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 45 : 20,
        paddingBottom: 16,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '600',
        marginBottom: 8,
    },
    pointsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pointsText: {
        fontSize: 16,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    activeFilterButton: {
        borderWidth: 0,
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    notificationBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 8,
    }
});

export const rewardService = {
    awardPoints: async (userId: string, points: number, reason: string) => {
        try {
            await supabase
                .from('rewards')
                .insert({
                    user_id: userId,
                    title: 'Points Awarded',
                    description: reason,
                    icon: '⭐',
                    points_value: points,
                    seen: false,
                    claimed: false
                });
        } catch (error) {
            console.error('Error awarding points:', error);
        }
    },
    createAchievementReward: async (
        userId: string,
        title: string,
        description: string,
        points: number,
        milestoneId?: string,
        projectId?: string
    ) => {
        try {
            await supabase
                .from('rewards')
                .insert({
                    user_id: userId,
                    title,
                    description,
                    icon: '🏆',
                    points_value: points,
                    seen: false,
                    claimed: false,
                    milestone_id: milestoneId,
                    project_id: projectId
                });
        } catch (error) {
            console.error('Error creating achievement reward:', error);
        }
    }
};

export default RewardScreen;