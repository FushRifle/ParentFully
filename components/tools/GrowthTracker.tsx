import { Text, View } from '@/components/Themed';
import { StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function GrowthTracker() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Growth Tracker</Text>
            <LineChart
                data={{
                    labels: ['0m', '3m', '6m', '9m', '12m'],
                    datasets: [
                        {
                            data: [3.2, 5.4, 6.8, 7.9, 8.7],
                        },
                    ],
                }}
                width={300}
                height={200}
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                bezier
                style={styles.chart}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    chart: {
        borderRadius: 16,
    },
});