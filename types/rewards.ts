import { ReactNode } from "react";

// @/types/rewards.ts
export interface Reward {
    claimed: any;
    image: ReactNode;
    name: ReactNode;
    pointsRequired: number;
    id: string;
    user_id: string;
    title: string;
    description: string;
    icon: string;
    created_at: string;
    milestone_id?: string;
    project_id?: string;
    seen: boolean;
    points_value: number;
}


export interface ChildPoints {
    currentPoints: number;
    totalPointsEarned: number;
    stickers: string[];
}