import CoreValuesGrid from '@/components/curriculums/ValuesGrid';
import ProgressBar from '@/components/ui/ProgressBar';
import { fonts, spacing } from '@/styles/theme';
import { useTheme } from '@/styles/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PlanCategory {
    key: string;
    label: string;
    icon: string;
    progress?: number;
    lastUpdated?: string;
}

const CURRICULUM_CATEGORIES: PlanCategory[] = [
    { key: 'emotional', label: 'Emotional Intelligence', icon: 'heart', progress: 35, lastUpdated: '2 days ago' },
    { key: 'nutrition', label: 'Nutrition', icon: 'feather', progress: 60, lastUpdated: '1 week ago' },
    { key: 'sleep', label: 'Sleep Routines', icon: 'moon', progress: 45, lastUpdated: '3 days ago' },
    { key: 'discipline', label: 'Discipline Techniques', icon: 'shield', progress: 25, lastUpdated: 'just now' },
    { key: 'coparenting', label: 'Co-Parenting', icon: 'users', progress: 70, lastUpdated: '1 day ago' },
    { key: 'learning', label: 'Early Learning', icon: 'book', progress: 55, lastUpdated: '4 days ago' },
    { key: 'health', label: 'Child Health', icon: 'activity', progress: 40, lastUpdated: '1 week ago' },
    { key: 'tech', label: 'Tech Balance', icon: 'tablet', progress: 30, lastUpdated: '2 weeks ago' },
];

interface CurriculumSelectionScreenProps {
    initialSelected?: string[];
    onSave?: (selected: string[]) => void;
    onBack?: () => void;
    onComplete?: () => void;
}

const CurriculumSelectionScreen = ({
    initialSelected = [],
    onSave,
    onBack,
    onComplete
}: CurriculumSelectionScreenProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'values' | 'topics'>('values');
    const { colors } = useTheme();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    const toggleCategory = (key: string) => {
        setSelectedCategories(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            onSave?.(selectedCategories);
        }, 800);
    };

    const handleComplete = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onComplete?.();
        }, 1000);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.header, { backgroundColor: colors.primary, borderBottomColor: colors.primaryDark }]}>
                <Text style={[styles.headerTitle, { color: colors.onPrimary }]}>
                    Parenting Curriculum
                </Text>
                <View style={styles.headerRight} />
            </View>

            <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'values' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab('values')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'values' && { color: colors.onPrimary }
                    ]}>
                        Core Values
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'topics' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab('topics')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'topics' && { color: colors.onPrimary }
                    ]}>
                        Curriculum
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'values' ? (
                    <View style={styles.valuesContainer}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Our foundational principles for holistic family development
                        </Text>
                        <CoreValuesGrid
                            initialSelected={['Love', 'Respect']}
                            maxSelections={4}
                            onSelectionChange={(selected) => console.log('Selected values:', selected)}
                        />
                    </View>
                ) : (
                    <View style={styles.topicsContainer}>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Select the areas you want to focus on. We'll personalize your content based on your choices.
                        </Text>

                        <View style={styles.grid}>
                            {CURRICULUM_CATEGORIES.map(category => {
                                const isSelected = selectedCategories.includes(category.key);
                                return (
                                    <TouchableOpacity
                                        key={category.key}
                                        onPress={() => toggleCategory(category.key)}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.card,
                                            {
                                                backgroundColor: isSelected ? colors.primary : colors.surface as any,
                                                borderColor: isSelected ? colors.primaryDark : colors.border as any
                                            }
                                        ]}
                                    >
                                        <View style={[
                                            styles.iconContainer,
                                            {
                                                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.background,
                                            }
                                        ]}>
                                            <Feather
                                                name={category.icon as any}
                                                size={20}
                                                color={isSelected ? colors.onPrimary : colors.primary}
                                            />
                                        </View>
                                        <Text style={[styles.cardTitle, { color: isSelected ? colors.onPrimary : colors.text }]}>
                                            {category.label}
                                        </Text>
                                        {category.progress != null && (
                                            <ProgressBar
                                                progress={category.progress}
                                                progressColor={isSelected ? colors.onPrimary as string : colors.primary as string}
                                                backgroundColor={isSelected ? colors.surface as string : colors.background as string}
                                            />
                                        )}
                                        <Text style={[styles.updateText, { color: isSelected ? colors.onPrimary : colors.textSecondary }]}>
                                            Updated {category.lastUpdated}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Animated.View
                            style={[
                                styles.footer,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.saveButton,
                                    { backgroundColor: colors.primary, opacity: isLoading || selectedCategories.length === 0 ? 0.6 : 1 }
                                ]}
                                onPress={handleComplete}
                                disabled={isLoading || selectedCategories.length === 0}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>Continue</Text>
                                )}
                            </TouchableOpacity>

                            <Text style={[styles.footerText, { color: colors.lightText }]}>
                                You can always update these preferences later
                            </Text>
                        </Animated.View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = {
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.medium,
        borderBottomWidth: 1,
        elevation: 2,
        marginTop: 10,
    },
    footer: {
        marginTop: 24,
        alignItems: 'center',
    },
    footerText: {
        marginTop: 12,
        fontSize: 13,
    },
    backButton: {
        padding: spacing.small,
    },
    headerTitle: {
        ...fonts.header,
        textAlign: 'center',
        flex: 1,
    },
    headerRight: {
        width: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.medium,
        marginTop: spacing.medium,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
    },
    tabButton: {
        flex: 1,
        padding: spacing.medium,
        alignItems: 'center',
    },
    tabText: {
        ...fonts.bodyBold,
    },
    scrollContent: {
        paddingHorizontal: spacing.medium,
        paddingTop: spacing.medium,
        paddingBottom: 130,

    },
    valuesContainer: {
        marginBottom: spacing.large,
    },
    topicsContainer: {
        marginBottom: spacing.large,
    },
    subtitle: {
        ...fonts.body,
        marginBottom: spacing.large,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.small,
    },
    card: {
        width: '48%',
        borderRadius: 12,
        padding: spacing.medium,
        marginBottom: spacing.small,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.small,
        alignSelf: 'center',
    },
    cardTitle: {
        ...fonts.bodyBold,
        marginBottom: spacing.small,
        textAlign: 'center',
    },
    updateText: {
        ...fonts.small,
        marginTop: spacing.small,
        textAlign: 'center',
        opacity: 0.8,
    },
    saveButtonContainer: {
        marginTop: spacing.large,
        marginBottom: spacing.large,
    },
    saveButton: {
        borderRadius: 8,
        padding: spacing.medium,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    saveButtonText: {
        ...fonts.button,
    },
} as const;

export default CurriculumSelectionScreen;

function setIsLoading(arg0: boolean) {
    throw new Error('Function not implemented.');
}
function onComplete() {
    throw new Error('Function not implemented.');
}

