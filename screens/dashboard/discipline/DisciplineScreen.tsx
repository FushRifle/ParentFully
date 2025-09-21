import { PRELOADED_DISCIPLINE } from "@/constants/Discipline";
import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { DisciplinePlan, DisciplineTemplate } from "@/types/discipline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { Image, ScrollView } from "react-native";
import { Card, Text, View, XStack, YStack } from "tamagui";

type Child = {
    id: string;
    name: string;
    age: number;
};


const DisciplineScreen: React.FC = ({ navigation }: any) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);

    const [myPlans, setMyPlans] = useState<DisciplinePlan[]>([]);
    const [templates, setTemplates] = useState<DisciplineTemplate[]>([]);
    const [allPlans, setAllPlans] = useState<(DisciplinePlan | DisciplineTemplate)[]>([]);

    const [loading, setLoading] = useState(true);
    const [activeCount, setActiveCount] = useState(0);
    const [templateCount, setTemplateCount] = useState(0);

    const { childId: initialChildId } = useLocalSearchParams<{ childId?: string }>();

    // Fetch user-created plans
    const fetchUserPlans = useCallback(async () => {
        if (!selectedChild) return [];
        try {
            const { data, error } = await supabase
                .from('discipline_plans')
                .select('*')
                .eq('user_id', user?.id)
                .order('id', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error("Error fetching user plans:", err);
            return [];
        }
    }, [selectedChild]);

    // Fetch templates (user + preloaded)
    const fetchTemplates = useCallback(async () => {
        if (!selectedChild) return PRELOADED_DISCIPLINE;
        try {
            const { data, error } = await supabase
                .from('discipline_templates')
                .select('*')
                .eq('user_id', selectedChild.id);
            if (error) throw error;
            return [...(data || []), ...PRELOADED_DISCIPLINE];
        } catch (err) {
            console.error("Error fetching templates:", err);
            return PRELOADED_DISCIPLINE;
        }
    }, [selectedChild]);

    // Load all data
    const loadData = useCallback(async () => {
        if (!selectedChild) return;

        setLoading(true);
        try {
            const [plans, tpls] = await Promise.all([fetchUserPlans(), fetchTemplates()]);
            setMyPlans(plans);
            setTemplates(tpls);

            const combined = [...plans, ...tpls.filter(t => t.isPreloaded)];
            setAllPlans(combined);

            // Update counts
            setActiveCount(plans.length);
            setTemplateCount(tpls.length);
        } catch (err) {
            console.error(err);
            setError("Failed to load discipline plans and templates");
        } finally {
            setLoading(false);
        }
    }, [fetchUserPlans, fetchTemplates, selectedChild]);

    // Fetch children
    const fetchChildren = useCallback(async () => {
        try {
            const { data, error } = await supabase.from("children").select("*");
            if (error) throw error;

            setChildren(data || []);
            if (data && data.length > 0 && !selectedChild) setSelectedChild(data[0]);
        } catch (err) {
            console.error("Error fetching children:", err);
        }
    }, [selectedChild]);

    useEffect(() => { fetchChildren(); }, [fetchChildren]);
    useEffect(() => { loadData(); }, [loadData]);

    return (
        <GoalBackground>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 60 }}
            >
                <YStack ai="center" mt="$4" mb="$5">
                    <Image
                        source={require("@/assets/onboarding/bro.png")}
                        style={{ width: 368, top: 35, height: 348, resizeMode: "contain" }}
                    />
                </YStack>

                <YStack px="$4" mb="$5" mt='$5'>
                    <Text fontSize="$8" fontWeight="700" color={colors.text}>
                        Discipline Plans
                    </Text>
                    <Text fontSize="$4" color="#555">
                        Create structured Disciplines that support positive behavior and growth
                    </Text>
                </YStack>

                <XStack px="$4" space="$3" mb="$5">
                    <Card flex={1} elevate padding="$4" borderRadius="$6" backgroundColor="white" jc='flex-start'>
                        <Text fontSize="$9" textAlign='left' color="#FF8C01" fontWeight="700">
                            {activeCount}
                        </Text>
                        <Text fontSize="$4" color="#555">Active Plans</Text>
                    </Card>

                    <Card flex={1} elevate padding="$4" borderRadius="$6" backgroundColor="white" jc='flex-start'>
                        <Text fontSize="$8" color="#4CAF50" fontWeight="700">
                            {templateCount}
                        </Text>
                        <Text fontSize="$4" color="#555">Templates</Text>
                    </Card>
                </XStack>

                <YStack px="$4" space="$3">
                    <Card
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor="white"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => {
                            navigation.navigate("ActiveDiscipline");
                        }}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space="$3">
                                <MaterialCommunityIcons name="star" size={24} color={colors.secondary} />
                                <YStack>
                                    <Text fontWeight="700" color={colors.text}>Active Discipline Plans</Text>
                                    <Text color="#666">Your kid’s current discipline plans at a glance</Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                        </XStack>
                    </Card>

                    <Card
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor={colors.secondary}
                        pressStyle={{ opacity: 0.9 }}
                        onPress={() => navigation.navigate("Discipline")}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space="$3">
                                <MaterialCommunityIcons name="file-document-outline" size={24} color="white" />
                                <YStack>
                                    <Text fontWeight="700" color="white">Use Template</Text>
                                    <Text color="#EEE">Start with recommendations from experts</Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="white" />
                        </XStack>
                    </Card>

                    <Card
                        elevate
                        padding="$4"
                        borderRadius="$6"
                        backgroundColor="white"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => navigation.navigate("AddDiscipline")}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space="$3">
                                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFEAD3', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
                                    <MaterialCommunityIcons name="plus-circle-outline" size={24} color={colors.primary} />
                                </View>
                                <YStack>
                                    <Text fontWeight="700" color={colors.text}>Create custom Discipline Plan</Text>
                                    <Text color="#666">Build from scratch</Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
                        </XStack>
                    </Card>
                </YStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default DisciplineScreen;
