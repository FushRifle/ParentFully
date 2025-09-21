import { supabase } from '@/supabase/client';
import i18n from './i18n';

const fetchUserLanguage = async (userId: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('language')
        .eq('id', userId)
        .single();

    if (!error && data?.language) {
        i18n.changeLanguage(data.language);
    }
};