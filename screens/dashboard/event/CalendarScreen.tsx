import { useTheme } from '@/styles/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { FAB, Menu, Text } from 'react-native-paper';

LocaleConfig.locales['en'] = {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};
LocaleConfig.defaultLocale = 'en';

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    type: 'custody' | 'school' | 'medical' | 'other';
    notes?: string;
    shared: boolean;
}

export const CalendarScreen = ({ navigation }: { navigation: StackNavigationProp<any> }) => {
    const { colors } = useTheme();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [visibleMenu, setVisibleMenu] = useState(false);

    const markedDates = events.reduce((acc, event) => {
        acc[event.date] = {
            marked: true,
            dotColor: event.type === 'custody' ? colors.primary :
                event.type === 'school' ? colors.success :
                    event.type === 'medical' ? colors.error : colors.secondary,
            selected: event.date === selectedDate
        };
        return acc;
    }, {} as any);

    const syncWithGoogleCalendar = async () => {
        // Implementation for Google Calendar sync
    };

    const syncWithICal = async () => {
        // Implementation for iCal sync
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Calendar
                markedDates={markedDates}
                onDayPress={(day: { dateString: string }) => setSelectedDate(day.dateString)}
                theme={{
                    backgroundColor: colors.background?.toString(),
                    calendarBackground: colors.background?.toString(),
                    textSectionTitleColor: colors.text?.toString(),
                    selectedDayBackgroundColor: colors.primary?.toString(),
                    selectedDayTextColor: colors.background?.toString(),
                    todayTextColor: colors.primary?.toString(),
                    dayTextColor: colors.text?.toString(),
                    arrowColor: colors.primary?.toString(),
                    monthTextColor: colors.text?.toString(),
                    textDisabledColor: colors.textSecondary?.toString(),
                }}
            />

            <View style={styles.eventList}>
                {events.filter(e => e.date === selectedDate).map(event => (
                    <View key={event.id} style={[styles.eventItem, { borderLeftColor: colors.primary }]}>
                        <Text style={{ color: colors.text }}>{event.title}</Text>
                        <Text style={{ color: colors.textSecondary }}>{event.type}</Text>
                    </View>
                ))}
            </View>

            <Menu
                visible={visibleMenu}
                onDismiss={() => setVisibleMenu(false)}
                anchor={<FAB
                    icon="plus"
                    style={[styles.fab, { backgroundColor: colors.primary }]}
                    onPress={() => setVisibleMenu(true)}
                />}
            >
                <Menu.Item
                    leadingIcon="calendar-plus"
                    title="Add Event"
                    onPress={() => navigation.navigate('AddCalendarEvent')}
                />
                <Menu.Item
                    leadingIcon="google"
                    title="Sync Google"
                    onPress={syncWithGoogleCalendar}
                />
                <Menu.Item
                    leadingIcon="apple"
                    title="Sync iCal"
                    onPress={syncWithICal}
                />
            </Menu>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    eventList: {
        marginTop: 20
    },
    eventItem: {
        padding: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        backgroundColor: 'rgba(0,0,0,0.05)'
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    }
});