import GoalSetting from '@/components/tools/GoalSetting';
import ProgressTracking from '@/components/tools/ProgressTracking';
import VisionBuilder from '@/components/tools/VisionBuilder';
import { useTheme } from '@/styles/ThemeContext';
import { RootStackParamList } from '@/types';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ToolsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tools'>;

interface ToolsScreenProps {
    navigation: ToolsScreenNavigationProp;
}

const ToolsScreen: React.FC<ToolsScreenProps> = ({ navigation }) => {
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<'vision' | 'goals' | 'progress'>('vision');

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={[styles.title, { color: colors.text }]}>Parenting Tools</Text>
            <Text style={{ color: colors.text, marginBottom: 16 }}>
                Explore our tools to help you build a vision for your family, set goals, and track your progress.
            </Text>

            <View style={styles.tabsContainer}>
                <TabButton
                    label="Vision Builder"
                    active={activeTab === 'vision'}
                    onPress={() => setActiveTab('vision')}
                    colors={colors}
                />
                <TabButton
                    label="Goal Setting"
                    active={activeTab === 'goals'}
                    onPress={() => setActiveTab('goals')}
                    colors={colors}
                />
                <TabButton
                    label="Progress"
                    active={activeTab === 'progress'}
                    onPress={() => setActiveTab('progress')}
                    colors={colors}
                />
            </View>

            {activeTab === 'vision' && <VisionBuilder />}
            {activeTab === 'goals' && <GoalSetting />}
            {activeTab === 'progress' && <ProgressTracking />}
        </ScrollView>
    );
};

const TabButton = ({
    label,
    active,
    onPress,
    colors
}: {
    label: string;
    active: boolean;
    onPress: () => void;
    colors: any;
}) => (
    <TouchableOpacity
        style={[
            styles.tabButton,
            active && styles.activeTab,
            active && { borderBottomColor: colors.primary }
        ]}
        onPress={onPress}
    >
        <Text style={[
            styles.tabButtonText,
            { color: active ? colors.primary : colors.text }
        ]}>
            {label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 125
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        marginTop: 45
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabButton: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ToolsScreen;