import { useState } from 'react';

interface ParentingValue {
    id: string;
    value: string;
    isCustom: boolean;
}

interface ParentingGoal {
    id: string;
    description: string;
    isShared: boolean;
    alignmentScore?: number;
}

export const useParentingVision = () => {
    const [isCoParenting, setIsCoParenting] = useState(false);
    const [alignmentScore, setAlignmentScore] = useState(50);
    const [parentingValues, setParentingValues] = useState<ParentingValue[]>([
        { id: '1', value: 'Compassion', isCustom: false },
        { id: '2', value: 'Honesty', isCustom: false },
        { id: '3', value: 'Resilience', isCustom: false },
    ]);
    const [newValue, setNewValue] = useState('');
    const [parentingGoals, setParentingGoals] = useState<ParentingGoal[]>([
        { id: '1', description: 'Raise independent children', isShared: false },
        { id: '2', description: 'Create a loving home environment', isShared: true, alignmentScore: 80 },
    ]);
    const [newGoal, setNewGoal] = useState('');

    const addParentingValue = () => {
        if (newValue.trim()) {
            setParentingValues([
                ...parentingValues,
                { id: Date.now().toString(), value: newValue.trim(), isCustom: true },
            ]);
            setNewValue('');
        }
    };

    const addParentingGoal = () => {
        if (newGoal.trim()) {
            setParentingGoals([
                ...parentingGoals,
                {
                    id: Date.now().toString(),
                    description: newGoal.trim(),
                    isShared: isCoParenting,
                    alignmentScore: isCoParenting ? alignmentScore : undefined
                },
            ]);
            setNewGoal('');
        }
    };

    const removeParentingValue = (id: string) => {
        setParentingValues(parentingValues.filter(v => v.id !== id));
    };

    return {
        isCoParenting,
        setIsCoParenting,
        alignmentScore,
        setAlignmentScore,
        parentingValues,
        newValue,
        setNewValue,
        parentingGoals,
        newGoal,
        setNewGoal,
        addParentingValue,
        addParentingGoal,
        removeParentingValue
    };
};