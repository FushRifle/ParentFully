import React from 'react';
import { Text as TamaguiText, TextProps } from 'tamagui';
import { useResponsiveText } from './ResponsiveTextContext';

export const Text = ({ fontSize = 14.9, ...props }: TextProps) => {
    const { scaleFont } = useResponsiveText();

    // Automatically scale any font size, even inline
    const finalFontSize = scaleFont(Number(fontSize));

    return <TamaguiText {...props} fontSize={finalFontSize} />;
};
