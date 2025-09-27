import { GoalBackground } from '@/constants/GoalBackground';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, } from 'react-native';
import { Button, Card, Text, View, XStack, YStack } from 'tamagui';
import { v4 as uuidv4 } from 'uuid';

type RuleSet = {
    rule: string;
    consequence: string;
    notes?: string;
};

type DisciplinePlan = {
    id?: string;
    color?: string;
    child_id: string;
    name: string;
    rules: RuleSet[];
    notes?: string;
    created_at?: string;
    updated_at?: string;
};

type RootStackParamList = {
    ChildProfile: { child: ChildProfile };
    Goals: undefined;
    Discipline: { childId: string };
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

const DisciplineScreen = ({ childId }: { childId: string }) => {
    const { colors } = useTheme();
    const [disciplinePlans, setDisciplinePlans] = useState<DisciplinePlan[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { childId: initialChildId } = useLocalSearchParams<{ childId?: string }>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [disciplineModalOpen, setDisciplineModalOpen] = useState(false);

    const fetchDisciplinePlans = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('discipline_plans')
                .select('*')
                .eq('child_id', childId);

            if (error) throw error;
            setDisciplinePlans(data || []);
        } catch (error) {
            console.error('Error fetching discipline plans:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [childId]);

    useEffect(() => {
        fetchDisciplinePlans();
    }, [fetchDisciplinePlans]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchDisciplinePlans();
    }, [fetchDisciplinePlans]);

    const handleSavePlan = useCallback(
        async (plan: DisciplinePlan) => {
            try {
                setLoading(true);
                let error;

                if (plan.id) {
                    const { error: updateError } = await supabase
                        .from('discipline_plans')
                        .update(plan)
                        .eq('id', plan.id);
                    error = updateError;
                } else {
                    const { error: insertError } = await supabase.from('discipline_plans').insert({
                        ...plan,
                        id: uuidv4(),
                        child_id: childId,
                    });
                    error = insertError;
                }

                if (error) throw error;

                await fetchDisciplinePlans();
                setDisciplineModalOpen(false);
            } catch (error) {
                console.error('Error saving discipline plan:', error);
            } finally {
                setLoading(false);
            }
        },
        [childId, fetchDisciplinePlans]
    );

    const handleDeletePlan = useCallback(
        async (id: string) => {
            try {
                setLoading(true);
                const { error } = await supabase.from('discipline_plans').delete().eq('id', id);

                if (error) throw error;

                await fetchDisciplinePlans();
            } catch (error) {
                console.error('Error deleting discipline plan:', error);
            } finally {
                setLoading(false);
            }
        },
        [fetchDisciplinePlans]
    );

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading discipline plans...</Text>
            </View>
        );
    }

    return (
        <GoalBackground>
            <ScrollView
                style={{ flex: 1, padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary as any]}
                    />
                }
            >
                {disciplinePlans.length > 0 ? (
                    disciplinePlans.map((plan) => (
                        <YStack key={plan.id} space="$3" marginBottom="$4">
                            <Card
                                padding="$4"
                                backgroundColor={colors.card}
                                borderTopColor={plan.color}
                                borderTopWidth={4}
                                borderRadius="$3"
                                elevate
                            >
                                <XStack alignItems="center"
                                    justifyContent="space-between">
                                    <YStack space='$3'>
                                        <Text fontSize="$5" fontWeight="bold" color={colors.text}>
                                            {plan.name}
                                        </Text>
                                        <View
                                            px="$3"
                                            py="$1"
                                            br={9999}
                                            backgroundColor={plan.color || colors.primary}
                                            alignSelf="flex-start"
                                        >
                                            <Text fontSize="$4" fontWeight="600" color="white">
                                                {plan.rules?.length || 0} rule(s)
                                            </Text>
                                        </View>
                                    </YStack>

                                    <XStack space="$3" alignItems="center">
                                        <Button
                                            size="$2"
                                            circular
                                            icon={
                                                expandedId === plan.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                            }
                                            onPress={() => toggleExpand(plan.id!)}
                                            backgroundColor={colors.card}
                                            color={colors.secondary}
                                            borderColor={colors.secondary as any}
                                            borderWidth={1}
                                        />
                                    </XStack>
                                </XStack>

                                {expandedId === plan.id && (
                                    <YStack space="$4" marginTop="$4">
                                        <YStack space="$2">
                                            <Text fontSize="$5" fontWeight="bold" color={colors.primary}>
                                                Rules
                                            </Text>
                                            {plan.rules?.length > 0 ? (
                                                plan.rules.map((rule, idx) => (
                                                    <Card key={idx}
                                                        padding="$3"
                                                        space='$2'
                                                        bordered
                                                        borderColor={colors.border as any}>
                                                        <Text fontWeight="600" color={colors.text}>
                                                            * Rule: {rule.rule}
                                                        </Text>
                                                        <Text color={colors.primary}>* Consequence: {rule.consequence}</Text>
                                                        {rule.notes && <Text color={colors.secondary}>* Notes: {rule.notes}</Text>}
                                                    </Card>
                                                ))
                                            ) : (
                                                <Text>No rules defined yet.</Text>
                                            )}
                                        </YStack>

                                        {plan.notes && (
                                            <YStack space="$2">
                                                <Text fontSize="$5" fontWeight="bold" color={colors.primary}>
                                                    Parent Notes
                                                </Text>
                                                <Text color={colors.text}>{plan.notes}</Text>
                                            </YStack>
                                        )}
                                    </YStack>
                                )}
                            </Card>

                            <Button
                                size='$5'
                                onPress={() => navigation.navigate('Discipline', { childId } as never)}
                                backgroundColor={colors.secondary}
                                color={colors.onPrimary}
                                marginTop="$5"
                            >
                                Add New Plan
                            </Button>

                        </YStack>
                    ))
                ) : (
                    <YStack ai="center" mt='$3' jc="center" p="$6" br="$4" bg={colors.surface} gap="$3">
                        <Text color={colors.textSecondary} fontSize='$4'>
                            No Discipline Plan Yet
                            Add some to get started!</Text>

                    </YStack>)}
            </ScrollView>
        </GoalBackground>
    );
};

export default DisciplineScreen;
