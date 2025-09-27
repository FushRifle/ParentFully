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
            $colorSecondary: 'gray',
            onPrimary: 'white',
            primary: '#007AFF',
            backgroundFocus: '#e0e0e0',
            red2: '#FF3B30',
            red10: 'red',
            gray10: '#1C1C1E',
            gray12: 'grays',
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
            $colorSecondary: '#e0e0e0',
            primary: '#0A84FF',
            backgroundFocus: '#333333',
            red2: '#FF453A',
            gray10: '#F2F2F7',
        },
    },
})

export type Conf = typeof tamaguiConfig

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}

export default tamaguiConfig
