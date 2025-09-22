import { supabase } from '@/supabase/client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface Child {
    id: string;
    name: string;
    age: string;
    photo: string | null;
}

interface ChildContextType {
    currentChild: Child | null;
    children: Child[];
    setCurrentChild: (child: Child) => void;
    updateChild: (childData: Partial<Child>) => void;
}

const ChildContext = createContext<ChildContextType>({
    currentChild: null,
    children: [],
    setCurrentChild: () => { },
    updateChild: () => { },
});

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children: providerChildren }) => {
    const { user } = useAuth();
    const [currentChild, setCurrentChild] = useState<Child | null>(null);
    const [childrenList, setChildrenList] = useState<Child[]>([]);

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user) return;

            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error('Error fetching children:', error.message);
            } else {
                setChildrenList(data || []);
                if (data && data.length > 0) {
                    setCurrentChild(data[0]);
                }
            }
        };

        fetchChildren();
    }, [user]);

    const updateChild = (childData: Partial<Child>) => {
        if (currentChild) {
            setCurrentChild({
                ...currentChild,
                ...childData
            });
        }
    };

    return (
        <ChildContext.Provider value={{ currentChild, children: childrenList, setCurrentChild, updateChild }}>
            {providerChildren}
        </ChildContext.Provider>
    );
};

export const useChildContext = () => useContext(ChildContext);
