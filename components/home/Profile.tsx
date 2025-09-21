import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChildProfile {
    id: string;
    name: string;
    age: number;
    photo?: any;
}

const ChildProfileSelector = ({
    children,
    selectedChild,
    onSelectChild
}: {
    children: ChildProfile[];
    selectedChild: ChildProfile | null;
    onSelectChild: (child: ChildProfile) => void;
}) => {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <TouchableOpacity
                style={[styles.selectorButton, {
                    backgroundColor: colors.surface as any,
                    borderColor: colors.border as any,
                }]}
                onPress={() => setModalVisible(true)}
            >
                <View style={styles.selectedChildContainer}>
                    {selectedChild?.photo && (
                        <Image
                            source={selectedChild.photo}
                            style={[styles.smallImage, { borderColor: colors.primary }]}
                        />
                    )}
                    <Text style={[styles.selectedText, { color: colors.text }]}>
                        {selectedChild?.name || 'Select Child'}
                    </Text>
                </View>
                <MaterialIcons
                    name={modalVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color={colors.textSecondary}
                />
            </TouchableOpacity>

            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Select Child Profile
                        </Text>

                        {children.map(child => (
                            <TouchableOpacity
                                key={child.id}
                                style={[
                                    styles.childOption,
                                    {
                                        backgroundColor: selectedChild?.id === child.id ?
                                            colors.primary : 'transparent',
                                        borderBottomColor: colors.border as any,
                                    }
                                ]}
                                onPress={() => {
                                    onSelectChild(child);
                                    setModalVisible(false);
                                }}
                            >
                                {child.photo && (
                                    <Image
                                        source={child.photo}
                                        style={[styles.optionImage, { borderColor: colors.primary as any }]}
                                    />
                                )}
                                <View style={styles.optionTextContainer}>
                                    <Text style={[styles.optionName, { color: colors.text }]}>
                                        {child.name}
                                    </Text>
                                    <Text style={[styles.optionAge, { color: colors.textSecondary }]}>
                                        {child.age} years old
                                    </Text>
                                </View>
                                {selectedChild?.id === child.id && (
                                    <MaterialIcons
                                        name="check"
                                        size={20}
                                        color={colors.primary as any}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    selectorButton: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
    },
    selectedChildContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    smallImage: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        marginRight: 12,
    },
    selectedText: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        borderRadius: 16,
        padding: 16,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        paddingBottom: 8,
    },
    childOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    optionImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        marginRight: 12,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '500',
    },
    optionAge: {
        fontSize: 14,
        marginTop: 2,
    },
});

export default ChildProfileSelector;