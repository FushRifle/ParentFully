import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';

export default function AuthIndex() {
    const { user } = useAuth();

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    return null;
}