
export type UserProfile = {
    id: string;
    name: string;
    email: string;
    username: string;
    role: string;
    avatar_url?: string | null
    notificationsEnabled: boolean;
    darkMode: boolean;
    family_id?: string;
};

export type FamilyMember = {
    id: string;
    name: string;
    email: string;
    relationship: string;
    avatar?: string | { uri: string };
};

export type CoParentData = {
    name: string;
    email: string;
    relation: string;
};

export type Child = {
    id: string;
    name: string;
    age?: string;
    avatar?: string | { uri: string };
    parent_id: string;
    developmentstage: string;
};

export type SupabaseUser = {
    id: string;
    full_name: string | null;
    email: string;
    username: string | null;
    role: string | null;
    avatar_url: string | null;
    notifications_enabled: boolean | null;
    dark_mode: boolean | null;
    family_id: string | null;
};