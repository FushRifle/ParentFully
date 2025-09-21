import { v4 as uuidv4 } from "uuid";

type RuleSet = {
    rule: string;
    consequence: string;
    notes: string;
};

export type DisciplineTemplate = {
    id: string;
    color?: string;
    name: string;
    description: string;
    strategy?: string;
    rewards?: string;
    icon?: string;
    notes?: string;
    rules?: RuleSet[];
    ageRange?: string;
    isPreloaded?: boolean;
};


export const PRELOADED_DISCIPLINE: DisciplineTemplate[] = [
    {
        id: uuidv4(),
        color: '#FF8C01',
        name: "Tidy",
        description: "Encourage children to tidy their toys and books immediately after use.",
        strategy: "Model cleanup behavior and pair with songs or timers.",
        rewards: "Praise and small reward for consistent behavior",
        notes: "Keep bins accessible; pair cleanup with music, praise effort",
        icon: "toy-brick",
        rules: [
            {
                rule: "Put toys/books away after use",
                consequence: "No new toy until cleanup is done",
                notes: "Keep bins accessible; pair cleanup with music, Praise effort",
            },
        ],
        ageRange: "3-7",
        isPreloaded: true,
    },
    {
        id: uuidv4(),
        color: '#9FCC16',
        name: "Respect",
        description: "Promote polite and respectful communication among family members.",
        strategy: "Model tone, give reminders before correcting.",
        rewards: "Praise or small token for polite interactions",
        icon: "chat",
        rules: [
            {
                rule: "Use kind words with family",
                consequence: "Apologize and try again with respectful tone",
                notes: "Model tone and give reminders before correcting. Acknowledge when appropriate tone is used",
            },
            {
                rule: "Ask permission before using something",
                consequence: "Return the item + wait for yes",
                notes: "Encourage eye contact and verbal requests",
            },
            {
                rule: "Speak calmly, not yelling",
                consequence: "Calm-down time in quiet space",
                notes: "Use visuals or hand signals to cue volume awareness",
            },
            {
                rule: "Wait your turn when speaking",
                consequence: "Reminder and wait time before continuing",
                notes: "Practice turn-taking games to build the habit",
            },
        ],
        ageRange: "3-10",
        isPreloaded: true,
    },
    {
        id: uuidv4(),
        color: '#005A31',
        name: "Responsibility",
        description: "Encourage children to stick to daily routines promptly.",
        strategy: "Use visual schedules or timers to guide routines",
        rewards: "Praise or sticker for on-time completion",
        icon: "clock-outline",
        rules: [
            {
                rule: "Follow routine without delay",
                consequence: "Delay screen/play time",
                notes: "Keep routines visible/Accessible (chart or checklist)",
            },
            {
                rule: "Finish schoolwork before screens/play",
                consequence: "No screen time until work is complete + extra task",
                notes: "Use timers or chore list to visualize progress",
            },
        ],
        ageRange: "4-12",
        isPreloaded: true,
    },
    {
        id: uuidv4(),
        color: 'black',
        name: "Dining",
        description: "Encourage participation in household tasks after meals.",
        strategy: "Use a simple routine chart; assign age-appropriate tasks",
        rewards: "Praise and small reward for cooperation",
        icon: "silverware-fork-knife",
        rules: [
            {
                rule: "Help set the table or tidy after meals",
                consequence: "No dessert/snack until job is complete",
                notes: "Use a simple routine chart; keep jobs age-appropriate",
            },
        ],
        ageRange: "4-12",
        isPreloaded: true,
    },
];
