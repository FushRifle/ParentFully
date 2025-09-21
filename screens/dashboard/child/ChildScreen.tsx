import DisciplineScreen from '@/components/child/DisciplineScreen';
import GoalsScreen from '@/components/child/GoalScreen';
import { RoutineScreen } from '@/components/child/RoutineScreen';
import { CompletedGoalsSheet } from '@/components/goals/CompletedGoalsModal';
import ChildOptionsModal from '@/components/profile/EditChildModal';
import { GoalBackground } from '@/constants/GoalBackground';
import useImageUpload from '@/hooks/image/cloudinary/cloudinary';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';
import { TabBar, TabView } from 'react-native-tab-view';
import { Card, ScrollView, Text, View, XStack, YStack } from 'tamagui';

type RootStackParamList = {
    ChildProfile: { child: ChildProfile };
    Goals: undefined;
    Routine: undefined;
};

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo: string;
    notes?: string;
    points?: number;
}

type ChildProfileScreenProps = NativeStackScreenProps<RootStackParamList, 'ChildProfile'>;

const ChildProfileScreen = ({ navigation, route }: ChildProfileScreenProps) => {
    const { colors } = useTheme();
    const [sheetOpen, setSheetOpen] = useState(false);
    const { child: initialChild } = route.params;
    const [child, setChild] = useState<ChildProfile>(initialChild);
    const [masteredGoalsCount, setMasteredGoalsCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const { height: screenHeight } = useWindowDimensions();
    const [modalVisible, setModalVisible] = useState(false);
    const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);
    const [imageCache, setImageCache] = useState<Record<string, string>>({});
    const { pickImage, tempImage, isUploading, setTempImage } = useImageUpload();
    const [imageVersions, setImageVersions] = useState<Record<string, number>>({});
    const [loadError, setLoadError] = useState(false);

    const routes = React.useMemo(() => [
        { key: 'goals', title: 'Goals' },
        { key: 'routine', title: 'Routine' },
        { key: 'discipline', title: 'Discipline' },
    ], []);

    const fetchChildDetails = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('children')
                .select('*')
                .eq('id', initialChild.id)
                .single();

            if (error) throw error;
            if (data) setChild(data);
        } catch (error) {
            console.error('Error fetching child details:', error);
        } finally {
            setLoading(false);
        }
    }, [initialChild.id]);

    const fetchMasteredGoalsCount = useCallback(async () => {
        try {
            const { count, error } = await supabase
                .from('selected_goals')
                .select('*', { count: 'exact' })
                .eq('child_id', child.id)
                .eq('status', 'Mastered');

            if (!error) {
                setMasteredGoalsCount(count || 0);
            }
        } catch (error) {
            console.error('Error fetching mastered goals count:', error);
        }
    }, [child.id]);

    useEffect(() => {
        fetchChildDetails();
        fetchMasteredGoalsCount();
    }, [fetchChildDetails, fetchMasteredGoalsCount]);

    const renderScene = useCallback(({ route }: { route: { key: string } }) => {
        const screens = {
            goals: <GoalsScreen childId={child.id} />,
            routine: <RoutineScreen childId={child.id} />,
            discipline: <DisciplineScreen childId={child.id || ''} />,
        };
        return screens[route.key as keyof typeof screens] || null;
    }, [child.id]);

    const renderTabBar = useCallback((props: any) => (
        <TabBar
            {...props}
            indicatorStyle={{
                backgroundColor: colors.secondaryContainer,
                height: "100%",
                borderRadius: 8,
            }} style={{
                backgroundColor: colors.card,
                width: "93%",
                alignSelf: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                overflow: "hidden",
            }}
            labelStyle={{ color: colors.text }}
            activeColor={colors.onPrimary}
            inactiveColor={colors.text}
        />

    ), [colors.background, colors.primary, colors.text]);

    const openEditModal = (child: ChildProfile) => {
        setCurrentChild(child);
        setModalVisible(true);
    };

    const handleNavigate = (screen: 'routine' | 'goals' | 'discipline') => {
        console.log('Navigate to:', screen);
        setModalVisible(false);
    };

    const handleSave = async (updatedChild: ChildProfile) => {
        try {
            let photoUrl = updatedChild.photo;

            if (photoUrl && photoUrl.startsWith('file:')) {
                const compressed = await manipulateAsync(
                    photoUrl,
                    [{ resize: { width: 800 } }],
                    { compress: 0.8, format: SaveFormat.JPEG }
                );
                photoUrl = compressed.uri;
            }

            const { error } = await supabase
                .from('children')
                .update({
                    name: updatedChild.name,
                    age: updatedChild.age,
                    photo: photoUrl,
                    notes: updatedChild.notes,
                    points: updatedChild.points
                })
                .eq('id', updatedChild.id);

            if (error) throw error;

            setChild(updatedChild);
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Save Error', 'Failed to save child profile');
            console.error('Save failed:', error);
        }
    };

    return (
        <GoalBackground>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Appbar.Header style={{ backgroundColor: colors.background }}>
                    <Appbar.BackAction
                        onPress={navigation.goBack}
                        color={typeof colors.text === 'string' ? colors.text : undefined}
                    />
                    <Appbar.Content
                        title="Child's Profile"
                        color={typeof colors.text === 'string' ? colors.text : undefined}
                    />

                    <Appbar.Action
                        icon="cog"
                        onPress={() => openEditModal(child)}
                        color={typeof colors.text === 'string' ? colors.text : undefined}
                    />
                </Appbar.Header>

                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        marginBottom: 40
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <Card
                        backgroundColor={colors.card}
                        margin={16}
                        borderRadius={16}
                        elevation={2}
                        padding={16}
                    >
                        <XStack alignItems="center" space={16}>
                            <Avatar.Image
                                size={80}
                                source={
                                    child.photo
                                        ? { uri: child.photo, cache: 'force-cache' }
                                        : require('@/assets/images/profile.jpg')
                                }
                                style={{ backgroundColor: colors.accent }}
                                onError={() => setLoadError(true)}
                            />
                            <YStack flex={1} gap="$2">
                                <Text fontSize={22} fontWeight="bold" color={colors.text}>
                                    {child.name}
                                </Text>
                                <Text fontSize={16} color={colors.text}>
                                    {child.age} years old
                                </Text>
                                <XStack alignItems="center" space="$2" marginTop="$2">
                                    <Pressable onPress={() => setSheetOpen(true)}>
                                        <Text
                                            paddingHorizontal={12}
                                            paddingVertical={6}
                                            borderRadius={8}
                                            space='$3'
                                            color={colors.primaryDark}
                                            backgroundColor='#FFE9CE'
                                            fontSize={14}
                                            fontWeight="500"
                                        >
                                            {masteredGoalsCount}
                                            Mastered Goals
                                        </Text>
                                    </Pressable>
                                </XStack>
                            </YStack>
                        </XStack>
                    </Card>

                    <View style={{ flex: 1, marginTop: 6, }}>
                        <TabView
                            navigationState={{ index, routes }}
                            renderScene={renderScene}
                            onIndexChange={setIndex}
                            renderTabBar={renderTabBar}
                        />
                    </View>
                </ScrollView>

                <CompletedGoalsSheet
                    open={sheetOpen}
                    onClose={() => setSheetOpen(false)}
                    childId={child.id}
                />

                <ChildOptionsModal
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    currentChild={currentChild}
                    onSave={handleSave}
                    onNavigate={handleNavigate}
                />
            </View>
        </GoalBackground>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    goalCard: {
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
        alignItems: 'center',
    },
    goalContent: {
        flex: 1,
    },
    centerContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    coreValue: {
        fontSize: 13,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 4,
        marginTop: 6,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '500',
    },
    editButton: {
        marginLeft: 10,
    },
    addButton: {
        marginTop: 30,
    },
});

export default ChildProfileScreen;