import { Button } from '@/components/ui/Buttons';
import { useTheme } from '@/styles/ThemeContext';
import { Reward } from '@/types/rewards';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

interface RewardModalProps {
    visible: boolean;
    reward: Reward | null;
    currentPoints: number;
    onClose: () => void;
    onClaim: () => Promise<void>;
    claimInProgress?: boolean;
}

const RewardModal: React.FC<RewardModalProps> = ({
    visible,
    reward,
    currentPoints,
    onClose,
    onClaim,
    claimInProgress = false
}) => {
    const { colors } = useTheme();
    const [isClaiming, setIsClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset states when modal becomes visible
        if (visible) {
            setIsClaiming(false);
            setError(null);
        }
    }, [visible]);

    if (!reward) return null;

    const canClaim = currentPoints >= reward.pointsRequired && !reward.claimed;
    const pointsDifference = reward.pointsRequired - currentPoints;

    const handleClaim = async () => {
        if (!canClaim) return;

        setIsClaiming(true);
        setError(null);
        try {
            await onClaim();
        } catch (err) {
            console.error('Claim failed:', err);
            setError('Failed to claim reward. Please try again.');
        } finally {
            setIsClaiming(false);
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                    <Text style={[styles.modalTitle, { color: colors.primary }]}>
                        {reward.claimed ? 'Reward Claimed!' : 'Claim Your Reward!'}
                    </Text>

                    <View style={styles.rewardContainer}>
                        <Text style={[styles.rewardEmoji, { fontSize: 60 }]}>{reward.icon || '🏆'}</Text>
                        <Text style={[styles.rewardName, { color: colors.text }]}>{reward.title}</Text>
                        <Text style={[styles.rewardDescription, { color: colors.lightText }]}>
                            {reward.description}
                        </Text>

                        <View style={styles.pointsContainer}>
                            <View style={styles.pointsRow}>
                                <Text style={[styles.pointsLabel, { color: colors.text }]}>Required:</Text>
                                <Text style={[styles.pointsValue, { color: colors.primary }]}>
                                    {reward.pointsRequired} pts
                                </Text>
                            </View>
                            <View style={styles.pointsRow}>
                                <Text style={[styles.pointsLabel, { color: colors.text }]}>Your Points:</Text>
                                <Text style={[
                                    styles.pointsValue,
                                    {
                                        color: canClaim ? colors.success : colors.warning
                                    }
                                ]}>
                                    {currentPoints} pts
                                </Text>
                            </View>
                        </View>

                        {!canClaim && !reward.claimed && (
                            <Text style={[styles.morePointsNeeded, { color: colors.warning }]}>
                                You need {pointsDifference} more points to claim this reward
                            </Text>
                        )}

                        {reward.claimed && (
                            <Text style={[styles.claimedText, { color: colors.success }]}>
                                You've successfully claimed this reward!
                            </Text>
                        )}

                        {error && (
                            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                        )}
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Close"
                            onPress={onClose}
                            style={{ ...styles.button, backgroundColor: colors.card }}
                            textStyle={{ color: colors.text }}
                        />

                        {!reward.claimed && (
                            <Button
                                title={
                                    (isClaiming || claimInProgress)
                                        ? "Processing..."
                                        : canClaim
                                            ? "Claim Now"
                                            : "View Progress"
                                }
                                onPress={canClaim ? handleClaim : onClose}
                                style={{
                                    ...styles.button,
                                    backgroundColor: canClaim
                                        ? colors.primary
                                        : colors.secondary,
                                    ...(isClaiming || claimInProgress ? styles.buttonProcessing : {})
                                }}
                                disabled={isClaiming || claimInProgress}
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    rewardContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    rewardEmoji: {
        marginBottom: 16,
    },
    rewardName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    rewardDescription: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    pointsContainer: {
        width: '100%',
        marginBottom: 16,
    },
    pointsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    pointsLabel: {
        fontSize: 16,
    },
    pointsValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    morePointsNeeded: {
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
        fontWeight: '500',
    },
    claimedText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        marginTop: 12,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
        borderRadius: 12,
        paddingVertical: 12,
    },
    buttonProcessing: {
        opacity: 0.8,
    },
});

export default RewardModal;