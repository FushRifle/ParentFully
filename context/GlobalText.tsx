import React from 'react';
import { Text as TamaguiText, TextProps } from 'tamagui';
import { useResponsiveText } from './ResponsiveTextContext';

export const Text = ({ fontSize = 13, ...props }: TextProps) => {
    const { scaleFont } = useResponsiveText();

    const finalFontSize = scaleFont(Number(fontSize));

    return <TamaguiText {...props} fontSize={finalFontSize} />;
};
