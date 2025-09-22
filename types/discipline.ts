export type DisciplinePlan = {
    id: string;
    child_id: string;
    name: string;
    strategy: string;
    consequences: string;
    rewards: string;
    notes: string;
    ageRange?: string;

};

export type DisciplineTemplate = {
    id: string;
    name: string;
    strategy: string;
    consequences: string;
    rewards: string;
    notes: string;
    ageRange?: string;
    isPreloaded?: boolean;
};