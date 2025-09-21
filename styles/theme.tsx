// styles/theme.tsx

import { TextStyle } from 'react-native';

export const spacing = {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xl: 32,
};

export const colors = {
    // Light theme (customize as needed)
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#4A90E2',
    primaryLight: '#D0E6FA',
    secondary: '#50E3C2',
    text: '#333333',
    textSecondary: '#7F8C8D',
    border: '#E0E0E0',
    danger: '#E74C3C',
};

export const fonts: { [key: string]: TextStyle } = {
    header: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.text,
    },
    subheader: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.text,
    },
    bodyBold: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    small: {
        fontSize: 12,
        fontWeight: '400',
        color: colors.text,
    },
    caption: {
        fontSize: 10,
        fontWeight: '400',
        color: colors.textSecondary,
    },
};

export const theme = {
    spacing,
    colors,
    fonts,
};

export default theme;
