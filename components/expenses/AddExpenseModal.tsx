import { useTheme } from '@/styles/ThemeContext';
import React, { useState } from 'react';
import { Keyboard, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Divider, IconButton, Text, TextInput } from 'react-native-paper';
import uuid from 'react-native-uuid';

interface AddExpenseModalProps {
    visible: boolean;
    onClose: () => void;
    onAdd: (expense: any) => void;
}

const categories = [
    { label: 'Education', icon: 'school' },
    { label: 'Medical', icon: 'medical-bag' },
    { label: 'Activities', icon: 'soccer' },
    { label: 'Clothing', icon: 'tshirt-crew' },
    { label: 'Childcare', icon: 'baby-face-outline' },
    { label: 'Other', icon: 'dots-horizontal' }
];

export const AddExpenseModal = ({ visible, onClose, onAdd }: AddExpenseModalProps) => {
    const { colors } = useTheme();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Other');
    const [split, setSplit] = useState('50');
    const [receiptUrl, setReceiptUrl] = useState('');

    const handleAdd = () => {
        if (!description || !amount) return;

        const newExpense = {
            id: uuid.v4().toString(),
            description,
            amount: parseFloat(amount),
            category,
            date: new Date().toISOString(),
            split_percentage: parseFloat(split),
            status: 'pending',
            receipt_url: receiptUrl
        };
        onAdd(newExpense);
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setDescription('');
        setAmount('');
        setCategory('Other');
        setSplit('50');
        setReceiptUrl('');
    };

    const handleAttachReceipt = () => {
        // Implement document picker logic here
        console.log('Attach receipt functionality');
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text variant="titleMedium" style={[styles.modalTitle, { color: colors.text }]}>
                                Add New Expense
                            </Text>
                            <IconButton
                                icon="close"
                                size={20}
                                onPress={() => {
                                    resetForm();
                                    onClose();
                                }}
                                iconColor={colors.text as string}
                            />
                        </View>
                        <Divider />

                        {/* Form Content */}
                        <View style={styles.formContent}>
                            <TextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                style={[styles.input, { backgroundColor: colors.surface }]}
                                mode="outlined"
                                autoFocus
                            />

                            <TextInput
                                label="Amount ($)"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                style={[styles.input, { backgroundColor: colors.surface }]}
                                mode="outlined"
                                left={<TextInput.Affix text="$" />}
                            />

                            <Text style={[styles.sectionLabel, { color: colors.primary }]}>
                                Category
                            </Text>
                            <View style={styles.categoryContainer}>
                                {categories.map((cat) => (
                                    <Button
                                        key={cat.label}
                                        mode={category === cat.label ? 'contained' : 'outlined'}
                                        onPress={() => setCategory(cat.label)}
                                        style={styles.categoryButton}
                                        icon={cat.icon}
                                        contentStyle={{ flexDirection: 'row-reverse' }}
                                    >
                                        {cat.label}
                                    </Button>
                                ))}
                            </View>

                            <Text style={[styles.sectionLabel, { color: colors.primary }]}>
                                Split Percentage
                            </Text>
                            <View style={styles.splitContainer}>
                                <TextInput
                                    value={split}
                                    onChangeText={setSplit}
                                    keyboardType="numeric"
                                    style={[styles.splitInput, { backgroundColor: colors.surface }]}
                                    mode="outlined"
                                    right={<TextInput.Affix text="%" />}
                                />
                                <View style={styles.splitSlider}>
                                    <Button
                                        mode="text"
                                        onPress={() => setSplit('25')}
                                        style={styles.splitButton}
                                    >
                                        25%
                                    </Button>
                                    <Button
                                        mode="text"
                                        onPress={() => setSplit('50')}
                                        style={styles.splitButton}
                                    >
                                        50%
                                    </Button>
                                    <Button
                                        mode="text"
                                        onPress={() => setSplit('75')}
                                        style={styles.splitButton}
                                    >
                                        75%
                                    </Button>
                                </View>
                            </View>

                            <Button
                                mode="outlined"
                                onPress={handleAttachReceipt}
                                icon="paperclip"
                                style={styles.attachButton}
                            >
                                Attach Receipt
                            </Button>
                        </View>

                        {/* Modal Footer */}
                        <View style={styles.modalFooter}>
                            <Button
                                mode="outlined"
                                onPress={() => {
                                    resetForm();
                                    onClose();
                                }}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleAdd}
                                style={styles.submitButton}
                                disabled={!description || !amount}
                            >
                                Add Expense
                            </Button>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    formContent: {
        paddingVertical: 16,
    },
    input: {
        marginBottom: 16,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginTop: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    categoryButton: {
        marginRight: 8,
        marginBottom: 8,
        borderRadius: 8,
    },
    splitContainer: {
        marginBottom: 16,
    },
    splitInput: {
        marginBottom: 8,
    },
    splitSlider: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    splitButton: {
        flex: 1,
    },
    attachButton: {
        marginTop: 8,
        borderStyle: 'dashed',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
        borderRadius: 8,
    },
    submitButton: {
        flex: 1,
        borderRadius: 8,
    },
});