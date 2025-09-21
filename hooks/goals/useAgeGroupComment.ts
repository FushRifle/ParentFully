export const ageGroupDescriptions = {
    age3_5: {
        label: 'Age 3–5',
        description: 'This age isn’t about deep theology. It’s about planting seeds through love, joy, and repetition. Think stories, songs, and modeling faith in everyday life.'
    },
    age6_8: {
        label: 'Age 6–8',
        description: 'Develop empathy, conflict resolution skills, teamwork, and understanding of social boundaries in school and peer settings.'
    },
    age9_11: {
        label: 'Age 9–11',
        description: 'Build leadership skills, digital etiquette, accountability, and navigate complex social dynamics and peer pressure situations.'
    },
    age_12plus: {
        label: 'Age 12+',
        description: 'Master advanced communication, responsible decision-making, independent conflict resolution, and develop mature relationships.'
    }
};

export type AgeGroupKey = keyof typeof ageGroupDescriptions;