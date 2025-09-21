import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';

type AddMilestoneFABProps = {
    colors: {
        secondary: string;
        text: string;
        [key: string]: string;
    };
    setAddModalVisible: (visible: boolean) => void;
};

const AddMilestoneFAB = ({ colors, setAddModalVisible }: AddMilestoneFABProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const loopAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        loopAnimation.start();
        return () => loopAnimation.stop();
    }, [fadeAnim]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.animatedTextContainer, { opacity: fadeAnim }]}>
                <Text style={[styles.text, { color: colors.text }]}>Add Milestones</Text>
                <Icon name="arrow-forward" size={20} color={colors.text} />
            </Animated.View>
            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: colors.secondary }]}
                onPress={() => setAddModalVisible(true)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 30
    },
    fab: {
        elevation: 6,
    },
    animatedTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 6,
    },
});

export default AddMilestoneFAB;
