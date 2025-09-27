import LoadingScreen from "@/components/LoadingScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { copyDefaultGoalsToUser } from "@/hooks/goals/useOnSignUP";
import AuthNavigator from "@/navigation/AuthNavigator";
import MainNavigator from "@/navigation/MainNavigator";
import AddChildScreen from "@/screens/auth/AddChildScreen";
// import BiometricSheet from "@/screens/auth/Biometrics";
import IntroScreen from "@/screens/auth/IntroSection";
import InviteScreen from "@/screens/auth/InviteScreen";
import OnboardingScreen from "@/screens/auth/OnboardingScreen";
import SuccessScreen from "@/screens/auth/SuccessScreen";
// import PhoneVerification from "@/screens/auth/VerifyScreen";
import { GoalProvider } from "@/context/GoalContext";
import { ResponsiveTextProvider } from "@/context/ResponsiveTextContext";
import { ScreenProvider } from "@/context/ScreenContext";
import { supabase } from "@/supabase/client";
import config from "@/tamagui.config";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TamaguiProvider } from "tamagui";
import { LogBox } from 'react-native';

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <SafeAreaProvider>
        <AuthProvider>
          <GoalProvider>
            <ScreenProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </ScreenProvider>
          </GoalProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </TamaguiProvider>
  );
}

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);
  const [hasChild, setHasChild] = useState<boolean | null>(null);
  const [hasSentInvite, setHasSentInvite] = useState(false);
  const [hasSeenSuccess, setHasSeenSuccess] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // 🚫 Phone verification skipped for now
  // const [hasVerifiedPhone, setHasVerifiedPhone] = useState(false);
  // const [hasCheckedPhoneStatus, setHasCheckedPhoneStatus] = useState(false);
  // const [phoneCheckCompleted, setPhoneCheckCompleted] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(
          "has_completed_onboarding, has_sent_invite, has_seen_success"
        )
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user status:", userError);
        if (
          userError.code === "PGRST116" ||
          userError.message.includes("No rows")
        ) {
          supabase.auth.signOut();
          return;
        }
      }

      if (!userData) {
        await supabase.auth.signOut();
        return;
      }

      setHasCompletedOnboarding(userData.has_completed_onboarding || false);
      setHasSentInvite(userData.has_sent_invite || false);
      setHasSeenSuccess(userData.has_seen_success || false);

      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("id")
        .eq("user_id", user.id);

      if (childError) {
        console.error("Error fetching child data:", childError);
      } else {
        setHasChild(childData.length > 0);
      }

      setHasCheckedStatus(true);
    };

    checkUserStatus();
  }, [user]);

  // 🚀 If no user → stay on Auth stack immediately
  if (!user && !isLoading) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
      </Stack>
    );
  }

  // Still checking session or fetching data
  if (isLoading || (user && !hasCheckedStatus)) {
    return <LoadingScreen />;
  }

  // --- 🚫 Phone verification disabled for now ---
  // if (user && !hasVerifiedPhone && !phoneCheckCompleted) {
  //   return (
  //     <PhoneVerification
  //       userId={user.id}
  //       email={user.email!}
  //       onComplete={() => {
  //         setHasVerifiedPhone(true);
  //         setPhoneCheckCompleted(true);
  //       }}
  //       onSkip={() => setPhoneCheckCompleted(true)}
  //     />
  //   );
  // }

  if (user && !hasCompletedOnboarding && !hasSeenIntro) {
    return <IntroScreen onContinue={() => setHasSeenIntro(true)} />;
  }

  if (user && !hasCompletedOnboarding && hasSeenIntro) {
    return (
      <OnboardingScreen
        onComplete={async () => {
          await supabase
            .from("users")
            .update({ has_completed_onboarding: true })
            .eq("id", user.id);

          await copyDefaultGoalsToUser(user.id);
          setHasCompletedOnboarding(true);
        }}
      />
    );
  }

  if (user && hasCompletedOnboarding && hasChild === false) {
    return <AddChildScreen onComplete={() => setHasChild(true)} />;
  }

  if (user && hasChild && !hasSentInvite) {
    return (
      <InviteScreen
        onComplete={async () => {
          await supabase
            .from("users")
            .update({ has_sent_invite: true })
            .eq("id", user.id);
          setHasSentInvite(true);
        }}
      />
    );
  }

  if (user && hasSentInvite && !hasSeenSuccess) {
    return (
      <SuccessScreen
        route={{
          key: "Success",
          name: "Success",
          params: {
            message: "Congratulations!",
            heading:
              "You have successfully completed your Child's profile",
            buttonText: "Go to Home",
            onPress: async () => {
              await supabase
                .from("users")
                .update({ has_seen_success: true })
                .eq("id", user.id);
              setHasSeenSuccess(true);
            },
          },
        }}
        navigation={{} as any}
      />
    );
  }

  // 🔐 Biometric lock before entering main app
  // 🚫 Biometric temporarily disabled
  // if (user && !isUnlocked) {
  //   return <BiometricSheet onUnlock={() => setIsUnlocked(true)} visible={true} />;
  // }

  // ✅ Default: user goes into main tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
