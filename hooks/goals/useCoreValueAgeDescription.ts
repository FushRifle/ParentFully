import { useCallback } from 'react';
import { getCoreValueAgeDescription, type AgeGroupKey } from './coreValueAgeDescriptions';

export const useCoreValueAgeDescription = () => {
    const getDescription = useCallback((coreValueId: string, ageGroup: AgeGroupKey): string => {
        return getCoreValueAgeDescription(coreValueId, ageGroup);
    }, []);

    return { getDescription };
};