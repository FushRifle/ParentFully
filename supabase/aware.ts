import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

let supabaseClient: SupabaseClient;

export const getSupabase = async () => {
    if (!supabaseClient) {
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

        supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
            }
        });

        // Initialize storage auth with current session
        const session = await supabaseClient.auth.getSession();
        // No need to manually set storage auth; supabase-js v2 handles this internally.
    }

    return supabaseClient;
};