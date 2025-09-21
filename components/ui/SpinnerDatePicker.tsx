import DateTimePicker, {
    AndroidNativeProps,
    DateTimePickerEvent,
    IOSNativeProps
} from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Label, Text } from 'tamagui';

type DateTimePickerMode = 'date' | 'time' | 'datetime';

const SpinnerDateTimePicker = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [show, setShow] = useState<boolean>(false);
    const [mode] = useState<DateTimePickerMode>('datetime');
    const [display] = useState<'spinner'>('spinner');

    const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        // Always close the picker on Android
        if (Platform.OS === 'android') {
            setShow(false);
        }

        // Handle dismissal on Android
        if (event.type === 'dismissed') {
            return;
        }

        // Update date if one was selected
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const showPicker = () => {
        setShow(true);
    };

    const commonProps: AndroidNativeProps & IOSNativeProps = {
        value: date,
        mode: mode === 'datetime' ? 'date' : mode,
        display,
        onChange,
        minimumDate: new Date(2020, 0, 1),
        maximumDate: new Date(2030, 11, 31),
    };

    return (
        <View style={{ padding: 20 }}>
            <Label fontWeight="bold">Target Date</Label>
            <Button onPress={showPicker} theme="active">
                {Platform.OS === 'ios' ? 'Show Date Picker' : 'Pick Date'}
            </Button>
            <Text fontSize="$4" marginTop="$2">
                Selected: {date.toLocaleString()}
            </Text>

            {show && (
                <DateTimePicker
                    {...commonProps}
                    style={Platform.OS === 'ios' ? { height: 200 } : undefined}
                    themeVariant="light"
                />
            )}
        </View>
    );
};

export default SpinnerDateTimePicker;