import { View } from '@/components/Themed';
import { experts } from '@/constants/Experts';
import { StyleSheet } from 'react-native';
import ExpertCard from './ExpertCard';

export default function ExpertRecommendations() {
    return (
        <View style={styles.container}>
            {experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
});