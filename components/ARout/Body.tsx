import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Bell, ChevronRight } from "@tamagui/lucide-icons";
import { TouchableOpacity, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Button, H4, Text, XStack, YStack } from "tamagui";

export const RoutineDetailsBody = ({
    mode,
    tasks,
    selectedTasks,
    activeMenu,
    toggleTask,
    setTasks,
    renderItem,
    keyExtractor,
    navigation,
    reminders,
    routineId,
    title,
    fetchReminders,
    handleAssignToChild,
    handleAddCustomRoutine,
    colors,
}: {
    mode: "view" | "reorder";
    tasks: any[];
    selectedTasks: number[];
    activeMenu: number | null;
    toggleTask: (index: number) => void;
    setTasks: (tasks: any[]) => void;
    renderItem: any;
    keyExtractor: (item: any, index: number) => string;
    navigation: any;
    reminders: any[];
    routineId: string;
    title: string;
    fetchReminders: (id: string) => void;
    handleAssignToChild: () => void;
    handleAddCustomRoutine: () => void;
    colors: any;
}) => {
    return (
        <YStack space="$4" px="$3">
            {mode === "view" && (
                <Text fontSize="$5" fontWeight="600" color={colors.text} mb="$1">
                    Select Tasks that apply to your child's routine
                </Text>
            )}

            {/* Tasks */}
            <YStack space="$2" minHeight={200} px="$2">
                {mode === "view" && tasks.length > 0 ? (
                    tasks.map((task, index) => {
                        const isSelected = selectedTasks.includes(index);
                        const isMenuOpen = activeMenu === index;

                        return (
                            <XStack
                                bg="white"
                                key={keyExtractor(task, index)}
                                onPress={() => toggleTask(index)}
                                p="$3"
                                br="$3"
                                space="$5"
                                height={76}
                                ai="center"
                                jc="space-between"
                                borderWidth={1}
                                borderColor={colors.border as any}
                                zIndex={isMenuOpen ? 1000 : 1}
                            >
                                {/* Checkbox */}
                                <TouchableOpacity onPress={() => toggleTask(index)}>
                                    <View
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 12,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: isSelected ? colors.success : "transparent",
                                            borderWidth: 2,
                                            borderColor: isSelected ? (colors.border as any) : colors.text,
                                        }}
                                    >
                                        {isSelected && (
                                            <MaterialCommunityIcons name="check" size={20} color="white" />
                                        )}
                                    </View>
                                </TouchableOpacity>

                                <MaterialCommunityIcons
                                    name={(task.icon as any) || "calendar-check"}
                                    size={22}
                                    color={colors.primary}
                                />

                                <YStack flex={1} mx="$3">
                                    <Text fontSize="$4" color="#333" numberOfLines={1}>
                                        {task.title || `Task ${index + 1}`}
                                    </Text>
                                    <Text color={colors.text}>
                                        {task.time_slot || "—"} | {task.duration_minutes || "—"} mins
                                    </Text>
                                </YStack>

                                {/* Pen Icon - Navigates to edit page */}
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("CustomTask", {
                                            task,
                                            onSave: (savedTask: any, isEditing: boolean) => {
                                                if (isEditing) {
                                                    const updatedTasks = tasks.map((t) =>
                                                        t.id === savedTask.id ? savedTask : t
                                                    );
                                                    setTasks(updatedTasks);
                                                }
                                            },
                                        })
                                    }
                                >
                                    <MaterialCommunityIcons
                                        name="pencil"
                                        size={18}
                                        color={colors.secondary as any}
                                    />
                                </TouchableOpacity>
                            </XStack>
                        );
                    })
                ) : mode !== "view" ? (
                    <DraggableFlatList
                        data={tasks}
                        onDragEnd={({ data }) => setTasks(data)}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        activationDistance={10}
                        dragItemOverflow={false}
                        nestedScrollEnabled
                        style={{ flex: 1 }}
                        ListHeaderComponent={
                            mode === "reorder" ? (
                                <Text
                                    fontSize="$5"
                                    fontWeight="600"
                                    color="#005A31"
                                    mb="$2"
                                    mt="$2"
                                    px="$1"
                                >
                                    Drag and drop to reorder tasks
                                </Text>
                            ) : null
                        }
                    />
                ) : (
                    <Text fontSize="$4" color="#777">
                        No tasks yet.
                    </Text>
                )}
            </YStack>

            {/* Reminder */}
            {mode === "view" && (
                <YStack space="$2" mt="$2" px="$1">
                    <H4 color={colors.text} fontSize="$5" fontWeight="900">
                        Reminder
                    </H4>
                    <Text fontSize="$3">When should we remind you about this routine?</Text>

                    {reminders.length > 0 ? (
                        <TouchableOpacity
                            onPress={() =>
                                navigation.navigate("Reminder", {
                                    routine: { id: routineId, title },
                                    reminderId: reminders[0]?.id,
                                    onSave: () => fetchReminders(routineId),
                                })
                            }
                        >
                            <XStack
                                mt="$3"
                                ai="center"
                                jc="space-between"
                                p="$3"
                                bg="#F9FAFB"
                                br="$4"
                                borderWidth={1}
                                borderColor="#E5E7EB"
                            >
                                <YStack>
                                    <H4 color={colors.text} fontSize="$5">
                                        {reminders[0].time.slice(0, 5)}
                                    </H4>
                                    <Text>{reminders[0].repeat}</Text>
                                </YStack>
                                <ChevronRight size={20} color={colors.text as string} />
                            </XStack>
                        </TouchableOpacity>
                    ) : (
                        <Button
                            width="100%"
                            borderColor={colors.border as any}
                            mt="$3"
                            onPress={() =>
                                navigation.navigate("Reminder", {
                                    routine: { id: routineId, title },
                                    onSave: () => fetchReminders(routineId),
                                })
                            }
                            icon={<Bell size={16} />}
                        >
                            Set Reminder
                        </Button>
                    )}
                </YStack>
            )}

            {/* Assign / Add buttons */}
            {mode === "view" && selectedTasks.length > 0 && (
                <Button
                    mt="$3"
                    size="$5"
                    bg={colors.primary}
                    color={colors.onPrimary}
                    onPress={handleAssignToChild}
                    icon={
                        <MaterialCommunityIcons
                            name="account-child-outline"
                            size={18}
                            color="white"
                        />
                    }
                >
                    Assign Routine
                </Button>
            )}

            {mode === "view" && selectedTasks.length === 0 && (
                <Button
                    mt="$3"
                    size="$5"
                    bg={colors.primary}
                    color={colors.onPrimary}
                    onPress={handleAddCustomRoutine}
                    icon={
                        <MaterialCommunityIcons
                            name="plus-circle-outline"
                            size={18}
                            color="white"
                        />
                    }
                >
                    Add Custom
                </Button>
            )}
        </YStack>
    );
};
