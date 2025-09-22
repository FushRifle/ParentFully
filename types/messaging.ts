import { MaterialIcons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'

export type User = {
    id: string
    email: string
    full_name?: string
    photo?: string
    family_id?: string
}

export type Chat = {
    id: string
    name: string
    avatar?: string
    isGroup: boolean
    type: 'direct' | 'group'
    updatedAt: string
    lastMessage: string
    unreadCount: number
}

export type Group = {
    id: string
    name: string
    avatar?: string
}

export type Message = {
    id: string
    content: string
    sender_id: string
    created_at: string | Date
    read?: boolean
}

export type MessagingScreenProps = {
    navigation: StackNavigationProp<any>
}

export type FabOption = {
    icon: React.ComponentProps<typeof MaterialIcons>['name']
    label: string
    color: string
    onPress: () => void
}

export type MediaItem = {
    id: string;
    uri: string;
    type: 'image' | 'video' | 'document' | 'audio';
    name: string;
    createdAt?: string;
};

export type SharedDocument = {
    id: string;
    name: string;
    uri: string;
    size: number;
    type: string;
    uploaded: boolean;
    progress?: number;
    error?: string;
};

export type VoiceRecording = {
    id: string;
    uri: string;
    duration: number;
    name: string;
    uploaded: boolean;
    progress?: number;
    error?: string;
    isUploading?: boolean;
};

export type Picture = {
    id: string;
    uri: string;
    name: string;
    width: number;
    height: number;
    uploaded: boolean;
    progress?: number;
    error?: string;
};