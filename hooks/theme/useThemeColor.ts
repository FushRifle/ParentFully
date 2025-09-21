import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/theme/useColorScheme';

type ThemeType = 'light' | 'dark';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = (useColorScheme() ?? 'light') as ThemeType;

  // First priority: override via props
  const colorFromProps = props[theme];
  if (colorFromProps) {
    return colorFromProps;
  }

  // Fallback: return from Colors map
  return Colors[theme][colorName];
}
