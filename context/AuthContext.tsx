'use client'

import { supabase } from '@/supabase/client'
import { User } from '@supabase/supabase-js'
import * as AuthSession from 'expo-auth-session'
import React, { createContext, useContext, useEffect, useState } from 'react'

interface AuthContextType {
    user: User | null
    setUser: (user: User | null) => void
    isLoading: boolean
    logout: () => Promise<void>
    profile: any | null
    refreshProfile: () => Promise<void>
    googleSignIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => { },
    isLoading: true,
    logout: async () => { },
    profile: null,
    refreshProfile: async () => { },
    googleSignIn: async () => { }
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<any>(null)

    // Fetch user profile from 'users' table
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (!error) setProfile(data)
    }

    // Refresh profile whenever user changes
    useEffect(() => {
        if (user?.id) {
            fetchProfile(user.id)
        } else {
            setProfile(null)
        }
    }, [user])

    // Initial session & auth state listener
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setIsLoading(false)
        })

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            subscription.subscription.unsubscribe()
        }
    }, [])

    // Logout
    const logout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)
        } catch (err) {
            console.error('Logout failed:', err)
            throw err
        }
    }

    // Google sign-in (Expo dev-friendly)
    const handleGoogleSignIn = async () => {
        const redirectUrl = AuthSession.makeRedirectUri()
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: redirectUrl }
        })

        if (error) console.log('Google Sign-In Error:', error)
        else console.log('Google Sign-In started, check your browser')
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                isLoading,
                logout,
                profile,
                refreshProfile: async () => {
                    if (user?.id) await fetchProfile(user.id)
                },
                googleSignIn: handleGoogleSignIn
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
