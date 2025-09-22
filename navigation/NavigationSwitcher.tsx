import { useAuth } from "@/context/AuthContext";
import AuthNavigator from "@/navigation/AuthNavigator";
import MainNavigator from "@/navigation/MainNavigator";
import OnboardingNavigator from "@/navigation/OnboardingNavigator";

export default function NavigatorSwitcher() {
    const { user, isLoading, profile } = useAuth();

    if (isLoading) return null; // or splash

    if (!user) {
        return <AuthNavigator />; // login/register
    }

    if (profile && !profile.has_completed_onboarding) {
        return <OnboardingNavigator />; // 🚀 dedicated onboarding flow
    }

    return <MainNavigator />; // main app
}
