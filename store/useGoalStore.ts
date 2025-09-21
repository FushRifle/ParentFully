import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SMART = {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
};

type Goal = {
    id: string;
    area: string;
    goal: string;
    status: 'Working on' | 'Mastered';
    expiryDate?: string;
    smart?: SMART;
    category: string;
    createdAt: string;
    lastUpdated?: string;
};

type GoalStore = {
    goals: Goal[];
    selectedGoalIds: string[];
    // Single goal operations
    addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'> & { status?: 'Working on' | 'Mastered' }) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    removeGoal: (id: string) => void;
    // Bulk operations
    addGoals: (goals: Omit<Goal, 'id' | 'createdAt'>[]) => void;
    removeGoals: (ids: string[]) => void;
    // Selection management
    toggleGoalSelection: (id: string) => void;
    setSelectedGoals: (ids: string[]) => void;
    clearSelectedGoals: () => void;
    // Status management
    updateGoalStatus: (id: string, status: 'Working on' | 'Mastered') => void;
    // Expiry management
    setGoalExpiry: (id: string, expiryDate: string) => void;
    // Getters
    getGoal: (id: string) => Goal | undefined;
    getSelectedGoals: () => Goal[];
    getGoalsByCategory: (category: string) => Goal[];
    // Reset
    reset: () => void;
};

export const useGoalStore = create<GoalStore>()(
    persist(
        (set, get) => ({
            goals: [],
            selectedGoalIds: [],

            // Add a single goal
            addGoal: (goal) => {
                const newGoal: Goal = {
                    ...goal,
                    id: Date.now().toString(),
                    status: goal.status || 'Working on',
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                };
                set((state) => ({
                    goals: [...state.goals, newGoal]
                }));
                return newGoal;
            },

            // Update a goal
            updateGoal: (id, updates) => {
                set((state) => ({
                    goals: state.goals.map(goal =>
                        goal.id === id
                            ? {
                                ...goal,
                                ...updates,
                                lastUpdated: new Date().toISOString()
                            }
                            : goal
                    )
                }));
            },

            // Remove a goal
            removeGoal: (id) => {
                set((state) => ({
                    goals: state.goals.filter(goal => goal.id !== id),
                    selectedGoalIds: state.selectedGoalIds.filter(goalId => goalId !== id)
                }));
            },

            // Add multiple goals
            addGoals: (newGoals) => {
                const withIds = newGoals.map(goal => ({
                    ...goal,
                    id: Date.now().toString(),
                    status: goal.status || 'Working on',
                    createdAt: new Date().toISOString(),
                    lastUpdated: new Date().toISOString()
                }));
                set((state) => ({
                    goals: [...state.goals, ...withIds]
                }));
            },

            // Remove multiple goals
            removeGoals: (ids) => {
                set((state) => ({
                    goals: state.goals.filter(goal => !ids.includes(goal.id)),
                    selectedGoalIds: state.selectedGoalIds.filter(id => !ids.includes(id))
                }));
            },

            // Toggle goal selection
            toggleGoalSelection: (id) => {
                set((state) => {
                    const exists = state.selectedGoalIds.includes(id);
                    return {
                        selectedGoalIds: exists
                            ? state.selectedGoalIds.filter(goalId => goalId !== id)
                            : [...state.selectedGoalIds, id]
                    };
                });
            },

            // Set selected goals
            setSelectedGoals: (ids) => {
                set({ selectedGoalIds: ids });
            },

            // Clear all selected goals
            clearSelectedGoals: () => {
                set({ selectedGoalIds: [] });
            },

            // Update goal status
            updateGoalStatus: (id, status) => {
                set((state) => ({
                    goals: state.goals.map(goal =>
                        goal.id === id
                            ? {
                                ...goal,
                                status,
                                lastUpdated: new Date().toISOString()
                            }
                            : goal
                    )
                }));
            },

            // Set goal expiry date
            setGoalExpiry: (id, expiryDate) => {
                set((state) => ({
                    goals: state.goals.map(goal =>
                        goal.id === id
                            ? {
                                ...goal,
                                expiryDate,
                                lastUpdated: new Date().toISOString()
                            }
                            : goal
                    )
                }));
            },

            // Get a single goal by ID
            getGoal: (id) => {
                return get().goals.find(goal => goal.id === id);
            },

            // Get all currently selected goals
            getSelectedGoals: () => {
                const { goals, selectedGoalIds } = get();
                return goals.filter(goal => selectedGoalIds.includes(goal.id));
            },

            // Get goals by category
            getGoalsByCategory: (category) => {
                return get().goals.filter(goal => goal.category === category);
            },

            // Reset the entire store
            reset: () => {
                set({ goals: [], selectedGoalIds: [] });
            }
        }),
        {
            name: 'goal-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                goals: state.goals,
                // Don't persist selection state
            })
        }
    )
);

// Utility function to generate a new goal ID
export const generateGoalId = () => Date.now().toString();