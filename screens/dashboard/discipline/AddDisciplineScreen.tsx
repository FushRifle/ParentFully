import { GoalBackground } from "@/constants/GoalBackground";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Modal, ScrollView, TouchableOpacity } from "react-native";
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
    View,
    XStack,
    YStack,
} from "tamagui";

type Props = NativeStackScreenProps<RootStackParamList, "AddDiscipline">;

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

type Child = {
    id: string;
    name: string;
    photo?: string;
    age?: number;
};

export default function AddDisciplineScreen({ navigation }: Props) {
    const { colors } = useTheme();

    // Local state
    const [planName, setPlanName] = useState("");
    const [description, setDescription] = useState("");
    const [ruleSets, setRuleSets] = useState<RuleSet[]>([
        { rule: "", consequence: "", notes: "" },
    ]);
    const [isEditing, setIsEditing] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Children
    const [children, setChildren] = useState<Child[]>([]);
    const [childrenLoading, setChildrenLoading] = useState(false);
    const [childrenError, setChildrenError] = useState<string | null>(null);
    const [assignSheetOpen, setAssignSheetOpen] = useState(false);
    const [selectedChildren, setSelectedChildren] = useState<Child[]>([]);

    // Fetch children
    useEffect(() => {
        const fetchChildren = async () => {
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
                    .select("id, name, age, photo")
                    .eq("user_id", userId);

                if (error) throw error;
                setChildren((data as Child[]) ?? []);
            } catch (err: any) {
                console.error("Error fetching children:", err?.message ?? err);
                setChildrenError("Failed to load children");
            } finally {
                setChildrenLoading(false);
            }
        };
        fetchChildren();
    }, []);

    const handleUpdateRuleSet = (
        index: number,
        field: keyof RuleSet,
        value: string
    ) => {
        const updated = [...ruleSets];
        updated[index][field] = value;
        setRuleSets(updated);
    };

    const addRuleSet = () => {
        setRuleSets([...ruleSets, { rule: "", consequence: "", notes: "" }]);
    };

    // Save discipline plan
    const saveDisciplinePlan = async (childId: string) => {
        try {
            const { data: userRes, error: userErr } = await supabase.auth.getUser();
            if (userErr) throw userErr;
            const userId = userRes.user?.id;
            if (!userId) throw new Error("User not found");

            const { error } = await supabase.from("discipline_plans").insert([
                {
                    user_id: userId,
                    child_id: childId,
                    name: planName,
                    description,
                    rules: ruleSets,
                    is_preloaded: false,
                },
            ]);

            if (error) throw error;
        } catch (err: any) {
            console.error("❌ Failed to save:", err?.message ?? err);
        }
    };

    // Child Item Component
    const ChildItem = ({
        child,
        isSelected,
        onToggle,
    }: {
        child: Child;
        isSelected: boolean;
        onToggle: () => void;
    }) => (
        <XStack
            p="$3"
            br="$3"
            height={70}
            ai="center"
            space="$5"
            borderWidth={1}
            borderColor={isSelected ? colors.primary : colors.border as any}
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
                <Text
                    color={isSelected ? "black" : colors.text}
                    fontSize="$5"
                    fontWeight="600"
                >
                    {child.name}
                </Text>
                {child.age !== undefined && (
                    <Text color={isSelected ? "black" : colors.text} fontSize="$4">
                        {child.age} y/o
                    </Text>
                )}
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
                    {isSelected && (
                        <MaterialCommunityIcons name="check" size={14} color="white" />
                    )}
                </View>
            </TouchableOpacity>
        </XStack>
    );

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }}>
                <YStack space="$4" p="$4">
                    {/* Header */}
                    <YStack space="$4" mt="$7">
                        <XStack space="$4" ai="center">
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                            </TouchableOpacity>
                            <Text fontSize="$7" fontWeight="700" color={colors.text}>
                                Add Discipline Plan
                            </Text>
                        </XStack>
                    </YStack>

                    <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={15}
                        keyboardOpeningTime={0}
                        style={{ flex: 1 }}
                    >
                        {/* Plan Fields */}
                        <YStack>
                            <Text fontSize="$5" mt="$3" mb="$1" color="#444">
                                Plan Name
                            </Text>
                            <Input
                                size="$5"
                                value={planName}
                                backgroundColor="white"
                                onChangeText={setPlanName}
                                editable={isEditing}
                            />

                            <Text fontSize="$5" mt="$3" mb="$1" color="#444">
                                Description
                            </Text>
                            <Input
                                size="$5"
                                backgroundColor="white"
                                value={description}
                                onChangeText={setDescription}
                                editable={isEditing}
                            />
                        </YStack>

                        {/* Rules */}
                        <XStack ai="center" jc="space-between" mt="$5" mb="$1">
                            <Text fontSize="$6" fontWeight="600" color="#444">
                                Rules Set
                            </Text>
                            <Button size="$3" bg="#FFE6C8" borderRadius={9999} onPress={addRuleSet}>
                                <Text color={colors.primary} fontWeight="700">
                                    + Add Rule
                                </Text>
                            </Button>
                        </XStack>

                        {ruleSets.map((ruleItem, index) => (
                            <Card
                                key={index}
                                p="$4"
                                mb="$4"
                                borderRadius="$6"
                                bordered
                                backgroundColor="white"
                            >
                                <YStack space="$3">
                                    <View space="$2">
                                        <Text color="green" fontSize="$5" fontWeight="700">
                                            Rules
                                        </Text>
                                        <Input
                                            borderWidth={1}
                                            borderColor={colors.border as any}
                                            value={ruleItem.rule}
                                            editable={isEditing}
                                            onChangeText={(text) =>
                                                handleUpdateRuleSet(index, "rule", text)
                                            }
                                        />
                                    </View>

                                    <View space="$2">
                                        <Text color="red" fontSize="$5" fontWeight="700">
                                            Consequences
                                        </Text>
                                        <Input
                                            borderWidth={1}
                                            borderColor={colors.border as any}
                                            value={ruleItem.consequence}
                                            editable={isEditing}
                                            onChangeText={(text) =>
                                                handleUpdateRuleSet(index, "consequence", text)
                                            }
                                        />
                                    </View>

                                    <View space="$2">
                                        <Text color="blue" fontSize="$5" fontWeight="700">
                                            Parent Notes
                                        </Text>
                                        <Input
                                            borderWidth={1}
                                            borderColor={colors.border as any}
                                            value={ruleItem.notes}
                                            editable={isEditing}
                                            numberOfLines={4}
                                            height={90}
                                            onChangeText={(text) =>
                                                handleUpdateRuleSet(index, "notes", text)
                                            }
                                        />
                                    </View>
                                </YStack>
                            </Card>
                        ))}
                    </KeyboardAwareScrollView>

                    {/* Save */}
                    <Button
                        mt="$6"
                        mb='$9'
                        size="$5"
                        borderRadius="$4"
                        backgroundColor={colors.primary}
                        onPress={() => setAssignSheetOpen(true)}
                    >
                        <Text color="white" fontWeight="700">
                            Save and Assign Plan
                        </Text>
                    </Button>
                </YStack>
            </ScrollView>

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
                    <H4>Assign Discipline Plan</H4>
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
                                <YStack space="$3">
                                    {children.map((child) => {
                                        const isSelected = selectedChildren.some(
                                            (c) => c.id === child.id
                                        );
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
      for (const child of selectedChildren) {
        await saveDisciplinePlan(child.id)
      }
      setAssignSheetOpen(false)
      setSelectedChildren([])
      setShowSuccessModal(true)

      // 👇 navigate back after saving & closing
      navigation.goBack()
    } catch (err: any) {
      console.error("❌ Failed to assign:", err?.message ?? err)
    }
  }}
>
  <Text color="white">Done</Text>
</Button>
                    </ScrollView>
                </Sheet.Frame>
            </Sheet>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            padding: 20,
                            borderRadius: 10,
                            alignItems: "center",
                            width: "80%",
                        }}
                    >
                        <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
                        <Text fontSize={18} fontWeight="bold" marginVertical={10}>
                            Discipline Plan Assigned Successfully!
                        </Text>
                        <Button
                            mt="$4"
                            bg={colors.primary}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text color="white" fontWeight="700">
                                OK
                            </Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        </GoalBackground>
    );
}
