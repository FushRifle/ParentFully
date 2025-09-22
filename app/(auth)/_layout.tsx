// app/(auth)/_layout.tsx
import { useAuth } from '@/context/AuthContext';
import AuthNavigator from '@/navigation/AuthNavigator';
import MainNavigator from '@/navigation/MainNavigator';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

export default function AuthLayout() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (user) {
            router.replace('/(tabs)');
        }
    }, [user, isLoading]);

    if (isLoading) return null;

    return (
        <>
            <StatusBar hidden={true} />
            {!user ? <AuthNavigator /> : <MainNavigator />}
        </>
    );
}
