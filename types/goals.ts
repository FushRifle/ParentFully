export type Goal = {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    priority?: 'low' | 'medium' | 'high';
    area: string; goal: string;
    measurable?: string; achievable?: string; relevant?:
    string; time_bound?: string; is_default?: boolean;
    created_at?: string; updated_at?: string;
    is_active?: boolean; user_id?: string; age_group?: string;
    celebration?: string; progress?: number; is_edited?: boolean; is_selected?: boolean;
    reminders?: boolean;
    reminder_id?: string;
    notes?: string; timeframe?: string; target_date?: string;
}

export type Child = {
    id: string
    name: string
    photo: string | null
}

export type Reward = {
    name: string
    notes: string
}

export type SmartFields = {
    measurable: string
    achievable: string
    relevant: string
}

export type CoreValue = {
    id: string;
    title: string;
    description: string;
    icon: string; iconComponent: React.ComponentType<any>;
    color: string;
    iconColor: string;
    age_group?: string
}