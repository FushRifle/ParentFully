export type RoutineTask = {
    id: string;
    child_id: string;
    title: string;
    description: string;
    is_completed: boolean;
    time_slot: string;
    created_at: string;
    updated_at?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

export type RoutineTaskInput = Omit<RoutineTask, 'id' | 'created_at' | 'is_completed'> & {
    is_completed?: boolean;
};


export type RoutineTemplate = {
    id: string;
    name: string;
    ageRange: string;
    description?: string;
    tasks: (string | TemplateTask)[];
    notes?: string;
    isPreloaded?: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    categories?: string[];
};

export type RoutineSection = {
    id: string;
    name: string;
    timeSlot: string;
    tasks: RoutineTask[];
    isExpanded: boolean;
    icon?: string;
    color?: string;
};

export type RoutineDayPlan = {
    id: string;
    child_id: string;
    date: string;
    sections: RoutineSection[];
    notes?: string;
    completed_tasks?: number;
    total_tasks?: number;
    created_at: string;
    updated_at?: string;
};

export type RoutineStats = {
    completion_rate: number;
    most_productive_time: string;
    most_common_category: string;
    average_duration: number;
};

export type TemplateTask = {
    name: string;
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};
