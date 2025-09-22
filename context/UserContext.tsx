import { supabase } from '@/supabase/client';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string | null;
    family_id?: string | null;
}

interface UserContextType {
    user: User | null;
    updateUser: (userData: Partial<User>) => void;
    clearUser: () => void;
    isAuthenticated: boolean;
    familyMembers: User[];
    refreshFamilyMembers: () => void;
}

const defaultUserContext: UserContextType = {
    user: null,
    updateUser: () => console.warn('No UserProvider found'),
    clearUser: () => console.warn('No UserProvider found'),
    isAuthenticated: false,
    familyMembers: [],
    refreshFamilyMembers: () => { },
};

export const UserContext = createContext<UserContextType>(defaultUserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>({
        id: '123',
        name: 'Fush Olawale',
        email: 'fush.rifle@example.com',
        photo: null,
        family_id: null, // add this if needed
    });

    const [familyMembers, setFamilyMembers] = useState<User[]>([]);

    const updateUser = useCallback((userData: Partial<User>) => {
        setUser(prev => {
            if (!prev) {
                if (!userData.id) {
                    throw new Error('User id is required for initial user setup');
                }
                return userData as User;
            }
            return { ...prev, ...userData };
        });
    }, []);

    const clearUser = useCallback(() => {
        setUser(null);
        setFamilyMembers([]);
    }, []);

    const refreshFamilyMembers = useCallback(async () => {
        if (!user?.family_id) return;

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, photo')
            .eq('family_id', user.family_id)
            .neq('id', user.id); // Exclude current user

        if (error) {
            console.error('Error fetching family members:', error);
        } else {
            setFamilyMembers(data);
        }
    }, [user?.family_id, user?.id]);

    useEffect(() => {
        if (user?.family_id) {
            refreshFamilyMembers();
        }
    }, [user?.family_id, refreshFamilyMembers]);

    const isAuthenticated = !!user;

    return (
        <UserContext.Provider
            value={{
                user,
                updateUser,
                clearUser,
                isAuthenticated,
                familyMembers,
                refreshFamilyMembers,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === defaultUserContext) {
        console.warn('useUser must be used within a UserProvider');
    }
    return context;
};
