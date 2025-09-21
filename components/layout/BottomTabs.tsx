import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


import { useNavigation } from '@/node_modules/@react-navigation/native/lib/typescript/src';

const BottomTabs: React.FC = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();

    const tabs = [
        { name: 'Home', icon: 'home' },
        { name: 'Rewards', icon: 'trophy' },
        { name: 'Resources', icon: 'book' },
        { name: 'Tools', icon: 'hammer' },
        { name: 'Profile', icon: 'person' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.cardBackground }]}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.tab}
                    onPress={() => navigation.navigate(tab.name as never)}
                >
                    <Icon
                        name={tab.icon}
                        size={24}
                        color={colors.text}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 60,
        borderTopWidth: 1,
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BottomTabs;