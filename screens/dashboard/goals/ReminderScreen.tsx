import { CustomRepeatModal } from '@/components/Time/CustomModal';
import TimePicker, { TimePickerHandle } from '@/components/ui/TimePicker';
import { GoalBackground } from '@/constants/GoalBackground';
import { useAuth } from '@/context/AuthContext';
import { Text } from '@/context/GlobalText';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RootStackParamList } from '@/types';
import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell } from '@tamagui/lucide-icons';
import { format } from 'date-fns';
import { MotiView } from 'moti';
import React, { useMemo, useRef, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import {
    Button,
    H6,
    Spinner,
    XStack,
    YStack
} from 'tamagui';

type Reminder = {
    id?: string;
    goal_id?: string;      // optional now
    routine_id?: string;   // added for routine
    user_id: string;
    title: string;
    message: string;
    date: string;
    time: string;
    repeat: 'None' | 'Once' | 'Daily' | 'Mon-Fri' | 'Custom';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
};

type ReminderScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reminder'>;
type ReminderScreenRouteProp = RouteProp<RootStackParamList, 'Reminder'>;

const ReminderScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<ReminderScreenNavigationProp>();
    const route = useRoute<ReminderScreenRouteProp>();

    // Params
    const { goal, routine, reminderId, onSave } = route.params || {};

    const [saving, setSaving] = useState(false);
    const [repeat, setRepeat] = useState<"None" | "Once" | "Daily" | "Mon-Fri" | "Custom">("Once");
    const [customOpen, setCustomOpen] = useState(false);

    const [selectedTime, setSelectedTime] = useState("08:00:00");
    const timePickerRef = useRef<TimePickerHandle>(null);
    const repeatOptions = ["None", "Once", "Daily", "Mon-Fri", "Custom"];

    const handleRepeatPress = (item: typeof repeat) => {
        if (item === "Custom") {
            setRepeat(item);
            setCustomOpen(true);
        } else {
            setRepeat(item);
        }
    };

    const handleConfirm = async () => {
        if (!user?.id || (!goal?.id && !routine?.id)) {
            Alert.alert('Error', 'Please select a goal or routine first');
            return;
        }

        setSaving(true);
        try {
            const timeString = timePickerRef.current?.getTime24() || selectedTime;

            const reminderData: Reminder = {
                goal_id: goal?.id,
                routine_id: routine?.id,
                user_id: user.id,
                title: goal?.area || routine?.name || 'Reminder',
                message: goal
                    ? `Don't forget to work on: ${goal.goal || 'your goal'}`
                    : `Don't forget to complete your routine: ${routine?.name || 'your routine'
                    }`,
                date: format(new Date(), 'yyyy-MM-dd'),
                time: timeString,
                repeat,
                is_active: true,
            };

            if (reminderId) {
                const { error } = await supabase
                    .from('reminders')
                    .update({
                        ...reminderData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', reminderId);

                if (error) throw error;
            } else {
                const { error } = await supabase.from('reminders').insert([
                    {
                        ...reminderData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    },
                ]);

                if (error) throw error;
            }

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: `Reminder ${reminderId ? 'updated' : 'created'} successfully`,
                position: 'bottom',
            });

            onSave?.();
            navigation.goBack();
        } catch (error) {
            console.error('Error saving reminder:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to save reminder',
                position: 'bottom',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        navigation.goBack();
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
    };

    // Next occurrence preview
    const nextOccurrence = useMemo(() => {
        const now = new Date();
        const [hours, minutes] = selectedTime.split(':').map(Number);

        const occurrence = new Date();
        occurrence.setHours(hours, minutes, 0, 0);

        if (occurrence <= now) {
            occurrence.setDate(occurrence.getDate() + 1);
        }

        return occurrence;
    }, [selectedTime]);

    return (
        <GoalBackground>
            <YStack flex={1} opacity={0.95}>

                {/* Header */}
                <XStack px='$3' alignItems="center" mt='$7'>
                    <Button unstyled onPress={handleCancel} hitSlop={20} mr="$5">
                        <MaterialIcons name="arrow-back" size={20} color={colors.text} />
                    </Button>
                    <H6 fontWeight='600'>
                        Set Reminder
                    </H6>
                </XStack>

                <YStack f={1} jc="flex-start" p="$4" space="$5">
                    {/* Time Picker */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 600, delay: 100 }}
                    >
                        <YStack ai="center" width="100%" space="$3">
                            <TimePicker
                                ref={timePickerRef}
                                onChange={handleTimeChange}
                                initialHour="08"
                                initialMinute="00"
                                initialAmPm="AM"
                            />
                        </YStack>
                    </MotiView>

                    {/* Repeat Options */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 600, delay: 200 }}
                    >
                        <XStack space="$4">
                            <H6 fontWeight='600'>Repeat</H6>
                        </XStack>

                        <YStack space="$3" p="$4">
                            {repeatOptions.map((item) => (
                                <TouchableOpacity
                                    key={item}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 10,
                                        borderRadius: 8,
                                        backgroundColor: repeat === item ? "#F0FFC3" : "transparent",
                                        marginBottom: 6,
                                    }}
                                    onPress={() => handleRepeatPress(item as typeof repeat)}
                                >
                                    <Text
                                        style={{
                                            fontWeight: repeat === item ? "bold" : "normal",
                                            color: repeat === item ? "black" : "#000",
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </YStack>
                    </MotiView>

                    {/* Footer buttons */}
                    <MotiView
                        from={{ opacity: 0, translateY: 40 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 600, delay: 400 }}
                    >
                        <XStack space="$4" width="100%" mt="$1" maxWidth={400}>
                            <Button
                                f={1}
                                backgroundColor="transparent"
                                borderColor={colors.primary}
                                borderWidth={2}
                                color={colors.primary}
                                borderRadius="$4"
                                onPress={handleCancel}
                                disabled={saving}
                                height="$4"
                            >
                                Cancel
                            </Button>
                            <Button
                                f={1}
                                backgroundColor={colors.primary}
                                color={colors.onPrimary}
                                borderRadius="$4"
                                onPress={handleConfirm}
                                disabled={saving}
                                height="$4"
                                icon={saving ? undefined : <Bell size={16} />}
                            >
                                {saving ? (
                                    <Spinner color={colors.onPrimary as any} />
                                ) : (
                                    "Set Reminder"
                                )}
                            </Button>
                        </XStack>
                    </MotiView>
                </YStack>

                <CustomRepeatModal
                    open={customOpen}
                    onOpenChange={setCustomOpen}
                    setRepeat={setRepeat}
                />
            </YStack>
        </GoalBackground>
    );
};

const styles = StyleSheet.create({
    bg: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 16,
        paddingBottom: 40
    },
});

export default ReminderScreen;
