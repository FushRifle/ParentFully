import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';

const AuthRedirect: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null; // Or return a loading spinner
    }

    if (!user) {
        return <Redirect href="/(auth)" />;
    }

    return null;
};

export default AuthRedirect;