import { TabButtonProps } from '@/types/support';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TabButton: React.FC<TabButtonProps> = ({ label, active, onPress, colors }) => (
    <TouchableOpacity
        style={styles.tabButton}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.tabContent}>
            <Text
                style={[
                    styles.tabText,
                    {
                        color: active ? colors.primary : colors.text,
                        fontWeight: active ? '600' : '500',
                    },
                ]}
            >
                {label}
            </Text>
            {active && (
                <View style={[styles.underline, { backgroundColor: colors.primary }]} />
            )}
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    tabButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    tabContent: {
        alignItems: 'center',
    },
    tabText: {
        fontSize: 15,
        marginBottom: 4, // Space for underline
    },
    underline: {
        height: 3,
        width: '70%',
        borderRadius: 2,
    },
});

export default React.memo(TabButton);