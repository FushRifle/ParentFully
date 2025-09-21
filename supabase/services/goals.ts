import { supabase } from '@/supabase/client';
import { Goal } from '@/types/goals';

export const fetchGoalsByCategory = async (userId: string, category: string) => {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const addGoalToSupabase = async (goal: Omit<Goal, 'id'> & { user_id: string }) => {
    const { data, error } = await supabase
        .from('goals')
        .insert([goal])
        .select();

    if (error) throw error;
    return data[0];
};

export const updateGoalInSupabase = async (goalId: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .select();

    if (error) throw error;
    return data[0];
};

export const deleteGoalInSupabase = async (goalId: string) => {
    const { data, error } = await supabase
        .from('goals')
        .update({ is_active: false })
        .eq('id', goalId)
        .select();

    if (error) throw error;
    return data[0];
};

export const updateGoalStatusInSupabase = async (goalId: string, status: 'Working on' | 'Mastered') => {
    const { data, error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId)
        .select();

    if (error) throw error;
    return data[0];
};

export const subscribeToGoalsChanges = (userId: string, callback: (payload: any) => void) => {
    return supabase
        .channel('goals_changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'goals',
            filter: `user_id=eq.${userId}`
        }, callback)
        .subscribe();
};