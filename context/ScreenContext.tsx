import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenContextProps {
    width: number;
    height: number;
    scaleWidth: (value: number) => number;
    scaleHeight: (value: number) => number;
    scaleFont: (value: number) => number;
    overrideFontSize: (fontSize: number) => number; // NEW: override any font size
}

const ScreenContext = createContext<ScreenContextProps | undefined>(undefined);

export const ScreenProvider = ({ children }: { children: ReactNode }) => {
    const [screen, setScreen] = useState<ScaledSize>(Dimensions.get('window'));

    useEffect(() => {
        const onChange = ({ window }: { window: ScaledSize }) => {
            setScreen(window);
        };
        const subscription = Dimensions.addEventListener('change', onChange);

        return () => {
            subscription.remove();
        };
    }, []);

    // Base device to scale against (reference device)
    const guidelineBaseWidth = 375; // e.g., iPhone 11 width
    const guidelineBaseHeight = 812; // e.g., iPhone 11 height

    const scaleWidth = (size: number) => (screen.width / guidelineBaseWidth) * size;
    const scaleHeight = (size: number) => (screen.height / guidelineBaseHeight) * size;
    const scaleFont = (size: number) => scaleWidth(size);

    // Override any custom font size globally
    const overrideFontSize = (fontSize: number) => {
        return scaleFont(fontSize);
    };

    return (
        <ScreenContext.Provider value={{ width: screen.width, height: screen.height, scaleWidth, scaleHeight, scaleFont, overrideFontSize }}>
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
