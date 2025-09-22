import { supabase } from '@/supabase/client';
import { MilestoneService } from '@/supabase/services/milestone';
import type { Milestone } from '@/supabase/types';
import { useEffect, useState } from 'react';

export const useMilestones = (childId?: string) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMilestones = async () => {
        if (!childId) return;

        try {
            setLoading(true);
            const data = await MilestoneService.getByChildId(childId);
            setMilestones(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMilestones();

        // Set up realtime subscription
        const subscription = supabase
            .channel('milestones-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'milestones',
                    filter: `child_id=eq.${childId}`
                },
                () => fetchMilestones()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [childId]);

    return {
        milestones,
        loading,
        error,
        refresh: fetchMilestones,
        markAchieved: MilestoneService.markAchieved,
        createMilestone: MilestoneService.create,
        updateMilestone: MilestoneService.update,
        deleteMilestone: MilestoneService.delete
    };
};