import { useTheme } from '@/styles/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

interface SandWProps {
    strengths: string[];
    weaknesses: string[];
    isEditing: boolean;
    onUpdateStrengths: (newStrengths: string[]) => void;
    onUpdateWeaknesses: (newWeaknesses: string[]) => void;
    fetchStrengths?: () => Promise<string[]>;
    fetchWeaknesses?: () => Promise<string[]>;
}

const SandW: React.FC<SandWProps> = ({
    strengths: initialStrengths,
    weaknesses: initialWeaknesses,
    isEditing,
    onUpdateStrengths,
    onUpdateWeaknesses,
    fetchStrengths,
    fetchWeaknesses,
}) => {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<'strengths' | 'weaknesses'>('strengths');
    const [tempItems, setTempItems] = useState<string[]>([]);
    const [strengths, setStrengths] = useState<string[]>(initialStrengths);
    const [weaknesses, setWeaknesses] = useState<string[]>(initialWeaknesses);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const s = fetchStrengths ? await fetchStrengths() : initialStrengths;
                const w = fetchWeaknesses ? await fetchWeaknesses() : initialWeaknesses;
                setStrengths(s);
                setWeaknesses(w);
                setTempItems(activeTab === 'strengths' ? [...s] : [...w]);
            } catch (error) {
                console.error('Failed to load strengths/weaknesses:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        setTempItems(activeTab === 'strengths' ? [...strengths] : [...weaknesses]);
    }, [activeTab]);

    const handleItemChange = (text: string, index: number) => {
        const newItems = [...tempItems];
        newItems[index] = text;
        setTempItems(newItems);
    };

    const handleAddItem = () => {
        setTempItems([...tempItems, '']);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...tempItems];
        newItems.splice(index, 1);
        setTempItems(newItems);
    };

    const handleSaveItems = () => {
        const cleanedItems = tempItems.filter(item => item.trim() !== '');
        if (activeTab === 'strengths') {
            setStrengths(cleanedItems);
            onUpdateStrengths(cleanedItems);
        } else {
            setWeaknesses(cleanedItems);
            onUpdateWeaknesses(cleanedItems);
        }
        Alert.alert('Saved', `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} saved successfully.`);
    };

    const renderItems = () => {
        const items = isEditing ? tempItems : (activeTab === 'strengths' ? strengths : weaknesses);

        if (isEditing) {
            return (
                <View style={styles.tabContent}>
                    {items.map((item, index) => (
                        <View key={index} style={[styles.listItem, { backgroundColor: colors.cardBackground }]}>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.listInput,
                                    { backgroundColor: colors.inputBackground, color: colors.text },
                                ]}
                                value={item}
                                onChangeText={text => handleItemChange(text, index)}
                                placeholder={`Enter ${activeTab.slice(0, -1)}...`}
                                placeholderTextColor={colors.textSecondary}
                            />
                            <TouchableOpacity onPress={() => handleRemoveItem(index)} style={styles.removeButton}>
                                <Ionicons name="close-circle" size={24} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity style={[styles.addButton, { borderColor: colors.primary }]} onPress={handleAddItem}>
                        <Ionicons name="add" size={20} color={colors.primary} />
                        <Text style={[styles.addButtonText, { color: colors.primary }]}>
                            Add {activeTab === 'strengths' ? 'Strength' : 'Weakness'}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        } else {
            return (
                <View style={styles.twoColumnContainer}>
                    <View style={styles.column}>
                        {items.slice(0, Math.ceil(items.length / 2)).map((item, index) => (
                            <View key={index} style={[styles.listItemStatic, { backgroundColor: colors.cardBackground }]}>
                                <View style={[styles.bulletPoint, { backgroundColor: activeTab === 'strengths' ? colors.success : colors.warning }]} />
                                <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={styles.column}>
                        {items.slice(Math.ceil(items.length / 2)).map((item, index) => (
                            <View key={index + Math.ceil(items.length / 2)} style={[styles.listItemStatic, { backgroundColor: colors.cardBackground }]}>
                                <View style={[styles.bulletPoint, { backgroundColor: activeTab === 'strengths' ? colors.success : colors.warning }]} />
                                <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.tabsContainer, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.tabsHeader, { borderBottomColor: typeof colors.border === 'string' ? colors.border : '#ccc' }]}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'strengths' && styles.activeTab,
                        activeTab === 'strengths' && { borderBottomColor: colors.primary },
                    ]}
                    onPress={() => setActiveTab('strengths')}
                >
                    <Ionicons name="happy" size={20} color={colors.primary} style={styles.tabIcon} />
                    <Text style={[styles.tabButtonText, { color: colors.primary }]}>Strengths</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activeTab === 'weaknesses' && styles.activeTab,
                        activeTab === 'weaknesses' && { borderBottomColor: colors.primary },
                    ]}
                    onPress={() => setActiveTab('weaknesses')}
                >
                    <Ionicons name="sad" size={20} color={colors.primary} style={styles.tabIcon} />
                    <Text style={[styles.tabButtonText, { color: colors.primary }]}>Weaknesses</Text>
                </TouchableOpacity>
            </View>
            {renderItems()}
            {isEditing && (
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSaveItems}>
                    <Text style={[styles.saveButtonText, { color: colors.buttonText }]}>Save Changes</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tabsContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginVertical: 16,
    },
    tabsHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabButton: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabIcon: {
        marginRight: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    tabContent: {
        padding: 16,
    },
    twoColumnContainer: {
        flexDirection: 'row',
        padding: 16,
    },
    column: {
        flex: 1,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    listItemStatic: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
    },
    bulletPoint: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
    },
    listInput: {
        flex: 1,
        marginRight: 12,
    },
    listText: {
        fontSize: 16,
        flex: 1,
    },
    removeButton: {
        padding: 4,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        marginTop: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    addButtonText: {
        marginLeft: 8,
        fontWeight: '600',
        fontSize: 14,
    },
    saveButton: {
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 16,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
});

export default SandW;
