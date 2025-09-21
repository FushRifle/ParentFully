import { useTheme } from '@/styles/ThemeContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useCallback, useEffect } from 'react';
import { Platform, StatusBar, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

// Tab Screens
import CommunityScreen from '@/screens/dashboard/home/CommunityScreen';
import HomeScreen from '@/screens/dashboard/home/HomeScreen';
import SupportScreen from '@/screens/dashboard/home/SupportScreen';
import SettingsScreen from '@/screens/dashboard/settings/SettingsScreen';
import MilestoneDetailScreen from '@/screens/dashboard/unused/MileDetailScreen';
import { UserProfileScreen } from '@/screens/dashboard/user/UserProfileScreen';

// System Screens
import NotificationScreen from '@/screens/dashboard/notification/NotificationScreen';


//Goals and CorePlans
import AddGoalScreen from '@/screens/dashboard/goals/AddGoalScreen';
import GoalDetailsScreen from '@/screens/dashboard/goals/GoalDetailScreen';
import PlanDetailScreen from '@/screens/dashboard/goals/PlanDetailScreen';
import ReminderScreen from '@/screens/dashboard/goals/ReminderScreen';
import CategoryDetailsScreen from '@/screens/dashboard/home/CategoryDetailsScreen';
import GoalScreen from '@/screens/dashboard/unused/GoalScreen';
import { GoalSummaryScreen } from '@/screens/dashboard/unused/GoalSummaryScreen';
import PlanScreen from '@/screens/dashboard/unused/PlanScreen';

//Routine Screens
import ActiveRoutineScreen from '@/screens/dashboard/routine/ActiveRoutineScreen';
import CreateCustomRoutineScreen from '@/screens/dashboard/routine/AddRoutineScreen';
import CustomTaskScreen from '@/screens/dashboard/routine/CustomTask';
import DailyRoutineScreen from '@/screens/dashboard/routine/Routine';
import RoutineDetailsScreen from '@/screens/dashboard/routine/RoutineDetailsScreen';
import RoutineScreen from '@/screens/dashboard/routine/RoutineScreen';


// Child Related Screens
import { CertificateScreen } from '@/screens/dashboard/child/CerificateScreen';
import ChildProfileScreen from '@/screens/dashboard/child/ChildScreen';
import AddChildScreen from '@/screens/dashboard/home/AddAnotherChild';

// Components
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { Ionicons } from '@expo/vector-icons';

//Discipline Screens
import ActiveDisciplineScreen from '@/screens/dashboard/discipline/ActiveDisiplineScreen';
import AddDisciplineScreen from '@/screens/dashboard/discipline/AddDisciplineScreen';
import DisciplineTemplateScreen from '@/screens/dashboard/discipline/Discipline';
import DisciplineDetailsScreen from '@/screens/dashboard/discipline/DisciplineDetailsScreen';
import DisciplineScreen from '@/screens/dashboard/discipline/DisciplineScreen';
import { DocumentScreen } from '@/screens/dashboard/document/DocumentScreen';
import { AddCalendarEventScreen } from '@/screens/dashboard/event/AddCalendarEventScreen';
import { CalendarScreen } from '@/screens/dashboard/event/CalendarScreen';
import AddCategoryScreen from '@/screens/dashboard/goals/AddCategoryScreen';
import CorePlanScreen from '@/screens/dashboard/goals/CorePlanScreen';
import ResourcesScreen from '@/screens/dashboard/home/ResourcesScreen';
import ToolsScreen from '@/screens/dashboard/home/ToolsScreen';
import { MessagingScreen } from '@/screens/dashboard/messaging/MessagingScreen';
import { PrintScreen } from '@/screens/dashboard/print/PrintScreen';
import RewardScreen from '@/screens/dashboard/reward/RewardsScreen';
import TaskScreen from '@/screens/dashboard/task/TaskScreen';

//Family Contact
import AddFamilyContactScreen from '@/screens/dashboard/family/AddFamilyScreen';
import FamilyDetailsScreen from '@/screens/dashboard/family/FamilyDetailsScreen';
import FamilyContactScreen from '@/screens/dashboard/family/FamilyScreen';
import FamilyInviteScreen from '@/screens/dashboard/family/InviteScreen';

//Expense
import { AddExpenseScreen } from '@/screens/dashboard/budget/AddExpenseScreen';
import ExpenseDetailScreen from '@/screens/dashboard/budget/ExpenseDetailScreen';
import ExpenseRecordsScreen from '@/screens/dashboard/budget/ExpenseRecords';
import { ExpenseScreen } from '@/screens/dashboard/budget/ExpenseScreen';
import AddPaymentScreen from '@/screens/dashboard/budget/payment/AddPayment';
import ConfirmPaymentScreen from '@/screens/dashboard/budget/payment/ConfirmPayment';
import ConfirmRequestScreen from '@/screens/dashboard/budget/payment/ConfirmRequest';
import RequestPaymentScreen from '@/screens/dashboard/budget/payment/RequestPayment';
import ChildEditScreen from '@/screens/dashboard/settings/EditChildScreen';
import EditUserScreen from '@/screens/dashboard/settings/EditUserScreen';
import NotificationSettingsScreen from '@/screens/dashboard/settings/NotisSettingScreen';
import GiftInviteScreen from '@/screens/dashboard/user/GiftReferScreen';
import PremiumScreen from '@/screens/dashboard/user/PremiumScreen';



type BottomTabParamList = {
    Home: undefined;
    Milestones: undefined;
    Expenses: undefined;
    Goals: undefined;
    Chat: undefined;
    Profile: undefined;
    Settings: undefined;
    Resources: undefined;
    Community: undefined;
    Plan: undefined;
    CorePlan: undefined;
    UserProfile: undefined;
    Budgets: undefined;
};

export type RootStackParamList = {
    MainTabs: undefined;
    AddChild: undefined;
    Settings: undefined;
    Support: undefined;
    Community: undefined;
    Milestones: undefined;
    Resources: undefined;
    Notifications: undefined;
    Messaging: undefined;
    Tools: undefined;
    MilestoneDetail: {
        milestoneId: string;
        onDelete: () => void;
    };
    Rewards: undefined;
    ParentingPlan: undefined;
    GoalScreen: {
        goals: Goal[];
        category: string;
        onStatusUpdate?: (updatedGoals: Goal[]) => void;
    };
    CategoryDetails: { categoryId: string };
    AddCategory: undefined;
    Calendar: undefined;
    AddCalendarEvent: undefined;
    Certificate: {
        childName: string;
        skill: string;
        reward: string;
        date: string;
    };

    //Goal Screens
    CorePlan: undefined;
    PlanDetail: {
        coreValue: CoreValue;
        goals: Goal[];
        ageGroup: string;
        ageDescription: string;
    };
    AddGoal: {
        category: string;
        initialGoal?: Goal | null;
        onSave?: (goal: Goal) => void;
    };
    GoalDetails: {
        goal: Goal | null;
        onSave: (updatedGoal: Goal) => void;
        onDelete?: (goalId: string) => void;
    };
    Reminder: {
        goal?: Goal;
        reminderId?: string;
        onSave?: () => void;
    };

    //Goal Screens
    GoalDetail: undefined;
    GoalSummary: undefined;
    UserProfile: undefined;

    //Routine
    Routine: undefined;
    AddRoutine: undefined;
    WelcomeRoutine: undefined;
    ActiveRoutine: { childId: string };
    CustomTask: {
        task?: Task;
        onSave?: (task: Task, isEditing: boolean) => void;
        routineId?: string;
        isPredefined?: boolean;
    };
    RoutineDetails: {
        routineId: string;
        isPredefined?: boolean;
    };

    //Discipline
    WelcomeDiscipline: undefined;
    ActiveDiscipline: undefined;
    Discipline: undefined;
    AddDiscipline: undefined;
    DisciplineDetails: {
        id: string;
        name: string;
        description: string;
        rules?: RuleSet[];
        icon?: string;
    };

    //Family Connect
    WelcomeFamily: undefined;
    AddFamily: undefined;
    FamilyInvite: undefined;
    FamilyDetails: { id: string };

    //Print
    Print: {
        plan?: string;
        childName?: string;
        printAll?: boolean;
        allPlans?: string;
    };

    //Budgeting
    AddExpense: undefined;
    Expense: undefined;
    ExpenseRecords: undefined;
    ExpenseApproval: undefined;
    ExpenseDetails: {
        expenseId: string;
        title?: string;
        amount?: number;
        currency?: string;
        childName?: string;
        date?: string;
        category?: string;
        categoryColor?: string;
        status?: "Pending Approval" | "Approved" | "Rejected";
        statusBg?: string;
        splitInfo?: string;
        reimbursedBy?: string;
    };

    //Payment
    AddPayment: {
        expense: ExpenseType;
    };
    ConfirmPayment: {
        expense: ExpenseType;
        payment: PaymentType;
    };

    //Request
    RequestPayment: undefined;
    PayRequest: undefined;
    ConfirmRequest: {
        title: string;
        description: string;
        amount: number;
        currency: string;
        requestedFromId: string;
        requestedFromName: string;
        dueDate: string;
        fileName?: string;
        requestId?: string;
        status?: string;
    };

    Tasks: undefined;
    ChildProfile: { child: any };
    Documents: {
        chatId: string;
        conversationId: string;
    };

    //Settings stuff
    ChildEdit: { child: ChildProfile };
    UserEdit: undefined;
    NotisSettings: undefined;
    Premium: undefined;
    GiftRefer: undefined;
};

export type ExpenseType = {
    id: string;
    payer_id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    date: string;
    status: string;
    your_share?: number;
    co_parent_share?: number;
    your_percentage?: number;
    co_parent_percentage?: number;
    reimburser?: string;
    coParentId?: string;
    paid_at?: string;
    creator_name: string;
    children?: {
        name?: string;
    };
};

export type PaymentType = {
    amount: number;
    currency: string;
    description: string;
    paid_at: string;
    paid_to: string;
    contactName: string;
};

type ChildProfile = {
    id: string;
    name: string;
    age: number;
    photo: string | null;
    avatar?: string | { uri: string };
    notes?: string;
    interests?: string[];
    allergies?: string[];
    developmentstage?: string;
};

type Goal = {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    area: string;
    goal: string;
    measurable?: string;
    achievable?: string;
    relevant?: string;
    time_bound?: string;
    is_default?: boolean;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    user_id?: string;
    age_group?: string;
    celebration?: string;
    progress?: number;
    is_edited?: boolean;
    is_selected?: boolean;
    reminders?: boolean;
    notes?: string;
    timeframe?: string;
    target_date?: string;
};

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

type Task = {
    id: string;
    title: string;
    duration: string;
    time?: string;
};

type CoreValue = {
    id: string;
    title: string;
    description: string;
    icon: string;
    iconComponent: React.ComponentType<any>;
    color: string;
    iconColor: string;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator<RootStackParamList>();
const CoreValuesStack = createStackNavigator();
const GoalsStack = createStackNavigator();

const CoreValuesNavigator = () => {
    const { colors } = useTheme();

    return (
        <CoreValuesStack.Navigator
            screenOptions={{
                headerShown: false,
                presentation: 'modal'
            }}
        >
            <CoreValuesStack.Screen
                name="CoreValues"
                component={CorePlanScreen}
                options={{ title: 'Core Values' }}
            />
            <CoreValuesStack.Screen
                name="PlanDetail"
                component={PlanDetailScreen as any}
                options={{ title: 'Plan Details' }}
            />
            <CoreValuesStack.Screen
                name="Goals"
                component={GoalScreen}
                options={({ route }) => {
                    const params = route.params as { goalId?: string; category?: string };
                    return {
                        title: params?.category ?? 'Goals',
                    };
                }}
            />
        </CoreValuesStack.Navigator>
    );
};

const GoalsNavigator = () => {
    const { colors } = useTheme();

    return (
        <GoalsStack.Navigator
            screenOptions={{
                headerShown: false,
                presentation: 'modal'
            }}
        >
            <GoalsStack.Screen
                name="GoalScreen"
                component={GoalScreen}
                options={({ route }) => ({
                    title: (route.params as any)?.goals?.[0]?.area || 'Goals'
                })}
            />
            <GoalsStack.Screen
                name="AddGoal"
                component={AddGoalScreen}
                options={{ title: 'Add New Goal' }}
            />
            <GoalsStack.Screen
                name="GoalSummary"
                component={GoalSummaryScreen}
                options={{ title: 'Goal Summary' }}
            />
        </GoalsStack.Navigator>
    );
};

const MainTabs = () => {
    const insets = useSafeAreaInsets();
    const { colors } = useTheme();

    useEffect(() => {
        if (Platform.OS === 'android') {
            SystemUI.setBackgroundColorAsync('transparent');

            NavigationBar.setVisibilityAsync('hidden');
            NavigationBar.setBehaviorAsync('inset-swipe');
            StatusBar.setHidden(true, 'fade');
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (Platform.OS === 'android') {
                SystemUI.setBackgroundColorAsync('transparent');
                NavigationBar.setVisibilityAsync('hidden');
                NavigationBar.setBehaviorAsync('inset-swipe');

                StatusBar.setHidden(true, 'fade');
            }
        }, [])
    );

    return (
        <Tab.Navigator
            screenOptions={({ route }) => {
                const iconName = (focused: boolean): string => {
                    switch (route.name) {
                        case 'Home':
                            return focused ? 'home' : 'home-outline';
                        case 'Resources':
                            return focused ? 'book' : 'book-outline';
                        case 'CorePlan':
                            return focused ? 'people' : 'people-outline';
                        case 'Profile':
                            return focused ? 'person' : 'person-outline';
                        case 'Budgets':
                            return focused ? 'wallet' : 'wallet-outline';
                        default:
                            return 'help-outline';
                    }
                };

                return {
                    headerShown: false,
                    tabBarIcon: ({ focused, color, size }) => {
                        const name = iconName(focused)

                        if (route.name === 'CorePlan') {
                            return (
                                <YStack alignItems="center" top={-28}>
                                    <YStack
                                        width={70}
                                        height={70}
                                        borderRadius={35}
                                        bg={colors.background}
                                        justifyContent="center"
                                        alignItems="center"
                                        borderColor="rgba(0,0,0,0.05)"
                                        borderWidth={1}
                                        elevation={12}
                                        shadowColor="#000"
                                        shadowOffset={{ width: 0, height: 6 }}
                                        shadowOpacity={0.2}
                                        shadowRadius={10}
                                    >
                                        <Ionicons name={name as any} size={32} color={colors.primary} />
                                    </YStack>
                                </YStack>
                            )
                        }

                        return <Ionicons name={name as any} size={size ?? 24} color={color} />
                    },
                    tabBarActiveTintColor: String(colors.primary),
                    tabBarInactiveTintColor: String(colors.textSecondary),
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: Platform.OS === 'ios' ? insets.bottom : 0,
                        left: 20,
                        right: 20,
                        height: 75,
                        alignSelf: 'center',
                        paddingBottom: 12,
                        paddingHorizontal: 16,
                        backgroundColor: colors.background,
                        borderRadius: 12,
                        borderTopWidth: 0,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.08,
                        shadowRadius: 12,
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        marginBottom: 6,
                    },
                }
            }}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Resources" component={ResourcesScreen} />
            <Tab.Screen name="CorePlan" component={CorePlanScreen} />
            <Tab.Screen name="Budgets" component={ExpenseScreen} />
            <Tab.Screen name="Profile" component={UserProfileScreen} />
        </Tab.Navigator>
    );
};

const MilestoneStack = () => (
    <RootStack.Navigator>
        <RootStack.Screen
            name="MilestoneDetail"
            component={MilestoneDetailScreen}
            options={{ headerShown: false, presentation: 'modal' }}
        />
    </RootStack.Navigator>
);

const PlanStack = () => {
    const { colors } = useTheme();

    return (
        <RootStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                    shadowColor: 'transparent',
                },
                headerTintColor: colors.text as string,
                headerTitleStyle: { fontWeight: '600' },
            }}
        >
            <RootStack.Screen
                name="ParentingPlan"
                component={PlanScreen}
                options={{ title: 'Parenting Plan' }}
            />
            <RootStack.Screen
                name="CategoryDetails"
                component={CategoryDetailsScreen}
                options={({ route }) => ({
                    title: route.params?.categoryId || 'Category Details'
                })}
            />
            <RootStack.Screen
                name="AddCategory"
                component={AddCategoryScreen}
                options={{ title: 'Add New Category' }}
            />
        </RootStack.Navigator>
    );
};

const MainStack = () => (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={MainTabs} />

        <RootStack.Screen name="Settings" component={SettingsScreen} />
        <RootStack.Screen name="Support" component={SupportScreen} />
        <RootStack.Screen name="Community" component={CommunityScreen} />

        <RootStack.Screen name='ChildEdit' component={ChildEditScreen} />
        <RootStack.Screen name='UserEdit' component={EditUserScreen} />
        <RootStack.Screen name='NotisSettings' component={NotificationSettingsScreen} />
        <RootStack.Screen name='Premium' component={PremiumScreen} />
        <RootStack.Screen name='GiftRefer' component={GiftInviteScreen} />

        <RootStack.Screen name="Milestones" component={MilestoneStack} />
        <RootStack.Screen name="ParentingPlan" component={PlanStack} />
        <RootStack.Screen name="AddGoal" component={AddGoalScreen} />
        <RootStack.Screen name="Calendar" component={CalendarScreen} />
        <RootStack.Screen name="AddCalendarEvent" component={AddCalendarEventScreen} />

        <RootStack.Screen name="Expense" component={ExpenseScreen} />
        <RootStack.Screen name="ExpenseDetails" component={ExpenseDetailScreen} />
        <RootStack.Screen name="ExpenseRecords" component={ExpenseRecordsScreen} />
        <RootStack.Screen name="AddExpense" component={AddExpenseScreen} />

        <RootStack.Screen name="AddPayment" component={AddPaymentScreen} />
        <RootStack.Screen name="ConfirmPayment" component={ConfirmPaymentScreen} />

        <RootStack.Screen name="RequestPayment" component={RequestPaymentScreen} />
        <RootStack.Screen name="ConfirmRequest" component={ConfirmRequestScreen} />

        <RootStack.Screen name="Rewards" component={RewardScreen} />
        <RootStack.Screen name="Tools" component={ToolsScreen} />
        <RootStack.Screen name="Resources" component={ResourcesScreen} />
        <RootStack.Screen name="Messaging" component={MessagingScreen} />
        <RootStack.Screen name="AddCategory" component={AddCategoryScreen} />

        <RootStack.Screen name="CorePlan" component={CoreValuesNavigator} />
        <RootStack.Screen name="PlanDetail" component={PlanDetailScreen as never} />
        <RootStack.Screen name="GoalScreen" component={GoalsNavigator} />
        <RootStack.Screen name="GoalDetails" component={GoalDetailsScreen} />
        <RootStack.Screen name="Reminder" component={ReminderScreen} />
        <RootStack.Screen name="GoalSummary" component={GoalSummaryScreen} />

        <RootStack.Screen name="UserProfile" component={UserProfileScreen} />

        <RootStack.Screen name="Routine" component={DailyRoutineScreen} />
        <RootStack.Screen name="WelcomeRoutine" component={RoutineScreen} />
        <RootStack.Screen name="RoutineDetails" component={RoutineDetailsScreen} />
        <RootStack.Screen name="AddRoutine" component={CreateCustomRoutineScreen} />
        <RootStack.Screen name="ActiveRoutine" component={ActiveRoutineScreen} />
        <RootStack.Screen name="CustomTask" component={CustomTaskScreen} />

        <RootStack.Screen name="WelcomeDiscipline" component={DisciplineScreen} />
        <RootStack.Screen name="ActiveDiscipline" component={ActiveDisciplineScreen} />
        <RootStack.Screen name="Discipline" component={DisciplineTemplateScreen} />
        <RootStack.Screen name="AddDiscipline" component={AddDisciplineScreen} />
        <RootStack.Screen name='DisciplineDetails' component={DisciplineDetailsScreen} />

        <RootStack.Screen name='WelcomeFamily' component={FamilyContactScreen} />
        <RootStack.Screen name='AddFamily' component={AddFamilyContactScreen} />
        <RootStack.Screen name="FamilyInvite" component={FamilyInviteScreen} />
        <RootStack.Screen name="FamilyDetails" component={FamilyDetailsScreen} />


        <RootStack.Screen name="Tasks" component={TaskScreen} />
        <RootStack.Screen name="Notifications" component={NotificationScreen} />
        <RootStack.Screen name="ChildProfile" component={ChildProfileScreen} />
        <RootStack.Screen name="AddChild" component={AddChildScreen} />
        <RootStack.Screen name="Documents" component={DocumentScreen} />
        <RootStack.Screen name="Print" component={PrintScreen} />
        <RootStack.Screen name="Certificate" component={CertificateScreen} />

    </RootStack.Navigator>
);

const MainNavigator = () => {
    const { colors } = useTheme();
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false,
                drawerStyle: {
                    width: 250,
                    borderTopRightRadius: 15,
                    borderBottomRightRadius: 15,
                    overflow: 'hidden',
                    backgroundColor: colors.cardBackground,
                },
                drawerPosition: 'left',
                drawerActiveTintColor: String(colors.primary),
                drawerInactiveTintColor: String(colors.text),
                drawerActiveBackgroundColor: colors.primaryLight,
            }}
        >
            <Drawer.Screen name="Main" component={MainStack} />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        paddingTop: 10,
        borderTopWidth: 1,
        elevation: 10,
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    headerStyle: {
        height: Platform.OS === 'ios' ? 100 : 90,
        borderBottomWidth: 1,
    },
});

export default MainNavigator;