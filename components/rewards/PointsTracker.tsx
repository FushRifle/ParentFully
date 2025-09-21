import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { Text, View } from 'react-native';

interface PointsTrackerProps {
    currentPoints: number;
    totalPoints: number;
    stickers: string[];
}

const PointsTracker: React.FC<PointsTrackerProps> = ({ currentPoints, totalPoints, stickers }) => {
    const { colors } = useTheme();
    const progress = (currentPoints / 200) * 100; // Assuming 200 points fills the bar

    return (
        <View style={styles.container}>

            <View style={styles.pointsHeader}>
                <Text style={[styles.pointsText, { color: colors.text }]}>
                    🏅 {currentPoints} Points
                </Text>
                <Text style={[styles.totalText, { color: colors.lightText }]}>
                    Total earned: {totalPoints}
                </Text>
            </View>

            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBarBackground, { backgroundColor: colors.inputBackground }]}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${progress}%`,
                                backgroundColor: colors.primary
                            }
                        ]}
                    />
                </View>
            </View>

            <View style={styles.stickersContainer}>
                <Text style={[styles.stickersTitle, { color: colors.text }]}>Sticker Collection:</Text>
                <View style={styles.stickersRow}>
                    {stickers.map((sticker, index) => (
                        <Text key={index} style={styles.sticker}>
                            {sticker}
                        </Text>
                    ))}
                </View>
            </View>

        </View>
    );
};

const styles = {
    container: {
        marginBottom: 20,
    },
    pointsHeader: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        marginBottom: 8,
    },
    pointsText: {
        fontSize: 18,
        fontWeight: 'bold' as const,
    },
    totalText: {
        fontSize: 14,
    },
    progressBarContainer: {
        marginBottom: 16,
    },
    progressBarBackground: {
        height: 12,
        borderRadius: 6,
        overflow: 'hidden' as const,
    },
    progressBarFill: {
        height: '100%' as unknown as number, // workaround for percentage height, but you may want to use flex or absolute positioning for progress bars
    },
    stickersContainer: {
        marginTop: 8,
    },
    stickersTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 8,
    },
    stickersRow: {
        flexDirection: 'row' as const,
        flexWrap: 'wrap' as const,
    },
    sticker: {
        fontSize: 24,
        marginRight: 8,
        marginBottom: 8,
    },
};

export default PointsTracker;