import type { ThemeColors } from '@/styles/ThemeContext';

export type RootStackParamList = {
    Community: undefined;
};

export type SupportTab = 'faq' | 'chat' | 'resources' | 'contact';

export interface FAQItem {
    question: string;
    answer: string;
}

export interface ResourceItem {
    title: string;
    description: string;
    icon: string;
    link: string;
}

export interface ContactMethod {
    method: string;
    details: string;
    icon: string;
    action: () => void;
}

export interface ChatMessage {
    text: string;
    sender: 'user' | 'support';
    id: string;
}

export interface TabButtonProps {
    label: string;
    active: boolean;
    onPress: () => void;
    colors: ThemeColors;
}

export interface FAQItemProps {
    faq: FAQItem;
    index: number;
    expanded: boolean;
    onPress: (index: number) => void;
    colors: ThemeColors;
}

export interface MessageBubbleProps {
    message: ChatMessage;
    colors: ThemeColors;
}

export interface ChatInputProps {
    message: string;
    setMessage: (msg: string) => void;
    handleSendMessage: () => void;
    colors: ThemeColors;
}