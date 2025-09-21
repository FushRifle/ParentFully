import Card from '@/components/ui/Card';
import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Reward {
    id: string;
    title: string;
    description: string;
    icon: string;
    points_value: number;
    seen: boolean;
    claimed?: boolean;
}

interface RewardCardProps {
    reward: Reward;
    onSelect: (reward: Reward) => void;
    onClaim?: (id: string) => Promise<void>;
    currentPoints?: number;
    isClaimed?: boolean;
    claimInProgress?: boolean;
}

const RewardCard: React.FC<RewardCardProps> = ({
    reward,
    onSelect,
    onClaim,
    currentPoints = 0,
    isClaimed: claimedFromProps,
    claimInProgress = false,
}) => {
    const { colors } = useTheme();

    const isClaimed = claimedFromProps ?? reward.claimed ?? false;
    const canClaim = currentPoints >= reward.points_value && !isClaimed;

    const handleClaimPress = async () => {
        if (canClaim && onClaim) {
            try {
                await onClaim(reward.id);
            } catch (error) {
                console.error('Reward claim failed:', error);
            }
        }
    };

    return (
        <Card
            style={[
                styles.card,
                isClaimed && styles.claimedCard,
                { borderLeftWidth: 4, borderLeftColor: isClaimed ? colors.success : colors.primary },
            ]}
        >
            <TouchableOpacity
                onPress={() => onSelect(reward)}
                activeOpacity={0.85}
            >
                <View style={styles.header}>
                    <Text style={[styles.icon, { fontSize: 32 }]}>{reward.icon}</Text>
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: colors.text }]}>{reward.title}</Text>
                        <Text style={[styles.description, { color: colors.lightText }]}>
                            {reward.description}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>

            <View style={styles.footer}>
                <View style={styles.pointsContainer}>
                    <Text style={[styles.points, { color: colors.primary }]}>
                        {reward.points_value} pts
                    </Text>

                    {isClaimed && (
                        <View style={[styles.claimedBadge, { backgroundColor: colors.success }]}>
                            <Text style={styles.claimedBadgeText}>Claimed</Text>
                        </View>
                    )}
                </View>

                {onClaim && !isClaimed && (
                    <TouchableOpacity
                        onPress={handleClaimPress}
                        disabled={!canClaim || claimInProgress}
                        style={[
                            styles.button,
                            {
                                backgroundColor: canClaim ? colors.primary : colors.disabled,
                                opacity: claimInProgress ? 0.6 : 1,
                            },
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {claimInProgress
                                ? 'Processing...'
                                : canClaim
                                    ? 'Claim Now'
                                    : 'Need More Points'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
    },
    claimedCard: {
        opacity: 0.7,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pointsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    points: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 8,
    },
    claimedBadge: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    claimedBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    button: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        minWidth: 120,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default RewardCard;
