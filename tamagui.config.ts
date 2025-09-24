import { config } from '@tamagui/config/v2'
import { createTamagui } from 'tamagui'

const tamaguiConfig = createTamagui({
    ...config,
    themes: {
        light: {
            background: '#ffffff',
            backgroundHover: '#f7f7f7',
            backgroundPress: '#eaeaea',
            borderColor: '#e2e2e2',
            borderColorHover: '#cfcfcf',
            borderColorPress: '#b5b5b5',
            borderColorFocus: '#999999',
            color: '#000000',
            colorHover: '#111111',
            colorPress: '#222222',
            primary: '#007AFF',
            backgroundFocus: '#e0e0e0',
            red2: '#FF3B30',
            red10: 'red',
            gray10: '#1C1C1E',
        },
        dark: {
            background: '#000000',
            backgroundHover: '#111111',
            backgroundPress: '#222222',

            borderColor: '#333333',
            borderColorHover: '#444444',
            borderColorPress: '#555555',
            borderColorFocus: '#666666',

            color: '#ffffff',
            colorHover: '#f0f0f0',
            colorPress: '#e0e0e0',

            // Newly added tokens
            primary: '#0A84FF',
            backgroundFocus: '#333333',
            red2: '#FF453A',
            gray10: '#F2F2F7',
        },
    },
    fonts: {
        body: {
            family: 'Inter',
            weight: {
                1: '100', // Thin
                2: '200', // Extra Light
                3: '300', // Light
                4: '400', // Regular
                5: '500', // Medium
                6: '600', // Semi-Bold
                7: '700', // Bold
                8: '800', // Extra Bold
                9: '900', // Black
                10: '950', // Ultra Black
            },
            size: {
                1: 12,
                2: 14,
                3: 15,
                4: 16,
                5: 18,
                6: 20,
                7: 22,
                8: 24,
                9: 28,
                10: 32,
            },
            lineHeight: {
                1: 16,
                2: 18,
                3: 20,
                4: 22,
                5: 24,
                6: 26,
                7: 28,
                8: 32,
                9: 36,
                10: 40,
            },
        },
    },
})

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}

export default tamaguiConfig