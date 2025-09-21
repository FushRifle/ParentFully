import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

export function useTheme() {
    const colorScheme = (useColorScheme() ?? 'light') as ThemeType;

    const themeColors = Colors[colorScheme] ?? Colors.light;

    return {
        colorScheme,
        colors: themeColors,
        isDark: colorScheme === 'dark',
        isLight: colorScheme === 'light',
    };
}
