import ValuesGrid from '@/components/curriculums/ValuesGrid';
import ProgressBar from '@/components/ui/ProgressBar';
import { useTheme } from '@/styles/ThemeContext';
import { CURRICULUM_CATEGORIES } from '@/supabase/constants';
import { CurriculumSelectionScreenProps } from '@/types/curriculum';
import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CurriculumSelectionScreen = ({ initialSelected = [], onSave, onBack }: CurriculumSelectionScreenProps) => {
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialSelected);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'age3_5' | 'age6_8' | 'age9_11' | 'age13plus'>('age3_5');
    const { colors } = useTheme();

    const toggleCategory = (key: string) => {
        setSelectedCategories(prev =>
            prev.includes(key)
                ? prev.filter(k => k !== key)
                : [...prev, key]
        );
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await new Promise(resolve => setTimeout(resolve, 800));
            onSave?.(selectedCategories);
        } finally {
            setIsSaving(false);
        }
    };

    const ageGroups = [
        { id: 'age3_5', label: 'Age 3–5' },
        { id: 'age6_8', label: 'Age 6–8' },
        { id: 'age9_11', label: 'Age 9–11' },
        { id: 'age13plus', label: 'Age 13+' },
    ];

    const renderCategoryCard = (category: typeof CURRICULUM_CATEGORIES[0]) => {
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
                        borderColor: isSelected ? colors.primaryDark : colors.border as any,
                    }
                ]}
            >
                <View style={[
                    styles.iconContainer,
                    {
                        backgroundColor: isSelected ? colors.primaryLight : colors.background as any,
                    }
                ]}>
                    <Feather
                        name={category.icon as any}
                        size={20}
                        color={isSelected ? colors.onPrimary : colors.primary as any}
                    />
                </View>
                <Text style={[
                    styles.cardTitle,
                    { color: isSelected ? colors.onPrimary : colors.text as any }
                ]}>
                    {category.label}
                </Text>
                {category.progress && (
                    <ProgressBar
                        progress={category.progress}
                        progressColor={isSelected ? colors.onPrimary : colors.primary as any}
                        backgroundColor={isSelected ? colors.primaryLight : colors.background as any}
                    />
                )}
                <Text style={[
                    styles.updateText,
                    { color: isSelected ? colors.onPrimary : colors.textSecondary as any }
                ]}>
                    Updated {category.lastUpdated}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header */}
            <View style={[styles.header, {
                backgroundColor: colors.primary,
                borderBottomColor: colors.primaryDark
            }]}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Feather name="chevron-left" size={24} color={colors.onPrimary} />
                    </TouchableOpacity>
                )}
                <Text style={[styles.headerTitle, { color: colors.onPrimary }]}>
                    Parenting Curriculum
                </Text>
                <View style={styles.headerRight} />
            </View>

            {/* Age Group Selection */}
            <View style={styles.ageGroupSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Age Groups
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.ageGroupScrollContent}
                >
                    {ageGroups.map(group => (
                        <TouchableOpacity
                            key={group.id}
                            style={[
                                styles.ageGroupButton,
                                {
                                    backgroundColor: activeTab === group.id ? colors.primary : colors.surface as any,
                                    borderColor: colors.border as any,
                                }
                            ]}
                            onPress={() => setActiveTab(group.id as any)}
                        >
                            <Text style={[
                                styles.ageGroupText,
                                { color: activeTab === group.id ? colors.onPrimary : colors.text as any }
                            ]}>
                                {group.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topicsContainer}>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Select the areas you want to focus on. We'll personalize your content based on your choices.
                    </Text>

                    {activeTab === 'age3_5' ? (
                        <ValuesGrid />
                    ) : (
                        <View style={styles.grid}>
                            {CURRICULUM_CATEGORIES.map(renderCategoryCard)}
                        </View>
                    )}
                </View>

                {/* Save Button */}
                <View style={{ marginBottom: 100 }}>
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
                                {selectedCategories.length > 0
                                    ? `Save Changes (${selectedCategories.length} selected)`
                                    : 'Select at least one category'}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    headerRight: {
        width: 24,
    },
    ageGroupSection: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    ageGroupScrollContent: {
        paddingBottom: 8,
    },
    ageGroupButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 8,
    },
    ageGroupText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 10,
    },
    topicsContainer: {
        flex: 1,
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
        textAlign: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    card: {
        width: (SCREEN_WIDTH - 40) / 2,
        padding: 16,
        borderWidth: 1,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        alignSelf: 'center',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    updateText: {
        fontSize: 12,
        marginTop: 8,
        textAlign: 'center',
    },
    saveButtonContainer: {
        padding: 16,
    },
    saveButton: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 70,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CurriculumSelectionScreen;