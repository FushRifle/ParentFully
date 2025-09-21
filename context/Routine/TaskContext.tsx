import React, { createContext, useContext, useState } from "react";

type Task = {
    id?: string;
    title: string;
    icon?: string;
    time_slot?: string;
    duration_minutes?: string;
};

type TaskContextType = {
    routineId: string | null;
    setRoutineId: (id: string | null) => void;
    task: Task | null;
    setTask: (task: Task | null) => void;
    isPreloaded: boolean;
    setIsPreloaded: (val: boolean) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routineId, setRoutineId] = useState<string | null>(null);
    const [task, setTask] = useState<Task | null>(null);
    const [isPreloaded, setIsPreloaded] = useState(false);

    return (
        <TaskContext.Provider
            value={{ routineId, setRoutineId, task, setTask, isPreloaded, setIsPreloaded }}
        >
            {children}
        </TaskContext.Provider>
    );
};

export const useTask = () => {
    const ctx = useContext(TaskContext);
    if (!ctx) throw new Error("useTask must be used within TaskProvider");
    return ctx;
};
