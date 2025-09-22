import { useTheme } from '@/styles/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Button, RadioButton, Switch, Text, TextInput } from 'react-native-paper';


export const AddCalendarEventScreen = ({
    navigation,
}: {
    navigation: StackNavigationProp<any>;
}) => {
    const { colors } = useTheme();

    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date());
    const [type, setType] = useState<'custody' | 'school' | 'medical' | 'other'>('custody');
    const [notes, setNotes] = useState('');
    const [inviteeEmail, setInviteeEmail] = useState('');
    const [setReminder, toggleSetReminder] = useState(false);
    const [requestChange, toggleRequestChange] = useState(false);
    const [syncExternal, toggleSyncExternal] = useState(false);
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    const saveEvent = () => {
        const event = {
            title,
            date: date.toISOString(),
            type,
            notes,
            inviteeEmail,
            reminder: setReminder,
            requestChange,
            syncExternal,
        };

        console.log('Saving event:', event);

        // Save event logic here (e.g., Supabase or Firebase)
        // Optionally trigger calendar sync API call

        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TextInput
                label="Event Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />

            <Button
                mode="outlined"
                onPress={() => setDatePickerOpen(true)}
                style={styles.dateButton}
            >
                {date.toLocaleDateString()}
            </Button>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Type</Text>
            <RadioButton.Group onValueChange={(v) => setType(v as any)} value={type}>
                <RadioButton.Item label="Custody" value="custody" />
                <RadioButton.Item label="School" value="school" />
                <RadioButton.Item label="Medical" value="medical" />
                <RadioButton.Item label="Other" value="other" />
            </RadioButton.Group>

            <TextInput
                label="Notes (Optional)"
                value={notes}
                onChangeText={setNotes}
                multiline
                style={[styles.input, styles.notesInput]}
            />

            <TextInput
                label="Invite Email (Optional)"
                value={inviteeEmail}
                onChangeText={setInviteeEmail}
                style={styles.input}
                keyboardType="email-address"
            />

            <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Set Reminder</Text>
                <Switch value={setReminder} onValueChange={toggleSetReminder} />
            </View>

            <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Request Schedule Change</Text>
                <Switch value={requestChange} onValueChange={toggleRequestChange} />
            </View>

            <View style={styles.switchRow}>
                <Text style={{ color: colors.text }}>Sync with Google Calendar / iCal</Text>
                <Switch value={syncExternal} onValueChange={toggleSyncExternal} />
            </View>

            <Button
                mode="contained"
                onPress={saveEvent}
                disabled={!title}
                style={styles.saveButton}
            >
                Save Event
            </Button>
            {datePickerOpen && (
                <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    onChange={(_, selectedDate) => {
                        setDatePickerOpen(false);
                        if (selectedDate) {
                            setDueDate(selectedDate);
                        }
                    }}
                />
            )}

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    input: {
        marginBottom: 16,
    },
    dateButton: {
        marginBottom: 16,
        padding: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    notesInput: {
        height: 100,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 8,
    },
    saveButton: {
        marginTop: 16,
    },
});
