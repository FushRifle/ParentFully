import { supabase } from '@/supabase/client'
import { useState } from 'react'

export const useCreateGroup = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createGroup = async (name: string, members: string[]) => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('group_chats')
                .insert({ name })
                .select()
                .single()

            if (error) throw error

            const groupId = data.id

            const { error: memberError } = await supabase
                .from('group_members')
                .insert(members.map(user_id => ({ user_id, group_id: groupId })))

            if (memberError) throw memberError

            return data
        } catch (err: any) {
            console.error('Failed to create group:', err.message)
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }

    return { createGroup, loading, error }
}

