import {
    ACADEMIC_DEVELOPMENT_DATA,
    CIVIC_AND_COMMUNITY_ENGAGEMENT_DATA,
    CORE_VALUES_DATA,
    CREATIVE_EXPRESSION_AND_COMMUNICATION_DATA,
    DIGITAL_AND_MEDIA_LITERACY_GOALS_DATA,
    EMOTIONAL_DEVELOPMENT_DATA,
    FAITH_AND_SPIRITUAL_GROWTH_DATA,
    FINANCIAL_LITERACY_GOALS_DATA,
    LIFE_SKILLS_AND_PROBLEM_SOLVING_DATA,
    PHYSICAL_HEALTH_GOALS_DATA,
    SOCIAL_DEVELOPMENT_DATA
} from '@/data/ValueData';
import { supabase } from '@/supabase/client';
import { v4 as uuidv4 } from 'uuid';

const GOALS_MAP = [
    SOCIAL_DEVELOPMENT_DATA,
    ACADEMIC_DEVELOPMENT_DATA,
    EMOTIONAL_DEVELOPMENT_DATA,
    LIFE_SKILLS_AND_PROBLEM_SOLVING_DATA,
    PHYSICAL_HEALTH_GOALS_DATA,
    FAITH_AND_SPIRITUAL_GROWTH_DATA,
    FINANCIAL_LITERACY_GOALS_DATA,
    DIGITAL_AND_MEDIA_LITERACY_GOALS_DATA,
    CIVIC_AND_COMMUNITY_ENGAGEMENT_DATA,
    CREATIVE_EXPRESSION_AND_COMMUNICATION_DATA,
];

export const seedDefaultGoals = async () => {
    for (let i = 0; i < CORE_VALUES_DATA.length; i++) {
        const coreValue = CORE_VALUES_DATA[i];
        const goals = GOALS_MAP[i];

        for (const goal of goals) {
            const { specific, measurable, achievable, relevant, timeBound } = goal.smart;

            const { error } = await supabase.from('goals_plan').insert({
                id: goal.id,
                user_id: null, // Default for all users
                core_value_id: coreValue.id,
                status: goal.status,
                area: goal.area,
                goal: goal.goal,
                specific,
                measurable,
                achievable,
                relevant,
                time_bound: timeBound,
                is_default: true,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            if (error) {
                console.error('Failed to insert goal:', goal.goal, error);
            }
        }
    }

    console.log('✅ Default goals seeded.');
};

export const copyDefaultGoalsToUser = async (userId: string) => {
    const { data: defaultGoals, error } = await supabase
        .from('goals_plan')
        .select('*')
        .eq('is_default', true)
        .is('user_id', null);

    if (error || !defaultGoals) return;

    const clonedGoals = defaultGoals.map(goal => ({
        ...goal,
        id: uuidv4(),
        user_id: userId,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
        .from('goals_plan')
        .insert(clonedGoals);

    if (insertError) {
        console.error('Failed to copy default goals:', insertError);
    } else {
        console.log('✅ Default goals copied to user');
    }
};

