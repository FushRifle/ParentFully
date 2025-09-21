import { useTheme } from '@/styles/ThemeContext';
import React from 'react';
import { Animated, Dimensions } from 'react-native';
import { YStack } from 'tamagui';

interface DotsIndicatorProps {
    count: number;
    activeIndex: number;
    scrollX?: Animated.Value;
}

const { width } = Dimensions.get('window');

const DotsIndicator: React.FC<DotsIndicatorProps> = ({ count, activeIndex, scrollX }) => {
    const { colors } = useTheme();

    return (
        <YStack flexDirection="row" justifyContent="center" alignItems="center" height={16}>
            {Array.from({ length: count }).map((_, index) => {
                const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

                const dotWidth = scrollX
                    ? scrollX.interpolate({
                        inputRange,
                        outputRange: [8, 16, 8],
                        extrapolate: 'clamp',
                    })
                    : activeIndex === index
                        ? 16
                        : 8;

                const opacity = scrollX
                    ? scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    })
                    : activeIndex === index
                        ? 1
                        : 0.3;

                return (
                    <Animated.View
                        key={index}
                        style={{
                            width: dotWidth,
                            height: 8,
                            borderRadius: 4,
                            marginHorizontal: 4,
                            opacity,
                            backgroundColor: colors.primary,
                        }}
                    />
                );
            })}
        </YStack>
    );
};

export default DotsIndicator;
