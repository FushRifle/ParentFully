import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, XStack, YStack } from 'tamagui';

interface ConfirmModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}


const ConfirmModal: React.FC<ConfirmModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
}) => {
    const { colors } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <YStack
                    backgroundColor={colors.surface}
                    borderRadius="$4"
                    padding="$4"
                    width="80%"
                    space="$3"
                >
                    <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.primary }]}>{message}</Text>

                    <XStack space="$3" justifyContent="flex-end">
                        <Button
                            onPress={onClose}
                            backgroundColor={colors.error}
                            color={colors.onPrimary}
                            pressStyle={{ opacity: 0.8 }}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onPress={onConfirm}
                            backgroundColor={colors.error}
                            color={colors.onPrimary}
                            pressStyle={{ opacity: 0.8 }}
                        >
                            {confirmText}
                        </Button>
                    </XStack>
                </YStack>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        marginBottom: 16,
    },
});

export default ConfirmModal;