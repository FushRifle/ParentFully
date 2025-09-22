import Navbar from '@/components/Navbar';
import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MainLayoutProps {
    children: React.ReactNode;
    navigation: any;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, navigation }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Navbar navigation={navigation} />
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default MainLayout;