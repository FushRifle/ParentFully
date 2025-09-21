import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from '@/context/AuthContext';
import AuthNavigator from '@/navigation/AuthNavigator';
import MainNavigator from '@/navigation/MainNavigator';
import { ThemeProvider } from '@/styles/ThemeContext';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const App: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ThemeProvider>
                    {user ? <MainNavigator /> : <AuthNavigator />}
                </ThemeProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
};

export default App;