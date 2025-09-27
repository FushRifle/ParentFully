import React from 'react';
import { Text as TamaguiText, TextProps } from 'tamagui';

export const Text = ({ fontSize = 13, ...props }: TextProps) => {
    let finalFontSize = typeof fontSize === 'number' ? fontSize : parseFloat(fontSize as string) || 13;
    return <TamaguiText {...props} fontSize={finalFontSize} />;
};
