import { useTheme } from '@/styles/ThemeContext';
import React, { memo } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ActionButtonProps {
    icon: string;
    label: string;
    onPress?: () => void;
    disabled?: boolean;
    testID?: string;
}

const ActionButton: React.FC<ActionButtonProps> = memo(({
    icon,
    label,
    onPress,
    disabled = false,
    testID
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={disabled}
            testID={testID}
        >
            <View>
                <Icon
                    name={icon}
                    size={24}
                    color={disabled ? colors.textSecondary : colors.primary}
                />
            </View>
            <Text
                style={[
                    styles.label,
                    {
                        color: disabled ? colors.textSecondary : colors.text
                    }
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 100,
        paddingVertical: 8,
        marginHorizontal: 4,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        ...Platform.select({
            ios: {
                shadowColor: 'green',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 2,
                shadowColor: 'green',
                shadowOpacity: 0.1
            },
        }),
    },
    label: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: Platform.OS === 'ios' ? '500' : '400',
        paddingHorizontal: 4,
    }
});

export default ActionButton;