import * as LocalAuthentication from "expo-local-authentication";
import { useEffect, useRef } from "react";
import { Alert } from "react-native";

type Props = {
    visible: boolean;
    onUnlock: () => void;
};

export default function BiometricAuth({ visible, onUnlock }: Props) {
    const hasRun = useRef(false);

    useEffect(() => {
        if (visible && !hasRun.current) {
            runAuth();
        }
    }, [visible]);

    const runAuth = async () => {
        hasRun.current = true; // mark as run
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !enrolled) {
                Alert.alert("Biometrics not available", "Falling back to password.");
                onUnlock();
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Unlock App",
                cancelLabel: "Cancel",
                fallbackLabel: "Use Password",
            });

            if (result.success) {
                onUnlock();
            } else {
                Alert.alert(
                    "Authentication failed",
                    "Please try again or use your password."
                );
            }
        } catch (e) {
            console.log("Auth error:", e);
            Alert.alert("Authentication Error", "Falling back to password.");
            onUnlock();
        }
    };

    return null;
}
