import { useState } from 'react';

interface Milestone {
    id: string;
    description: string;
    completed: boolean;
}

export interface ChildGoal {
    id: string;
    title: string;
    type: 'behavioral' | 'learning' | 'emotional';
    milestones: Milestone[];
    notes: string;
    progress: number;
}

export const useChildGoals = () => {
    const [childGoals, setChildGoals] = useState<ChildGoal[]>([
        {
            id: '1',
            title: 'Bedtime routine',
            type: 'behavioral',
            milestones: [
                { id: '1', description: 'Brush teeth', completed: true },
                { id: '2', description: 'Put on pajamas', completed: true },
                { id: '3', description: 'Read story', completed: false },
                { id: '4', description: 'Lights out by 8pm', completed: false },
            ],
            notes: '',
            progress: 50,
        },
        {
            id: '2',
            title: 'Emotional regulation',
            type: 'emotional',
            milestones: [
                { id: '1', description: 'Identify feelings', completed: true },
                { id: '2', description: 'Use calming techniques', completed: false },
            ],
            notes: 'Working on deep breathing exercises',
            progress: 25,
        },
    ]);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalType, setNewGoalType] = useState<'behavioral' | 'learning' | 'emotional'>('behavioral');
    const [newMilestones, setNewMilestones] = useState<string[]>(['']);

    const addChildGoal = () => {
        if (newGoalTitle.trim() && newMilestones.some(m => m.trim())) {
            const milestones = newMilestones
                .filter(m => m.trim())
                .map((m, i) => ({
                    id: i.toString(),
                    description: m.trim(),
                    completed: false
                }));

            setChildGoals([
                ...childGoals,
                {
                    id: Date.now().toString(),
                    title: newGoalTitle.trim(),
                    type: newGoalType,
                    milestones,
                    notes: '',
                    progress: 0,
                },
            ]);
            setNewGoalTitle('');
            setNewMilestones(['']);
        }
    };

    const toggleMilestone = (goalId: string, milestoneId: string) => {
        setChildGoals(childGoals.map(goal => {
            if (goal.id === goalId) {
                const updatedMilestones = goal.milestones.map(m =>
                    m.id === milestoneId ? { ...m, completed: !m.completed } : m
                );
                const completedCount = updatedMilestones.filter(m => m.completed).length;
                const progress = Math.round((completedCount / updatedMilestones.length) * 100);

                return {
                    ...goal,
                    milestones: updatedMilestones,
                    progress
                };
            }
            return goal;
        }));
    };

    const addMilestoneField = () => {
        if (newMilestones.length < 5) {
            setNewMilestones([...newMilestones, '']);
        }
    };

    const updateMilestoneField = (text: string, index: number) => {
        const updated = [...newMilestones];
        updated[index] = text;
        setNewMilestones(updated);
    };

    const removeMilestoneField = (index: number) => {
        const updated = [...newMilestones];
        updated.splice(index, 1);
        setNewMilestones(updated);
    };

    const updateGoalNotes = (goalId: string, notes: string) => {
        setChildGoals(childGoals.map(goal =>
            goal.id === goalId ? { ...goal, notes } : goal
        ));
    };

    return {
        childGoals,
        newGoalTitle,
        setNewGoalTitle,
        newGoalType,
        setNewGoalType,
        newMilestones,
        addChildGoal,
        toggleMilestone,
        addMilestoneField,
        updateMilestoneField,
        removeMilestoneField,
        updateGoalNotes
    };
};