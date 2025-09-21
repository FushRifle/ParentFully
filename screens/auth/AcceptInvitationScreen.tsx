import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AcceptInvitationScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [invitation, setInvitation] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkInvitation = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('family_invitations')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;
                if (!data) throw new Error('Invitation not found');
                if (data.status !== 'pending') throw new Error('Invitation already processed');

                setInvitation(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        checkInvitation();
    }, [id]);

    const handleAccept = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase.rpc('accept_family_invitation', {
                invitation_id: id
            });

            if (error) throw error;

            Alert.alert(
                'Success',
                'You have been added to the family account!',
                [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
            );
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to accept invitation');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.error, { color: colors.text }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={() => router.replace('/(auth)')}
                >
                    <Text style={styles.buttonText}>Return to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Accept Invitation' }} />
            <ScrollView
                contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        You've been invited!
                    </Text>
                    <Text style={[styles.message, { color: colors.text }]}>
                        {invitation.message || 'Join this family account'}
                    </Text>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: colors.primary }]}
                        onPress={handleAccept}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Accept Invitation</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        justifyContent: 'center'
    },
    content: {
        alignItems: 'center'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    message: {
        fontSize: 16,
        marginBottom: 32,
        textAlign: 'center'
    },
    error: {
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center'
    },
    button: {
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 24,
        alignItems: 'center',
        minWidth: 200
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    }
});