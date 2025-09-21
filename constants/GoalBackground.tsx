import { useTheme } from "@/styles/ThemeContext"
import React from "react"
import { ImageBackground } from "react-native"
import { YStack, useThemeName } from "tamagui"

export const GOAL_BACKGROUND = require("@/assets/backgrounds/Bg-Main.png")
export const GOAL_BACKGROUND_DARK = require("@/assets/backgrounds/Bg-Main2.png")

export const GoalBackground = ({ children }: { children: React.ReactNode }) => {
    const themeName = useThemeName()
    const { colors, isDark } = useTheme();
    return (
        <YStack flex={1} bg={colors.background}>
            <ImageBackground
                source={isDark ? colors.background : GOAL_BACKGROUND}
                style={{ flex: 1, width: "100%", height: "100%" }}
                imageStyle={{ opacity: 0.07, resizeMode: "cover" }}
            >
                {children}
            </ImageBackground>
        </YStack>
    )
}
