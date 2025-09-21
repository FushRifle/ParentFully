import { useEffect, useState } from 'react'
import { supabase } from '@/supabase/client'
import OnboardingScreen from '@/screens/auth/OnboardingScreen'
import AddChildScreen from '@/screens/auth/AddChildScreen'
import InviteScreen from '@/screens/auth/InviteScreen'
import SuccessScreen from '@/screens/auth/SuccessScreen'
import { copyDefaultGoalsToUser } from '@/hooks/goals/useOnSignUP'
import LoadingScreen from '@/components/LoadingScreen'

export function useUserFlow(user: any) {
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)
    const [hasCheckedStatus, setHasCheckedStatus] = useState(false)
    const [hasChild, setHasChild] = useState<boolean | null>(null)
    const [hasSentInvite, setHasSentInvite] = useState(false)
    const [hasSeenSuccess, setHasSeenSuccess] = useState(false)

    useEffect(() => {
        if (!user) return
        const checkUserStatus = async () => {
            const { data: userData } = await supabase
                .from('users')
                .select('has_completed_onboarding, has_sent_invite, has_seen_success')
                .eq('id', user.id)
                .single()

            setHasCompletedOnboarding(userData?.has_completed_onboarding || false)
            setHasSentInvite(userData?.has_sent_invite || false)
            setHasSeenSuccess(userData?.has_seen_success || false)

            const { data: childData } = await supabase
                .from('children')
                .select('id')
                .eq('user_id', user.id)

            setHasChild((childData?.length ?? 0) > 0)
            setHasCheckedStatus(true)
        }
        checkUserStatus()
    }, [user])

    if (user && !hasCheckedStatus) {
        return { screen: <LoadingScreen /> }
    }

    if (user && !hasCompletedOnboarding) {
        return {
            screen: (
                <OnboardingScreen
          onComplete= { async() => {
            await supabase
                .from('users')
                .update({ has_completed_onboarding: true })
                .eq('id', user.id)
            await copyDefaultGoalsToUser(user.id)
            setHasCompletedOnboarding(true)
        }
    }
        />
      ),
}
  }

if (user && hasCompletedOnboarding && hasChild === false) {
    return {
        screen: <AddChildScreen onComplete={ () => setHasChild(true) } />,
}
  }

if (user && hasChild && !hasSentInvite) {
    return {
        screen: (
            <InviteScreen
          onComplete= { async() => {
        await supabase
            .from('users')
            .update({ has_sent_invite: true })
            .eq('id', user.id)
        setHasSentInvite(true)
    }
}
        />
      ),
    }
  }

if (user && hasSentInvite && !hasSeenSuccess) {
    return {
        screen: (
            <SuccessScreen
          route= {{
        key: 'Success',
            name: 'Success',
                params: {
            message: 'Welcome to Co-Parent Connect!',
                buttonText: 'Proceed to App',
                    onPress: async () => {
                        await supabase
                            .from('users')
                            .update({ has_seen_success: true })
                            .eq('id', user.id)
                        setHasSeenSuccess(true)
                    },
            },
    }
}
navigation = {{ } as any}
        />
      ),
    }
  }

return { screen: null }
}
