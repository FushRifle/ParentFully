import type { Notification } from '@/types/notification'
import { X } from '@tamagui/lucide-icons'
import React from 'react'
import { Modal, Pressable } from 'react-native'
import {
    Button,
    Card,
    H4,
    Paragraph,
    Text,
    XStack
} from 'tamagui'

type NotificationModalProps = {
    visible: boolean
    onClose: () => void
    notification: Notification
}

export default function NotificationModal({
    visible,
    onClose,
    notification,
}: NotificationModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable
                onPress={onClose}
                style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                }}
            >
                <Pressable onPress={() => { }} style={{ width: '100%' }}>
                    <Card elevate bordered padded backgroundColor="$background" width="100%">
                        <XStack justifyContent="space-between" alignItems="center" mb="$2">
                            <H4>{notification.title}</H4>
                            <Button size="$2" circular onPress={onClose}>
                                <X size={16} />
                            </Button>
                        </XStack>

                        <Paragraph>{notification.message}</Paragraph>

                        <Text color="$gray8" fontSize="$1" mt="$2">
                            {new Date(notification.created_at).toLocaleString()}
                        </Text>
                    </Card>
                </Pressable>
            </Pressable>
        </Modal>
    )
}
