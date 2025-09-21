import { useTheme } from "@/styles/ThemeContext"
import React from "react"
import { ImageBackground, StyleSheet } from "react-native"
import { useThemeName } from "tamagui"

export const CELEBRATE_BACKGROUND = require("@/assets/backgrounds/congrats.webp")
export const CELEBRATE_BACKGROUND_DARK = require("@/assets/backgrounds/congrats.webp")

export const CelebrateBackground = () => {
    const themeName = useThemeName()
    const { isDark } = useTheme()

    return (
        <ImageBackground
            source={isDark ? CELEBRATE_BACKGROUND_DARK : CELEBRATE_BACKGROUND}
            style={StyleSheet.absoluteFillObject}
            imageStyle={{
                opacity: 0.07,
                resizeMode: "cover",
            }}
        />
    )
}
