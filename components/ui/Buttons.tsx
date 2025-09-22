import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle
} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'text';
    disabled?: boolean;
    loading?: boolean;
    mode?: 'filled' | 'outlined';
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    style,
    textStyle,
    variant = 'primary',
    disabled = false,
    loading = false,
    mode = 'filled',
}) => {
    const { colors } = useTheme();

    const getButtonStyle = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            borderWidth: mode === 'outlined' ? 1 : 0,
            borderColor: mode === 'outlined' ? colors.primary : 'transparent',
        };

        switch (variant) {
            case 'secondary':
                return {
                    ...baseStyle,
                    backgroundColor: mode === 'outlined' ? 'transparent' : colors.secondary,
                };
            case 'text':
                return {
                    ...baseStyle,
                    backgroundColor: 'transparent',
                };
            default:
                return {
                    ...baseStyle,
                    backgroundColor: mode === 'outlined' ? 'transparent' : colors.primary,
                };
        }
    };

    const getTextStyle = (): TextStyle => {
        if (mode === 'outlined' || variant === 'text') {
            return { color: colors.primary };
        }

        return { color: 'white' };
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                getButtonStyle(),
                disabled && styles.disabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator size="small" color={getTextStyle().color} />
            ) : (
                <Text style={[styles.text, getTextStyle(), textStyle]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '500',
    },
    disabled: {
        opacity: 0.6,
    },
});

export { Button };

