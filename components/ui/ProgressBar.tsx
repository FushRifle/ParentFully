import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { View } from 'react-native';

const ProgressBar = ({
    progress,
    progressColor,
    backgroundColor,
}: {
    progress: number;
    progressColor?: string;
    backgroundColor?: string;
}) => {
    const { colors } = useTheme();

    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <View
            style={{
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                marginVertical: 8,
                backgroundColor: colors.border as string
            }}
        >
            <View
                style={{
                    width: `${clampedProgress}%`,
                    height: '100%',
                    borderRadius: 4,
                    backgroundColor: progressColor || colors.primary
                }}
            />
        </View>
    );
};

export default ProgressBar;
