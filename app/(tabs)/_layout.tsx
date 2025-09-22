import MainNavigator from '@/navigation/MainNavigator';
import { ThemeProvider } from '@/styles/ThemeContext';
import config from '@/tamagui.config';
import { StatusBar } from 'react-native';
import { PortalProvider, TamaguiProvider } from 'tamagui';

export default function MainLayout() {
    return (
        <TamaguiProvider config={config}>
            <ThemeProvider>
                <PortalProvider>
                    <StatusBar hidden={true} />
                    <MainNavigator />
                </PortalProvider>
            </ThemeProvider>
        </TamaguiProvider>
    );
}