import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
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

    const [isEditing, setIsEditing] = useState(false);
    const [assignSheetOpen, setAssignSheetOpen] = useState(false);
    const [children, setChildren] = useState<Child[]>([]);
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);
    const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);

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

    const handleUpdateRuleSet = (
        index: number,
        field: keyof RuleSet,
        value: string
    ) =>
        setRuleSets((prev) =>
            prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
        );

    const saveDisciplinePlan = async (plan: DisciplinePlan) => {
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

        if (error) {
            console.error("❌ Failed to save discipline plan:", error.message);
            throw error;
        }
        return data;
    };

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }}>
                <YStack space="$4" p="$4">
                    {/* Header */}
                    <XStack space="$4" mt="$7" ai="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                        </TouchableOpacity>
                        <Text fontSize="$7" fontWeight="700" color={colors.text}>
                            {name}
                        </Text>
                    </XStack>
                    <Text fontSize="$5" color="#555">
                        Review and Customise
                    </Text>

                    <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={5}
                        keyboardOpeningTime={0}
                        style={{ flex: 1 }}
                    >
                        {/* Editable Plan Name */}
                        <Text fontSize="$5" mt="$3" mb="$2" color="#444">
                            Plan Name
                        </Text>
                        <Input defaultValue={name} size="$5" editable={isEditing} />

                        {/* Rules Set */}
                        <XStack ai="center" jc="space-between" mt="$5" mb="$2">
                            <Text fontSize="$6" fontWeight="600" color="#444">
                                Rules Set
                            </Text>
                            {isEditing && (
                                <Button
                                    size="$3"
                                    bg="#FFE6C8"
                                    onPress={handleAddRuleSet}
                                    borderRadius={9999}
                                >
                                    <Text color={colors.primary} fontWeight="700">
                                        + Add Rule
                                    </Text>
                                </Button>
                            )}
                        </XStack>

                        {ruleSets.map((ruleItem, index) => (
                            <Card
                                key={index}
                                p="$4"
                                mb="$4"
                                borderRadius="$6"
                                bordered
                                backgroundColor="white"
                                borderColor={colors.border as any}
                            >
                                <YStack space="$5">
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
                                        onChangeText={(text) =>
                                            handleUpdateRuleSet(index, "consequence", text)
                                        }
                                    />
                                    <Field
                                        label="Parent Notes"
                                        color="blue"
                                        value={ruleItem.notes}
                                        editable={isEditing}
                                        isMultiline
                                        onChangeText={(text) =>
                                            handleUpdateRuleSet(index, "notes", text)
                                        }
                                    />
                                </YStack>
                            </Card>
                        ))}
                    </KeyboardAwareScrollView>

                    {/* Buttons */}
                    <XStack space="$3" jc="space-between" mt="$6" mb='$9'>
                        <Button
                            flex={1}
                            size="$5"
                            borderRadius="$4"
                            borderColor={colors.primary}
                            backgroundColor="transparent"
                            onPress={() => setIsEditing(!isEditing)}
                        >
                            <Text color="#FF8C00" fontWeight="700">
                                {isEditing ? "Done" : "Customize"}
                            </Text>
                        </Button>
                        <Button
                            flex={1}
                            size="$5"
                            borderRadius="$4"
                            backgroundColor={colors.primary}
                            onPress={() => {
                                fetchChildren();
                                setAssignSheetOpen(true);
                            }}
                        >
                            <Text color="white" fontWeight="700">
                                Save and Assign
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
                                                name,
                                                description,
                                                rules: ruleSets,
                                                is_preloaded: false,
                                            });
                                        }

                                        setAssignSheetOpen(false);
                                        setSelectedChildren([]);
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
        <Text color={color} fontSize="$5" fontWeight="700">
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
            <Text color={isSelected ? "black" : colors.text} fontSize="$5" fontWeight="600">
                {child.name}
            </Text>
            <Text color={isSelected ? "black" : colors.text} fontSize="$4">
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

