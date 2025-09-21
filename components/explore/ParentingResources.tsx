import { Text, View } from '@/components/Themed';
import { resources } from '@/constants/Resources';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function ParentingResources() {
    return (
        <FlatList
            data={resources}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.card}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                        <Text style={styles.icon}>{item.icon}</Text>
                    </View>
                    <Text style={styles.title}>{item.title}</Text>
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
        width: 120,
        marginRight: 16,
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 24,
    },
    title: {
        textAlign: 'center',
        fontSize: 14,
    },
});