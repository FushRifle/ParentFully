import { supabase } from '@/supabase/client';

/**
 * Award points to a user for a reason.
 * @param userId string - user's ID
 * @param points number - points to award
 * @param reason string - description or reason for awarding points
 */
export const awardPoints = async (userId: string, points: number, reason: string) => {
    try {
        const { error } = await supabase
            .from('rewards')
            .insert({
                user_id: userId,
                title: 'Points Awarded',
                description: reason,
                icon: '⭐',
                points_value: points,
                seen: false,
            });

        if (error) {
            console.error('Failed to award points:', error);
            return false;
        }
        return true;
    } catch (err) {
        console.error('Unexpected error awarding points:', err);
        return false;
    }
};

/**
 * Award daily login points if 24 hours have passed since last reward
 * @param userId string - user's ID
 */
export const awardDailyLoginPoints = async (userId: string) => {
    try {
        const { data: lastReward, error } = await supabase
            .from('rewards')
            .select('created_at')
            .eq('user_id', userId)
            .eq('description', 'Daily login reward')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // ignore "no rows" error
            console.error('Error fetching last reward:', error);
            return false;
        }

        const now = Date.now();
        const lastRewardTime = lastReward?.created_at ? new Date(lastReward.created_at).getTime() : null;

        // Check if 24 hours have passed
        const hasBeen24Hours = !lastRewardTime || (now - lastRewardTime > 24 * 60 * 60 * 1000);

        if (hasBeen24Hours) {
            const success = await awardPoints(userId, 10, 'Daily login reward');

            if (success) {
                await supabase.from('notifications').insert({
                    user_id: userId,
                    title: 'Daily Login Reward',
                    message: 'You earned 10 points for logging in today!',
                    read: false,
                    created_at: new Date().toISOString(),
                });
                return true;
            }
        }

        return false;
    } catch (err) {
        console.error('Error in daily login reward:', err);
        return false;
    }
};

/**
 * Create an achievement reward for a user.
 * @param userId string - user's ID
 * @param title string - achievement title
 * @param description string - achievement description
 * @param points number - points awarded for achievement
 */
export const createAchievementReward = async (
    userId: string,
    title: string,
    description: string,
    points: number
) => {
    try {
        const { data, error } = await supabase
            .from('achievement_rewards')
            .insert([{
                user_id: userId,
                title,
                description,
                points,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Failed to create achievement reward:', error);
            return null;
        }

        await awardPoints(userId, points, `Achievement unlocked: ${title}`);
        return data;
    } catch (err) {
        console.error('Error creating achievement reward:', err);
        return null;
    }
};
