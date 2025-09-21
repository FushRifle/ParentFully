import { CORE_VALUES_DATA } from "@/data/ValueData";
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
    MainTabs: undefined;
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
    CategoryDetails: { categoryId: string };
    AddCategory: undefined;
    Calendar: undefined;
    AddExpense: undefined;
    AddCalendarEvent: undefined;
    ExpenseDetail: { expense: any };


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
        routine?: RoutineTemplate
        reminderId?: string;
        onSave?: () => void;
    };

    ChildProfile: {
        ChildProfile: { child: ChildProfile };
        childId: string;
        goalsSaved?: boolean;
    };
    Certificate: {
        childName: string;
        skill: string;
        reward: string;
        date: string;
    };
};

type RoutineTemplate = {
    id: string;
    name: string;
    ageRange: string;
    description?: string;
    tasks: (string | TemplateTask)[];
    icon?: string;
};

type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: "low" | "medium" | "high";
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

type Goal = {
    id: string;
    core_value_id: string;
    status: 'Working on' | 'Mastered' | 'Expired' | 'Behind' | 'Try again';
    area: string;
    goal: string;
    specific?: string
    measurable?: string;
    achievable?: string;
    relevant?: string;
    time_bound?: string;
    is_default?: boolean;
    created_at?: string;
    updated_at?: string;
    is_active?: boolean;
    user_id?: string;
    child_id?: string
    age_group?: string;
    celebration?: string;
    progress?: number;
    is_edited?: boolean;
    is_selected?: boolean;
    reminders?: boolean;
    notes?: string;
    timeframe?: string;
    target_date?: string;
    assigned_to?: string
    reward_name?: string
    reward_notes?: string
};

type CoreValue = {
    id: string
    title: string
    description: string
    icon: string
    iconComponent: React.ComponentType<any>
    color: string
    iconColor: string
    age_group?: string
}

type Child = {
    id: string
    name: string
    age: number
}

export interface CombinedChildProfileProps {
    children: ChildProfile[];
    selectedChild: ChildProfile | null;
    onSelectChild: (child: ChildProfile) => void;
    onEdit?: () => void;
}


export type OnboardingStackParamList = {
    Onboarding: undefined;
    OnboardingSlide: { slide: OnboardingSlide };
};

export type AuthStackParamList = {
    Login: undefined;
    Main: undefined;
    Register: undefined;
    ForgotPassword: undefined;
};

export type OnboardingSlide = {
    id: number;
    title: string;
    text: string;
    image: number;
};

export type ChildProfile = {
    id: string;
    name: string;
    age: string;
    photo: number;
};

export type Article = {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    readingTime: number;
};

export type Milestone = {
    completed: any;
    updated_at: any;
    due_date: boolean;
    id: string;
    title: string;
    achieved: boolean;
    date?: string;
};
export type MilestoneChecklist = {
    childId: string;
    milestones: Milestone[];
};
export type BottomTabParamList = {
    Home: undefined;
    Resources: undefined;
    Tools: undefined;
    Profile: undefined;
};

export type DrawerParamList = {
    Main: undefined;
};

export type Tool = {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
};

export type Expert = {
    id: string;
    name: string;
    specialty: string;
    tip: string;
};

export type FamilyMember = {
    id: string;
    name: string;
    age: string;
    relation: string;
};

type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role: 'parent' | 'expert' | 'admin';
    created_at: string;
    updated_at: string;
};

type Profile = {
    id: string;
    user_id: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    website?: string;
    created_at: string;
    updated_at: string;
};

export type CoreValuesStackParamList = {
    CoreValues: undefined;
    CoreValueDetails: {
        coreValue: typeof CORE_VALUES_DATA[0];
        selectedValues: string[];
        onSelect: (value: string) => void;
    };
};

export type CoreValuesNavigationProp = StackNavigationProp<CoreValuesStackParamList, 'CoreValues'>;