import { useTheme } from '@/hooks/theme/useTheme';
import React from 'react';
import { StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text, View } from './Themed';

export function ThemeToggle() {
    const { colors, colorScheme } = useTheme();
    const [isDark, setIsDark] = React.useState(colorScheme === 'dark');

    // In a real app, you would persist this preference
    const toggleTheme = () => setIsDark(previousState => !previousState);

    return (
        <View style={styles.container}>
            <Icon
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={colors.text}
                style={styles.icon}
            />
            <Text style={styles.text}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Switch
                trackColor={{ false: '#767577', true: colors.tint }}
                thumbColor={isDark ? colors.tint : '#f4f3f4'}
                onValueChange={toggleTheme}
                value={isDark}
            />
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    text: {
        flex: 1,
        fontSize: 16,
    },
});