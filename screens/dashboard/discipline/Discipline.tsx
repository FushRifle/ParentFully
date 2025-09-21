import { PRELOADED_DISCIPLINE } from '@/constants/Discipline';
import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from '@/context/AuthContext';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Modal, ScrollView, TouchableOpacity } from "react-native";
import { Button, Card, Spinner, Text, View, XStack, YStack } from "tamagui";
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
        if (deleteId) {
            console.log("Deleting plan with id:", deleteId);
        }
        setDeleteId(null);
        setShowDeleteModal(false);
    };

    const renderDisciplineCard = (tpl: DisciplineTemplate, isUserPlan = false) => {
        const isSelected = selectedIds.includes(tpl.id);

        return (
            <TouchableOpacity
                key={tpl.id}
                onPress={() => handlePlanPress(tpl, isUserPlan)}
                onLongPress={() => handleSelectPlan(tpl.id)}
            >
                <Card
                    bordered
                    padding="$3"
                    borderRadius="$4"
                    marginBottom="$3"
                    borderWidth={2}
                    backgroundColor={isSelected ? colors.card : "white"}
                    borderColor={isSelected ? colors.primary : (colors.border as any)}
                >
                    {isSelected && (
                        <View
                            position="absolute"
                            top={-8}
                            right={-8}
                            zIndex={10}
                            w={28}
                            h={28}
                            br={14}
                            backgroundColor={colors.primary}
                            ai="center"
                            jc="center"
                            elevationAndroid={10}
                        >
                            <MaterialCommunityIcons name="check" size={16} color="white" />
                        </View>
                    )}

                    <XStack ai="center" jc="space-between" mb="$2" f={1}>
                        <XStack ai="center" space="$4" f={1}>
                            <View w={40} h={40} br={20} ai="center" jc="center">
                                <MaterialCommunityIcons
                                    name={(tpl.icon as any) || "calendar-check"}
                                    size={22}
                                    color={colors.primary}
                                />
                            </View>

                            <YStack f={1} space="$2">
                                <XStack ai="center" jc="space-between" space="$2">
                                    <Text fontSize="$6" fontWeight="700" color="#333">
                                        {tpl.name}
                                    </Text>
                                    <Text fontSize="$4" fontWeight="600" color={colors.primary}>
                                        {tpl.rules?.length || 0} rule(s)
                                    </Text>
                                </XStack>

                                <Text
                                    fontSize="$4"
                                    color="#555"
                                    lineHeight={20}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {tpl.description || "No description available"}
                                </Text>

                                <XStack space="$4" mr="$2" jc="flex-end">
                                    <XStack space="$4">
                                        <TouchableOpacity onPress={() => handlePlanPress(tpl, isUserPlan)}>
                                            <MaterialCommunityIcons
                                                name="pencil"
                                                size={23}
                                                color={colors.primary}
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => handleDelete(tpl.id)}>
                                            <MaterialCommunityIcons
                                                name="trash-can"
                                                size={23}
                                                color="red"
                                            />
                                        </TouchableOpacity>
                                    </XStack>
                                </XStack>
                            </YStack>
                        </XStack>
                    </XStack>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
                <YStack space="$4" mt="$7">
                    <XStack space="$4" ai="center">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                        </TouchableOpacity>
                        <Text fontSize="$7" fontWeight="700" color={colors.text}>
                            Choose Template
                        </Text>
                    </XStack>
                    <Text fontSize="$5" color="#555">
                        Long press to select one or more plans for download or print
                    </Text>
                </YStack>

                <XStack ai="center" jc="flex-start" space="$5" mt="$4">
                    <Button
                        unstyled
                        br='$6'
                        backgroundColor="#FFF0DE"
                        px="$3"
                        onPress={() => navigation.navigate('Print', { printAll: true })}
                    >
                        <XStack ai="center" space="$3" py="$3">
                            <Feather name="download" size={20} color={colors.primary} />
                            <Text color={colors.primary} fontSize="$4">
                                Download All
                            </Text>
                        </XStack>
                    </Button>

                    <Button
                        unstyled
                        backgroundColor="#E3FFF2"
                        px="$3"
                        br='$6'
                        onPress={() => handlePrintAllPlans(allPlans, childName)}
                    >
                        <XStack ai="center" space="$3" py="$3">
                            <Feather name="printer" size={20} color={colors.secondary} />
                            <Text color={colors.secondary} fontSize="$4">
                                Print All
                            </Text>
                        </XStack>
                    </Button>
                </XStack>

                {loading && (
                    <View ai="center" mt="$6">
                        <Spinner size="large" color={colors.primary as any} />
                    </View>
                )}

                {error && <Text color="red" fontSize="$4" mt="$4">{error}</Text>}

                {!loading && !error && (
                    <YStack space="$5">
                        <YStack jc="flex-start" mt="$6" space="$6">
                            <YStack space="$3">
                                <Text fontSize="$7" fontWeight="700" color={colors.text}>
                                    My Plans:
                                </Text>
                                {myPlans.length > 0 ? (
                                    myPlans.map((tpl) => renderDisciplineCard(tpl, true))
                                ) : (
                                    <Text color={colors.textSecondary} fontSize="$4">
                                        You have no personal plans yet.
                                    </Text>
                                )}
                            </YStack>

                            {selectedIds.length > 0 ? (
                                <YStack space="$4" jc="center" mt="$4">
                                    <Button size="$5" bg={colors.primary} onPress={handleDownloadPlan}>
                                        <XStack ai="center" jc="center" space="$2">
                                            <Feather name="download" size={18} color="white" />
                                            <Text color="white">
                                                Download ({selectedIds.length})
                                            </Text>
                                        </XStack>
                                    </Button>

                                    <Button size="$5" bg='#9FCC16' onPress={handlePrintSelectedPlans}>
                                        <XStack ai="center" jc="center" space="$2">
                                            <Feather name="printer" size={18} color="white" />
                                            <Text color="white">
                                                Print ({selectedIds.length})
                                            </Text>
                                        </XStack>
                                    </Button>
                                </YStack>
                            ) : (
                                <YStack>
                                    <XStack ai="center" my="$1" mb='$3'>
                                        <View flex={1} height={1} bg="gray" />
                                        <Text mx="$3" fontSize="$5" color={colors.text}>
                                            OR
                                        </Text>
                                        <View flex={1} height={1} bg="gray" />
                                    </XStack>
                                    <Button
                                        mt='$2'
                                        mb='$3'
                                        bg={colors.primary}
                                        size='$5'
                                        color="white"
                                        borderRadius="$4"
                                        onPress={() => navigation.navigate("AddDiscipline" as never)}
                                    >
                                        Create Custom
                                    </Button>
                                </YStack>
                            )}

                            <YStack space="$3">
                                <Text fontSize="$7" fontWeight="700" color={colors.text}>
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
                <YStack f={1} jc="flex-end" bg="rgba(0,0,0,0.4)">
                    <YStack bg={colors.card} p="$4" br="$6" space="$6" elevation={6} borderTopLeftRadius={20} borderTopRightRadius={20}>
                        <YStack space='$3'>
                            <Text fontSize="$7" fontWeight="600" jc='center' ai='center' color={colors.text}>
                                Are you sure you want to Delete this Task ?
                            </Text>
                            <Text fontSize="$5" fontWeight="600">
                                Once this Task is deleted it cannot be retrieved.
                            </Text>
                        </YStack>
                        <XStack jc='center' ai='center' space='$6' mt='$5' mb='$7'>
                            <Button size="$5" w='40%' variant="outlined"
                                borderColor={colors.border as any}
                                onPress={() => setShowOptions(false)}>
                                Cancel
                            </Button>
                            <Button
                                size="$5"
                                width='40%'
                                backgroundColor="red"
                                px="$4"
                                onPress={confirmDelete}
                            >
                                <Text color="white" fontSize="$4" fontWeight="bold">
                                    Delete
                                </Text>
                            </Button>
                        </XStack>
                    </YStack>
                </YStack>
            </Modal>
        </GoalBackground>
    );
};

export default DisciplineScreen;
