import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { Card } from 'react-native-paper';

import { useChildContext } from '@/context/ChildContext';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import { RootStackParamList } from '@/types';

import DailyTipCard from '@/components/home/DailyTipCard';
import ParentingGoalsSection from '@/components/home/Goals';
import { HelloWave } from '@/components/home/HelloWave';
import ParentingPlanSection from '@/components/home/Plan';
import RecentUpdates from '@/components/home/Recent';
import ActionButton from '@/components/ui/ActionButton';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

interface ProfileData {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface ChildData {
    id: string;
    name: string;
    age: string;
    photo_url: string | null;
    strengths: string[];
    weaknesses: string[];
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { colors, fonts } = useTheme();
    const { currentChild } = useChildContext();
    const [childData, setChildData] = useState<ChildData | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const scrollY = useRef(new Animated.Value(0)).current;

    const children = currentChild
        ? [{ id: currentChild.id, name: currentChild.name, age: currentChild.age }]
        : [];

    const parentingPlan = {
        academics: { progress: 65, lastUpdated: '2 days ago' },
        health: { progress: 80, lastUpdated: '1 week ago' },
        emotional: { progress: 45, lastUpdated: '3 days ago' },
    };

    const currentGoals = [
        {
            id: '1',
            title: 'Improve math skills',
            category: 'academics',
            progress: 60,
            dueDate: '2023-12-15',
        },
        {
            id: '2',
            title: 'Establish bedtime routine',
            category: 'health',
            progress: 30,
            dueDate: '2023-11-30',
        },
    ];

    useEffect(() => {
        fetchProfile();
    }, [currentChild]);

    const fetchProfile = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: userData } = await supabase
                .from('users')
                .select('first_name')
                .eq('id', user.id)
                .single();

            setProfile(userData);

            const { data: childRaw } = await supabase
                .from('children')
                .select('id, name, age, photo_url, strengths, weaknesses')
                .eq('user_id', user.id)
                .single();

            if (childRaw) {
                setChildData({
                    id: childRaw.id,
                    name: childRaw.name,
                    age: childRaw.age ?? '',
                    photo_url: childRaw.photo_url ?? null,
                    strengths: childRaw.strengths ?? [],
                    weaknesses: childRaw.weaknesses ?? [],
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleActionPress = (screen: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(screen as any);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                refreshControl={
                    <RefreshControl refreshing={loadingProfile} onRefresh={fetchProfile} />
                }
            >
                {/* Greeting */}
                <View style={styles.header}>
                    <Text style={[styles.greeting, { color: colors.primary }]}>
                        Hey <HelloWave /> {profile?.first_name}
                    </Text>
                    <Text style={[styles.greeting, { color: colors.primary }]}>
                        Welcome to your Co-Parent Connect Dashboard.
                    </Text>
                    <Text style={[styles.greeting, { color: colors.primary }]}>
                        Here you can manage your parenting plan, goals, and more.
                    </Text>
                </View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>


                <View style={styles.recent}>
                    {/*Recent Updates*/}
                    <RecentUpdates
                        updates={[
                            {
                                type: 'plan-update',
                                category: 'academics',
                                parent: 'You',
                                time: '2 hours ago',
                            },
                            {
                                type: 'goal-completed',
                                title: 'Swimming lessons',
                                parent: 'Co-parent',
                                time: '1 day ago',
                            },
                        ]}
                    />
                </View>


                {/* Child Related Sections */}
                {childData && (
                    <>
                        <ParentingPlanSection
                            plan={parentingPlan}
                            onPress={() => navigation.navigate('ParentingPlan' as any)}
                        />
                        <ParentingGoalsSection
                            goals={currentGoals}
                            onPressGoal={(goal) => navigation.navigate('GoalDetails' as any, { goal })}
                            onAddGoal={() => navigation.navigate('AddGoal' as any)}
                        />
                    </>
                )}
                <View
                    style={[styles.lasplace]}
                >
                    {/* Daily Tips */}
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Tip</Text>
                    <DailyTipCard tip="Start mornings with affection. A hug sets the tone for the day." />
                    <DailyTipCard tip="Try narrating your actions to help language development. For example: 'Mommy is washing the dishes now'." />
                </View>

            </Animated.ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    recent: {
        marginTop: 30,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 140,
    },
    lasplace: {
        marginBottom: 25
    },
    header: {
        marginTop: 5,
        marginBottom: 20,
        fontSize: 12
    },
    greeting: {
        marginTop: 10,
        fontWeight: '900',
        fontSize: 16
    },
    subGreeting: {
        fontSize: 24,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 16,
    },
    card: {
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 8,
        marginBottom: 4,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionWrapper: {
        width: '30%',
        marginVertical: 12,
        alignItems: 'center',
    },
});

export default HomeScreen;
