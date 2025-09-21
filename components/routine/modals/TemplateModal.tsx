import { getPreloadedTemplates } from "@/constants/Routines";
import { useTheme } from "@/styles/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal } from "react-native";
import {
    Button,
    Card,
    H4,
    Paragraph,
    ScrollView,
    Text,
    View,
    XStack, YStack
} from "tamagui";
import { v4 as uuidv4 } from 'uuid';

type RoutineTemplate = {
    id: string;
    name: string;
    ageRange: string;
    description?: string;
    tasks: (string | TemplateTask)[];
    notes?: string;
    isPreloaded?: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    categories?: string[];
};

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

type RoutineSection = {
    id: string;
    name: string;
    timeSlot: string;
    tasks: TemplateTask[];
    isExpanded: boolean;
    icon?: string;
    color?: string;
    templateId?: string;
    templateName?: string;
};

const getSectionName = (timeSlot: string): string => {
    if (timeSlot === 'Unscheduled') return 'Anytime';

    const time = timeSlot.split(':')[0];
    const hour = parseInt(time, 10);

    if (hour >= 5 && hour < 12) return 'Morning Routine';
    if (hour >= 12 && hour < 14) return 'Midday Routine';
    if (hour >= 14 && hour < 18) return 'Afternoon Routine';
    if (hour >= 18 && hour < 21) return 'Evening Routine';
    return 'Night Routine';
};

const organizeIntoSections = (template: RoutineTemplate): RoutineSection[] => {
    const sectionsMap: Record<string, RoutineSection> = {};

    template.tasks.forEach(task => {
        const taskObj = typeof task === 'string' ? { title: task } : task;
        const timeSlot = taskObj.time_slot || 'Unscheduled';

        if (!sectionsMap[timeSlot]) {
            sectionsMap[timeSlot] = {
                id: uuidv4(),
                name: getSectionName(timeSlot),
                timeSlot,
                tasks: [],
                isExpanded: true,
                templateId: template.id,
                templateName: template.name
            };
        }

        sectionsMap[timeSlot].tasks.push(taskObj);
    });

    return Object.values(sectionsMap);
};

export const TemplateModal = () => {
    const { colors } = useTheme();
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [localPreloadedTemplates, setLocalPreloadedTemplates] = useState<RoutineTemplate[]>([]);
    const [routineSections, setRoutineSections] = useState<RoutineSection[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<RoutineTemplate | null>(null);
    const [preloadedTemplates, setPreloadedTemplates] = useState<RoutineTemplate[]>([]);
    const [userTemplates, setUserTemplates] = useState<RoutineTemplate[]>([]);
    const [childId, setChildId] = useState<string | null>(null);
    const [childName, setChildName] = useState('');
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<Array<{ id: string; name: string; age: number }>>([]);
    const [appliedTasks, setAppliedTasks] = useState<Array<{
        id: string;
        title: string;
        time_slot?: string;
        templateName: string;
        applied_at: string;
    }>>([]);

    // Modal states
    const [modalState, setModalState] = useState({
        add: false,
        template: false,
        detail: false,
        userTemplates: false,
        childSelection: false,
        edit: false
    });

    const toggleModal = (modal: keyof typeof modalState, value?: boolean) => {
        setModalState(prev => ({
            ...prev,
            [modal]: value !== undefined ? value : !prev[modal]
        }));
    };

    useEffect(() => {
        const loadTemplates = async () => {
            if (modalState.template) {
                setLoadingTemplates(true);
                try {
                    const templates = await getPreloadedTemplates();
                    setLocalPreloadedTemplates(templates);
                } catch (error) {
                    console.error('Error loading templates:', error);
                } finally {
                    setLoadingTemplates(false);
                }
            }
        };

        loadTemplates();
    }, [modalState.template]);

    return (
        <Modal
            animationType="slide"
            transparent
            visible={modalState.template}
            onRequestClose={() => toggleModal('template', false)}
        >
            <View flex={1} justifyContent="center" backgroundColor="rgba(0,0,0,0.5)">
                <Card backgroundColor={colors.cardBackground} margin={20} borderRadius={10} padding={20} maxHeight="80%">
                    <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
                        <H4 color={colors.text}>Preloaded Routine Templates</H4>
                        <Button
                            unstyled
                            onPress={() => toggleModal('template', false)}
                            icon={<Feather name="x" size={24} color={colors.text} />}
                        />
                    </XStack>

                    {loadingTemplates ? (
                        <View flex={1} justifyContent="center" alignItems="center">
                            <Text>Loading templates...</Text>
                        </View>
                    ) : (
                        <ScrollView>
                            <YStack space="$3">
                                {localPreloadedTemplates.map((routine) => (
                                    <Card
                                        key={routine.id}
                                        padding="$4"
                                        borderWidth={1}
                                        borderColor={colors.primary}
                                        backgroundColor={colors.surface}
                                        marginBottom="$3"
                                        borderRadius="$3"
                                        shadowColor="#000"
                                        shadowOffset={{ width: 0, height: 2 }}
                                        shadowOpacity={0.1}
                                        shadowRadius={3}
                                    >
                                        <YStack space="$2">
                                            <XStack justifyContent="space-between" alignItems="center">
                                                <Text fontWeight="bold" color={colors.text}>{routine.name}</Text>
                                                <Text color={colors.textSecondary}>{routine.ageRange}</Text>
                                            </XStack>
                                            <Paragraph color={colors.textSecondary} numberOfLines={2}>
                                                {routine.description}
                                            </Paragraph>
                                            <Button
                                                marginTop="$2"
                                                onPress={() => {
                                                    setSelectedTemplate(routine);
                                                    setRoutineSections(organizeIntoSections(routine));
                                                    toggleModal('template', false);
                                                }}
                                                backgroundColor={colors.primary}
                                                color={colors.onPrimary}
                                                disabled={loading}
                                                borderRadius="$2"
                                            >
                                                View Details
                                            </Button>
                                        </YStack>
                                    </Card>
                                ))}
                            </YStack>
                        </ScrollView>
                    )}
                </Card>
            </View>
        </Modal>
    );
};