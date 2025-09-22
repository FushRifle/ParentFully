import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from 'react-native-paper';

type CompletedRoutinesModalProps = {
    visible: boolean;
    onClose: () => void;
    childId: string;
};

type RoutineTask = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
    activity: string;
    completed: boolean;
    child_id: string;
};

export const CompletedRoutinesModal = ({ visible, onClose, childId }: CompletedRoutinesModalProps) => {
    const { colors } = useTheme();
    const [completedRoutines, setCompletedRoutines] = useState<RoutineTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCompletedRoutines = async () => {
            if (!visible) return;

            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('routine_tasks')
                    .select('*')
                    .eq('child_id', childId)
                    .eq('is_completed', true)
                    .order('updated_at', { ascending: false });

                if (error) throw error;

                setCompletedRoutines(data || []);
            } catch (error) {
                console.error('Error fetching completed routines:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedRoutines();
    }, [visible, childId]);

    return (
        <Modal
            isVisible={visible}
            onBackdropPress={onClose}
            backdropOpacity={0.7}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            style={styles.modal}
        >
            <View style={[styles.container, { backgroundColor: colors.surface }]}>
                <Text style={[styles.title, { color: colors.text }]}>Completed Routines</Text>

                {loading ? (
                    <Text style={{ color: colors.text }}>Loading...</Text>
                ) : completedRoutines.length > 0 ? (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {completedRoutines.map((routine) => (
                            <View
                                key={routine.id}
                                style={[
                                    styles.routineItem,
                                    { borderColor: typeof colors.border === 'string' ? colors.border : undefined }
                                ]}
                            >
                                <Text style={[styles.routineText, { color: colors.text }]}>
                                    {routine.title}
                                </Text>
                                <Text style={[styles.completedDate, { color: colors.textSecondary }]}>
                                    Completed on: {new Date(routine.updated_at).toLocaleDateString()}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={[styles.emptyText, { color: colors.text }]}>
                        No completed routines yet
                    </Text>
                )}

                <Button
                    mode="contained"
                    onPress={onClose}
                    style={styles.closeButton}
                    labelStyle={{ color: colors.onPrimary }}
                >
                    Close
                </Button>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    scrollContent: {
        paddingBottom: 15,
    },
    routineItem: {
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    routineText: {
        fontSize: 16,
        marginBottom: 5,
    },
    completedDate: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    emptyText: {
        textAlign: 'center',
        marginVertical: 20,
    },
    closeButton: {
        marginTop: 15,
        borderRadius: 8,
    },
});