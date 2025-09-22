import React, { createContext, useContext, useState } from 'react';
import {
    ColorValue,
    Falsy,
    OpaqueColorValue,
    RecursiveArray,
    RegisteredStyle,
    StyleSheet,
    TextStyle,
    useColorScheme
} from 'react-native';
import { Value3D } from 'react-native-reanimated';

//Fallback COlors
const withFallbackColors = (colors: Partial<ThemeColors>): ThemeColors => {
    const defaultFallback = '#000'; // global fallback if nothing else specified

    return {
        white: '#FFFFFF',
        primaryDark: '#002233',
        primaryContainer: '#cce7f5',
        secondaryContainer: '#ffe5b4',
        onPrimaryContainer: '#000000',
        onSecondaryContainer: '#000000',
        onPrimary: '#FFFFFF',
        notification: '#007bff',
        surface: '#f5f5f5',
        warning: '#FFA500',
        buttonText: '#FFFFFF',
        success: 'green',
        disabled: '#CCCCCC',
        inputBackground: '#FFFFFF',
        error: '#FF0000',
        textSecondary: '#7C7C7C',
        border: '#00394f',
        primaryLight: '#a4c8de',
        card: '#FFFFFF',
        primary: '#00394f',
        secondary: 'orange',
        accent: '#42C6A1',
        background: '#F7F7F7',
        cardBackground: '#EBEBEB',
        text: '#3F3D56',
        lightText: '#00394f',
        notificationUnread: '#e3f2fd',
        notificationRead: '#ffffff',
        modalBackground: 'rgba(0,0,0,0.5)',

        ...colors, // override with provided values
    };
};

// --- Colors Interface ---
export interface ThemeColors {
    white: ColorValue | undefined;
    primaryDark: ColorValue | undefined;
    primaryContainer: ColorValue | undefined;
    secondaryContainer: ColorValue | undefined;
    onPrimaryContainer: string | undefined;
    onSecondaryContainer: string | undefined;
    onPrimary: ColorValue | undefined;
    notification: string | OpaqueColorValue | undefined;
    surface: ColorValue | undefined;
    warning: ColorValue | undefined;
    buttonText: ColorValue | undefined;
    success: ColorValue | undefined;
    disabled: ColorValue | undefined;
    inputBackground: ColorValue | undefined;
    error: string | OpaqueColorValue | undefined;
    textSecondary: string | undefined;
    border: string | Value3D | OpaqueColorValue | undefined;
    primaryLight: string | undefined;
    card: ColorValue | undefined;
    primary: ColorValue | undefined;
    secondary: ColorValue | undefined;
    accent: ColorValue | undefined;
    background: ColorValue | undefined;
    cardBackground: ColorValue | undefined;
    text: ColorValue | undefined;
    lightText: ColorValue | undefined;
    notificationUnread: string;
    notificationRead: string;
    modalBackground: string;
}

// --- Fonts & Spacing Interfaces ---
export interface ThemeFonts {
    subheader: string | TextStyle | Falsy | RegisteredStyle<TextStyle> | RecursiveArray<TextStyle | Falsy | RegisteredStyle<TextStyle>> | readonly (TextStyle | Falsy | RegisteredStyle<TextStyle>)[];
    small: string | TextStyle | Falsy | RegisteredStyle<TextStyle> | RecursiveArray<TextStyle | Falsy | RegisteredStyle<TextStyle>> | readonly (TextStyle | Falsy | RegisteredStyle<TextStyle>)[];
    header: any;
    heading: string;
    body: string;
    mono: string;
    weightLight: string;
    weightRegular: string;
    weightBold: string;
    bodyBold: string;
}

export interface ThemeSpacing {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
}

export interface ThemeShadows {
    shadow: {
        shadowColor: string;
        shadowOffset: { width: number; height: number };
        shadowOpacity: number;
        shadowRadius: number;
        elevation: number;
    };
}

// --- Light Theme ---
const lightColors: ThemeColors = withFallbackColors({
    primary: '#FF8C01',
    primaryDark: '#B35D00',
    secondary: '#005A31',
    secondaryContainer: '#9FCC16',
    accent: '#42C6A1',
    background: '#FFF5F8',
    cardBackground: '#EBEBEB',
    text: '#3F3D56',
    disabled: '#C9C9C9',
    lightText: '#00394f',
    card: '#FFFFFF',
    textSecondary: '#72706F',
    border: '#D0D7DD',
    primaryLight: '#a4c8de',
    inputBackground: '#FFFFFF',
    error: '#E65A5A',
    success: '#4CAF50',
    warning: '#FFA500',
    buttonText: '#FFFFFF',
    notificationUnread: '#e3f2fd',
    notificationRead: '#ffffff',
    modalBackground: 'rgba(0,0,0,0.5)',
    surface: '#f5f5f5',
    notification: '#007bff',
    onPrimary: 'white',
});

// --- Dark Theme ---
const darkColors: ThemeColors = withFallbackColors({
    primary: '#FFFFFF',
    secondary: '#FF7594',
    secondaryContainer: '#9FCC16',
    accent: '#52D6B1',
    background: '#000000',
    cardBackground: '#141414',
    text: '#FFFFFF',
    lightText: '#B1B1C5',
    card: '#1E1E1E',
    textSecondary: '#A0A0A0',
    border: '#333333',
    primaryLight: '#D3D3D3',
    inputBackground: '#1A1A1A',
    error: '#FF6B6B',
    success: '#4CAF50',
    disabled: '#555555',
    warning: '#FFC107',
    buttonText: '#000000',
    notificationUnread: '#1e3a8a',
    notificationRead: '#1f2937',
    modalBackground: 'rgba(0,0,0,0.8)',
    surface: '#222222',
    notification: '#4dabf7',
});

// --- Fonts ---
const defaultFonts: ThemeFonts = {
    heading: 'System',
    body: 'System',
    mono: 'Courier',
    weightLight: '300',
    weightRegular: '400',
    weightBold: '700',
    header: 'System',
    bodyBold: 'System',
    subheader: undefined,
    small: undefined
};

// --- Spacing ---
const defaultSpacing: ThemeSpacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
};

// --- Theme Context ---
interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    fonts: ThemeFonts;
    spacing: ThemeSpacing;
    toggleTheme: () => void;
    mode: 'light' | 'dark' | 'system';
    setMode: (mode: 'light' | 'dark' | 'system') => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    colors: lightColors,
    fonts: defaultFonts,
    spacing: defaultSpacing,
    toggleTheme: () => { },
    mode: 'light',
    setMode: () => { },
    setThemeMode: () => { }
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<'light' | 'dark' | 'system'>('system');

    const isDark = (mode === 'dark') || (mode === 'system' && systemColorScheme === 'dark');

    const getCurrentTheme = () => {
        if (mode === 'light') return lightColors;
        if (mode === 'dark') return darkColors;
        return systemColorScheme === 'dark' ? darkColors : lightColors;
    };

    const toggleTheme = () => {
        setMode((prev) =>
            prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'
        );
    };

    const theme: ThemeContextType = {
        isDark,
        colors: getCurrentTheme(),
        fonts: defaultFonts,
        spacing: defaultSpacing,
        toggleTheme,
        mode,
        setMode,
        setThemeMode: () => { }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

// --- Global Styles (you can now use spacing + fonts dynamically) ---
export const globalStyles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    container: {
        flex: 1,
        padding: defaultSpacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: defaultFonts.weightBold as any,
        marginBottom: defaultSpacing.md,
        fontFamily: defaultFonts.heading,
    },
    borderTop: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
});
