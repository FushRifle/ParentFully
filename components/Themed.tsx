import { useTheme } from '@/hooks/theme/useTheme';
import * as React from 'react';
import { Text as DefaultText, TextInput as DefaultTextInput, View as DefaultView, StyleSheet } from 'react-native';

export function Text(props: DefaultText['props']) {
    const { style, ...otherProps } = props;
    const { colors } = useTheme();

    return (
        <DefaultText
            style={[{ color: colors.text }, style]}
            {...otherProps}
        />
    );
}

export function View(props: DefaultView['props']) {
    const { style, ...otherProps } = props;
    const { colors } = useTheme();

    return (
        <DefaultView
            style={[{ backgroundColor: colors.background }, style]}
            {...otherProps}
        />
    );
}

export function TextInput(props: DefaultTextInput['props']) {
    const { style, ...otherProps } = props;
    const { colors } = useTheme();

    return (
        <DefaultTextInput
            style={[
                styles.input,
                {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.tint
                },
                style
            ]}
            placeholderTextColor={colors.text}
            {...otherProps}
        />
    );
}

export function Card(props: DefaultView['props']) {
    const { style, ...otherProps } = props;
    const { colors } = useTheme();

    return (
        <DefaultView
            style={[
                styles.card,
                {
                    backgroundColor: colors.background
                },
                style
            ]}
            {...otherProps}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    }
});