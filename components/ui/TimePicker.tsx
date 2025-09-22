// components/TimePicker.tsx
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { View } from "react-native";
import WheelPickerExpo from "react-native-wheel-picker-expo";

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));
const ampmOptions = ["AM", "PM"];

export type TimePickerHandle = {
    getTime: () => { hour: string; minute: string; ampm: string };
    getTime24: () => string;
};

type TimePickerProps = {
    initialHour?: string;
    initialMinute?: string;
    initialAmPm?: string;
    onChange?: (time: string) => void;
};

const TimePicker = forwardRef<TimePickerHandle, TimePickerProps>(({
    initialHour = "08",
    initialMinute = "00",
    initialAmPm = "AM",
    onChange
}, ref) => {
    const [hour, setHour] = useState(initialHour);
    const [minute, setMinute] = useState(initialMinute);
    const [ampm, setAmPm] = useState(initialAmPm);

    useImperativeHandle(ref, () => ({
        getTime: () => ({ hour, minute, ampm }),
        getTime24: () => {
            let hour24 = parseInt(hour);
            if (ampm === "PM" && hour24 !== 12) hour24 += 12;
            if (ampm === "AM" && hour24 === 12) hour24 = 0;
            return `${hour24.toString().padStart(2, '0')}:${minute}:00`;
        }
    }));

    const handleHourChange = (item: { value: string }) => {
        setHour(item.value);
        if (onChange) {
            let hour24 = parseInt(item.value);
            if (ampm === "PM" && hour24 !== 12) hour24 += 12;
            if (ampm === "AM" && hour24 === 12) hour24 = 0;
            onChange(`${hour24.toString().padStart(2, '0')}:${minute}:00`);
        }
    };

    const handleMinuteChange = (item: { value: string }) => {
        setMinute(item.value);
        if (onChange) {
            let hour24 = parseInt(hour);
            if (ampm === "PM" && hour24 !== 12) hour24 += 12;
            if (ampm === "AM" && hour24 === 12) hour24 = 0;
            onChange(`${hour24.toString().padStart(2, '0')}:${item.value}:00`);
        }
    };

    const handleAmPmChange = (item: { value: string }) => {
        setAmPm(item.value);
        if (onChange) {
            let hour24 = parseInt(hour);
            if (item.value === "PM" && hour24 !== 12) hour24 += 12;
            if (item.value === "AM" && hour24 === 12) hour24 = 0;
            onChange(`${hour24.toString().padStart(2, '0')}:${minute}:00`);
        }
    };

    return (
        <View style={{ position: "relative", width: "100%", height: 230 }}>
            {/* Background overlay */}
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "transparent",
                    borderRadius: 12,
                }}
            />

            {/* Pickers on top */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: 1,
                }}
            >
                {/* Hour Picker */}
                <WheelPickerExpo
                    height={200}
                    width={100}
                    initialSelectedIndex={hours.indexOf(hour)}
                    items={hours.map((h) => ({ label: h, value: h }))}
                    onChange={({ item }) => handleHourChange(item)}
                    backgroundColor="transparent"
                />

                {/* Minute Picker */}
                <WheelPickerExpo
                    height={200}
                    width={120}
                    initialSelectedIndex={minutes.indexOf(minute)}
                    items={minutes.map((m) => ({ label: m, value: m }))}
                    onChange={({ item }) => handleMinuteChange(item)}
                    backgroundColor="transparent"
                />

                {/* AM/PM Picker */}
                <WheelPickerExpo
                    height={200}
                    width={100}
                    initialSelectedIndex={ampmOptions.indexOf(ampm)}
                    items={ampmOptions.map((ap) => ({ label: ap, value: ap }))}
                    onChange={({ item }) => handleAmPmChange(item)}
                    backgroundColor="transparent"
                />
            </View>
        </View>
    );

});

TimePicker.displayName = "TimePicker";

export default TimePicker;