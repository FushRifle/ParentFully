import { Select, XStack, YStack } from 'tamagui';

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = [
    { name: 'January', value: 0 },
    { name: 'February', value: 1 },
    { name: 'March', value: 2 },
    { name: 'April', value: 3 },
    { name: 'May', value: 4 },
    { name: 'June', value: 5 },
    { name: 'July', value: 6 },
    { name: 'August', value: 7 },
    { name: 'September', value: 8 },
    { name: 'October', value: 9 },
    { name: 'November', value: 10 },
    { name: 'December', value: 11 },
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

export const ChildBirthDateField = ({
    birthDate,
    onDateChange,
}: {
    birthDate: Date;
    onDateChange: (date: Date) => void;
}) => {
    const updateDate = (type: 'day' | 'month' | 'year', value: number) => {
        const newDate = new Date(birthDate);
        if (type === 'day') newDate.setDate(value);
        if (type === 'month') newDate.setMonth(value);
        if (type === 'year') newDate.setFullYear(value);
        onDateChange(newDate);
    };

    return (
        <YStack space="$3">
            <XStack space="$2">
                <YStack flex={1}>
                    <Select
                        value={birthDate.getDate().toString()}
                        onValueChange={(val) => updateDate('day', parseInt(val))}
                    >
                        <Select.Trigger>
                            <Select.Value placeholder="Day" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Viewport>
                                {days.map((day) => (
                                    <Select.Item key={day} index={0} value={day.toString()}>
                                        <Select.ItemText>{day}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select>
                </YStack>

                <YStack flex={1}>
                    <Select
                        value={birthDate.getMonth().toString()}
                        onValueChange={(val) => updateDate('month', parseInt(val))}
                    >
                        <Select.Trigger>
                            <Select.Value placeholder="Month" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Viewport>
                                {months.map((month) => (
                                    <Select.Item key={month.value} index={0} value={month.value.toString()}>
                                        <Select.ItemText>{month.name}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select>
                </YStack>

                <YStack flex={1}>
                    <Select
                        value={birthDate.getFullYear().toString()}
                        onValueChange={(val) => updateDate('year', parseInt(val))}
                    >
                        <Select.Trigger>
                            <Select.Value placeholder="Year" />
                        </Select.Trigger>
                        <Select.Content>
                            <Select.Viewport>
                                {years.map((year) => (
                                    <Select.Item key={year} index={0} value={year.toString()}>
                                        <Select.ItemText>{year}</Select.ItemText>
                                    </Select.Item>
                                ))}
                            </Select.Viewport>
                        </Select.Content>
                    </Select>
                </YStack>
            </XStack>
        </YStack>
    );
};