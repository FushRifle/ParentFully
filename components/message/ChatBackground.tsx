import { CHAT_BACKGROUND_DARK, CHAT_BACKGROUND_LIGHT } from '@/constants/Images';
import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet, useColorScheme } from 'react-native';

type Props = {
    children: ReactNode;
};

const ChatBackground = ({ children }: Props) => {
    const scheme = useColorScheme();

    return (
        <ImageBackground
            source={scheme === 'dark' ? CHAT_BACKGROUND_DARK : CHAT_BACKGROUND_LIGHT}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            {children}
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});

export default ChatBackground;
