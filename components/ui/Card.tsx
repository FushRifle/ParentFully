import { globalStyles } from '@/styles/globalStyles';
import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
    const { colors } = useTheme();

    return (
        <Pressable
            {...props}
            style={({ pressed }) => [
                styles.card,
                globalStyles.shadow,
                { backgroundColor: colors.cardBackground },
                style,
                pressed && styles.pressed
            ]}
        >
            <View style={styles.innerContainer}>
                {children}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginVertical: 8,
    },
    innerContainer: {
        padding: 16,
    },
    pressed: {
        opacity: 0.9,
    },
});

export default Card;