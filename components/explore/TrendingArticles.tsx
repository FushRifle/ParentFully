import { Text, View } from '@/components/Themed';
import { articles } from '@/constants/Articles';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function TrendingArticles() {
    return (
        <FlatList
            data={articles}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.card}>
                    <View style={styles.imagePlaceholder} />
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.category}>{item.category}</Text>
                </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    card: {
        width: 200,
        marginRight: 16,
    },
    imagePlaceholder: {
        height: 120,
        backgroundColor: '#ddd',
        borderRadius: 8,
        marginBottom: 8,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        opacity: 0.6,
    },
});