import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';

type HapticType =
    | 'light'
    | 'medium'
    | 'heavy'
    | 'selection'
    | 'success'
    | 'warning'
    | 'error';

interface HapticTabProps {
    children: React.ReactNode;
    onPress: () => void;
    style?: any;
    hapticType?: HapticType;
    activeOpacity?: number;
}

const HapticTab: React.FC<HapticTabProps> = ({
    children,
    onPress,
    style,
    hapticType = 'light',
    activeOpacity = 0.7
}) => {
    const handlePress = () => {
        triggerHaptic(hapticType);
        onPress();
    };

    const triggerHaptic = (type: HapticType) => {
        try {
            switch (type) {
                case 'light':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case 'selection':
                    Haptics.selectionAsync();
                    break;
                case 'success':
                    Platform.OS === 'ios'
                        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
                        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'warning':
                    Platform.OS === 'ios'
                        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
                        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'error':
                    Platform.OS === 'ios'
                        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
                        : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
            }
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            style={style}
            activeOpacity={activeOpacity}
        >
            {children}
        </TouchableOpacity>
    );
};

export default HapticTab;