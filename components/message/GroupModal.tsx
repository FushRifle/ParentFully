import { useTheme } from '@/styles/ThemeContext'
import { supabase } from '@/supabase/client'
import { MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
    Button,
    H4,
    Input,
    ScrollView,
    Sheet,
    Text,
    XStack,
    YStack
} from 'tamagui'

type GroupModalProps = {
    open: boolean
    onClose: () => void
    onCreateGroup: (
        name: string,
        selectedContacts: string[],
        childId?: string
    ) => Promise<void>
    userData: User | null
}

type User = {
    id: string
    email: string
    full_name?: string
    photo?: string
    family_id?: string
}

type Contact = {
    id: string
    name: string
}

export const GroupModal = ({
    open,
    onClose,
    onCreateGroup,
    userData,
}: GroupModalProps) => {
    const { colors } = useTheme();
    const [groupName, setGroupName] = useState('')
    const [contacts, setContacts] = useState<Contact[]>([])
    const [selectedContacts, setSelectedContacts] = useState<string[]>([])

    useEffect(() => {
        if (!open) return

        const fetchContacts = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, full_name')
                .eq('family_id', userData?.family_id ?? '')
                .neq('id', userData?.id ?? '')

            if (error) {
                console.error('Error fetching contacts:', error)
                return
            }

            setContacts(
                data.map((item: any) => ({
                    id: item.id,
                    name: item.full_name,
                }))
            )
        }

        fetchContacts()
    }, [open])

    const handleToggleContact = (id: string) => {
        setSelectedContacts((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        )
    }

    const handleCreateGroup = async () => {
        if (groupName.trim() && selectedContacts.length > 0) {
            try {
                await onCreateGroup(groupName, selectedContacts)
                setGroupName('')
                setSelectedContacts([])
                onClose()
            } catch (error) {
                console.error('Failed to create group:', error)
            }
        }
    }

    return (
        <Sheet
            forceRemoveScrollEnabled
            modal
            open={open}
            onOpenChange={(val: any) => !val && onClose()}
            snapPoints={[80]}
            dismissOnSnapToBottom
            animation="medium"
        >
            <Sheet.Overlay />
            <Sheet.Frame padding="$4" space="$4">
                <YStack space="$4">
                    <H4>Create New Group</H4>

                    <Input
                        placeholder="Group name"
                        value={groupName}
                        borderWidth={1}
                        borderColor={colors.primary}
                        onChangeText={setGroupName}
                    />

                    <Text>Add Participants</Text>
                    <ScrollView height={200}>
                        <YStack space="$2">
                            {contacts.map((contact) => (
                                <XStack
                                    key={contact.id}
                                    alignItems="center"
                                    space="$3"
                                    padding="$2"
                                    backgroundColor={
                                        selectedContacts.includes(contact.id)
                                            ? '$blue3'
                                            : 'transparent'
                                    }
                                    borderRadius="$2"
                                    onPress={() => handleToggleContact(contact.id)}
                                >
                                    <MaterialIcons
                                        name={
                                            selectedContacts.includes(contact.id)
                                                ? 'check-box'
                                                : 'check-box-outline-blank'
                                        }
                                        size={24}
                                        color={
                                            selectedContacts.includes(contact.id)
                                                ? 'dodgerblue'
                                                : 'gray'
                                        }
                                    />
                                    <Text>{contact.name}</Text>
                                </XStack>
                            ))}
                        </YStack>
                    </ScrollView>

                    <XStack justifyContent="flex-end" space="$3">
                        <Button
                            backgroundColor={colors.error}
                            color={colors.onPrimary}
                            onPress={() => {
                                setGroupName('')
                                setSelectedContacts([])
                                onClose()
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            backgroundColor="$green9"
                            color={colors.onPrimary}
                            onPress={handleCreateGroup}
                            disabled={!groupName.trim() || selectedContacts.length === 0}
                        >
                            Create
                        </Button>
                    </XStack>
                </YStack>
            </Sheet.Frame>
        </Sheet>
    )
}
