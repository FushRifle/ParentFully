import type { Database } from '@/supabase/client';
import { supabase } from '@/supabase/client';

type Child = Database['public']['Tables']['users']['Insert'];

export const ChildService = {
    async addChild(child: Child) {
        const { data, error } = await supabase
            .from('children')
            .insert(child)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getChildren(userId: string) {
        const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data;
    },

    async updateChild(id: string, updates: Partial<Child>) {
        const { data, error } = await supabase
            .from('children')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },
};