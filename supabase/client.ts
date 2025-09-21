import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
    global: {
        headers: {
            'X-Client-Info': 'supabase-js-react-native/2.39.8'
        }
    },
    db: {
        schema: 'public',
    },
});


export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string | null;
                    role: 'parent' | 'expert' | 'admin';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name?: string | null;
                    role?: 'parent' | 'expert' | 'admin';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string | null;
                    role?: 'parent' | 'expert' | 'admin';
                    updated_at?: string;
                };
            };
            children: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    birth_date: string; // ISO date string
                    gender: 'male' | 'female' | 'other';
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    birth_date: string;
                    gender: 'male' | 'female' | 'other';
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    name?: string;
                    birth_date?: string;
                    gender?: 'male' | 'female' | 'other';
                    updated_at?: string;
                };
            };
            milestones: {
                Row: {
                    id: string;
                    child_id: string;
                    title: string;
                    description: string | null;
                    category: 'physical' | 'cognitive' | 'social' | 'language';
                    expected_date: string; // ISO date string
                    achieved: boolean;
                    achieved_at: string | null; // ISO date string
                    media_urls: string[] | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    child_id: string;
                    title: string;
                    description?: string | null;
                    category: 'physical' | 'cognitive' | 'social' | 'language';
                    expected_date: string;
                    achieved?: boolean;
                    achieved_at?: string | null;
                    media_urls?: string[] | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    child_id?: string;
                    title?: string;
                    description?: string | null;
                    category?: 'physical' | 'cognitive' | 'social' | 'language';
                    expected_date?: string;
                    achieved?: boolean;
                    achieved_at?: string | null;
                    media_urls?: string[] | null;
                    updated_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string;
                    read: boolean;
                    type: 'milestone' | 'reminder' | 'system';
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    message: string;
                    read?: boolean;
                    type: 'milestone' | 'reminder' | 'system';
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    message?: string;
                    read?: boolean;
                    type?: 'milestone' | 'reminder' | 'system';
                };
            };
        };
        Views: {
            child_milestones_view: {
                Row: {
                    child_id: string | null;
                    child_name: string | null;
                    milestone_id: string | null;
                    milestone_title: string | null;
                    achieved: boolean | null;
                };
            };
        };
        Functions: {
            get_child_milestones: {
                Args: {
                    child_uuid: string;
                };
                Returns: {
                    milestone_id: string;
                    title: string;
                    description: string;
                    category: string;
                    expected_date: string;
                    achieved: boolean;
                    child_name: string;
                }[];
            };
            achieve_milestone: {
                Args: {
                    milestone_uuid: string;
                };
                Returns: void;
            };
            get_upcoming_milestones: {
                Args: {
                    user_uuid: string;
                    days_ahead: number;
                };
                Returns: {
                    child_id: string;
                    child_name: string;
                    milestone_id: string;
                    milestone_title: string;
                    expected_date: string;
                }[];
            };
        };
        Enums: {
            milestone_category: 'physical' | 'cognitive' | 'social' | 'language';
            user_role: 'parent' | 'expert' | 'admin';
            notification_type: 'milestone' | 'reminder' | 'system';
        };
    };
};

// Helper type for queries with relationships
export type MilestoneWithChild = Database['public']['Tables']['milestones']['Row'] & {
    child: Database['public']['Tables']['children']['Row'];
};

export type ChildWithMilestones = Database['public']['Tables']['children']['Row'] & {
    milestones: Database['public']['Tables']['milestones']['Row'][];
};

// Realtime event types
export type RealtimeEvent<T extends keyof Database['public']['Tables']> = {
    event: 'INSERT' | 'UPDATE' | 'DELETE';
    table: T;
    schema: 'public';
    record: Database['public']['Tables'][T]['Row'];
    old_record: Database['public']['Tables'][T]['Row'] | null;
};