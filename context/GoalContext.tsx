import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface Goal {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    area: string;
    goal: string;
    specific?: string
    measurable?: string;
    achievable?: string;
    relevant?: string;
    time_bound?: string;
    is_default?: boolean;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    user_id?: string;
    child_id?: string
    age_group?: string;
    celebration?: string;
    progress?: number;
    is_edited?: boolean;
    is_selected?: boolean;
    reminders?: boolean;
    notes?: string;
    timeframe?: string;
    target_date?: string;
    assigned_to?: string
    reward_name?: string
    reward_notes?: string
}

interface GoalContextType {
    goals: Goal[];
    updateGoal: (updatedGoal: Goal) => void;
    deleteGoal: (goalId: string) => void;
    setGoals: (goals: Goal[]) => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider = ({ children }: { children: ReactNode }) => {
    const [goals, setGoals] = useState<Goal[]>([]);

    const updateGoal = (updatedGoal: Goal) => {
        setGoals(prev =>
            prev.map(g => (g.id === updatedGoal.id ? updatedGoal : g))
        );
    };

    const deleteGoal = (goalId: string) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
    };

    return (
        <GoalContext.Provider value={{ goals, updateGoal, deleteGoal, setGoals }}>
            {children}
        </GoalContext.Provider>
    );
};

export const useGoalsContext = () => {
    const context = useContext(GoalContext);
    if (!context) throw new Error('useGoalsContext must be used inside GoalProvider');
    return context;
};
