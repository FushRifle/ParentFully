import React from 'react';
import { Text as TamaguiText, TextProps } from 'tamagui';
import { useResponsiveText } from './ResponsiveTextContext';
import { Platform } from 'react-native';

export const Text = ({ fontSize = 12, ...props }: TextProps) => {
    const { scaleFont } = useResponsiveText();

    let numericFontSize: number;

    if (typeof fontSize === 'number') {
        numericFontSize = scaleFont(fontSize);
    } else if (typeof fontSize === 'string') {
        // Try to parse numeric value from Tamagui token or string
        const parsed = parseFloat(fontSize.replace(/[^0-9.]/g, ''));
        numericFontSize = scaleFont(isNaN(parsed) ? 12 : parsed);
    } else {
        numericFontSize = scaleFont(12);
    }

    // On Android, RCText can only handle numeric font sizes
    const finalFontSize = Platform.OS === 'android' ? numericFontSize : fontSize;

    return <TamaguiText {...props} fontSize={finalFontSize} />;
};
