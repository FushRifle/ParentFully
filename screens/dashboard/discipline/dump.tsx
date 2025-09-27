import { DisciplineModal } from '@/components/discipline/AddDisciplineModal';
import { PRELOADED_DISCIPLINE } from '@/constants/Discipline';
import { GoalBackground } from '@/constants/GoalBackground';
import { useAuth } from '@/context/AuthContext';
import type { RootStackParamList } from '@/navigation/MainNavigator';
import { useTheme } from '@/styles/ThemeContext';
import { supabase } from '@/supabase/client';
import type { DisciplinePlan, DisciplineTemplate } from "@/types/discipline";
import { Feather, MaterialIcons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown, ChevronUp, Edit3 } from '@tamagui/lucide-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, RefreshControl } from 'react-native';
import { Button, Card, H4, ScrollView, Text, View, XStack, YStack } from 'tamagui';
import { v4 as uuidv4 } from 'uuid';



<Card
    elevate
    padding={moderateScale(12)}
    borderRadius={moderateScale(10)}
    backgroundColor="white"
    pressStyle={{ opacity: 0.8 }}
    onPress={() => navigation.navigate("ActiveDiscipline")}
>
    <XStack ai="center" jc="space-between">
        <XStack ai="center" space={moderateScale(12)}>
            <MaterialCommunityIcons name="star" size={moderateScale(20)} color={colors.secondary} />
            <YStack >
                <Text fontWeight="700" color={colors.text}>Active Discipline Plans</Text>
                <Text fontSize={12} color="#666">Your kid’s current discipline plans at a glance</Text>
            </YStack>
        </XStack>
        <MaterialCommunityIcons name="chevron-right" size={moderateScale(20)} color="#999" />
    </XStack>
</Card>

export default function DisciplineTemplateScreen() {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user } = useAuth();
    const { childId: initialChildId } = useLocalSearchParams<{ childId?: string }>();

    // State management
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [plans, setPlans] = useState<DisciplinePlan[]>([]);
    const [childId, setChildId] = useState<string | null>(initialChildId || null);
    const [childName, setChildName] = useState('');
    const [children, setChildren] = useState<Array<{ id: string; name: string }>>([]);
    const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
    const [editingPlan, setEditingPlan] = useState<DisciplinePlan | null>(null);
    const [templates, setTemplates] = useState<DisciplineTemplate[]>([]);
    const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
    const [modalState, setModalState] = useState({
        childSelection: false,
        edit: false,
    });

    // Fetch data functions
    const fetchChildren = useCallback(async () => {
        try {
            if (!user?.id) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('children')
                .select('id, name')
                .or(`user_id.eq.${user.id},parent_id.eq.${user.id}`)
                .order('name', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Error fetching children:', err);
            return [];
        }
    }, [user?.id]);

    const fetchDisciplinePlans = useCallback(async (childId: string) => {
        try {
            const { data, error } = await supabase
                .from('discipline_plans')
                .select('*')
                .eq('child_id', childId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching discipline plans:', error);
            return [];
        }
    }, []);

    const fetchTemplates = useCallback(async () => {
        if (!user?.id) return [];

        try {
            const { data, error } = await supabase
                .from('discipline_templates')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            return [...(data || []), ...PRELOADED_DISCIPLINE];
        } catch (error) {
            console.error('Error fetching templates:', error);
            return PRELOADED_DISCIPLINE;
        }
    }, [user?.id]);

    // Main data fetching
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const childrenData = await fetchChildren();
            setChildren(childrenData);

            if (childrenData.length) {
                const currentChildId = childId || childrenData[0]?.id;
                if (currentChildId) {
                    setChildId(currentChildId);
                    const child = childrenData.find(c => c.id === currentChildId);
                    if (child) setChildName(child.name);

                    const plansData = await fetchDisciplinePlans(currentChildId);
                    setPlans(plansData);
                }
            }

            const templatesData = await fetchTemplates();
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error in fetchData:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [childId, fetchChildren, fetchDisciplinePlans, fetchTemplates]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const handleSavePlan = useCallback(async (plan: DisciplinePlan) => {
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
                const { error: insertError } = await supabase
                    .from('discipline_plans')
                    .insert({
                        ...plan,
                        id: uuidv4(),
                        child_id: childId || ''
                    });
                error = insertError;
            }

            if (error) throw error;

            if (childId) {
                const plansData = await fetchDisciplinePlans(childId);
                setPlans(plansData);
            }
        } catch (error) {
            console.error('Error saving discipline plan:', error);
        } finally {
            setLoading(false);
        }
    },
        [childId, fetchDisciplinePlans]
    );

    const handleDeletePlan = useCallback(async (planId: string) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('discipline_plans')
                .delete()
                .eq('id', planId);

            if (error) throw error;

            setPlans(prev => prev.filter(p => p.id !== planId));
        } catch (error) {
            console.error('Error deleting discipline plan:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeleteTemplate = useCallback(async (templateId: string) => {
        try {
            const { error } = await supabase
                .from('discipline_templates')
                .delete()
                .eq('id', templateId);

            if (error) throw error;

            const templatesData = await fetchTemplates();
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    }, [fetchTemplates]);

    const applyTemplate = useCallback(async (template: DisciplineTemplate) => {
        try {
            setLoading(true);
            const newPlan: DisciplinePlan = {
                ...template,
                child_id: childId || '',
                id: uuidv4()
            };

            const { error } = await supabase
                .from('discipline_plans')
                .insert(newPlan);

            if (error) throw error;

            // Refresh the plans list
            if (childId) {
                const plansData = await fetchDisciplinePlans(childId);
                setPlans(plansData);
            }
        } catch (error) {
            console.error('Error applying template:', error);
        } finally {
            setLoading(false);
        }
    }, [childId, fetchDisciplinePlans]);

    const toggleModal = (modal: keyof typeof modalState, value?: boolean) => {
        setModalState(prev => ({ ...prev, [modal]: value ?? !prev[modal] }));
    };

    const renderPlanCard = (plan: DisciplinePlan) => {
        const isExpanded = expandedPlanId === plan.id;

        return (
            <Card key={plan.id}
                backgroundColor={colors.card}
                borderRadius="$6" mt="$3"
            >
                <XStack
                    padding="$4"
                    justifyContent="space-between"
                    alignItems="center"
                    onPress={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                >
                    <YStack flex={1}>
                        <Text fontWeight="bold" fontSize="$4" color={colors.text}>
                            {plan.name}
                        </Text>
                    </YStack>

                    <XStack space="$2">
                        <Button
                            size="$2"
                            circular
                            icon={<Edit3 size={18} color={colors.primary as any} />}
                            onPress={(e) => {
                                e.stopPropagation();
                                setEditingPlan(plan);
                            }}
                            backgroundColor={colors.surface}
                        />
                        <Button
                            size="$2"
                            circular
                            icon={
                                isExpanded ?
                                    <ChevronUp size={18} color={colors.primary as any} /> :
                                    <ChevronDown size={18} color={colors.primary as any} />
                            }
                            onPress={(e) => {
                                e.stopPropagation();
                                setExpandedPlanId(isExpanded ? null : plan.id);
                            }}
                            backgroundColor={colors.surface}
                        />
                    </XStack>
                </XStack>

                {isExpanded && (
                    <YStack padding="$4" borderTopWidth={1} borderTopColor={colors.secondary as any}>
                        <YStack space="$3">
                            <YStack space="$2">
                                <Text fontSize="$7" fontWeight="bold" color={colors.text}>
                                    Rules:
                                </Text>
                                <Text color={colors.onPrimary}>{plan.name || 'No rules defined yet.'}</Text>
                            </YStack>
                            <YStack space="$2">
                                <Text fontSize="$7" fontWeight="bold" color={colors.text}>
                                    Consequences
                                </Text>
                                <Text color={colors.onPrimary}>{plan.consequences || 'No consequences defined yet.'}</Text>
                            </YStack>
                            {plan.notes && (
                                <YStack space="$2">
                                    <Text fontSize="$7" fontWeight="bold" color={colors.text}>
                                        Parent Notes
                                    </Text>
                                    <Text color={colors.onPrimary}>{plan.notes}</Text>
                                </YStack>
                            )}
                        </YStack>

                        <XStack justifyContent="space-between" marginTop="$5">
                            <Button
                                onPress={() => handleDeletePlan(plan.id)}
                                backgroundColor={colors.error}
                                color={colors.onPrimary}
                            >
                                Delete Plan
                            </Button>

                            <Button
                                onPress={() => navigation.navigate('Print', {
                                    plan: JSON.stringify(plan),
                                    childName
                                })}
                                backgroundColor={colors.primary}
                                color={colors.surface}
                                icon={<Feather name="printer" size={16} />}
                            >
                                Print
                            </Button>
                        </XStack>
                    </YStack>
                )}
            </Card>
        );
    };

    const renderTemplateCard = (template: DisciplineTemplate) => {
        const isExpanded = expandedTemplateId === template.id;

        return (
            <Card key={template.id}
                backgroundColor={colors.card}
                borderRadius="$6"
                mt="$3"
                height={88}
                elevate
            >
                <XStack
                    padding="$4"
                    justifyContent="space-between"
                    alignItems="center"
                    onPress={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                >
                    <YStack flex={1}>
                        <Text fontWeight="bold" fontSize="$4" color={colors.text}>
                            {template.name}
                        </Text>
                        <Text color={colors.textSecondary} fontSize="$2" marginTop="$1">
                            {template.ageRange || 'All ages'} • {template.isPreloaded ? 'Preloaded' : 'Custom'}
                        </Text>
                    </YStack>

                    <XStack space="$2">
                        {!template.isPreloaded && (
                            <Button
                                size="$2"
                                circular
                                icon={<Edit3 size={18} color={colors.primary as any} />}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setEditingPlan({
                                        ...template,
                                        child_id: childId || '',
                                        id: ''
                                    });
                                }}
                                backgroundColor={colors.surface}
                            />
                        )}
                        <Button
                            size="$2"
                            circular
                            icon={
                                isExpanded ?
                                    <ChevronUp size={18} color={colors.primary as any} /> :
                                    <ChevronDown size={18} color={colors.primary as any} />
                            }
                            onPress={(e) => {
                                e.stopPropagation();
                                setExpandedTemplateId(isExpanded ? null : template.id);
                            }}
                            backgroundColor={colors.surface}
                        />
                    </XStack>
                </XStack>

                {isExpanded && (
                    <YStack padding="$4" borderTopWidth={1} borderTopColor={colors.border as any}>
                        <YStack space="$3">
                            <YStack space="$2">
                                <Text fontSize="$5" fontWeight="bold" color={colors.text}>
                                    Rules:
                                </Text>
                                <Text color={colors.text}>{template.name || 'No rules defined yet.'}</Text>
                            </YStack>
                            <YStack space="$2">
                                <Text fontSize="$5" fontWeight="bold" color={colors.text}>
                                    Consequences
                                </Text>
                                <Text color={colors.text}>{template.consequences || 'No consequences defined yet.'}</Text>
                            </YStack>
                            {template.notes && (
                                <YStack space="$2">
                                    <Text fontSize="$5" fontWeight="bold" color={colors.text}>
                                        Parent Notes
                                    </Text>
                                    <Text color={colors.text}>{template.notes}</Text>
                                </YStack>
                            )}
                        </YStack>

                        <XStack space="$2" marginTop="$5">
                            {!template.isPreloaded && (
                                <Button
                                    onPress={() => handleDeleteTemplate(template.id)}
                                    backgroundColor={colors.error}
                                    color={colors.onPrimary}
                                    flex={1}
                                >
                                    Delete Template
                                </Button>
                            )}
                            <Button
                                onPress={() => applyTemplate(template)}
                                backgroundColor={colors.secondary}
                                color={isDark ? colors.primary : colors.onPrimary}
                                flex={1}
                            >
                                Apply to Child
                            </Button>
                        </XStack>
                    </YStack>
                )}
            </Card>
        );
    };

    if (loading && !refreshing) {
        return (
            <View flex={1} justifyContent="center" alignItems="center">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <GoalBackground>
            <View flex={1}>

                {/* Header */}
                <View mx="$3" mt="$9" mb="$1">
                    <XStack ai="center" position="relative" space='$5'>
                        {/* Back Button */}
                        <Button
                            unstyled
                            circular
                            pressStyle={{ opacity: 0.6 }}
                            onPress={navigation.goBack}
                            icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                        />

                        {/* Center Title (absolute center) */}
                        <YStack
                            left={0}
                            ai="center"
                            pointerEvents="none"
                        >
                            <Text color={colors.text} fontWeight="700" fontSize="$5" ta="center">
                                Choose Templates
                            </Text>

                        </YStack>

                        {/* Child Selector
                    <Button unstyled onPress={() => toggleModal('childSelection', true)}>
                        <YStack ai="center" mt="$3">
                            <MaterialIcons name="child-care" size={20} color={colors.primary} />
                            <Text color={colors.primary} fontWeight="700" fontSize="$5" ta="center">
                                {childName ? `${childName}` : 'Select Child'}
                            </Text>
                            {childName && (
                                <Text color={colors.textSecondary} fontSize="$1">
                                    Tap to change child
                                </Text>
                            )}
                        </YStack>
                    </Button>
                     */}
                    </XStack>
                </View>

                {/* Main Content */}
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                    contentContainerStyle={{
                        padding: 16,
                        flexGrow: 1,
                        paddingBottom: 80
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <XStack ai='center' jc='flex-start'>
                        <Button unstyled onPress={() => navigation.navigate('Print', { printAll: true })}>
                            <YStack ai="center" mt="$3">
                                <Feather name="printer" size={20} color={colors.primary} />
                                <Text color={colors.textSecondary} fontSize="$1" mt="$2">
                                    Download all
                                </Text>
                            </YStack>
                        </Button>
                        <Button unstyled onPress={() => navigation.navigate('Print', { printAll: true })}>
                            <YStack ai="center" mt="$3">
                                <Feather name="printer" size={20} color={colors.primary} />
                                <Text color={colors.textSecondary} fontSize="$1" mt="$2">
                                    Print all
                                </Text>
                            </YStack>
                        </Button>
                    </XStack>

                    <Text color={colors.text} fontWeight="700" fontSize="$5" ta="center">
                        Long press to select a plan for print or download
                    </Text>

                    {/* Current Plans */}
                    <Text fontSize="$5" fontWeight="bold" color={colors.text} mb="$3">
                        Current Plans
                    </Text>

                    {plans.length === 0 ? (
                        <Card padding="$4" backgroundColor={colors.card} borderRadius="$4" mb="$4">
                            <Text color={colors.text}>No discipline plans for this child</Text>
                        </Card>
                    ) : (
                        <YStack space="$3" mb="$4">
                            {plans.map(renderPlanCard)}
                        </YStack>
                    )}

                    {/* Templates */}
                    <Text fontSize="$5" fontWeight="bold" color={colors.text} mt="$4" mb="$2">
                        Available Templates
                    </Text>

                    <YStack space="$3">
                        {templates.map(renderTemplateCard)}
                    </YStack>

                    <Button
                        onPress={() => setEditingPlan({
                            id: uuidv4(),
                            name: '',
                            ageRange: '',
                            strategy: '',
                            consequences: '',
                            rewards: '',
                            notes: '',
                            child_id: childId || ''
                        })}
                        backgroundColor={colors.secondary}
                        color={colors.onPrimary}
                        marginTop="$6"
                    >
                        Create New Plan
                    </Button>
                </ScrollView>

                {modalState.childSelection && (
                    <Modal
                        animationType="fade"
                        transparent
                        visible={modalState.childSelection}
                        onRequestClose={() => toggleModal('childSelection', false)}
                    >
                        <View flex={1} justifyContent="center" alignItems="center" backgroundColor="rgba(0,0,0,0.4)">
                            <Card width="90%" padding={16} borderRadius={12} backgroundColor={colors.cardBackground}>
                                <XStack justifyContent="space-between" alignItems="center" marginBottom={16}>
                                    <H4 color={colors.text}>Select a Child</H4>
                                    <Button
                                        unstyled
                                        onPress={() => toggleModal('childSelection', false)}
                                        icon={<MaterialIcons name="close" size={24} color={colors.error} />}
                                    />
                                </XStack>

                                <YStack space={12}>
                                    {children.length > 0 ? (
                                        children.map((child) => (
                                            <Pressable
                                                key={child.id}
                                                onPress={() => {
                                                    setChildId(child.id);
                                                    setChildName(child.name);
                                                    toggleModal('childSelection', false);
                                                }}
                                            >
                                                <YStack
                                                    padding={12}
                                                    backgroundColor={child.id === childId ? colors.surface : colors.background}
                                                    borderRadius={8}
                                                    borderWidth={1}
                                                    borderColor={colors.border as any}
                                                >
                                                    <XStack space={12} alignItems="center">
                                                        <MaterialIcons name="child-care" size={24} color={colors.primary} />
                                                        <YStack>
                                                            <Text fontWeight="600" color={colors.text}>
                                                                {child.name}
                                                            </Text>
                                                        </YStack>
                                                    </XStack>
                                                </YStack>
                                            </Pressable>
                                        ))
                                    ) : (
                                        <Text textAlign="center" color={colors.textSecondary}>
                                            No children available
                                        </Text>
                                    )}
                                </YStack>
                            </Card>
                        </View>
                    </Modal>
                )}

                {/* Edit Plan Modal */}
                {
                    editingPlan && (
                        <DisciplineModal
                            open={true}
                            onOpenChange={(open) => {
                                if (!open) setEditingPlan(null);
                            }}
                            childId={childId || ''}
                            childName={childName}
                            initialData={editingPlan}
                            onSave={async (plan) => {
                                await handleSavePlan(plan);
                                setEditingPlan(null);
                            }}
                        />
                    )
                }
            </View >
        </GoalBackground>
    );
}