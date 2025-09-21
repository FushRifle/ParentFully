import { Text, View } from '@/components/Themed';
import { Tool } from '@/types';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ToolCardProps {
    tool: Tool;
}

export default function ToolCard({ tool }: ToolCardProps) {
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{tool.icon}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{tool.title}</Text>
                <Text style={styles.description}>{tool.description}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        opacity: 0.7,
    },
});