import { useTheme } from '@/styles/ThemeContext';
import { RootStackParamList } from '@/types';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { ColorValue, Platform, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View } from 'react-native';

type AddCategoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCategory'>;

interface AddCategoryScreenProps {
    navigation: AddCategoryScreenNavigationProp;
}

const AddCategoryScreen: React.FC<AddCategoryScreenProps> = ({ navigation }) => {
    const { colors, fonts } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Add your submission logic here
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <Text style={[fonts.header, { color: colors.text, marginBottom: 24 }]}>
                    Add New Category
                </Text>

                <Text style={[styles.label, { color: colors.text }]}>Category Name</Text>
                <TextInput
                    style={[
                        styles.input,
                        { backgroundColor: colors.inputBackground, color: colors.text }
                    ]}
                    placeholder="e.g. Emotional Development"
                    placeholderTextColor={colors.textSecondary}
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={[styles.label, { color: colors.text, marginTop: 16 }]}>
                    Description
                </Text>
                <TextInput
                    style={[
                        styles.textArea,
                        { backgroundColor: colors.inputBackground, color: colors.text }
                    ]}
                    placeholder="Describe what this category includes..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />
                <View style={[styles.footer, { backgroundColor: colors.surface }]}>
                    <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: colors.border as ColorValue }]}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[fonts.bodyBold as TextStyle, { color: colors.text }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: title ? colors.primary : colors.disabled,
                                opacity: title ? 1 : 0.6
                            }
                        ]}
                        onPress={handleSubmit}
                        disabled={!title}
                    >
                        <Text style={[fonts.bodyBold as TextStyle, { color: colors.onPrimary as string }]}>Create Category</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Platform.OS === 'ios' ? 48 : 60
    },
    content: {
        flex: 1,
        padding: 24,
    },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    input: {
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        height: 120,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 40
    },
    cancelButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginRight: 8,
        borderWidth: 1,
    },
    submitButton: {
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
});

export default AddCategoryScreen;