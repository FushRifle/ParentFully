import { CORE_VALUES_DATA, SOCIAL_DEVELOPMENT_DATA } from '@/data/ValueData';
import { fonts, spacing } from '@/styles/theme';
import { useTheme } from '@/styles/ThemeContext';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

interface CoreValuesModalProps {
    visible: boolean;
    onClose: () => void;
    onAddItems?: (items: typeof SOCIAL_DEVELOPMENT_DATA[0][]) => void;
    selectedValue: typeof CORE_VALUES_DATA[0] | null;
    selectedCoreValues: string[];
    maxSelections: number;
    onSelectCoreValue: (value: string) => void;
}

const CoreValuesModal = ({
    visible,
    onClose,
    onAddItems,
    selectedValue,
    selectedCoreValues,
    maxSelections,
    onSelectCoreValue
}: CoreValuesModalProps) => {
    const { colors } = useTheme();
    const [selectedItems, setSelectedItems] = useState<typeof SOCIAL_DEVELOPMENT_DATA[0][]>([]);
    const [editingItem, setEditingItem] = useState<typeof SOCIAL_DEVELOPMENT_DATA[0] | null>(null);

    const toggleItemSelection = (item: typeof SOCIAL_DEVELOPMENT_DATA[0]) => {
        setSelectedItems(prev => {
            const exists = prev.some(i => i.area === item.area);
            if (exists) {
                return prev.filter(i => i.area !== item.area);
            } else {
                return [...prev, item];
            }
        });
    };

    const handleAddItems = () => {
        if (onAddItems && selectedItems.length > 0) {
            onAddItems(selectedItems);
        }
        onClose();
    };

    const handleSelectCoreValue = () => {
        if (selectedValue) {
            onSelectCoreValue(selectedValue.title);
        }
        onClose();
    };

    const handleEditItem = (item: typeof SOCIAL_DEVELOPMENT_DATA[0]) => {
        setEditingItem(item);
        // Here you would implement your edit logic
        // For now we'll just log it
        console.log("Editing item:", item);
    };

    const handleAddNewItem = () => {
        const newItem = {
            status: 'New',
            area: 'Custom Area',
            goal: 'Enter your goal here'
        };
        setEditingItem(newItem as any);
        console.log("Adding new item:", newItem);
    };

    const renderItemTile = ({ item, index }: { item: typeof SOCIAL_DEVELOPMENT_DATA[0]; index: number }) => {
        const isSelected = selectedItems.some(i => i.area === item.area);

        return (
            <View style={[
                styles.tileContainer,
                {
                    backgroundColor: colors.surface,
                    borderColor: colors.border as any,
                    marginBottom: spacing.small as any
                }
            ]}>
                <View style={styles.tileHeader}>
                    <Checkbox
                        status={isSelected ? 'checked' : 'unchecked'}
                        onPress={() => toggleItemSelection(item)}
                        color={colors.primary as any}
                    />

                    <View style={styles.tileMainContent}>
                        <Text style={[styles.tileTitle, { color: colors.text }]}>
                            {item.area}
                        </Text>

                        <View style={styles.tileDetails}>

                            {/* Status row */}
                            <View style={styles.detailRow}>
                                <Text style={[styles.labelText, { color: colors.text }]}>Status:</Text>
                                <View style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            item.status === 'Mastered' ? colors.success :
                                                item.status === 'Working on' ? colors.warning :
                                                    colors.primary,
                                        borderColor: colors.border as any
                                    }
                                ]}>
                                    <Text style={[styles.statusText, { color: colors.onPrimary }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Goal row */}
                            <View style={styles.detailRow}>
                                <Text style={[styles.labelText, { color: colors.text }]}>Goal:</Text>
                                <Text style={[styles.valueText, { color: colors.text }]}>
                                    {item.goal}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => handleEditItem(item)}
                        style={styles.editButton}
                    >
                        <MaterialIcons
                            name="edit"
                            size={20}
                            color={colors.primary as any}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (!selectedValue) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <View style={styles.modalOverlay} />
            </Pressable>

            <View style={[
                styles.modalContainer,
                { backgroundColor: colors.background }
            ]}>
                <View style={[
                    styles.modalHeader,
                    {
                        backgroundColor: selectedValue.color,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }
                ]}>
                    <View style={[
                        styles.modalIconContainer,
                        { backgroundColor: colors.onPrimary }
                    ]}>
                        <selectedValue.iconComponent
                            name={selectedValue.icon as any}
                            size={32}
                            color={selectedValue.iconColor}
                        />
                    </View>
                    <Text style={[
                        styles.modalTitle,
                        { color: colors.onPrimary }
                    ]}>
                        {selectedValue.title}
                    </Text>
                    <Text style={[
                        styles.modalSubtitle,
                        { color: colors.onPrimary }
                    ]}>
                        {selectedValue.description}
                    </Text>
                </View>

                <FlatList
                    data={SOCIAL_DEVELOPMENT_DATA}
                    renderItem={renderItemTile}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.tilesContainer}
                    style={{ maxHeight: Dimensions.get('window').height * 0.6 }}
                    ListHeaderComponent={
                        <TouchableOpacity
                            style={[
                                styles.addNewContainer,
                                { backgroundColor: colors.surface, borderColor: colors.border as any }
                            ]}
                            onPress={handleAddNewItem}
                        >
                            <AntDesign name="pluscircleo" size={24} color={colors.primary} />
                            <Text style={[styles.addNewText, { color: colors.primary }]}>
                                Add New Goal
                            </Text>
                        </TouchableOpacity>
                    }
                />

                <View style={[
                    styles.modalFooter,
                    { borderTopColor: colors.border as any }
                ]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[
                            styles.modalButton,
                            {
                                backgroundColor: colors.surface,
                                borderColor: colors.border as any
                            }
                        ]}
                    >
                        <Text style={[styles.buttonText, { color: colors.text }]}>
                            Close
                        </Text>
                    </TouchableOpacity>

                    {selectedItems.length > 0 && (
                        <TouchableOpacity
                            onPress={handleAddItems}
                            style={[
                                styles.modalButton,
                                {
                                    backgroundColor: colors.secondary,
                                    marginHorizontal: spacing.small
                                }
                            ]}
                        >
                            <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                                Add {selectedItems.length} Items
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={handleSelectCoreValue}
                        style={[
                            styles.modalButton,
                            {
                                backgroundColor: colors.primary,
                                opacity: selectedCoreValues.includes(selectedValue.title) ||
                                    selectedCoreValues.length < maxSelections ? 1 : 0.6
                            }
                        ]}
                        disabled={!selectedCoreValues.includes(selectedValue.title) &&
                            selectedCoreValues.length >= maxSelections}
                    >
                        <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                            {selectedCoreValues.includes(selectedValue.title) ? 'Selected ✓' : 'Select'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    tileDetails: {
        paddingVertical: 10,
        gap: 6
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap', // allows long text to wrap
        gap: 6
    },
    labelText: {
        fontWeight: 'bold',
        fontSize: 14,
        width: 60 // or use flexBasis if dynamic width is needed
    },
    valueText: {
        fontSize: 14,
        flexShrink: 1
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: spacing.medium,
    },
    modalHeader: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        paddingBottom: spacing.medium,
    },
    modalIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.small,
    },
    modalTitle: {
        ...fonts.title,
        marginBottom: spacing.tiny,
        textAlign: 'center',
    },
    modalSubtitle: {
        ...fonts.body,
        textAlign: 'center',
        paddingHorizontal: spacing.medium,
    },
    tilesContainer: {
        padding: spacing.medium,
    },
    addNewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.medium,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginBottom: spacing.medium,
    },
    addNewText: {
        ...fonts.subtitle,
        marginLeft: spacing.small,
    },
    tileContainer: {
        borderRadius: 12,
        borderWidth: 1,
        padding: spacing.small,
    },
    tileHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    tileMainContent: {
        flex: 1,
        marginHorizontal: spacing.small,
    },
    tileTitle: {
        ...fonts.subtitle,
        marginBottom: spacing.tiny,
    },
    tileGoal: {
        ...fonts.body,
    },
    editButton: {
        padding: spacing.tiny,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.small,
        paddingHorizontal: spacing.medium,
        borderTopWidth: 1,
    },
    modalButton: {
        flex: 1,
        padding: spacing.small,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    buttonText: {
        ...fonts.subtitle,
        fontSize: 14,
    },
});

export default CoreValuesModal;