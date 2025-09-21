import CoreValuesGrid from '@/components/curriculums/ValuesGrid';
import ProgressBar from '@/components/ui/ProgressBar';
import { fonts, spacing } from '@/styles/theme';
import { useTheme } from '@/styles/ThemeContext';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PlanCategory {
    key: string;
    label: string;
    icon: string;
    progress?: number;
    lastUpdated?: string;
}

const CURRICULUM_CATEGORIES: PlanCategory[] = [
    { key: 'social', label: 'Social Development Goals', icon: 'heart', progress: 35, lastUpdated: '2 days ago' },
    { key: 'academic', label: 'Academic Development Goals', icon: 'book', progress: 60, lastUpdated: '1 week ago' },
    { key: 'emotional', label: 'Emotional Development Goals', icon: 'moon', progress: 45, lastUpdated: '3 days ago' },
    { key: 'skills', label: 'Life Skills + Critical Thinking & Problem Solving', icon: 'shield', progress: 25, lastUpdated: 'just now' },
    { key: 'physical', label: 'Physical Development & Health Goals', icon: 'users', progress: 70, lastUpdated: '1 day ago' },
    { key: 'religion', label: 'Faith/Religion Developmental Goals', icon: 'book', progress: 55, lastUpdated: '4 days ago' },
    { key: 'finance', label: 'Financial Literacy Goals', icon: 'activity', progress: 40, lastUpdated: '1 week ago' },
    { key: 'digital', label: 'Digital & Media Literacy Goals', icon: 'tablet', progress: 30, lastUpdated: '2 weeks ago' },
    { key: 'community', label: 'Civic & Community Engagement Goals', icon: 'tablet', progress: 30, lastUpdated: '2 weeks ago' },
    { key: 'communication', label: 'Creative Expression & Communication Skills', icon: 'tablet', progress: 30, lastUpdated: '2 weeks ago' },

];

interface CurriculumSelectionScreenProps {
    initialSelected?: string[];
    onSave?: (selected: string[]) => void;
    onBack?: () => void;
}

const CurriculumSelectionScreen = ({ initialSelected = [], onSave, onBack }: CurriculumSelectionScreenProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('age3_4');
    const { colors } = useTheme();

    const toggleCategory = (key: string) => {
        if (selectedCategories.includes(key)) {
            setSelectedCategories(selectedCategories.filter(k => k !== key));
        } else {
            setSelectedCategories([...selectedCategories, key]);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            onSave?.(selectedCategories);
        }, 800);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: colors.primary,
                borderBottomColor: colors.primaryDark
            }]}>
                <Text style={[styles.headerTitle, { color: colors.onPrimary }]}>
                    Parenting Curriculum
                </Text>
                <View style={styles.headerRight} />
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'age3_5' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab('age3_5')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'age3_5' && { color: colors.onPrimary }
                    ]}>
                        Age 3–5
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'age6_8' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab('age6_8')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'age6_8' && { color: colors.onPrimary }
                    ]}>
                        Age 6–8
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'age9_11' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab('age9_11')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'age9_11' && { color: colors.onPrimary }
                    ]}>
                        Age 9–11
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'age13plus' && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => setActiveTab('age13plus')}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === 'age13plus' && { color: colors.onPrimary }
                    ]}>
                        Age 13+
                    </Text>
                </TouchableOpacity>
            </View>


            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                                                backgroundColor: isSelected ? colors.primary : colors.surface,
                                                borderColor: isSelected ? colors.primaryDark : colors.border as string || colors.primary,
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
                                        <Text style={[
                                            styles.cardTitle,
                                            { color: isSelected ? colors.onPrimary : colors.text }
                                        ]}>
                                            {category.label}
                                        </Text>
                                        {category.progress && (
                                            <ProgressBar
                                                progress={category.progress}
                                                progressColor={isSelected ? colors.onPrimary as string : colors.primary as string}
                                                backgroundColor={isSelected ? colors.surface as string : colors.background as string}
                                            />
                                        )}
                                        <Text style={[
                                            styles.updateText,
                                            { color: isSelected ? colors.onPrimary : colors.textSecondary }
                                        ]}>
                                            Updated {category.lastUpdated}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Save Button - Now part of the content flow */}
                        <View style={styles.saveButtonContainer}>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={selectedCategories.length === 0 || isSaving}
                                activeOpacity={0.8}
                                style={[
                                    styles.saveButton,
                                    {
                                        backgroundColor: selectedCategories.length === 0 ? colors.disabled : colors.primary,
                                        opacity: selectedCategories.length === 0 ? 0.7 : 1,
                                    }
                                ]}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color={colors.onPrimary} />
                                ) : (
                                    <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
                                        Save Changes ({selectedCategories.length} selected)
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
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