// Text.tsx
import React from 'react';
import { Text as TamaguiText, TextProps } from 'tamagui';
import { useResponsiveText } from './ResponsiveTextContext';

export const Text = ({ fontSize = 12, ...props }: TextProps) => {
    const { scaleFont } = useResponsiveText();

    const finalFontSize =
        typeof fontSize === 'number'
            ? scaleFont(fontSize)
            : fontSize;

    return <TamaguiText {...props} fontSize={finalFontSize} />;
};
