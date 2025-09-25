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
import { Image, Platform } from 'react-native';
import { Button, Card, ScrollView, View, XStack } from 'tamagui';

type TemplateTask = {
     title: string;
     description?: string;
     time_slot?: string;
     priority?: 'low' | 'medium' | 'high';
     duration_minutes?: number | string;
     category?: string;
     icon?: string;
};

type DisciplinePlan = {
     id: string;
     name: string;         // Routine Name
     description: string;
     tasks?: TemplateTask[]; // ✅ instead of rules
     created_at?: string;
     isPreloaded?: boolean;
};

export const PrintRoutineScreen = () => {
     const route = useRoute<RouteProp<RootStackParamList, 'PrintRoutine'>>();
     const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
     const { colors } = useTheme();
     const [loading, setLoading] = useState(false);

     // Parse the parameters
     const singlePlan = route.params?.plan ? JSON.parse(route.params.plan) as DisciplinePlan : null;
     const allPlans = route.params?.allPlans ? JSON.parse(route.params.allPlans) as DisciplinePlan[] : null;
     const childName = route.params?.childName || '';

     // 🔹 Generate HTML for one plan with TemplateTasks
     const generateHtmlForSinglePlan = (plan: DisciplinePlan) => {
          const tasks = plan.tasks || [];
          return `
      <div class="plan-section">
        <h2>${plan.name || 'Routine Plan'}</h2>
        <p><strong>${tasks.length} Task(s)</strong> · Assigned on ${plan.created_at ? new Date(plan.created_at).toLocaleDateString() : '—'}</p>

        <table>
          <thead>
            <tr>
              <th>S/N</th>
              <th>Task</th>
              <th>Time Slot</th>
              <th>Priority</th>
              <th>Duration</th>
              <th>Icon</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.map((task, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${task.title}</td>
                <td>${task.time_slot || '—'}</td>
                <td>${task.priority || '—'}</td>
                <td>${task.duration_minutes || '—'}</td>
                <td>${task.icon ? `<img src="${task.icon}" width="20" height="20" />` : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
     };

     const generateHtmlForAllPlans = () =>
          allPlans?.map(plan => generateHtmlForSinglePlan(plan)).join('') || '';

     const generateHtml = () => `
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
          img { object-fit: contain; }
          .footer { margin-top: 40px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Active Routine Plan</h1>
        ${childName ? `<p style="text-align:center;">For: ${childName}</p>` : ''}
        <p style="text-align:center;">Generated on ${new Date().toLocaleDateString()}</p>

        ${allPlans ? generateHtmlForAllPlans() : (singlePlan ? generateHtmlForSinglePlan(singlePlan) : '<p>No plan data available</p>')}

        <div class="footer">Generated on: ${new Date().toLocaleDateString()}</div>
      </body>
    </html>
  `;

     const handlePrint = async () => {
          setLoading(true);
          try {
               const { uri } = await Print.printToFileAsync({ html: generateHtml() });
               if (Platform.OS === 'ios') {
                    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
               } else {
                    await Print.printAsync({ uri });
               }
          } catch (error) {
               console.error(error);
               alert('Failed to print. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     const handleSavePDF = async () => {
          setLoading(true);
          try {
               const { uri } = await Print.printToFileAsync({ html: generateHtml() });
               const downloadDir = `${FileSystem.documentDirectory}Downloads`;
               await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
               const fileName = allPlans
                    ? `All_Routines_${Date.now()}.pdf`
                    : `Routine_${singlePlan?.name ? singlePlan.name.replace(/\s+/g, '_') : Date.now()}.pdf`;
               const newPath = `${downloadDir}/${fileName}`;
               await FileSystem.moveAsync({ from: uri, to: newPath });
               alert(`PDF saved to: ${newPath}`);
          } catch (error) {
               console.error(error);
               alert('Failed to save PDF. Please try again.');
          } finally {
               setLoading(false);
          }
     };

     return (
          <GoalBackground>
               <View flex={1} padding="$4" mb='$10'>
                    {/* Header */}
                    <XStack space="$4" alignItems="center" mb="$4" mt="$7">
                         <Button
                              unstyled
                              circular
                              pressStyle={{ opacity: 0.6 }}
                              onPress={navigation.goBack}
                              icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                         />
                         <Text fontSize="$6" fontWeight="bold" color={colors.text}>
                              {allPlans ? 'Print All Routines' : 'Print Routine'}
                         </Text>
                    </XStack>

                    {/* Action Buttons */}
                    <XStack ai="center" jc="flex-start" space="$5" mt="$2">
                         <Button unstyled br='$6' backgroundColor="#FFF0DE" px="$3" onPress={handleSavePDF}>
                              <XStack ai="center" space="$3" py="$3">
                                   <Feather name="download" size={20} color={colors.primary} />
                                   <Text color={colors.primary} fontSize="$4">Download</Text>
                              </XStack>
                         </Button>
                         <Button unstyled backgroundColor="#E3FFF2" px="$3" br='$6' onPress={handlePrint}>
                              <XStack ai="center" space="$3" py="$3">
                                   <Feather name="printer" size={20} color={colors.secondary} />
                                   <Text color={colors.secondary} fontSize="$4">Print</Text>
                              </XStack>
                         </Button>
                    </XStack>

                    {/* Content */}
                    <ScrollView>
                         {allPlans?.length ? allPlans.map((plan, idx) => (
                              <Card key={idx} backgroundColor={colors.card} padding="$2" borderRadius="$4" mb="$6">
                                   <Text ml="$3" fontSize="$6" fontWeight="bold" color={colors.text} mb="$2">{plan.name}</Text>

                                   <XStack bg={colors.secondary} py="$2" px="$2" space="$3">
                                        <Text flex={0.6} color="white" fontWeight="bold">S/N</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Task</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Time Slot</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Priority</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Duration</Text>
                                        <Text flex={1} color="white" fontWeight="bold">Icon</Text>
                                   </XStack>

                                   {plan.tasks?.map((task, i) => (
                                        <XStack key={i} py="$2" px="$2" borderBottomWidth={1} borderBottomColor={colors.border as any} space="$3">
                                             <Text flex={0.6}>{i + 1}</Text>
                                             <Text flex={2}>{task.title}</Text>
                                             <Text flex={2}>{task.time_slot || '—'}</Text>
                                             <Text flex={2}>{task.priority || '—'}</Text>
                                             <Text flex={2}>{task.duration_minutes || '—'}</Text>
                                             <View flex={1}>{task.icon && <Image source={{ uri: task.icon }} style={{ width: 20, height: 20 }} />}</View>
                                        </XStack>
                                   ))}
                              </Card>
                         )) : singlePlan ? (
                              <Card backgroundColor="#FFF9F4" padding="$4" borderRadius="$4">
                                   <Text fontSize="$6" fontWeight="bold" color={colors.primary} mb="$2">{singlePlan.name}</Text>

                                   <XStack bg={colors.secondary} p="$2">
                                        <Text flex={0.5} color="white" fontWeight="bold">S/N</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Task</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Time Slot</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Priority</Text>
                                        <Text flex={2} color="white" fontWeight="bold">Duration</Text>
                                        <Text flex={1} color="white" fontWeight="bold">Icon</Text>
                                   </XStack>

                                   {singlePlan.tasks?.map((task, i) => (
                                        <XStack key={i} p="$2" borderBottomWidth={1} borderBottomColor={colors.border as any}>
                                             <Text flex={0.5}>{i + 1}</Text>
                                             <Text flex={2}>{task.title}</Text>
                                             <Text flex={2}>{task.time_slot || '—'}</Text>
                                             <Text flex={2}>{task.priority || '—'}</Text>
                                             <Text flex={2}>{task.duration_minutes || '—'}</Text>
                                             <View flex={1}>{task.icon && <Image source={{ uri: task.icon }} style={{ width: 20, height: 20 }} />}</View>
                                        </XStack>
                                   ))}
                              </Card>
                         ) : (
                              <Text textAlign="center" mt="$6">No routine data available</Text>
                         )}
                    </ScrollView>
               </View>
          </GoalBackground>
     );
};
