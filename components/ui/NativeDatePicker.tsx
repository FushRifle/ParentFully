import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Button, Text } from 'tamagui';

const NativeDatePicker = () => {
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate) setDate(selectedDate);
    };

    return (
        <View style={{ padding: 16 }}>
            <Button onPress={() => setShowPicker(true)}>
                Pick Date
            </Button>

            <Text fontSize="$4" marginTop="$2">
                Selected: {date.toDateString()}
            </Text>

            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChange}
                    minimumDate={new Date(2000, 0, 1)}
                    maximumDate={new Date(2030, 11, 31)}
                />
            )}
        </View>
    );
};

export default NativeDatePicker;
