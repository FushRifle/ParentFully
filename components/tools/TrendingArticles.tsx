import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';

const trendingArticles = [
    {
        id: '1',
        title: '5 Ways to Handle Toddler Tantrums',
        category: 'Behavior',
        image: require('@/assets/images/tantrums.jpg'),
        readTime: '5 min read'
    },
    {
        id: '2',
        title: 'Nutrition Guide for 1-2 Year Olds',
        category: 'Nutrition',
        image: require('@/assets/images/nutrition.jpg'),
        readTime: '8 min read'
    },
    {
        id: '3',
        title: 'Establishing Healthy Sleep Routines',
        category: 'Sleep',
        image: require('@/assets/images/sleep.jpg'),
        readTime: '6 min read'
    },
    {
        id: '4',
        title: 'Encouraging Language Development',
        category: 'Development',
        image: require('@/assets/images/language.jpg'),
        readTime: '7 min read'
    },
];

export default function TrendingArticles() {
    const router = useRouter();

    const handleArticlePress = (id: string) => {
        router.push({ pathname: '/article/[id]', params: { id } });
    };

    return (
        <FlatList
            data={trendingArticles}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleArticlePress(item.id)}
                >
                    <Image source={item.image} style={styles.image} />
                    <View style={styles.textContainer}>
                        <Text style={styles.category}>{item.category}</Text>
                        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                        <Text style={styles.readTime}>{item.readTime}</Text>
                    </View>
                </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
        paddingLeft: 16,
    },
    card: {
        width: 240,
        marginRight: 16,
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 140,
        resizeMode: 'cover',
    },
    textContainer: {
        padding: 12,
    },
    category: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C63FF',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        lineHeight: 22,
    },
    readTime: {
        fontSize: 12,
        opacity: 0.6,
    },
});