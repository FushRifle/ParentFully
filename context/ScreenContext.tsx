import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenContextProps {
    width: number;
    height: number;
    scaleWidth: (value: number) => number;
    scaleHeight: (value: number) => number;
}

const ScreenContext = createContext<ScreenContextProps | undefined>(undefined);

export const ScreenProvider = ({ children }: { children: ReactNode }) => {
    const [screen, setScreen] = useState<ScaledSize>(Dimensions.get('window'));

    useEffect(() => {
        const onChange = ({ window }: { window: ScaledSize }) => {
            setScreen(window);
        };
        const subscription = Dimensions.addEventListener('change', onChange);
        return () => subscription.remove();
    }, []);

    const guidelineBaseWidth = 375; // reference device width
    const guidelineBaseHeight = 812; // reference device height

    const scaleWidth = (size: number) => (screen.width / guidelineBaseWidth) * size;
    const scaleHeight = (size: number) => (screen.height / guidelineBaseHeight) * size;

    return (
        <ScreenContext.Provider value={{ width: screen.width, height: screen.height, scaleWidth, scaleHeight }}>
            {children}
        </ScreenContext.Provider>
    );
};

export const useScreen = () => {
    const context = useContext(ScreenContext);
    if (!context) {
        throw new Error('useScreen must be used within a ScreenProvider');
    }
    return context;
};
