import { StyleSheet } from 'react-native';

export interface ThemeColors {
    surface: any;
    border: any;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    lightText: string;
}

export const colors: ThemeColors = {
    primary: '#6C63FF',
    secondary: '#FF6584',
    accent: '#42C6A1',
    background: '#F9F9FF',
    text: '#3F3D56',
    lightText: '#A1A1B5',
    border: undefined,
    surface: undefined
};

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
        padding: 16,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
});

// Theme context for dark/light mode
import React, { createContext, useContext, useState } from 'react';
interface ThemeContextType {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme?: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    colors: colors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => setIsDark(!isDark);

    const theme: ThemeContextType = {
        isDark,
        colors: isDark ? darkColors : colors,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={theme} >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

const darkColors: ThemeColors = {
    primary: '#7C73FF',
    secondary: '#FF7594',
    accent: '#52D6B1',
    background: '#121212',
    text: '#FFFFFF',
    lightText: '#B1B1C5',
    border: undefined,
    surface: undefined
};