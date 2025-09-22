import { FAQItemProps } from '@/types/support';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { View } from 'tamagui';

const FAQItem: React.FC<FAQItemProps> = ({ faq, index, expanded, onPress, colors }) => (
    <TouchableOpacity
        style={[
            styles.faqItem,
            { backgroundColor: expanded ? colors.onPrimary : colors.onPrimary },
        ]}
        activeOpacity={0.8}
        onPress={() => onPress(index)}
    >
        <View style={styles.faqQuestion}
        >
            <Text style={[styles.questionText, { color: colors.text }]}>
                {faq.question}
            </Text>
            <View
                br={9999}
                bg={colors.primary}
            >
                <MaterialCommunityIcons
                    name={expanded ? 'minus' : 'plus'}
                    size={24}
                    color={colors.onPrimary}
                />
            </View>

        </View>
        {expanded && (
            <Text style={[styles.answerText, { color: colors.text }]}>
                {faq.answer}
            </Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    faqItem: {
        borderRadius: 10,
        marginHorizontal: 8,
        marginBottom: 12,
        padding: 16,
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    questionText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
        marginRight: 10,
    },
    answerText: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 20,
    },
});

export default React.memo(FAQItem);