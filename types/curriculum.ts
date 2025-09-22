import { IconProps } from '@expo/vector-icons/build/createIconSet';
import { ComponentType } from 'react';

export interface CoreValue {
    title: string;
    description: string;
    icon: string;
    iconComponent: ComponentType<IconProps<any>>;
    color: string;
    iconColor: string;
}

export interface DevelopmentMilestone {
    area: string;
    goal: string;
    why: string;
    activities: string;
    status: 'Mastered' | 'Working on';
    last_updated?: string;
}

export interface CoreValueWithMilestones {
    title: string;
    description: string;
    icon: string;
    iconComponent: ComponentType<IconProps<any>>;
    color: string;
    iconColor: string;
    milestones?: DevelopmentMilestone[];
}

export interface CoreValuesGridProps {
    onSelectionChange?: (selectedValues: string[]) => void;
    initialSelected?: string[];
    maxSelections?: number;
}

export interface CurriculumSelectionScreenProps {
    initialSelected?: string[];
    onSave?: (selected: string[]) => void;
    onBack?: () => void;
}
