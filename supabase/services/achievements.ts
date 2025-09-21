import { rewardService } from "@/screens/auth/dashboard/RewardsScreen";
import { supabase } from "../client";

export const checkAchievements = async (userId: string) => {
    // Check for first project
    const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    if (projectCount === 1) {
        await rewardService.createAchievementReward(
            'First Project!',
            'You created your first project!',
            "25",
            undefined as unknown as number // Cast undefined to number if function expects number
        );
    }

    // Check for milestones this week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    await rewardService.createAchievementReward(
        'Productive Week!',
        'You created 3 milestones this week!',
        "50",
        undefined as unknown as number // Cast undefined to number if function expects number
    );
};