import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Modal, PixelRatio, ScrollView, TouchableOpacity } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Avatar } from "react-native-paper";
import {
    Button,
    Card,
    Fieldset,
    H4,
    Input,
    Label,
    Sheet,
    Spinner,
    Text,
    TextArea,
    View,
    XStack,
    YStack,
} from "tamagui";
import { v4 as uuidv4 } from "uuid";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BASE_WIDTH = 390; // iPhone 12 width
const BASE_HEIGHT = 844;

type Props = NativeStackScreenProps<RootStackParamList, "DisciplineDetails">;

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

type DisciplinePlan = {
    id?: string;
    user_id: string;
    child_id?: string;
    name: string;
    description?: string;
    strategy?: string;
    consequences?: string;
    rewards?: string;
    notes?: string;
    icon?: string;
    age_range?: string;
    is_preloaded?: boolean;
    rules: RuleSet[];
};

type Child = {
    id: string;
    age?: string;
    name: string;
    photo?: string | null;
};

export default function DisciplineDetailsScreen({ navigation }: Props) {
    const { colors } = useTheme();
    const route = useRoute<Props["route"]>();
    const { id, name, description, rules } = route.params;

    const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
    const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;
    const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
    const scaleFont = (size: number) => Math.round(PixelRatio.roundToNearestPixel(scale(size)));

    const [isEditing, setIsEditing] = useState(false);
    const [assignSheetOpen, setAssignSheetOpen] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [children, setChildren] = useState<Child[]>([]);
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);
    const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);
    const [planName, setPlanName] = useState(name);

    // ✅ Normalize rules into RuleSet[]
    const [ruleSets, setRuleSets] = useState<RuleSet[]>(() =>
        Array.isArray(rules)
            ? rules.map((r: any) =>
                typeof r === "string"
                    ? { rule: r, consequence: "", notes: "" }
                    : r
            )
            : []
    );

    // Set editing mode if we're editing an existing plan
    useEffect(() => {
        if (id) {
            setIsEditing(true);
        }
    }, [id]);

    const fetchChildren = useCallback(async () => {
        try {
            setChildrenLoading(true);
            setChildrenError(null);
            const { data: userRes, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;

            const userId = userRes.user?.id;
            if (!userId) {
                setChildren([]);
                return;
            }

            const { data, error } = await supabase
                .from("children")
                .select("id, name, photo, age")
                .eq("user_id", userId)

            if (error) throw error;
            setChildren((data as Child[]) ?? []);
        } catch (err: any) {
            console.error("Error fetching children:", err?.message ?? err);
            setChildrenError("Failed to load children");
        } finally {
            setChildrenLoading(false);
        }
    }, []);

    const handleAddRuleSet = () =>
        setRuleSets((prev) => [...prev, { rule: "", consequence: "", notes: "" }]);

    const handleRemoveRuleSet = (index: number) => {
        if (ruleSets.length <= 1) return; // Don't remove the last rule
        setRuleSets((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpdateRuleSet = (
        index: number,
        field: keyof RuleSet,
        value: string
    ) =>
        setRuleSets((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );

    const saveDisciplinePlan = async (plan: DisciplinePlan) => {
        try {
            // If we're editing an existing plan
            if (id) {
                const { data, error } = await supabase
                    .from("discipline_plans")
                    .update({
                        name: plan.name,
                        description: plan.description ?? "",
                        rules: plan.rules,
                    })
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                return data;
            } else {
                // Creating a new plan
                const { data, error } = await supabase
                    .from("discipline_plans")
                    .insert([
                        {
                            id: plan.id ?? uuidv4(),
                            user_id: plan.user_id,
                            child_id: plan.child_id ?? null,
                            name: plan.name,
                            description: plan.description ?? "",
                            strategy: plan.strategy ?? "",
                            consequences: plan.consequences ?? "",
                            rewards: plan.rewards ?? "",
                            notes: plan.notes ?? "",
                            icon: plan.icon ?? "book",
                            age_range: plan.age_range ?? "",
                            is_preloaded: plan.is_preloaded ?? false,
                            rules: plan.rules,
                        },
                    ])
                    .select()
                    .single();

                if (error) throw error;
                return data;
            }
        } catch (error) {
            console.error("❌ Failed to save discipline plan:", error);
            throw error;
        }
    };

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }}>
                <YStack space="$4" p="$4">
                    {/* Header */}
                    <XStack space="$4" mt="$5" mb='$3' ai="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                        </TouchableOpacity>
                        <Text fontSize="$5" fontWeight="700" color={colors.text}>
                            {isEditing ? "Edit Plan" : name}
                        </Text>
                    </XStack>
                    <Text fontSize="$4" color="#555">
                        {isEditing ? "Edit your plan details" : "Review and Customise"}
                    </Text>

                    <KeyboardAwareScrollView
                        enableOnAndroid
                        extraScrollHeight={5}
                        keyboardOpeningTime={0}
                        style={{ flex: 1 }}
                    >
                        {/* Editable Plan Name */}
                        <Text fontSize="$3" mt="$3" mb="$2" color="#444">
                            Plan Name
                        </Text>
                        <Input
                            value={planName}
                            size="$4"
                            editable={isEditing}
                            onChangeText={setPlanName}
                        />

                        {/* Rules Set */}
                        <XStack ai="center" jc="space-between" mt="$5" mb="$2">
                            <Text fontSize="$3" fontWeight="600" color="#444">
                                Rules Set
                            </Text>
                            {isEditing && (
                                <Button
                                    size="$2"
                                    bg="#FFE6C8"
                                    onPress={handleAddRuleSet}
                                    borderRadius={9999}
                                >
                                    <Text color={colors.primary} fontWeight="700" fontSize='$2'>
                                        + Add Rule
                                    </Text>
                                </Button>
                            )}
                        </XStack>

                        {ruleSets.map((ruleItem, index) => (
                            <Card
                                key={index}
                                p={moderateScale(10)}      // reduced padding
                                mb={moderateScale(10)}     // reduced margin
                                borderRadius={moderateScale(12)}
                                bordered
                                backgroundColor="white"
                                borderColor={colors.border as any}
                            >
                                <YStack space={moderateScale(8)}>
                                    {isEditing && (
                                        <XStack jc="flex-end">
                                            <TouchableOpacity onPress={() => handleRemoveRuleSet(index)}>
                                                <MaterialCommunityIcons
                                                    name="close-circle"
                                                    size={moderateScale(20)}
                                                    color="#ff6b6b"
                                                />
                                            </TouchableOpacity>
                                        </XStack>
                                    )}

                                    <Field
                                        label="Rules"
                                        color="green"
                                        value={ruleItem.rule}
                                        editable={isEditing}
                                        onChangeText={(text) => handleUpdateRuleSet(index, "rule", text)}
                                    />

                                    <Field
                                        label="Consequences"
                                        color="red"
                                        value={ruleItem.consequence}
                                        editable={isEditing}
                                        onChangeText={(text) => handleUpdateRuleSet(index, "consequence", text)}
                                    />

                                    <Field
                                        label="Parent Notes"
                                        color="blue"
                                        value={ruleItem.notes}
                                        editable={isEditing}
                                        isMultiline
                                        onChangeText={(text) => handleUpdateRuleSet(index, "notes", text)}
                                    />
                                </YStack>

                            </Card>
                        ))}
                    </KeyboardAwareScrollView>

                    {/* Buttons */}
                    <XStack space="$3" jc="space-between" mt="$6" mb='$9'>
                        {!isEditing && (
                            <Button
                                flex={1}
                                size="$5"
                                borderRadius="$4"
                                borderColor={colors.primary}
                                backgroundColor="transparent"
                                onPress={() => setIsEditing(true)}
                            >
                                <Text color="#FF8C00" fontWeight="700">
                                    Customize
                                </Text>
                            </Button>
                        )}
                        {isEditing && (
                            <Button
                                flex={1}
                                size="$5"
                                borderRadius="$4"
                                borderColor={colors.primary}
                                backgroundColor="transparent"
                                onPress={() => setIsEditing(false)}
                            >
                                <Text color="#FF8C00" fontWeight="700">
                                    Cancel
                                </Text>
                            </Button>
                        )}
                        <Button
                            flex={1}
                            size="$5"
                            borderRadius="$4"
                            backgroundColor={colors.primary}
                            onPress={() => {
                                if (isEditing) {
                                    // Save changes first
                                    // In a real app, you would save the changes to the database here
                                    setIsEditing(false);
                                } else {
                                    fetchChildren();
                                    setAssignSheetOpen(true);
                                }
                            }}
                        >
                            <Text color="white" fontWeight="700">
                                {isEditing ? "Save Changes" : "Save and Assign"}
                            </Text>
                        </Button>
                    </XStack>
                </YStack>

                {/* Assign Routine Sheet */}
                <Sheet
                    open={assignSheetOpen}
                    onOpenChange={setAssignSheetOpen}
                    snapPoints={[65, 50]}
                    modal
                    dismissOnSnapToBottom
                    animation="medium"
                >
                    <Sheet.Overlay enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
                    <Sheet.Handle />
                    <Sheet.Frame p="$4" space="$4">
                        <H4>Assign Routine</H4>
                        <ScrollView>
                            <Fieldset space="$3">
                                <Label>Choose children</Label>
                                {childrenLoading ? (
                                    <XStack ai="center" space="$2" py="$2">
                                        <Spinner size="small" />
                                        <Text>Loading children…</Text>
                                    </XStack>
                                ) : childrenError ? (
                                    <Text color="red">{childrenError}</Text>
                                ) : children.length === 0 ? (
                                    <Text color="#666">No children found.</Text>
                                ) : (
                                    <YStack space="$2">
                                        {children.map((child) => {
                                            const isSelected = selectedChildren.some((c) => c.id === child.id);
                                            return (
                                                <ChildItem
                                                    key={child.id}
                                                    child={child}
                                                    isSelected={isSelected}
                                                    onToggle={() =>
                                                        setSelectedChildren((prev) =>
                                                            isSelected
                                                                ? prev.filter((c) => c.id !== child.id)
                                                                : [...prev, child]
                                                        )
                                                    }
                                                    colors={colors}
                                                />
                                            );
                                        })}
                                    </YStack>
                                )}
                            </Fieldset>

                            <Button
                                size="$5"
                                mt="$4"
                                bg={colors.primary}
                                disabled={selectedChildren.length === 0}
                                onPress={async () => {
                                    try {
                                        const { data: userRes, error: userErr } = await supabase.auth.getUser();
                                        if (userErr) throw userErr;
                                        const userId = userRes.user?.id;

                                        if (!userId) throw new Error("User not found");

                                        for (const child of selectedChildren) {
                                            await saveDisciplinePlan({
                                                user_id: userId,
                                                child_id: child.id,
                                                name: planName,
                                                description,
                                                rules: ruleSets,
                                                is_preloaded: false,
                                            });
                                        }

                                        setAssignSheetOpen(false);
                                        setSelectedChildren([]);
                                        setSuccessModalVisible(true);
                                    } catch (err: any) {
                                        console.error("❌ Failed to assign:", err?.message ?? err);
                                    }
                                }}
                            >
                                <Text color="white">Done</Text>
                            </Button>

                        </ScrollView>
                    </Sheet.Frame>
                </Sheet>

                {/* Success Modal */}
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={successModalVisible}
                    onRequestClose={() => {
                        setSuccessModalVisible(false);
                        navigation.goBack();
                    }}
                >
                    <View flex={1} jc="center" ai="center" bg="rgba(0,0,0,0.5)">
                        <View bg="white" p="$6" borderRadius="$4" width="80%" ai="center">
                            <MaterialCommunityIcons name="check-circle" size={50} color={colors.success} />
                            <Text fontSize="$4" fontWeight="700" mt="$3" mb="$2">
                                Plan Assigned Successfully!
                            </Text>
                            <Text textAlign="center" color="#666" mb="$4">
                                Your discipline plan has been successfully assigned to the selected children.
                            </Text>
                            <Button
                                width="100%"
                                bg={colors.primary}
                                onPress={() => {
                                    setSuccessModalVisible(false);
                                    navigation.goBack();
                                }}
                            >
                                <Text color="white" fontWeight="700">Done</Text>
                            </Button>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </GoalBackground>
    );
}

const Field = ({
    label,
    color,
    value,
    editable,
    isMultiline,
    onChangeText,
}: {
    label: string;
    color: string;
    value: string;
    editable: boolean;
    isMultiline?: boolean;
    onChangeText: (text: string) => void;
}) => (
    <View space="$2">
        <Text color={color} fontSize="$4" fontWeight="700">
            {label}
        </Text>
        {isMultiline ? (
            <TextArea
                borderWidth={1}
                borderColor="#ddd"
                value={value}
                editable={editable}
                numberOfLines={4}
                onChangeText={onChangeText}
            />
        ) : (
            <Input
                borderWidth={1}
                borderColor="#ddd"
                value={value}
                editable={editable}
                onChangeText={onChangeText}
            />
        )}
    </View>
);

const ChildItem = ({
    child,
    isSelected,
    onToggle,
    colors,
}: {
    child: Child;
    isSelected: boolean;
    onToggle: () => void;
    colors: any;
}) => (
    <XStack
        p="$3"
        br="$3"
        height={70}
        ai="center"
        space="$5"
        borderWidth={1}
        borderColor={isSelected ? colors.primary : colors.border}
    >
        <Avatar.Image
            source={
                child.photo
                    ? { uri: child.photo, cache: "force-cache" }
                    : require("@/assets/images/profile.jpg")
            }
            size={54}
        />
        <YStack>
            <Text color={isSelected ? "black" : colors.text} fontSize="$3" fontWeight="600">
                {child.name}
            </Text>
            <Text color={isSelected ? "black" : colors.text} fontSize="$3">
                {child.age} y/o
            </Text>
        </YStack>
        <TouchableOpacity onPress={onToggle} style={{ marginLeft: "auto" }}>
            <View
                w={22}
                h={22}
                br={12}
                ai="center"
                jc="center"
                bg={isSelected ? colors.success : "transparent"}
                borderWidth={2}
                borderColor={isSelected ? colors.success : colors.text}
            >
                {isSelected && <MaterialCommunityIcons name="check" size={14} color="white" />}
            </View>
        </TouchableOpacity>
    </XStack>
);