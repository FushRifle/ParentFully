import { v4 as uuidv4 } from "uuid";

export type RoutineTemplate = {
    id: string;
    name: string;
    ageRange: string;
    icon?: string;
    description?: string;
    tasks: (TemplateTask)[];
    notes?: string;
    isPreloaded?: boolean;
    user_id?: string;
    created_at?: string;
    updated_at?: string;
    categories?: string[];
};

export type TemplateTask = {
    title: string;
    description?: string;
    time_slot?: string;
    priority?: 'low' | 'medium' | 'high';
    duration_minutes?: number;
    category?: string;
    icon?: string;
};

export const PRELOADED_ROUTINES: RoutineTemplate[] = [
    {
        id: uuidv4(),
        name: "Morning Routine",
        ageRange: "3–8 years",
        description:
            "A structured start to the day that helps children develop independence and prepares them for school or daily activities.",
        tasks: [
            {
                title: "Wake up",
                description: "Gently wake up and stretch",
                time_slot: "7:00 AM",
                priority: "high",
                duration_minutes: 5,
                icon: "alarm",
                category: "wake-up",
            },
            {
                title: "Make bed",
                description: "Straighten sheets and blankets",
                time_slot: "7:05 AM",
                priority: "medium",
                duration_minutes: 3,
                icon: "bed-outline",
                category: "chores",
            },
            {
                title: "Brush teeth",
                description: "2 minutes of brushing",
                time_slot: "7:10 AM",
                priority: "high",
                duration_minutes: 3,
                icon: "toothbrush",
                category: "hygiene",
            },
            {
                title: "Get dressed",
                description: "Choose clothes and get dressed",
                time_slot: "7:15 AM",
                priority: "high",
                duration_minutes: 10,
                icon: "tshirt-crew",
                category: "dressing",
            },
            {
                title: "Eat breakfast",
                description: "Healthy breakfast with protein",
                time_slot: "7:30 AM",
                priority: "high",
                duration_minutes: 20,
                icon: "food",
                category: "meals",
            },
            {
                title: "Pack school bag",
                description: "Check for homework and supplies",
                time_slot: "7:50 AM",
                priority: "medium",
                duration_minutes: 5,
                icon: "bag-personal-outline",
                category: "school",
            },
        ],
        notes: "Ideal for preschool to early elementary. Use visual charts for younger children.",
        icon: "white-balance-sunny",
        categories: ["morning", "school"],
        isPreloaded: true,
        created_at: new Date().toISOString(),
    },


    {
        id: uuidv4(),
        name: "After School Routine",
        ageRange: "3–10 years",
        description: "Provides structure after the school day to balance responsibilities and relaxation.",
        tasks: [
            {
                title: "Unpack bag",
                description: "Empty lunchbox and organize papers",
                time_slot: "3:30 PM",
                priority: "medium",
                duration_minutes: 5,
                icon: "bag-personal-outline",
                category: "school",
            },
            {
                title: "Healthy snack",
                description: "Fruit, veggies, or protein snack",
                time_slot: "3:40 PM",
                priority: "high",
                duration_minutes: 15,
                icon: "food-apple",
                category: "meals",
            },
            {
                title: "Homework",
                description: "Focus on assignments",
                time_slot: "4:00 PM",
                priority: "high",
                duration_minutes: 30,
                icon: "book-education",
                category: "school",
            },
            {
                title: "Outdoor play",
                description: "Physical activity outside",
                time_slot: "4:30 PM",
                priority: "medium",
                duration_minutes: 45,
                icon: "soccer",
                category: "activity",
            },
            {
                title: "Quick tidy up",
                description: "Put away toys and belongings",
                time_slot: "5:15 PM",
                priority: "low",
                duration_minutes: 10,
                icon: "broom",
                category: "chores",
            },
        ],
        notes: "Builds structure after school day. Adjust homework duration based on age/needs.",
        icon: "school",
        categories: ["afternoon", "school"],
        isPreloaded: true,
        created_at: new Date().toISOString(),
    },

    {
        id: uuidv4(),
        name: "Evening Routine",
        ageRange: "3–12 years",
        description:
            "A calming routine that signals the transition to sleep, helping children wind down.",
        tasks: [
            {
                title: "Dinner",
                description: "Family meal time",
                time_slot: "6:00 PM",
                priority: "high",
                duration_minutes: 30,
                icon: "food-variant",
                category: "meals",
            },
            {
                title: "Bath time",
                description: "Wash up for bed",
                time_slot: "6:45 PM",
                priority: "medium",
                duration_minutes: 20,
                icon: "bathtub-outline",
                category: "hygiene",
            },
            {
                title: "Put on pajamas",
                description: "Change into sleep clothes",
                time_slot: "7:05 PM",
                priority: "medium",
                duration_minutes: 5,
                icon: "tshirt-v",
                category: "dressing",
            },
            {
                title: "Brush teeth",
                description: "2 minutes of brushing",
                time_slot: "7:10 PM",
                priority: "high",
                duration_minutes: 3,
                icon: "toothbrush",
                category: "hygiene",
            },
            {
                title: "Read a book",
                description: "Calming story time",
                time_slot: "7:15 PM",
                priority: "low",
                duration_minutes: 15,
                icon: "book-open-page-variant",
                category: "wind-down",
            },
            {
                title: "Lights out",
                description: "Time for sleep",
                time_slot: "7:30 PM",
                priority: "high",
                duration_minutes: 0,
                icon: "power-sleep",
                category: "sleep",
            },
        ],
        notes: "Helps with winding down and sleep transition. Start 30-60 minutes before target bedtime.",
        icon: "weather-night",
        categories: ["evening", "bedtime"],
        isPreloaded: true,
        created_at: new Date().toISOString(),
    },

    {
        id: uuidv4(),
        name: "No School Day",
        ageRange: "5–12 years",
        description:
            "A flexible yet structured approach to weekends that maintains rhythm while allowing for relaxation.",
        tasks: [
            {
                title: "Wake up naturally",
                description: "No alarm clock",
                time_slot: "8:00 AM",
                priority: "low",
                duration_minutes: 0,
                icon: "weather-sunset",
                category: "wake-up",
            },
            {
                title: "Family breakfast",
                description: "Leisurely morning meal",
                time_slot: "8:30 AM",
                priority: "medium",
                duration_minutes: 30,
                icon: "food-fork-drink",
                category: "meals",
            },
            {
                title: "Tidy room",
                description: "Quick clean-up",
                time_slot: "9:00 AM",
                priority: "medium",
                duration_minutes: 15,
                icon: "room-service-outline",
                category: "chores",
            },
            {
                title: "Choose an activity",
                description: "Creative or educational",
                time_slot: "9:30 AM",
                priority: "low",
                duration_minutes: 60,
                icon: "puzzle",
                category: "activity",
            },
            {
                title: "Outdoor time",
                description: "Park, bike ride, or play",
                time_slot: "11:00 AM",
                priority: "high",
                duration_minutes: 90,
                icon: "bike",
                category: "activity",
            },
            {
                title: "Screen time (limited)",
                description: "TV, tablet, or games",
                time_slot: "2:00 PM",
                priority: "low",
                duration_minutes: 60,
                icon: "tablet-cellphone",
                category: "leisure",
            },
        ],
        notes:
            "Flexible, relaxed — but still adds rhythm. Great for maintaining consistency on non-school days.",
        icon: "calendar-weekend",
        categories: ["weekend", "family"],
        isPreloaded: true,
        created_at: new Date().toISOString(),
    },
];
