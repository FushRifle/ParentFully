import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ChevronDown, Clock, Plus, ShieldCheck } from '@tamagui/lucide-icons';
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Button,
    Card,
    Input,
    ScrollView,
    Text,
    XStack,
    YStack
} from 'tamagui';

type Task = {
    id: number;
    title: string;
    icon?: string;
    duration: string;
    time?: string;
};

type AddRoutineScreenRouteProp = RouteProp<
    RootStackParamList,
    "AddRoutine"
>;

const CreateCustomRoutineScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth()
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(false)

    const [savedRoutineId, setSavedRoutineId] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);

    const route = useRoute<AddRoutineScreenRouteProp>();
    const params = route.params ?? {};
    const tasksFromParams = (params as any).tasks ?? [];
    const [routineName, setRoutineName] = useState('');
    const [routineDescription, setRoutineDescription] = useState('');
    const [tasks, setTasks] = useState<Task[]>(
        Array.isArray(tasksFromParams) && tasksFromParams.length > 0
            ? tasksFromParams.map((task: any, index: number) =>
                typeof task === "string"
                    ? { id: index, title: task, duration: '5' }
                    : { id: index, title: task.title || '', duration: task.duration || '5' }
            )
            : [{ id: Date.now(), title: '', duration: '5' }]
    );
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [completedTasks, setCompletedTasks] = useState<Task[]>([]);

    // Format time for display
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const convertTo24HourFormat = (time: string) => {
        const [rawHour, rawMinutePart] = time.split(':');
        let hour = parseInt(rawHour, 10);
        let minute = parseInt(rawMinutePart, 10);

        // Check if AM/PM exists
        const ampmMatch = time.match(/(am|pm)/i);
        if (ampmMatch) {
            const ampm = ampmMatch[1].toLowerCase();
            if (ampm === 'pm' && hour < 12) hour += 12;
            if (ampm === 'am' && hour === 12) hour = 0;
        }

        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
    };

    const addTask = () => {
        const currentTask = tasks[0];
        if (!currentTask || currentTask.title.trim() === '') {
            return;
        }

        const newCompletedTask = {
            ...currentTask,
            id: Date.now(),
            time: formatTime(selectedTime)
        };

        setCompletedTasks([...completedTasks, newCompletedTask]);
        setTasks([{ id: Date.now() + 1, title: '', duration: '5' }]);
        setShowSuccessModal(true);

        setTimeout(() => {
            setShowSuccessModal(false);
        }, 2000);
    };

    const removeTask = (id: number) => {
        setCompletedTasks(completedTasks.filter(task => task.id !== id));
    };

    const updateTaskName = (id: number, title: string) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, title } : task
        ));
    };

    const updateTaskDuration = (id: number, duration: string) => {
        if (!/^\d*$/.test(duration)) return;

        setTasks(tasks.map(task =>
            task.id === id ? { ...task, duration } : task
        ));
    };

    const handleTimeChange = (event: any, time?: Date) => {
        setShowTimePicker(false);
        if (time) {
            setSelectedTime(time);
        }
    };

    const handleSave = async () => {
        if (!user?.id) {
            Alert.alert("Error", "You must be logged in to save a routine.");
            return;
        }

        if (completedTasks.length === 0) {
            Alert.alert("Error", "Please add at least one task to save the routine.");
            return;
        }

        try {
            setLoading(true);

            // Calculate average time and duration from completed tasks
            const times = completedTasks.map(task => task.time).filter(Boolean) as string[];
            const durations = completedTasks.map(task => parseInt(task.duration) || 5);

            const averageTime = times.length > 0 ? times[0] : '09:00 AM';
            const averageDuration = durations.reduce((sum, dur) => sum + dur, 0) / durations.length;

            // Step 1️⃣: Insert routine
            const { data: insertedRoutine, error: routineError } = await supabase
                .from("routine_templates")
                .insert({
                    name: routineName,
                    description: routineDescription,
                    is_preloaded: false,
                    user_id: user.id,
                    time_slot: convertTo24HourFormat(averageTime),
                    duration_minutes: Math.round(averageDuration),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .select()
                .single(); // Get the inserted routine with its ID

            if (routineError || !insertedRoutine) throw routineError || new Error("Failed to create routine");

            const routineId = insertedRoutine.id;

            // Step 2️⃣: Insert tasks linked to this routine
            const tasksToInsert = completedTasks.map(task => ({
                title: task.title,
                icon: task.icon || 'checkbox-blank-circle-outline',
                time_slot: task.time ? convertTo24HourFormat(task.time) : '09:00:00',
                duration_minutes: parseInt(task.duration) || 5,
                routine_id: routineId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }));

            const { error: tasksError } = await supabase
                .from("routine_template_tasks")
                .insert(tasksToInsert);

            if (tasksError) throw tasksError;

            setSavedRoutineId(routineId);
            setShowCelebration(true);

        } catch (err: any) {
            console.error("Save routine error:", err);
            Alert.alert("Error", err.message || "Could not save routine.");
        } finally {
            setLoading(false);
        }
    };

    const handlePress = async () => {
        try {
            await handleSave();
        } catch (err) {
            console.error("Save routine error:", err);
        }
    };

    const currentTask = tasks.length > 0 ? tasks[0] : null;

    return (
        <GoalBackground>
            {/* Header */}
            <SafeAreaView style={{ backgroundColor: colors.secondary }}>
                <XStack
                    ai="center"
                    jc="flex-start"
                    width="100%"
                    paddingTop="$4"
                    paddingBottom="$4"
                    px="$3"
                    space='$3'
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                    >
                        <MaterialCommunityIcons
                            name={"arrow-left"}
                            size={26}
                            color="white"
                        />
                    </TouchableOpacity>
                    <Text color={colors.onPrimary} fontSize='$7'>Create Custom Routine</Text>
                </XStack>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>

                {/* Routine Name */}
                <YStack marginBottom='$4' mt='$2'>
                    <Text color={colors.text} fontSize='$6' fontWeight="600" mb='$4'>
                        Build a structured day for your child
                    </Text>
                    <YStack>
                        <Text color={colors.text} fontSize='$5' fontWeight="900" mb='$2'>
                            Routine Name
                        </Text>
                        <Card
                            flex={1}
                            padding="$3"
                            borderRadius="$2"
                            width='100%'
                            height={56}
                            backgroundColor={colors.card}
                        >
                            <Input
                                backgroundColor={colors.card}
                                borderColor={colors.border as any}
                                color={colors.text}
                                padding={0}
                                fontSize={16}
                                value={routineName}
                                borderWidth={0}
                                onChangeText={setRoutineName}
                                placeholder="Enter routine name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </Card>
                    </YStack>

                    <YStack mt='$3'>
                        <Text color={colors.text} fontSize='$5' fontWeight="900" mb='$2'>
                            Routine Description
                        </Text>
                        <Card
                            flex={1}
                            padding="$3"
                            borderRadius="$2"
                            width='100%'
                            backgroundColor={colors.card}
                        >
                            <Input
                                backgroundColor={colors.card}
                                borderColor={colors.border as any}
                                color={colors.text}
                                padding={0}
                                fontSize={16}
                                value={routineDescription}
                                borderWidth={0}
                                onChangeText={setRoutineDescription}
                                placeholder="Enter routine description"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </Card>
                    </YStack>
                </YStack>

                <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={5}
                    keyboardOpeningTime={0}
                    style={{ flex: 1 }}
                >
                    {/* Add Task */}
                    <YStack>
                        <Text color={colors.text} fontSize="$5" fontWeight="900" mb='$2'>
                            Add Tasks
                        </Text>

                        {currentTask && (
                            <XStack key={currentTask.id} mb='$2' space="$2" alignItems="center">
                                {/* Task Name Input */}
                                <Card
                                    flex={1}
                                    padding="$3"
                                    borderRadius="$2"
                                    height={56}
                                    width={213}
                                    backgroundColor={colors.card}
                                >
                                    <Input
                                        color={colors.text}
                                        fontSize={16}
                                        value={currentTask.title}
                                        onChangeText={(text) => updateTaskName(currentTask.id, text)}
                                        placeholder="Task Name"
                                        placeholderTextColor={colors.textSecondary}
                                        backgroundColor="transparent"
                                        borderColor={colors.border as any}
                                        borderWidth={0}
                                        padding={0}
                                    />
                                </Card>

                                {/* Duration Card */}
                                <Card
                                    padding="$2"
                                    borderRadius="$2"
                                    height={56}
                                    backgroundColor="white"
                                    width={161}
                                >
                                    <XStack alignItems="center" justifyContent="center" space="$2" flex={1}>
                                        {/* Decrement button */}
                                        <TouchableOpacity
                                            onPress={() =>
                                                updateTaskDuration(
                                                    currentTask.id,
                                                    Math.max(1, parseInt(currentTask.duration || "5") - 1).toString()
                                                )
                                            }
                                            style={{
                                                width: 32,
                                                height: 32,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text color={colors.text} fontSize={18}>-</Text>
                                        </TouchableOpacity>

                                        {/* Duration Display */}
                                        <XStack alignItems="center" space="$1">
                                            <Text color={colors.text} fontSize={16} fontWeight="600">
                                                {currentTask.duration || "5"}
                                            </Text>
                                            <Text color={colors.textSecondary} fontSize={14}>
                                                min
                                            </Text>
                                        </XStack>

                                        {/* Increment button */}
                                        <TouchableOpacity
                                            onPress={() =>
                                                updateTaskDuration(
                                                    currentTask.id,
                                                    (parseInt(currentTask.duration || "5") + 1).toString()
                                                )
                                            }
                                            style={{
                                                width: 32,
                                                height: 32,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text color={colors.text} fontSize={18}>+</Text>
                                        </TouchableOpacity>
                                    </XStack>
                                </Card>

                            </XStack>
                        )}

                        {/* Time Picker */}
                        <YStack marginBottom={24} mt='$3'>
                            <Text color={colors.text} fontSize={16} fontWeight="600" mb='$2'>
                                Time
                            </Text>

                            <Card
                                flex={1}
                                padding="$3"
                                height={56}
                                borderRadius="$2"
                                width='100%'
                                backgroundColor={colors.card}
                            >
                                <Button
                                    backgroundColor={colors.card}
                                    borderColor='transparent'
                                    borderWidth={1}
                                    borderRadius={8}
                                    padding={12}
                                    flexDirection="row"
                                    alignItems="center"
                                    onPress={() => setShowTimePicker(true)}
                                    unstyled
                                >
                                    <Clock size={20} color={colors.primary as any} />
                                    <Text flex={1} color={colors.text} marginLeft={12} fontSize={16}>
                                        {formatTime(selectedTime)}
                                    </Text>
                                    <ChevronDown size={20} color={colors.textSecondary} />
                                </Button>
                            </Card>

                            {showTimePicker && (
                                <DateTimePicker
                                    value={selectedTime}
                                    mode="time"
                                    is24Hour={false}
                                    display="default"
                                    onChange={handleTimeChange}
                                />
                            )}
                        </YStack>

                        {/* Add Task Button */}
                        <Button
                            backgroundColor={colors.primary}
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius={8}
                            padding={12}
                            onPress={addTask}
                            unstyled
                            marginTop={8}
                            opacity={!currentTask || currentTask.title.trim() === '' ? 0.5 : 1}
                        >
                            <Plus size={20} color="white" />
                            <Text color="white" marginLeft={8} fontWeight="600">
                                Add Task
                            </Text>
                        </Button>
                    </YStack>
                </KeyboardAwareScrollView>

                {/* Success Modal */}
                <Modal
                    visible={showSuccessModal}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0,0,0,0.5)'
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            alignItems: 'center',
                            width: '80%'
                        }}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={50}
                                color="#4CAF50"
                            />
                            <Text fontSize={18} fontWeight="bold" marginVertical={10}>
                                Task Added Successfully!
                            </Text>
                        </View>
                    </View>
                </Modal>

                {/* Added Tasks Summary */}
                <YStack mb='$3' mt='$5'>
                    <XStack jc='space-between' mb='$4'>
                        <Text color={colors.text} fontSize='$6' fontWeight="700" mb='$1'>
                            Added Tasks
                        </Text>
                        <Text
                            bg="#DDDDDD"
                            width={74}
                            height={24}
                            color="#333"
                            fontSize='$3'
                            fontWeight="600"
                            br={99}
                            textAlign="center"
                        >
                            {completedTasks.length} Tasks
                        </Text>
                    </XStack>

                    {completedTasks.length === 0 ? (
                        <YStack
                            alignItems="center"
                            padding={24}
                            borderRadius={8}
                            backgroundColor="rgba(0,0,0,0.05)"
                        >
                            <ShieldCheck
                                width={56}
                                height={61}
                                size='$7'
                                color='#72706F'
                            />

                            <Text color={colors.textSecondary} fontSize={16} fontWeight="500" marginBottom={4}>
                                No Task Added yet
                            </Text>
                            <Text color={colors.textSecondary} fontSize={14} textAlign="center">
                                Add your first task above to get started
                            </Text>
                        </YStack>
                    ) : (
                        <Card
                            padding="$3"
                            borderRadius="$3"
                            width="100%"
                            backgroundColor={colors.card}
                            mb="$4"
                        >
                            <YStack borderRadius={8} overflow="hidden">
                                {completedTasks.map((task, index) => (
                                    <XStack
                                        key={task.id}
                                        alignItems="center"
                                        justifyContent="space-between"
                                        paddingVertical="$2"
                                        borderBottomWidth={index < completedTasks.length - 1 ? 1 : 0}
                                        borderBottomColor="rgba(0,0,0,0.1)"
                                    >
                                        {/* Index */}
                                        <LinearGradient
                                            colors={["#005A31", "#9FCC16"]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 14,
                                                marginRight: 15,
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Text color="white" fontWeight="600" fontSize='$8'>
                                                {index + 1}
                                            </Text>
                                        </LinearGradient>

                                        {/* Title + Duration */}
                                        <YStack flex={1} mr="$2" space='$2'>
                                            <Text color={colors.text} fontSize={16} fontWeight="600">
                                                {task.title || `Task ${index + 1}`}
                                            </Text>
                                            {task.duration && (
                                                <Text color={colors.textSecondary} fontSize={14}>
                                                    {task.time} | {task.duration} min
                                                </Text>
                                            )}
                                        </YStack>

                                        {/* Action icons */}
                                        <XStack space="$4">
                                            {/* Edit button */}
                                            <TouchableOpacity onPress={() => console.log("Edit", task.id)}>
                                                <XStack
                                                    width={32}
                                                    height={32}
                                                    borderRadius={16}
                                                    bg='#F3F3F3'
                                                    justifyContent="center"
                                                    alignItems="center"
                                                >
                                                    <MaterialCommunityIcons name="pencil" size={18} color={colors.text} />
                                                </XStack>
                                            </TouchableOpacity>

                                            {/* Delete button */}
                                            <TouchableOpacity onPress={() => removeTask(task.id)}>
                                                <XStack
                                                    width={32}
                                                    height={32}
                                                    borderRadius={16}
                                                    bg='#FFE4E4'
                                                    justifyContent="center"
                                                    alignItems="center"
                                                >
                                                    <MaterialCommunityIcons name="delete" size={18} color="red" />
                                                </XStack>
                                            </TouchableOpacity>
                                        </XStack>
                                    </XStack>
                                ))}
                            </YStack>
                        </Card>
                    )}
                </YStack>

                {/* Buttons */}
                <XStack justifyContent="space-between" marginTop={16}>
                    <Button
                        flex={1}
                        borderColor={colors.primary as any}
                        borderWidth={1}
                        borderRadius={8}
                        padding={16}
                        marginRight={12}
                        onPress={() => navigation.goBack()}
                        unstyled
                    >
                        <Text color={colors.text} textAlign='center' fontSize={16} fontWeight="600">
                            Cancel
                        </Text>
                    </Button>

                    <Button
                        flex={1}
                        backgroundColor={colors.primary}
                        borderRadius={8}
                        padding={16}
                        marginLeft={12}
                        disabled={loading || completedTasks.length === 0}
                        opacity={(loading || completedTasks.length === 0) ? 0.6 : 1}
                        onPress={handlePress}
                        unstyled
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text color="white" textAlign="center" fontSize={16} fontWeight="600">
                                Save Routine
                            </Text>
                        )}
                    </Button>
                </XStack>
            </ScrollView>

            <Modal
                visible={showCelebration}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCelebration(false)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 20,
                    }}
                >
                    <YStack
                        bg="white"
                        p="$5"
                        br="$6"
                        width="90%"
                        height={385}
                        ai="center"
                        space="$4"
                    >
                        <MaterialCommunityIcons
                            name="party-popper"
                            size={56}
                            color={colors.primary}
                        />
                        <Text fontSize="$8" fontWeight="700" color={colors.text}>
                            🎉 Routine Created!
                        </Text>
                        <Text fontSize="$7" ta="center" color={colors.text}>
                            {routineName} has been successfully created
                        </Text>

                        <Button
                            bg={colors.primary}
                            color="white"
                            width='100%'
                            size='$5'
                            mt='$5'
                            br="$4"
                            onPress={() => {
                                setShowCelebration(false);
                                navigation.navigate("Routine", { routineId: savedRoutineId });
                            }}                        >
                            View Routine
                        </Button>
                    </YStack>
                </View>
            </Modal>
        </GoalBackground>
    );
};

export default CreateCustomRoutineScreen;