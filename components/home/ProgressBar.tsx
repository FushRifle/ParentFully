import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressBarProps {
    progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const { colors } = useTheme();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.primary as string }
            ]}
        >
            <View
                style={[
                    styles.progressBar,
                    {
                        width: `${progress}%`,
                        backgroundColor: colors.accent
                    }
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});

export default ProgressBar;
