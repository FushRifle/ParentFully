import { GoalBackground } from '@/constants/GoalBackground';
import { Text } from '@/context/GlobalText';
import type { RootStackParamList } from '@/navigation/MainNavigator';
import { useTheme } from '@/styles/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Button, Card, H4, ScrollView, View, XStack, YStack } from 'tamagui';

type DisciplinePlan = {
    id: string;
    name: string;
    description: string;
    strategy?: string;
    consequences?: string;
    rewards?: string;
    notes?: string;
    icon?: string;
    rules?: RuleSet[];
    ageRange?: string;
    created_at?: string;
    isPreloaded?: boolean;
};

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

export const PrintScreen = () => {
    const route = useRoute<RouteProp<RootStackParamList, 'Print'>>();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { colors } = useTheme();
    const [loading, setLoading] = useState(false);

    // Parse the parameters
    const singlePlan = route.params?.plan ? JSON.parse(route.params.plan) as DisciplinePlan : null;
    const allPlans = route.params?.allPlans ? JSON.parse(route.params.allPlans) as DisciplinePlan[] : null;
    const childName = route.params?.childName || '';

    // 🔹 HTML for a single plan (with ruleset table)
    const generateHtmlForSinglePlan = (plan: DisciplinePlan) => {
        const rules = (plan.rules as RuleSet[]) || [];

        return `
    <div class="plan-section">
      <h2 style="font-size: 28px; color: #005A31; text-align: left; margin-bottom: 12px;">
        ${plan.name || 'Discipline Plan'}
      </h2>
      <p style="font-size: 16px; margin-bottom: 20px;">
        <strong>${rules.length} Rule(s)</strong> · Assigned on ${plan.created_at ? new Date(plan.created_at).toLocaleDateString() : '—'
            }
      </p>

      <table style="width:100%; border-collapse: collapse; font-size: 15px;">
        <thead>
          <tr>
            <th style="background:#005A31; color:white; padding:10px; font-size:20px;">S/N</th>
            <th style="background:#005A31; color:white; padding:10px; font-size:20px;">Name</th>
            <th style="background:#005A31; color:white; padding:10px; font-size:20px;">Consequences</th>
            <th style="background:#005A31; color:white; padding:10px; font-size:20px;">Parent Notes</th>
          </tr>
        </thead>
        <tbody>
          ${rules
                .map(
                    (rule, i) => `
            <tr>
              <td style="padding:8px; border:1px solid #ddd;">${i + 1}</td>
              <td style="padding:8px; border:1px solid #ddd;">${rule.rule || ''}</td>
              <td style="padding:8px; border:1px solid #ddd; color:red;">${rule.consequence || '—'}</td>
              <td style="padding:8px; border:1px solid #ddd;">${rule.notes || ''}</td>
            </tr>
          `
                )
                .join('')}
        </tbody>
      </table>
    </div>
  `;
    };

    const generateHtmlForAllPlans = () => {
        return allPlans?.map(plan => generateHtmlForSinglePlan(plan)).join('') || '';
    };

    const generateHtml = () => {
        return `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #005A31; text-align: center; margin-bottom: 10px; }
            h2 { color: #005A31; margin: 20px 0 10px 0; font-size: 18px; }
            p { margin: 0 0 10px 0; color: #444; }
            .plan-section { margin-bottom: 40px; page-break-inside: avoid; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background-color: #005A31; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; vertical-align: top; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Active Discipline Plan</h1>
          <p style="text-align:center;">Generated on ${new Date().toLocaleDateString()}</p>
          ${childName ? `<p style="text-align:center;">For: ${childName}</p>` : ''}
          
          ${allPlans ? generateHtmlForAllPlans() : (singlePlan ? generateHtmlForSinglePlan(singlePlan) : '<p>No plan data available</p>')}
          
          <div class="footer">
            Generated on: ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;
    };

    const handlePrint = async () => {
        setLoading(true);
        try {
            const { uri } = await Print.printToFileAsync({
                html: generateHtml(),
                width: 612,
                height: 792,
            });

            if (Platform.OS === 'ios') {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    UTI: 'com.adobe.pdf',
                });
            } else {
                await Print.printAsync({ uri });
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to print. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePDF = async () => {
        setLoading(true);
        try {
            const { uri } = await Print.printToFileAsync({
                html: generateHtml(),
                width: 612,
                height: 792,
            });

            const downloadDir = `${FileSystem.documentDirectory}Downloads`;
            await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

            const fileName = allPlans
                ? `All_Discipline_Plans_${Date.now()}.pdf`
                : `DisciplinePlan_${singlePlan?.name ? singlePlan.name.replace(/\s+/g, '_') : Date.now()}.pdf`;

            const newPath = `${downloadDir}/${fileName}`;
            await FileSystem.moveAsync({ from: uri, to: newPath });

            alert(`PDF saved to: ${newPath}`);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save PDF. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GoalBackground>
            <View flex={1} padding="$4" mb='$10'>
                {/* Header */}
                <XStack space="$4" alignItems="center" mb="$4" mt="$6">
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />
                    <H4 fontSize={14} fontWeight="600" color={colors.text}>
                        {allPlans ? 'Print All Selected Plans' : 'Print Plan'}
                    </H4>
                </XStack>

                <XStack ai="center" jc="flex-start" space="$5" mt="$2">
                    <Button
                        unstyled
                        br='$6'
                        backgroundColor="#FFF0DE"
                        px="$3"
                        onPress={handleSavePDF}
                    >
                        <XStack ai="center" space="$3" py="$3">
                            <Feather name="download" size={20} color={colors.primary} />
                            <Text color={colors.primary}>
                                Download All
                            </Text>
                        </XStack>
                    </Button>

                    <Button
                        unstyled
                        backgroundColor="#E3FFF2"
                        px="$3"
                        br='$6'
                        onPress={handlePrint}
                    >
                        <XStack ai="center" space="$3" py="$3">
                            <Feather name="printer" size={20} color={colors.secondary} />
                            <Text color={colors.secondary}>
                                Print All
                            </Text>
                        </XStack>
                    </Button>
                </XStack>

                {/* Title */}
                <YStack mt='$4'
                    borderBottomWidth={4}
                    borderBottomColor={colors.secondary}
                    mb="$4"
                >
                    <Text
                        fontWeight="599"
                        color={colors.secondary}
                        textAlign="center"
                        mb="$2"
                    >
                        Active Discipline Plan
                    </Text>
                    <Text fontSize={13} color={colors.text} textAlign="center" mb="$6">
                        Generated On: {new Date().toLocaleDateString()}
                    </Text>
                </YStack>

                {/* Content */}
                <ScrollView>
                    {allPlans ? (
                        allPlans.map((plan, idx) => (
                            <Card
                                key={idx}
                                backgroundColor={colors.card}
                                padding="$1"
                                borderRadius="$4"
                                mb="$6"
                            >
                                <YStack
                                    borderLeftColor={colors.secondary}
                                    borderLeftWidth={4}
                                    borderBottomColor={colors.border as any}
                                    borderBottomWidth={2}
                                    backgroundColor="#FFF9F4"
                                    mb="$3"
                                >
                                    <Text ml="$3" fontSize={12} fontWeight="bold" color={colors.text} mb="$2">
                                        {plan.name}
                                    </Text>
                                    <Text
                                        fontSize={12}
                                        ml="$3"
                                        fontWeight="bold"
                                        color={colors.textSecondary}
                                        mb="$2"
                                    >
                                        {plan.rules?.length || 0} task(s) • Assigned On:{" "}
                                        {plan.created_at
                                            ? new Date(plan.created_at).toLocaleDateString()
                                            : "—"}
                                    </Text>
                                </YStack>

                                {/* Rules in Table format */}
                                <YStack
                                    borderWidth={1}
                                    borderColor={colors.border as any}
                                    br="$2"
                                    overflow="hidden"
                                    space="$2"
                                >
                                    {/* Table Header */}
                                    <XStack bg={colors.secondary} py="$2" px="$2" space="$4">
                                        <Text flex={0.6} color="white" fontWeight="500"
                                            fontSize={12}
                                        >
                                            S/N
                                        </Text>
                                        <Text flex={2} color="white" fontWeight="500"
                                            fontSize={12}>
                                            Name
                                        </Text>
                                        <Text flex={2} color="white" fontWeight="500"
                                            fontSize={12}>
                                            tasks
                                        </Text>
                                        <Text flex={2} color="white" fontWeight="500"
                                            fontSize={12}>
                                            Notes
                                        </Text>
                                    </XStack>

                                    {/* Table Rows */}
                                    {plan.rules?.map((rule: RuleSet, i: number) => (
                                        <XStack
                                            key={i}
                                            py="$3"
                                            px="$2"
                                            alignItems="center"
                                            borderBottomWidth={2}
                                            borderBottomColor={colors.border as any}
                                            space="$4"
                                        >
                                            <Text flex={0.5} fontSize={12} lineHeight={20}>
                                                {i + 1}
                                            </Text>
                                            <Text flex={2} fontSize={12} lineHeight={20}>
                                                {rule.rule}
                                            </Text>
                                            <Text flex={2} fontSize={12}
                                                lineHeight={20} color="red">
                                                {rule.consequence}
                                            </Text>
                                            <Text flex={2} fontSize={12} lineHeight={20}>
                                                {rule.notes || "—"}
                                            </Text>
                                        </XStack>
                                    ))}
                                </YStack>

                            </Card>
                        ))
                    ) : singlePlan ? (
                        <Card backgroundColor='#FFF9F4'
                            padding="$4" borderRadius="$4">
                            <Text fontWeight="bold" color={colors.primary} mb="$2">
                                {singlePlan.name}
                            </Text>

                            {/* Rules in Table format */}
                            <YStack borderWidth={1} borderColor={colors.border as any} br="$4" overflow="hidden">
                                {/* Table Header */}
                                <XStack bg={colors.secondary} p="$2">
                                    <Text flex={0.5} color="white" fontSize={12}
                                        fontWeight="500">
                                        S/N
                                    </Text>
                                    <Text flex={2} color="white" fontSize={12}
                                        fontWeight="500">
                                        Rule
                                    </Text>
                                    <Text flex={2} color="white" fontSize={12}
                                        fontWeight="500">
                                        Consequence
                                    </Text>
                                    <Text flex={2} color="white" fontSize={12}
                                        fontWeight="500">
                                        Notes
                                    </Text>
                                </XStack>

                                {/* Table Rows */}
                                {singlePlan.rules?.map((rule: RuleSet, i: number) => (
                                    <XStack
                                        key={i}
                                        p="$2"
                                        borderBottomWidth={1}
                                        borderBottomColor={colors.border as any}
                                    >
                                        <Text flex={0.5}>{i + 1}</Text>
                                        <Text flex={2}>{rule.rule}</Text>
                                        <Text flex={2} color="red">
                                            {rule.consequence}
                                        </Text>
                                        <Text flex={2}>{rule.notes || "—"}</Text>
                                    </XStack>
                                ))}
                            </YStack>
                        </Card>
                    ) : (
                        <Text textAlign="center" mt="$6">
                            No plan data available
                        </Text>
                    )}
                </ScrollView>
            </View>
        </GoalBackground>
    );
};
