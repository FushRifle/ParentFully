import React, { createContext, ReactNode, useContext } from 'react';
import { Dimensions } from 'react-native';

interface ResponsiveTextContextProps {
    scaleFont: (size: number) => number;
}

const ResponsiveTextContext = createContext<ResponsiveTextContextProps | undefined>(undefined);

export const ResponsiveTextProvider = ({ children }: { children: ReactNode }) => {
    const { width } = Dimensions.get('window');
    const guidelineBaseWidth = 375; // reference width

    const scaleFont = (size: number) => (width / guidelineBaseWidth) * size;

    return (
        <ResponsiveTextContext.Provider value={{ scaleFont }}>
            {children}
        </ResponsiveTextContext.Provider>
    );
};

export const useResponsiveText = () => {
    const context = useContext(ResponsiveTextContext);
    if (!context) throw new Error('useResponsiveText must be used within ResponsiveTextProvider');
    return context;
};
