import { Text, View } from '@/components/Themed';
import { Expert } from '@/types';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ExpertCardProps {
    expert: Expert;
}

export default function ExpertCard({ expert }: ExpertCardProps) {
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {expert.name.split(' ').map(n => n[0]).join('')}
                </Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.name}>{expert.name}</Text>
                <Text style={styles.specialty}>{expert.specialty}</Text>
                <View style={styles.tipContainer}>
                    <Text style={styles.tipLabel}>Expert Tip:</Text>
                    <Text style={styles.tipText}>{expert.tip}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6C63FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 8,
    },
    tipContainer: {
        padding: 12,
        borderRadius: 8,
    },
    tipLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 14,
        lineHeight: 20,
    },
});