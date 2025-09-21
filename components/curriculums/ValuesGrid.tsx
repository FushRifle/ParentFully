import { CORE_VALUES_DATA } from '@/data/ValueData';
import { fonts, spacing } from '@/styles/theme';
import { useTheme } from '@/styles/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import CoreValuesModal from './CoreValuesModal';

const CARD_WIDTH = (Dimensions.get('window').width - spacing.medium * 3) / 2;

interface CoreValuesGridProps {
    onSelectionChange?: (selected: string[]) => void;
    initialSelected?: string[];
    maxSelections?: number;
    onAddSocialItems?: (items: any[]) => void;
}

const CoreValuesGrid = ({
    onSelectionChange,
    initialSelected = [],
    maxSelections = 3,
    onAddSocialItems
}: CoreValuesGridProps) => {
    const { colors } = useTheme();
    const [selectedValues, setSelectedValues] = useState<string[]>(initialSelected);
    const [selectedValue, setSelectedValue] = useState<typeof CORE_VALUES_DATA[0] | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const cardAnimations = useRef(CORE_VALUES_DATA.map(() => new Animated.Value(0))).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true
            })
        ]).start();

        Animated.stagger(
            100,
            cardAnimations.map(anim =>
                Animated.spring(anim, {
                    toValue: 1,
                    friction: 6,
                    useNativeDriver: true
                })
            )
        ).start();
    }, []);

    const toggleSelection = (value: string) => {
        let newSelection;
        if (selectedValues.includes(value)) {
            newSelection = selectedValues.filter(v => v !== value);
        } else {
            if (selectedValues.length >= maxSelections) return;
            newSelection = [...selectedValues, value];
        }

        setSelectedValues(newSelection);
        onSelectionChange?.(newSelection);
    };

    const openModal = (value: typeof CORE_VALUES_DATA[0]) => {
        setSelectedValue(value);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedValue(null);
    };

    return (
        <>
            <ScrollView
                contentContainerStyle={{
                    paddingBottom: spacing.xl,
                    marginBottom: 30,
                    marginTop: 10
                }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    rowGap: spacing.medium
                }}>
                    {CORE_VALUES_DATA.map((value, index) => {
                        const isSelected = selectedValues.includes(value.title);
                        const IconComponent = value.iconComponent;

                        return (
                            <Animated.View
                                key={index}
                                style={{
                                    width: CARD_WIDTH,
                                    opacity: cardAnimations[index],
                                    transform: [
                                        {
                                            translateY: cardAnimations[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [50, 0]
                                            })
                                        }
                                    ]
                                }}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => openModal(value)}
                                    disabled={!isSelected && selectedValues.length >= maxSelections}
                                    style={{
                                        backgroundColor: isSelected ? colors.primary : value.color,
                                        height: CARD_WIDTH * 1.2,
                                        borderRadius: 16,
                                        padding: spacing.small,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        shadowColor: colors.text,
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 8,
                                        elevation: 5,
                                        borderWidth: 2,
                                        borderColor: isSelected ? colors.primaryDark : 'rgba(255,255,255,0.3)',
                                        opacity: !isSelected && selectedValues.length >= maxSelections ? 0.6 : 1
                                    }}
                                >
                                    <View style={{
                                        marginBottom: spacing.medium,
                                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'white',
                                        width: 60,
                                        height: 60,
                                        borderRadius: 30,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        shadowColor: value.iconColor,
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.2,
                                        shadowRadius: 4,
                                        elevation: 3,
                                        borderWidth: isSelected ? 1 : 0,
                                        borderColor: isSelected ? 'rgba(255,255,255,0.5)' : 'transparent'
                                    }}>
                                        <IconComponent
                                            name={value.icon as any}
                                            size={28}
                                            color={isSelected ? colors.onPrimary : value.iconColor}
                                        />

                                        {isSelected && (
                                            <View style={{
                                                position: 'absolute',
                                                right: -5,
                                                top: -5,
                                                backgroundColor: colors.primaryDark,
                                                borderRadius: 10,
                                                width: 20,
                                                height: 20,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderWidth: 2,
                                                borderColor: colors.background
                                            }}>
                                                <MaterialIcons
                                                    name="check"
                                                    size={12}
                                                    color={colors.onPrimary}
                                                />
                                            </View>
                                        )}
                                    </View>
                                    <Text style={{
                                        ...fonts.subtitle,
                                        textAlign: 'center',
                                        marginBottom: spacing.small,
                                        color: isSelected ? colors.onPrimary : colors.text
                                    }}>
                                        {value.title}
                                    </Text>
                                    <Text style={{
                                        ...fonts.caption,
                                        textAlign: 'center',
                                        color: isSelected ? colors.onPrimary : colors.text,
                                        lineHeight: 18,
                                        opacity: isSelected ? 0.9 : 0.8
                                    }}>
                                        {value.description}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            <CoreValuesModal
                visible={modalVisible}
                onClose={closeModal}
                onAddItems={onAddSocialItems}
                selectedValue={selectedValue as any}
                selectedCoreValues={selectedValues}
                maxSelections={maxSelections}
                onSelectCoreValue={toggleSelection}
            />
        </>
    );
};

export default CoreValuesGrid;