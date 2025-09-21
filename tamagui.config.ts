import { config } from '@tamagui/config/v2'
import { createTamagui } from 'tamagui'

const tamaguiConfig = createTamagui({
    ...config,
    themes: {
        light: {
            background: '#ffffff',
            color: '#000000',
        },
        dark: {
            background: '#000000',
            color: '#ffffff',
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
                10: '950', // Ultra Black (if supported by font)
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