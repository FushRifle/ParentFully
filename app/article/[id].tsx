import { Text, View } from '@/components/Themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ArticleDetail() {
    const { id } = useLocalSearchParams();

    // In a real app, you would fetch the article by ID
    const article = {
        id: '1',
        title: '5 Ways to Handle Toddler Tantrums',
        content: '...full article content here...',
        author: 'Dr. Sarah Johnson',
        date: 'May 15, 2023'
    };

    return (
        <>
            <Stack.Screen options={{ title: article.title }} />
            <View style={styles.container}>
                <Text style={styles.title}>{article.title}</Text>
                <Text style={styles.meta}>By {article.author} • {article.date}</Text>
                <Text style={styles.content}>{article.content}</Text>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    meta: {
        fontSize: 14,
        opacity: 0.6,
        marginBottom: 24,
    },
    content: {
        fontSize: 16,
        lineHeight: 24,
    },
});