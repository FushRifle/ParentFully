import { useTheme } from '@/styles/ThemeContext';
import type { DisciplinePlan } from '@/types/discipline';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import React from 'react';
import { ScrollView } from 'react-native';
import { Button, Sheet, Text, View, XStack } from 'tamagui';

interface PrintDisciplinePlanProps {
    plan: DisciplinePlan;
    childName: string;
    onClose: () => void;
}

export const PrintDisciplinePlan = ({ plan, childName, onClose }: PrintDisciplinePlanProps) => {
    const navigation = useNavigation();
    const { colors } = useTheme();

    return (
        <Sheet
            modal
            open={true}
            onOpenChange={onClose}
            snapPoints={[5]}
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay />
            <Sheet.Frame>
                <Sheet.Handle />
                <ScrollView>
                    {/* Header */}
                    <XStack jc="space-between" ai="center" mb="$4" pb="$2" borderBottomWidth={1} borderBottomColor="$gray5" px="$4">
                        <Text color={colors.primary} fontWeight="700" fontSize="$5">
                            {plan.name}
                        </Text>
                        <XStack space="$2">
                            <Button
                                onPress={() => { onClose(); }}
                                backgroundColor={colors.primary}
                                color={colors.onPrimary}
                                icon={<Feather name="printer" size={16} />}
                            >
                                Print
                            </Button>
                            <Button
                                onPress={onClose}
                                backgroundColor={colors.error}
                                color={colors.onPrimary}
                            >
                                Close
                            </Button>
                        </XStack>
                    </XStack>

                    {/* Orientation Note */}
                    <Text fontSize="$2" color="$gray10" mb="$4" fontStyle="italic" px="$4">
                        Note: Scroll horizontally to view all columns
                    </Text>

                    {/* Tabular Plan Details */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <XStack minWidth="100%" px="$4" pb="$4">
                            {/* Rules Column */}
                            <View width={250} mr="$4">
                                <Text fontWeight="bold" color={colors.primary} mb="$2">Rules</Text>
                                <View backgroundColor="$gray2" p="$3" borderRadius="$2">
                                    <Text>{plan.strategy || 'No rules defined yet.'}</Text>
                                </View>
                            </View>

                            {/* Consequences Column */}
                            <View width={250} mr="$4">
                                <Text fontWeight="bold" color={colors.primary} mb="$2">Consequences</Text>
                                <View backgroundColor="$gray2" p="$3" borderRadius="$2">
                                    <Text>{plan.consequences || 'No consequences defined yet.'}</Text>
                                </View>
                            </View>

                            {/* Rewards Column */}
                            <View width={250} mr="$4">
                                <Text fontWeight="bold" color={colors.primary} mb="$2">Rewards</Text>
                                <View backgroundColor="$gray2" p="$3" borderRadius="$2">
                                    <Text>{plan.rewards || 'No rewards defined yet.'}</Text>
                                </View>
                            </View>

                            {/* Notes Column (conditional) */}
                            {plan.notes && (
                                <View width={250}>
                                    <Text fontWeight="bold" color={colors.primary} mb="$2">Additional Notes</Text>
                                    <View backgroundColor="$gray2" p="$3" borderRadius="$2">
                                        <Text>{plan.notes}</Text>
                                    </View>
                                </View>
                            )}
                        </XStack>
                    </ScrollView>

                    {/* Footer */}
                    <Text mt="$4" fontSize="$2" color="$gray10" px="$4" pb="$4">
                        Printed on: {new Date().toLocaleDateString()}
                    </Text>
                </ScrollView>
            </Sheet.Frame>
        </Sheet>
    );
};

export const usePrintDisciplinePlan = () => {
    const { colors } = useTheme();
    const [printingPlan, setPrintingPlan] = React.useState<DisciplinePlan | null>(null);

    const PrintButton = ({ plan }: { plan: DisciplinePlan }) => (
        <Button
            mt="$3"
            size="$2"
            borderWidth={1}
            borderColor={colors.onPrimary}
            color={colors.onPrimary}
            backgroundColor={colors.primary}
            icon={<Feather name="printer" size={16} color={colors.onPrimary} />}
            onPress={() => { setPrintingPlan(plan); }}>
            Print
        </Button>
    );

    const PrintComponent = printingPlan ? (
        <PrintDisciplinePlan
            plan={printingPlan}
            childName=""
            onClose={() => setPrintingPlan(null)}
        />
    ) : null;

    return {
        PrintButton,
        PrintComponent,
    };
};