import { PRELOADED_DISCIPLINE } from '@/constants/Discipline';
import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from '@/context/AuthContext';
import { Text } from '@/context/GlobalText';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, Modal, PixelRatio, ScrollView, TouchableOpacity } from "react-native";
import { Button, Card, H4, H6, Spinner, View, XStack, YStack } from "tamagui";
import { v4 as uuidv4 } from 'uuid';

type DisciplineDetailsScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "Discipline"
>;

type DisciplineTemplate = {
    id: string;
    name: string;
    description: string;
    strategy?: string;
    consequences?: string;
    rewards?: string;
    notes?: string;
    icon?: string;
    rules?: RuleSet[];
    ageRange?: string;
    isPreloaded?: boolean;
    user_id?: string;
};

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

const DisciplineScreen = () => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation<DisciplineDetailsScreenNavigationProp>();

    // Screen scaling helpers
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')
    const BASE_WIDTH = 390
    const BASE_HEIGHT = 844

    const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size
    const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size
    const moderateScale = (size: number, factor = 0.5) =>
        size + (scale(size) - size) * factor
    const scaleFont = (size: number) => Math.round(PixelRatio.roundToNearestPixel(scale(size)))

    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [myPlans, setMyPlans] = useState<DisciplineTemplate[]>([]);
    const [templates, setTemplates] = useState<DisciplineTemplate[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [allPlans, setAllPlans] = useState<DisciplineTemplate[]>([]);
    const [childName] = useState("My Child");

    const fetchUserPlans = useCallback(async () => {
        if (!user?.id) return [];
        try {
            const { data, error } = await supabase
                .from('discipline_plans')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching user plans:", err);
            return [];
        }
    }, [user?.id]);

    const fetchTemplates = useCallback(async () => {
        if (!user?.id) return PRELOADED_DISCIPLINE;
        try {
            const { data, error } = await supabase
                .from('discipline_templates')
                .select('*')
                .eq('user_id', user.id);
            if (error) throw error;
            return [...(data || []), ...PRELOADED_DISCIPLINE];
        } catch (err) {
            console.error("Error fetching templates:", err);
            return PRELOADED_DISCIPLINE;
        }
    }, [user?.id]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [plans, tpls] = await Promise.all([fetchUserPlans(), fetchTemplates()]);
            setMyPlans(plans);
            setTemplates(tpls);
            setAllPlans([...plans, ...tpls.filter(t => t.isPreloaded)]);
        } catch (err) {
            console.error(err);
            setError("Failed to load discipline plans and templates");
        } finally {
            setLoading(false);
        }
    }, [fetchUserPlans, fetchTemplates]);

    useEffect(() => { loadData(); }, [loadData]);

    const createUserPlanFromTemplate = useCallback(async (tpl: DisciplineTemplate) => {
        if (!user?.id) return;

        try {
            const newPlan = {
                ...tpl,
                id: uuidv4(),
                isPreloaded: false,
                user_id: user.id
            };

            const { error } = await supabase
                .from('discipline_plans')
                .insert([newPlan]);

            if (error) throw error;

            setMyPlans(prev => [...prev, newPlan]);
            Alert.alert("Copied", "Predefined plan copied to your plans for editing.");

            return newPlan;
        } catch (err) {
            console.error("Error copying template to user plan:", err);
            Alert.alert("Error", "Failed to copy plan.");
        }
    }, [user?.id]);

    const handlePlanPress = (tpl: any, isUserPlan: boolean) => {
        if (selectedIds.length > 0) {
            handleSelectPlan(tpl.id);
            return;
        }

        navigation.navigate("DisciplineDetails", {
            id: tpl.id,
            name: tpl.name,
            description: tpl.description,
            rules: tpl.rules || [],
            icon: tpl.icon || "calendar-check",
        });
    };

    const handleSelectPlan = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleDownloadPlan = () => {
        if (selectedIds.length === 0) return;
        Alert.alert("Download Plan", `Downloading ${selectedIds.length} selected plan(s)...`);
    };

    const handlePrintSelectedPlans = () => {
        if (selectedIds.length === 0) return;
        const selectedPlans = [...myPlans, ...templates].filter((p) =>
            selectedIds.includes(p.id)
        );

        navigation.navigate("Print", {
            allPlans: JSON.stringify(selectedPlans),
            childName,
        });
    };

    const handlePrintAllPlans = (plans: DisciplineTemplate[], childName: string) => {
        if (!plans || plans.length === 0) return;

        navigation.navigate("Print", {
            allPlans: JSON.stringify(plans),
            childName,
        });
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setShowOptions(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        try {
            // Check if it's a user plan (not preloaded)
            const planToDelete = myPlans.find(plan => plan.id === deleteId);

            if (planToDelete && !planToDelete.isPreloaded) {
                // Delete from database
                const { error } = await supabase
                    .from('discipline_plans')
                    .delete()
                    .eq('id', deleteId);

                if (error) throw error;

                // Remove from local state
                setMyPlans(prev => prev.filter(plan => plan.id !== deleteId));
                setAllPlans(prev => prev.filter(plan => plan.id !== deleteId));

                // Remove from selected IDs if it was selected
                setSelectedIds(prev => prev.filter(id => id !== deleteId));

                Alert.alert("Success", "Plan deleted successfully");
            } else {
                Alert.alert("Error", "Cannot delete predefined plans");
            }
        } catch (err) {
            console.error("Error deleting plan:", err);
            Alert.alert("Error", "Failed to delete plan");
        } finally {
            setDeleteId(null);
            setShowOptions(false);
        }
    };

    const renderDisciplineCard = (tpl: DisciplineTemplate, isUserPlan = false) => {
        const isSelected = selectedIds.includes(tpl.id)
        const isPredefined = tpl.isPreloaded

        return (
            <TouchableOpacity
                key={tpl.id}
                onPress={() => handlePlanPress(tpl, isUserPlan)}
                onLongPress={() => handleSelectPlan(tpl.id)}
            >
                <Card
                    bordered
                    padding={moderateScale(5)}
                    borderRadius={moderateScale(10)}
                    marginBottom={verticalScale(12)}
                    borderWidth={2}
                    backgroundColor={isSelected ? colors.card : "white"}
                    borderColor={isSelected ? colors.primary : (colors.border as any)}
                >
                    {isSelected && (
                        <View
                            position="absolute"
                            top={-moderateScale(6)}
                            right={-moderateScale(6)}
                            zIndex={10}
                            width={moderateScale(28)}
                            height={moderateScale(28)}
                            borderRadius={moderateScale(14)}
                            backgroundColor={colors.primary}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <MaterialCommunityIcons name="check" size={moderateScale(16)} color="white" />
                        </View>
                    )}

                    <XStack ai="center" jc="space-between" mb={verticalScale(8)} flex={1}>
                        <XStack ai="center" space={moderateScale(12)} flex={1}>
                            <View
                                width={moderateScale(40)}
                                height={moderateScale(40)}
                                borderRadius={moderateScale(20)}
                                alignItems="center"
                                justifyContent="center"
                            >
                                <MaterialCommunityIcons
                                    name={(tpl.icon as any) || "calendar-check"}
                                    size={moderateScale(20)}
                                    color={colors.primary}
                                />
                            </View>

                            <YStack flex={1} space={moderateScale(6)}>
                                <XStack ai="center" jc="space-between" space={moderateScale(6)}>
                                    <Text fontSize={scaleFont(12)} fontWeight="700" color="#333">
                                        {tpl.name}
                                    </Text>
                                    <Text fontSize={scaleFont(12)} fontWeight="600" color={colors.primary}>
                                        {tpl.rules?.length || 0} rule(s)
                                    </Text>
                                </XStack>

                                <Text
                                    fontSize={scaleFont(12)}
                                    color="#555"
                                    lineHeight={verticalScale(18)}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {tpl.description || "No description available"}
                                </Text>

                                <XStack space={moderateScale(12)} mr={moderateScale(8)} jc="flex-end">
                                    <XStack space={moderateScale(12)}>
                                        <TouchableOpacity onPress={() => handlePlanPress(tpl, isUserPlan)}>
                                            <MaterialCommunityIcons
                                                name="pencil"
                                                size={moderateScale(20)}
                                                color={colors.primary}
                                            />
                                        </TouchableOpacity>

                                        {!isPredefined && (
                                            <TouchableOpacity onPress={() => handleDelete(tpl.id)}>
                                                <MaterialCommunityIcons
                                                    name="trash-can"
                                                    size={moderateScale(20)}
                                                    color="red"
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </XStack>
                                </XStack>
                            </YStack>
                        </XStack>
                    </XStack>
                </Card>
            </TouchableOpacity>
        )
    }

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: moderateScale(16), paddingBottom: verticalScale(60) }}>
                <YStack space={moderateScale(12)} mt={verticalScale(28)}>
                    <XStack space={moderateScale(12)} ai="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={moderateScale(24)} color="black" />
                        </TouchableOpacity>
                        <H4 fontSize={16} fontWeight="600" color={colors.text}>
                            Choose Template
                        </H4>
                    </XStack>
                    <H4 fontSize={14} color="#555">
                        Long press to select one or more plans for download or print
                    </H4>
                </YStack>

                <XStack ai="center" jc="flex-start" space={moderateScale(12)} mt={verticalScale(16)}>
                    <Button
                        unstyled
                        borderRadius={moderateScale(12)}
                        backgroundColor="#FFF0DE"
                        paddingHorizontal={moderateScale(12)}
                        onPress={() => navigation.navigate('Print', { printAll: true })}
                    >
                        <XStack ai="center" space={moderateScale(12)} paddingVertical={moderateScale(8)}>
                            <Feather name="download" size={moderateScale(18)} color={colors.primary} />
                            <Text color={colors.primary} fontSize={scaleFont(12)}>
                                Download All
                            </Text>
                        </XStack>
                    </Button>

                    <Button
                        unstyled
                        backgroundColor="#E3FFF2"
                        paddingHorizontal={moderateScale(12)}
                        borderRadius={moderateScale(12)}
                        onPress={() => handlePrintAllPlans(allPlans, childName)}
                    >
                        <XStack ai="center" space={moderateScale(12)} paddingVertical={moderateScale(8)}>
                            <Feather name="printer" size={moderateScale(18)} color={colors.secondary} />
                            <Text color={colors.secondary} fontSize={scaleFont(12)}>
                                Print All
                            </Text>
                        </XStack>
                    </Button>
                </XStack>

                {loading && (
                    <View alignItems="center" mt={verticalScale(24)}>
                        <Spinner size="large" color={colors.primary as any} />
                    </View>
                )}

                {error && <Text color="red" fontSize={scaleFont(12)} mt={verticalScale(16)}>{error}</Text>}

                {!loading && !error && (
                    <YStack space={moderateScale(12)}>
                        <YStack jc="flex-start" mt={verticalScale(24)} space={moderateScale(12)}>
                            <YStack space={moderateScale(8)}>
                                <H6 fontSize={scaleFont(14)} fontWeight="600" color={colors.text}>
                                    My Plans:
                                </H6>
                                {myPlans.length > 0 ? (
                                    myPlans.map((tpl) => renderDisciplineCard(tpl, true))
                                ) : (
                                    <Text color={colors.textSecondary} fontSize={scaleFont(12)}>
                                        You have no personal plans yet.
                                    </Text>
                                )}
                            </YStack>

                            {selectedIds.length > 0 ? (
                                <YStack space={moderateScale(12)} jc="center" mt={verticalScale(16)}>
                                    <Button size={moderateScale(40)} bg={colors.primary} onPress={handleDownloadPlan}>
                                        <XStack ai="center" jc="center" space={moderateScale(8)}>
                                            <Feather name="download" size={moderateScale(16)} color="white" />
                                            <Text color="white">
                                                Download ({selectedIds.length})
                                            </Text>
                                        </XStack>
                                    </Button>

                                    <Button size={moderateScale(40)} bg='#9FCC16' onPress={handlePrintSelectedPlans}>
                                        <XStack ai="center" jc="center" space={moderateScale(8)}>
                                            <Feather name="printer" size={moderateScale(16)} color="white" />
                                            <Text color="white">
                                                Print ({selectedIds.length})
                                            </Text>
                                        </XStack>
                                    </Button>
                                </YStack>
                            ) : (
                                <YStack>
                                    <XStack ai="center" my={moderateScale(4)} mb={moderateScale(12)}>
                                        <View flex={1} height={1} bg="gray" />
                                        <H4 mx={moderateScale(8)} fontSize={scaleFont(14)} color={colors.text}>
                                            OR
                                        </H4>
                                        <View flex={1} height={1} bg="gray" />
                                    </XStack>
                                    <Button
                                        mt={moderateScale(8)}
                                        mb={moderateScale(12)}
                                        bg={colors.primary}
                                        size={moderateScale(40)}
                                        color="white"
                                        borderRadius={moderateScale(8)}
                                        onPress={() => navigation.navigate("AddDiscipline" as never)}
                                    >
                                        Create Custom
                                    </Button>
                                </YStack>
                            )}

                            <YStack space={moderateScale(8)}>
                                <Text fontSize={scaleFont(18)} fontWeight="700" color={colors.text}>
                                    Predefined Plans:
                                </Text>
                                {templates.filter((t) => t.isPreloaded).map((tpl) =>
                                    renderDisciplineCard(tpl)
                                )}
                            </YStack>
                        </YStack>
                    </YStack>
                )}

            </ScrollView>

            <Modal visible={showOptions} transparent animationType="slide" onRequestClose={() => setShowOptions(false)}>
                <YStack flex={1} jc="flex-end" bg="rgba(0,0,0,0.4)">
                    <YStack bg={colors.card} p={moderateScale(16)} borderRadius={moderateScale(16)} space={moderateScale(16)} elevation={6}>
                        <YStack space={moderateScale(8)}>
                            <Text fontSize={scaleFont(18)} fontWeight="600" jc='center' ai='center' color={colors.text}>
                                Are you sure you want to delete this plan?
                            </Text>
                            <Text fontSize={scaleFont(14)} fontWeight="600">
                                Once this plan is deleted it cannot be retrieved.
                            </Text>
                        </YStack>
                        <XStack jc='center' ai='center' space={moderateScale(12)} mt={moderateScale(16)} mb={moderateScale(28)}>
                            <Button
                                size={moderateScale(40)}
                                width='40%'
                                variant="outlined"
                                borderColor={colors.border as any}
                                onPress={() => {
                                    setDeleteId(null)
                                    setShowOptions(false)
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size={moderateScale(40)}
                                width='40%'
                                backgroundColor="red"
                                px={moderateScale(12)}
                                onPress={confirmDelete}
                            >
                                <Text color="white" fontSize={scaleFont(14)} fontWeight="bold">
                                    Delete
                                </Text>
                            </Button>
                        </XStack>
                    </YStack>
                </YStack>
            </Modal>
        </GoalBackground>
    )
};

export default DisciplineScreen;