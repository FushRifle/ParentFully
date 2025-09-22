import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

export const handleDeleteAccount = async (userId: string) => {
    try {
        // Confirm with the user
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        // Step 1: Delete user-related data from your tables (if needed)
                        await supabase.from('profiles').delete().eq('id', userId)
                        // Step 2: Delete from auth
                        const { error } = await supabase.auth.admin.deleteUser(userId)
                        if (error) throw error

                        // Optional: Log out
                        await supabase.auth.signOut()

                        // Navigate away
                        const router = useRouter()
                        router.replace('/login')

                        // Optional: Show feedback
                        alert("Account deleted successfully.")
                    },
                },
            ]
        )
    } catch (err: any) {
        console.error('Delete account failed:', err.message)
        alert('Failed to delete account. Please try again later.')
    }
}
