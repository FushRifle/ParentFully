import { supabase } from '@/supabase/client';

export const createFamilyIfParent = async (role: string, familyName?: string) => {
    if (role !== 'parent' || !familyName?.trim()) return null;

    const { data, error } = await supabase
        .from('family')
        .insert({ family_name: familyName.trim() })
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data.id;
};
