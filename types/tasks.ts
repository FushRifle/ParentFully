export type TaskTemplate = {
    id: string
    title: string;
    description: string;
    due_date: string;
    assignee: string;
};

export type FamilyTask = {
    id: string;
    child_id: string;
    title: string;
    description: string;
    due_date: string;
    assignee: string;
    is_completed: boolean;
    created_at: string;
};