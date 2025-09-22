import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Appbar, Button, ProgressBar, useTheme as usePaperTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Define your navigation types
type RootStackParamList = {
    MilestoneList: undefined;
    MilestoneDetail: { milestoneId: string; onDelete?: () => void };
    // Add other screens here
};

type MilestoneDetailScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'MilestoneDetail'
>;

type MilestoneDetailScreenProps = {
    navigation: MilestoneDetailScreenNavigationProp;
    route: {
        params: {
            milestoneId: string;
            onDelete?: () => void;
        };
    };
};

interface MilestoneDetail {
    id: string;
    title: string;
    description?: string;
    progress: number;
    completed: boolean;
    due_date?: string;
    created_at: string;
    updated_at?: string;
}


export const MilestoneDetailScreen = ({ navigation, route }: MilestoneDetailScreenProps) => {
    const { colors } = useTheme();
    const paperTheme = usePaperTheme();
    const { milestoneId, onDelete } = route.params;
    const [milestone, setMilestone] = useState<MilestoneDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        dueDate: new Date(),
        hasDueDate: false
    });
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    useEffect(() => {
        fetchMilestone();
    }, [milestoneId]);

    const fetchMilestone = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('milestones')
                .select('*')
                .eq('id', milestoneId)
                .single();

            if (error) throw error;
            setMilestone(data);

            if (data) {
                setEditData({
                    title: data.title,
                    description: data.description || '',
                    dueDate: data.due_date ? new Date(data.due_date) : new Date(),
                    hasDueDate: !!data.due_date
                });
            }
        } catch (error) {
            console.error('Error fetching milestone:', error);
            Alert.alert('Error', 'Failed to load milestone details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProgress = async (progressDelta: number) => {
        if (!milestone) return;

        setUpdating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const newProgress = Math.min(1, Math.max(0, milestone.progress + progressDelta));

            const { data, error } = await supabase
                .from('milestones')
                .update({
                    progress: newProgress,
                    updated_at: new Date().toISOString()
                })
                .eq('id', milestoneId)
                .select();

            if (error) throw error;
            if (data) setMilestone(data[0]);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error updating progress:', error);
            Alert.alert('Error', 'Failed to update progress');
        } finally {
            setUpdating(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!milestone) return;

        setUpdating(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const updateData: any = {
                title: editData.title,
                description: editData.description || null,
                updated_at: new Date().toISOString()
            };

            if (editData.hasDueDate) {
                updateData.due_date = editData.dueDate.toISOString();
            } else {
                updateData.due_date = null;
            }

            const { data, error } = await supabase
                .from('milestones')
                .update(updateData)
                .eq('id', milestoneId)
                .select();

            if (error) throw error;
            if (data) {
                setMilestone(data[0]);
                setEditModalVisible(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Error updating milestone:', error);
            Alert.alert('Error', 'Failed to update milestone');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        try {
            const { error } = await supabase
                .from('milestones')
                .delete()
                .eq('id', milestoneId);

            if (error) throw error;

            onDelete?.();
            navigation.goBack();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Error deleting milestone:', error);
            Alert.alert('Error', 'Failed to delete milestone');
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            'Delete Milestone',
            'Are you sure you want to delete this milestone?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', onPress: handleDelete, style: 'destructive' }
            ]
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!milestone) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>Milestone not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Appbar.Header>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Milestone Details" />
                <Appbar.Action
                    icon="pencil"
                    onPress={() => setEditModalVisible(true)}
                    color={String(colors.primary)}
                />
                <Appbar.Action
                    icon="delete"
                    onPress={confirmDelete}
                    color={paperTheme.colors.error}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>{milestone.title}</Text>

                {milestone.description && (
                    <Text style={[styles.description, { color: colors.text }]}>
                        {milestone.description}
                    </Text>
                )}

                <View style={styles.progressContainer}>
                    <Text style={[styles.progressLabel, { color: colors.text }]}>
                        Progress: {Math.round(milestone.progress * 100)}%
                    </Text>
                    <ProgressBar
                        progress={milestone.progress}
                        color={milestone.completed ? String(colors.success) : String(colors.primary)}
                        style={styles.progressBar}
                    />
                </View>

                {milestone.due_date && (
                    <View style={styles.dateContainer}>
                        <Icon name="event" size={20} color={colors.textSecondary} />
                        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                            Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}
                        </Text>
                    </View>
                )}

                <View style={styles.dateContainer}>
                    <Icon name="calendar-today" size={20} color={colors.textSecondary} />
                    <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                        Created: {format(new Date(milestone.created_at), 'MMM dd, yyyy')}
                    </Text>
                </View>

                <View style={styles.buttonGroup}>
                    <Button
                        mode="contained"
                        onPress={() => handleUpdateProgress(0.1)}
                        disabled={milestone.completed || updating}
                        loading={updating}
                        style={styles.button}
                    >
                        Add 10%
                    </Button>
                    <Button
                        mode="contained"
                        onPress={() => handleUpdateProgress(0.25)}
                        disabled={milestone.completed || updating}
                        loading={updating}
                        style={styles.button}
                    >
                        Add 25%
                    </Button>
                    <Button
                        mode="contained"
                        onPress={() => handleUpdateProgress(1)}
                        disabled={milestone.completed || updating}
                        loading={updating}
                        style={styles.button}
                    >
                        Complete
                    </Button>
                </View>
            </ScrollView>

            <Modal
                visible={editModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Appbar.Header>
                            <Appbar.BackAction onPress={() => setEditModalVisible(false)} />
                            <Appbar.Content title="Edit Milestone" />
                        </Appbar.Header>

                        <ScrollView contentContainerStyle={styles.modalScrollContent}>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        color: colors.text,
                                        borderColor: typeof colors.border === 'string' ? colors.border : undefined
                                    }
                                ]}
                                placeholder="Title"
                                placeholderTextColor={colors.textSecondary}
                                value={editData.title}
                                onChangeText={(text) => setEditData({ ...editData, title: text })}
                            />

                            <TextInput
                                style={[styles.textArea, {
                                    color: colors.text,
                                    borderColor: typeof colors.border === 'string' ? colors.border : undefined,
                                    backgroundColor: colors.surface
                                }]}
                                placeholder="Description (optional)"
                                placeholderTextColor={colors.textSecondary}
                                value={editData.description}
                                onChangeText={(text) => setEditData({ ...editData, description: text })}
                                multiline
                                numberOfLines={4}
                            />

                            <View style={styles.dateToggleContainer}>
                                <Text style={[styles.dateToggleLabel, { color: colors.text }]}>
                                    Set due date:
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setEditData({ ...editData, hasDueDate: !editData.hasDueDate })}
                                    style={styles.toggleButton}
                                >
                                    <Icon
                                        name={editData.hasDueDate ? 'toggle-on' : 'toggle-off'}
                                        size={24}
                                        color={editData.hasDueDate ? colors.primary : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {editData.hasDueDate && (
                                <View style={styles.datePickerContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateButton,
                                            {
                                                borderColor:
                                                    typeof colors.border === 'string'
                                                        ? colors.border
                                                        : undefined
                                            }
                                        ]}
                                        onPress={() => setDatePickerOpen(true)}
                                    >
                                        <Text style={{ color: colors.text }}>
                                            {format(editData.dueDate, 'MMM dd, yyyy')}
                                        </Text>
                                    </TouchableOpacity>
                                    <DatePicker
                                        modal
                                        open={datePickerOpen}
                                        date={editData.dueDate}
                                        mode="date"
                                        onConfirm={(date) => {
                                            setDatePickerOpen(false);
                                            setEditData({ ...editData, dueDate: date });
                                        }}
                                        onCancel={() => setDatePickerOpen(false)}
                                    />
                                </View>
                            )}

                            <Button
                                mode="contained"
                                onPress={handleSaveEdit}
                                loading={updating}
                                disabled={!editData.title.trim()}
                                style={styles.saveButton}
                            >
                                Save Changes
                            </Button>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 24,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressLabel: {
        fontSize: 16,
        marginBottom: 8,
    },
    progressBar: {
        height: 10,
        borderRadius: 5,
        marginBottom: 8,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateText: {
        fontSize: 16,
        marginLeft: 8,
    },
    buttonGroup: {
        marginTop: 24,
    },
    button: {
        marginBottom: 12,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 8,
        overflow: 'hidden',
    },
    modalScrollContent: {
        padding: 20,
    },
    input: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        height: 120,
        textAlignVertical: 'top',
    },
    dateToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateToggleLabel: {
        fontSize: 16,
        marginRight: 8,
    },
    toggleButton: {
        padding: 8,
    },
    datePickerContainer: {
        marginBottom: 24,
    },
    dateButton: {
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        alignItems: 'center',
    },
    saveButton: {
        marginTop: 16,
    },
});

export default MilestoneDetailScreen;