import { MaterialIcons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
const generateUUID = () => uuidv4();
const cloneWithNewUUIDs = (original: any[]) => {
    return original.map(item => ({
        ...item,
        id: generateUUID()
    }));
};

export const CORE_VALUES_DATA = [
    {
        id: generateUUID(),
        title: 'Social Development Goals',
        description: 'These goals focus on helping children develop positive interactions, cooperation, manners, and early social awareness.',
        icon: 'people',
        iconComponent: MaterialIcons,
        color: '#fce4ec',
        iconColor: '#e91e63',
    },
    {
        id: generateUUID(),
        title: 'Academic Development Goals',
        description: 'Respect authority, follow rules, and value learning every day.',
        icon: 'school',
        iconComponent: MaterialIcons,
        color: '#e8eaf6',
        iconColor: '#3f51b5',
    },
    {
        id: generateUUID(),
        title: 'Emotional Development Goals',
        description: 'Do the right thing, even when it\'s difficult or unpopular.',
        icon: 'mood',
        iconComponent: MaterialIcons,
        color: '#fff3e0',
        iconColor: '#ff9800',
    },
    {
        id: generateUUID(),
        title: 'Life Skills & Problem Solving',
        description: 'Stay persistent, ask for help, and keep learning from challenges.',
        icon: 'lightbulb-outline',
        iconComponent: MaterialIcons,
        color: '#e8f5e9',
        iconColor: '#4caf50',
    },
    {
        id: generateUUID(),
        title: 'Physical Health Goals',
        description: 'Take care of your body with healthy habits and regular activity.',
        icon: 'fitness-center',
        iconComponent: MaterialIcons,
        color: '#e3f2fd',
        iconColor: '#2196f3',
    },
    {
        id: generateUUID(),
        title: 'Faith & Spiritual Growth',
        description: 'Be gentle, kind, and do for others what you wish for yourself.',
        icon: 'self-improvement',
        iconComponent: MaterialIcons,
        color: '#f3e5f5',
        iconColor: '#9c27b0',
    },
    {
        id: generateUUID(),
        title: 'Financial Literacy Goals',
        description: 'Plan wisely, save, and spend responsibly to achieve your dreams.',
        icon: 'attach-money',
        iconComponent: MaterialIcons,
        color: '#fce4ec',
        iconColor: '#7b1fa2',
    },
    {
        id: generateUUID(),
        title: 'Digital & Media Literacy Goals',
        description: 'Use technology safely, responsibly, and to express creativity.',
        icon: 'devices',
        iconComponent: MaterialIcons,
        color: '#e8eaf6',
        iconColor: '#0288d1',
    },
    {
        id: generateUUID(),
        title: 'Civic & Community Engagement',
        description: 'Contribute to your community and stand up for what is right.',
        icon: 'emoji-people',
        iconComponent: MaterialIcons,
        color: '#fffde7',
        iconColor: '#fbc02d',
    },
    {
        id: generateUUID(),
        title: 'Creative Expression & Communication',
        description: 'Express yourself confidently through art, words, and actions.',
        icon: 'brush',
        iconComponent: MaterialIcons,
        color: '#f1f8e9',
        iconColor: '#388e3c',
    },
];

export const SOCIAL_DEVELOPMENT_DATA = [
    {
        id: generateUUID(),
        status: 'Mastered',
        area: 'Basic Manners',
        goal: 'Practice saying "please," "thank you," and "excuse me"',
        smart: {
            specific: 'Use polite phrases in conversations',
            measurable: 'At least 5 times per day',
            achievable: 'Modeling and reinforcement by adults',
            relevant: 'Develops respectful social interactions',
            timeBound: 'Within 2 weeks'
        }
    },
    {
        id: generateUUID(),
        status: 'Mastered',
        area: 'Greetings',
        goal: 'Learn how to say hello and goodbye appropriately',
        smart: {
            specific: 'Greet peers and adults at appropriate times',
            measurable: 'Observed in daily arrival and departure routines',
            achievable: 'With daily practice and adult prompting',
            relevant: 'Encourages social confidence',
            timeBound: 'Mastered in 10 days'
        }
    },
    {
        id: generateUUID(),
        status: 'Working on',
        area: 'Turn-Taking',
        goal: 'Take turns in games and conversations',
        smart: {
            specific: 'Take turns with peers during play or talk',
            measurable: 'Successfully take turns in 3 activities daily',
            achievable: 'Facilitated by turn-taking games and role-play',
            relevant: 'Fosters patience and cooperation',
            timeBound: '4 weeks goal window'
        }
    },
    {
        id: generateUUID(),
        status: 'Mastered',
        area: 'Sharing',
        goal: 'Share toys and materials during play',
        smart: {
            specific: 'Share favorite toys during group play',
            measurable: 'At least twice per play session',
            achievable: 'Encouraged and praised by teachers/parents',
            relevant: 'Essential for social bonding and empathy',
            timeBound: 'Achieved over a 3-week period'
        }
    }
];
export const ACADEMIC_DEVELOPMENT_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const EMOTIONAL_DEVELOPMENT_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const LIFE_SKILLS_AND_PROBLEM_SOLVING_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const PHYSICAL_HEALTH_GOALS_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const FAITH_AND_SPIRITUAL_GROWTH_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const FINANCIAL_LITERACY_GOALS_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const DIGITAL_AND_MEDIA_LITERACY_GOALS_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const CIVIC_AND_COMMUNITY_ENGAGEMENT_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
export const CREATIVE_EXPRESSION_AND_COMMUNICATION_DATA = cloneWithNewUUIDs(SOCIAL_DEVELOPMENT_DATA);
