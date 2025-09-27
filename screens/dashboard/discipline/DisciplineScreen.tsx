import { PRELOADED_DISCIPLINE } from "@/constants/Discipline";
import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { DisciplinePlan, DisciplineTemplate } from "@/types/discipline";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, Image, PixelRatio, ScrollView, TouchableOpacity } from "react-native";
import { Card, View, XStack, YStack, H6, Button, H5 } from "tamagui";
import { MaterialIcons } from "@expo/vector-icons";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

type Child = {
    id: string;
    name: string;
    age: number;
};

const DisciplineScreen = ({ navigation }: { navigation: any }) => {
    const { colors, isDark } = useTheme();
    const { user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    // Guideline based on iPhone 12
    const BASE_WIDTH = 390
    const BASE_HEIGHT = 844

    const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size
    const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size
    const moderateScale = (size: number, factor = 0.5) =>
        size + (scale(size) - size) * factor

    const scaleFont = (size: number) => Math.round(PixelRatio.roundToNearestPixel(scale(size)))

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
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: verticalScale(60) }}>

                {/* Header */}
                <XStack mt="$8" mb="$3" ai="center" jc="flex-start" position="relative" px='$5'>

                    <Button
                        unstyled
                        onPress={() => navigation.goBack()}
                        hitSlop={24}>
                        <MaterialIcons name="arrow-back" size={20} color={colors.text} />
                    </Button>

                    <H5
                        color={colors.text}
                        position="absolute"
                        left={0}
                        right={0}
                        textAlign="center"
                    >
                        Discipline Plans
                    </H5>
                </XStack>

                <YStack ai="center" mt={verticalScale(16)} mb={verticalScale(20)}>

                    <Image
                        source={require("@/assets/onboarding/bro.png")}
                        style={{
                            width: SCREEN_WIDTH * 0.9,
                            height: SCREEN_HEIGHT * 0.4,
                            top: verticalScale(20),
                            resizeMode: "contain"
                        }}
                    />
                </YStack>

                <YStack px={moderateScale(16)} mb={verticalScale(20)} mt={verticalScale(20)}>
                    <Text fontSize={scaleFont(12)} color={colors.textSecondary}>
                        Create structured Disciplines that support positive behavior and growth
                    </Text>
                </YStack>

                <XStack px={moderateScale(24)} space={moderateScale(12)}
                    mb={verticalScale(20)}>
                    <Card flex={1} elevate padding={moderateScale(12)} borderRadius={moderateScale(12)} backgroundColor="white" jc='flex-start'>
                        <Text fontSize={scaleFont(18)} textAlign='left' color="#FF8C01" fontWeight="700">
                            {activeCount}
                        </Text>
                        <Text fontSize={scaleFont(12)} color="#555">Active Plans</Text>
                    </Card>

                    <Card flex={1} elevate padding={moderateScale(12)} borderRadius={moderateScale(12)} backgroundColor="white" jc='flex-start'>
                        <Text fontSize={scaleFont(18)} color="#4CAF50" fontWeight="700">
                            {templateCount}
                        </Text>
                        <Text fontSize={scaleFont(12)} color="#555">Templates</Text>
                    </Card>
                </XStack>

                <YStack px={moderateScale(16)} space={moderateScale(19)}>
                    <Card
                        elevate
                        padding={moderateScale(12)}
                        borderRadius={moderateScale(10)}
                        backgroundColor={colors.secondary}
                        pressStyle={{ opacity: 0.9 }}
                        onPress={() => navigation.navigate("Discipline")}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space={moderateScale(12)}>
                                <MaterialCommunityIcons name="file-document-outline" size={moderateScale(20)} color="white" />
                                <YStack space='$1'>
                                    <Text fontWeight="700" color="white">Use Template</Text>
                                    <Text fontSize={12} color="#EEE">Start with recommendations from experts</Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons name="chevron-right" size={moderateScale(20)} color="white" />
                        </XStack>
                    </Card>

                    <Card
                        elevate
                        padding={moderateScale(12)}
                        borderRadius={moderateScale(10)}
                        backgroundColor="white"
                        pressStyle={{ opacity: 0.8 }}
                        onPress={() => navigation.navigate("AddDiscipline")}
                    >
                        <XStack ai="center" jc="space-between">
                            <XStack ai="center" space={moderateScale(12)}>
                                <View style={{
                                    width: moderateScale(40),
                                    height: moderateScale(40),
                                    borderRadius: moderateScale(20),
                                    backgroundColor: '#FFEAD3',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 3
                                }}>
                                    <MaterialCommunityIcons name="plus-circle-outline" size={moderateScale(20)} color={colors.primary} />
                                </View>
                                <YStack space='$1'>
                                    <Text fontWeight={700} color={isDark ? 'black' : colors.text}
                                    >Create custom Discipline Plan</Text>
                                    <Text fontSize={12} color={isDark ? 'black' : colors.text}>Build from scratch</Text>
                                </YStack>
                            </XStack>
                            <MaterialCommunityIcons name="chevron-right" size={moderateScale(20)} color="#999" />
                        </XStack>
                    </Card>
                </YStack>
            </ScrollView>
        </GoalBackground>
    );
};

export default DisciplineScreen;
