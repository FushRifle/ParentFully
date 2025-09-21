import MainNavigator from '@/navigation/MainNavigator';
import { ThemeProvider } from '@/styles/ThemeContext';
import { StatusBar } from 'react-native';


export default function MainLayout() {
    return (
        <ThemeProvider>
            <StatusBar hidden={true} />
            <MainNavigator />
        </ThemeProvider>
    );
}