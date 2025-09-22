import type { TaskTemplate } from "@/types/tasks";
import { v4 as uuidv4 } from 'uuid';

export const PRELOADED_TASKS: TaskTemplate[] = [
    {
        id: uuidv4(),
        title: "Pick up new school uniform",
        description: "Uniform ready at store; pick up by Friday",
        due_date: "2025-07-05",
        assignee: "Parent A"
    },
    {
        id: uuidv4(),
        title: "Schedule dentist appointment",
        description: "Next check-up due this month",
        due_date: "2025-07-08",
        assignee: "Parent B"
    },
    {
        id: uuidv4(),
        title: "Drop off allergy meds to school",
        description: "School nurse needs new EpiPen refill",
        due_date: "2025-07-02",
        assignee: "Parent A"
    },
    {
        id: uuidv4(),
        title: "Confirm after-school pickup schedule",
        description: "Finalize pickup days for this week",
        due_date: "2025-07-01",
        assignee: "Both"
    },
    {
        id: uuidv4(),
        title: "Return library books",
        description: "Books due by Thursday to avoid late fee",
        due_date: "2025-07-04",
        assignee: "Parent B"
    },
    {
        id: uuidv4(),
        title: "Pay daycare invoice",
        description: "Last month's invoice is in — confirm who will handle payment",
        due_date: "2025-07-03",
        assignee: "Parent A"
    },
    {
        id: uuidv4(),
        title: "Check in on tutoring progress",
        description: "Ask tutor for progress report before report cards come out",
        due_date: "2025-07-06",
        assignee: "Parent B"
    },
    {
        id: uuidv4(),
        title: "Send reminder for class trip permission slip",
        description: "Form needs to be signed and submitted to school",
        due_date: "2025-07-02",
        assignee: "Parent A"
    },
    {
        id: uuidv4(),
        title: "Pack gym bag for PE day",
        description: "Ensure sneakers, shirt, and water bottle are in the bag",
        due_date: "2025-07-01",
        assignee: "Parent B"
    }
];