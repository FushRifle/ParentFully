import type { Database } from '@/supabase/client';
import { supabase } from '@/supabase/client';

type Milestone = Database['public']['Tables']['milestones']['Row'];
type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
type MilestoneUpdate = Database['public']['Tables']['milestones']['Update'];

export const MilestoneService = {
    // Get all milestones for a child
    async getByChildId(childId: string): Promise<Milestone[]> {
        const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .eq('child_id', childId)
            .order('expected_date', { ascending: true });

        if (error) throw new Error(error.message);
        return data;
    },

    // Get milestone by ID
    async getById(id: string): Promise<Milestone> {
        const { data, error } = await supabase
            .from('milestones')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    // Create new milestone
    async create(milestone: MilestoneInsert): Promise<Milestone> {
        const { data, error } = await supabase
            .from('milestones')
            .insert(milestone)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    // Update milestone
    async update(id: string, updates: MilestoneUpdate): Promise<Milestone> {
        const { data, error } = await supabase
            .from('milestones')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    },

    // Mark milestone as achieved
    async markAchieved(id: string): Promise<void> {
        const { error } = await supabase.rpc('achieve_milestone', {
            milestone_uuid: id
        });

        if (error) throw new Error(error.message);
    },

    // Delete milestone
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('milestones')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
    },

    // Get milestones with child details using the SQL function
    async getWithChildDetails(childId: string) {
        const { data, error } = await supabase
            .rpc('get_child_milestones', { child_uuid: childId });

        if (error) throw new Error(error.message);
        return data;
    }
};