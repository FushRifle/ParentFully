import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RadioGroupProps {
    options: { label: string; value: string }[];
    selectedValue: string;
    onValueChange: (value: string) => void;
    color?: string;
    disabled?: boolean;
}

export default function RadioGroup({
    options,
    selectedValue,
    onValueChange,
    color = '#007AFF',
    disabled = false
}: RadioGroupProps) {
    return (
        <View style={styles.container}>
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[styles.option, { opacity: disabled ? 0.6 : 1 }]}
                    onPress={() => !disabled && onValueChange(option.value)}
                    disabled={disabled}
                    activeOpacity={0.7}
                >
                    <View style={[styles.radio, { borderColor: color }]}>
                        {selectedValue === option.value && (
                            <View style={[styles.radioInner, { backgroundColor: color }]} />
                        )}
                    </View>
                    <Text style={styles.label}>{option.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        flexDirection: 'row',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    label: {
        fontSize: 16,
    },
});
