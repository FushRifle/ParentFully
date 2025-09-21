import type { Database } from '@/supabase/client';

export type User = Database['public']['Tables']['users']['Row'];
export type Child = Database['public']['Tables']['children']['Row'];
export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];

export type MilestoneWithChild = Milestone & {
    child: Child;
};

export type ChildWithMilestones = Child & {
    milestones: Milestone[];
};
