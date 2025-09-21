import { SOCIAL_DEVELOPMENT_DATA } from '@/data/ValueData';
import { supabase } from '@/supabase/client';

export type Goal = {
    id: string
    core_value_id: string
    status: 'Working on' | 'Mastered' | 'Expired'
    area: string
    goal: string
    specific?: string
    measurable?: string
    achievable?: string
    relevant?: string
    time_bound?: string
    is_default?: boolean
    created_at?: string
    updated_at?: string
    is_active?: boolean
    user_id?: string
}

export type CoreValue = {
    id: string
    title: string
    description: string
    icon: string
    iconComponent: React.ComponentType<any>
    color: string
    iconColor: string
}

type SelectedGoal = {
    area: string;
    goal: string;
    id: string;
    goal_id: string;
    user_id: string;
    child_id: string;
    goals_plan: Goal;
    created_at: string;
    child_name?: string;
    timeframe?: string;
    target_date?: string;
    status: 'Working on' | 'Mastered' | 'Expired'
    priority?: 'low' | 'medium' | 'high';
    reminders?: boolean;
    notes?: string;
    child?: Child;
    points?: number;
    progress?: number;
};

type Child = {
    id: string;
    name: string;
    age: number;
};

/**
 * Initialize default goals for a new user
 */
export const initializeDefaultGoals = async (userId: string): Promise<void> => {
    try {
        const { data: existingGoals, error } = await supabase
            .from('goals_plan')
            .select('id')
            .eq('user_id', userId)
            .eq('is_default', true)
            .limit(1);

        if (error) throw error;

        if (!existingGoals?.length) {
            const { error: insertError } = await supabase
                .from('goals_plan')
                .insert(SOCIAL_DEVELOPMENT_DATA.map(goal => ({
                    ...goal,
                    user_id: userId
                })));

            if (insertError) throw insertError;
        }
    } catch (error) {
        console.error('Error initializing default goals:', error);
        throw error;
    }
};

/**
 * Fetch user goals with optional filtering by core value
 */
export const fetchUserGoals = async (
    userId: string,
    coreValueId?: string
): Promise<Goal[]> => {
    try {
        let query = supabase
            .from('goals_plan')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (coreValueId) {
            query = query.eq('core_value_id', coreValueId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching goals:', error);
        throw error;
    }
};

/**
 * Fetch all core values
 */
export const fetchCoreValues = async (): Promise<CoreValue[]> => {
    try {
        const { data, error } = await supabase
            .from('core_values')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching core values:', error);
        throw error;
    }
};

/**
 * Create a new goal
 */
export const createGoal = async (goalData: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal> => {
    try {
        const { data, error } = await supabase
            .from('goals_plan')
            .insert([{
                ...goalData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error creating goal:', error);
        throw error;
    }
};

/**
 * Update an existing goal
 */
export const updateGoal = async (
    goalId: string,
    updates: Partial<Omit<Goal, 'id' | 'created_at'>>
): Promise<Goal> => {
    try {
        const { data, error } = await supabase
            .from('goals_plan')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', goalId)
            .select()
            .single();

        if (error) throw error;

        return data as Goal;
    } catch (error) {
        console.error('Error updating goal:', error);
        throw error;
    }
};

export const updateSelectedGoal = async (
    selectedGoalId: string,
    updates: Partial<Omit<SelectedGoal, 'id' | 'created_at'>>
): Promise<SelectedGoal> => {
    try {
        const { data, error } = await supabase
            .from('selected_goals')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', selectedGoalId)
            .select()
            .single();

        if (error) throw error;

        return data as SelectedGoal;
    } catch (error) {
        console.error('Error updating selected goal:', error);
        throw error;
    }
};

/**
 * Soft delete a goal (set is_active to false)
 */
export const deleteGoal = async (goalId: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('goals_plan')
            .update({
                is_active: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', goalId);

        if (error) throw error;
    } catch (error) {
        console.error('Error deleting goal:', error);
        throw error;
    }
};

/**
 * Insert default goals for a specific core value category
 */
export const insertDefaultGoalsForCategory = async (
    userId: string,
    coreValueId: string
): Promise<Goal[]> => {
    try {
        const defaultGoalsForCategory = SOCIAL_DEVELOPMENT_DATA.filter(
            g => g.id === coreValueId
        );

        if (!defaultGoalsForCategory.length) {
            return [];
        }

        const { data, error } = await supabase
            .from('goals_plan')
            .insert(
                defaultGoalsForCategory.map(g => ({
                    ...g,
                    user_id: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }))
            )
            .select();

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error inserting default goals:', error);
        throw error;
    }
};

/**
 * Fetch goals for a core value, inserting defaults if none exist
 */
export async function fetchOrInitializeGoals(userId: string, coreValueId: string): Promise<Goal[]> {
    const { data: userGoals, error: userError } = await supabase
        .from('goals_plan')
        .select('*')
        .eq('user_id', userId)
        .eq('core_value_id', coreValueId)

    if (userError) throw userError

    if (userGoals.length > 0) {
        return userGoals
    }

    // No user goals — fallback to default ones
    const { data: defaultGoals, error: defaultError } = await supabase
        .from('goals_plan')
        .select('*')
        .eq('core_value_id', coreValueId)
        .eq('is_default', true)

    if (defaultError) throw defaultError

    // Return as-is, but make sure it's shown as not editable
    return defaultGoals.map(g => ({
        ...g,
        user_id: userId, // visual ownership (but not DB)
    }))
}
