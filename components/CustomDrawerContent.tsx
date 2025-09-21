import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface CustomDrawerContentProps {
    navigation: any;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({ navigation }) => {
    const { colors, toggleTheme, isDark } = useTheme();

    const menuItems = [
        { label: 'Home', icon: 'home', route: 'Main' },
        { label: 'Profile', icon: 'person', route: 'Profile' },
        { label: 'Resources', icon: 'book', route: 'Resources' },
        { label: 'Tools', icon: 'hammer', route: 'Tools' },
        { label: 'Settings', icon: 'settings', route: 'Settings' },
        { label: 'Logout', icon: 'log-out', route: 'login' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Image
                    source={require('../assets/images/profile.jpg')}
                    style={styles.profileImage}
                />
                <Text style={[styles.name, { color: colors.text }]}>Fush Olawale</Text>
                <Text style={[styles.email, { color: colors.lightText }]}>fush.rifle@example.com</Text>
            </View>

            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={() => navigation.navigate(item.route)}
                    >
                        <Icon
                            name={item.icon}
                            size={20}
                            color={colors.text}
                            style={styles.menuIcon}
                        />
                        <Text style={[styles.menuText, { color: colors.text }]}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.themeToggle}
                onPress={toggleTheme}
            >

                <Icon
                    name={isDark ? 'sunny' : 'moon'}
                    size={20}
                    color={colors.text}
                />
                <Text style={[styles.themeText, { color: colors.text }]}>
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        width: 250,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
    },
    menuContainer: {
        marginBottom: 32,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuIcon: {
        marginRight: 16,
    },
    menuText: {
        fontSize: 16,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        position: 'absolute',
        bottom: 70,
        left: 16,
    },
    themeText: {
        marginLeft: 16,
        fontSize: 16,
    },
});

export default CustomDrawerContent;