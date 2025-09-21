import ChatInput from '@/components/support/ChatInput';
import FAQItem from '@/components/support/FAQItem';
import MessageBubble from '@/components/support/MessageBubble';
import { GoalBackground } from '@/constants/GoalBackground';
import { useTheme } from '@/styles/ThemeContext';
import {
    ChatMessage,
    ContactMethod,
    FAQItem as FAQItemType,
    ResourceItem,
    RootStackParamList,
    SupportTab
} from '@/types/support';
import { Feather } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Button, Card, H3, ScrollView as TamaguiScroll, Text, XStack, YStack } from 'tamagui';

const SupportScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [activeTab, setActiveTab] = useState<SupportTab>('faq');
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const faqs = useMemo<FAQItemType[]>(() => [
        { question: "How do I update my child's profile?", answer: "Go to the Profile tab..." },
        { question: "How do I invite my co-parent?", answer: "You can invite your co-parent..." },
        { question: "Can I track goals for multiple children?", answer: "Yes! You can create..." },
        { question: "What happens when I complete a goal?", answer: "Once a goal is marked..." },
        { question: "How do I update a parenting plan?", answer: "Tap your child’s profile..." },
        { question: "Who can see what I write?", answer: "Shared goals, comments..." },
    ], []);

    const parentingResources = useMemo<ResourceItem[]>(() => [
        { title: "Positive Parenting Techniques", description: "Learn effective strategies...", icon: "favorite", link: "https://example.com/parenting-techniques" }
    ], []);

    const contactMethods = useMemo<ContactMethod[]>(() => [
        {
            method: "Email Support",
            details: "support@parentingapp.com",
            icon: "mail",
            action: () => Linking.openURL("mailto:support@parentingapp.com"),
        },
        {
            method: "Call Us",
            details: "+1 (234) 567-8900",
            icon: "phone",
            action: () => Linking.openURL("tel:+12345678900"),
        },
        {
            method: "Visit Us",
            details: "123 Main Street, Springfield",
            icon: "location-on",
            action: () =>
                Linking.openURL(
                    "https://www.google.com/maps/search/?api=1&query=123+Main+Street+Springfield"
                ),
        },
    ], [navigation]);

    useEffect(() => {
        if (activeTab === 'chat' && scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [chatMessages, activeTab]);

    const handleTabChange = useCallback((tab: SupportTab) => setActiveTab(tab), []);
    const toggleFaq = useCallback((index: number) => setExpandedFaq(prev => prev === index ? null : index), []);

    const handleSendMessage = useCallback(() => {
        if (!message.trim()) return;
        const newMessage: ChatMessage = { text: message, sender: 'user', id: Date.now().toString() };
        setChatMessages(prev => [...prev, newMessage]);
        setMessage('');
        setTimeout(() => {
            setChatMessages(prev => [...prev, { text: "Thanks for your message! Our support team typically responds within 24 hours...", sender: 'support', id: Date.now().toString() }]);
        }, 1500);
    }, [message]);

    const renderFAQTab = () => (
        <TamaguiScroll flex={1} showsVerticalScrollIndicator={false}>
            <YStack px="$4" space="$2">
                <Text fontSize={14} color={colors.textSecondary}>Browse our most common questions and answers</Text>

                {faqs.map((faq, index) => (
                    <FAQItem key={index} faq={faq} index={index} expanded={expandedFaq === index} onPress={toggleFaq} colors={colors} />
                ))}

                <XStack ai="center" bg={colors.primaryLight} br={10} p="$3" mt="$4" space="$2">
                    <MaterialIcons name="lightbulb" size={24} color={colors.primary} />
                    <Text flex={1} color={colors.text} fontSize={14}>
                        Didn't find your answer? Try our live chat or contact support directly.
                    </Text>
                </XStack>
            </YStack>
        </TamaguiScroll>
    );

    const renderChatTab = () => (
        <YStack flex={1}>
            <TamaguiScroll ref={scrollViewRef} flex={1} px="$4" pb="$4" showsVerticalScrollIndicator={false}>
                {chatMessages.length === 0 ? (
                    <YStack flex={1} ai="center" jc="center" py="$10" px="$8">
                        <MaterialIcons name="support-agent" size={100} color={colors.primary} />
                        <H3 fontWeight="600" mt="$4" color={colors.text}>
                            Chat with Parenting Support</H3>
                        <Text fontSize='$5' textAlign="center" mt="$2" color={colors.textSecondary}>
                            We’re here to help you! Tell us what you need and our support team will respond shortly.
                        </Text>
                    </YStack>
                ) : chatMessages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} colors={colors} />
                ))}
            </TamaguiScroll>

            <ChatInput message={message} setMessage={setMessage} handleSendMessage={handleSendMessage} colors={colors} />
        </YStack>
    );

    const renderContactTab = () => (
        <TamaguiScroll flex={1} px="$4" showsVerticalScrollIndicator={false}>
            <Text fontSize={22} fontWeight="700" color={colors.text}>Contact Options</Text>
            <Text fontSize={14} color={colors.textSecondary} mb="$2">Choose your preferred way to get in touch</Text>

            {contactMethods.map((method, index) => (
                <XStack
                    key={index}
                    ai="center"
                    bg={colors.card}
                    br={10}
                    p="$3"
                    mb="$3"
                    jc="space-between"
                >
                    {/* Left side: icon + text */}
                    <XStack ai="center" flex={1}>
                        <MaterialIcons name={method.icon} size={24} color={colors.text} />
                        <YStack flex={1} ml="$3">
                            <Text fontSize={16} fontWeight="500" color={colors.text}>
                                {method.method}
                            </Text>
                            <Text fontSize={14} color={colors.textSecondary}>
                                {method.details}
                            </Text>
                        </YStack>
                    </XStack>

                    {/* Right side: conditional button / chevron */}
                    {method.method === "Email Support" ? (
                        <Button
                            size="$4"
                            w='33%'
                            bg={colors.primary}
                            color="white"
                            onPress={method.action}
                        >
                            Send Email
                        </Button>
                    ) : method.method === "Call Us" ? (
                        <Button
                            size="$4"
                            w='40%'
                            bg={colors.primary}
                            color="white"
                            onPress={method.action}
                        >
                            Make a Call
                        </Button>
                    ) : (
                        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
                    )}
                </XStack>
            ))}

            <XStack ai="center" bg={colors.card} br={10} p="$3" mt="$3">
                <MaterialIcons name="access-time" size={24} color={colors.text} />
                <YStack flex={1} ml="$3">
                    <Text fontSize={16} fontWeight="500" color={colors.text}>Support Hours</Text>
                    <Text fontSize={14} color={colors.textSecondary}>Mon-Fri: 8AM - 8PM EST</Text>
                    <Text fontSize={14} color={colors.textSecondary}>Sat-Sun: 10AM - 6PM EST</Text>
                </YStack>
            </XStack>
        </TamaguiScroll>
    );

    return (
        <GoalBackground>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <XStack px="$4" mt="$9" ai='flex-start'>
                    <Button
                        unstyled
                        circular
                        pressStyle={{ opacity: 0.6 }}
                        onPress={navigation.goBack}
                        icon={<Feather name="chevron-left" size={24} color={colors.text} />}
                    />

                    <Text color={colors.text} fontWeight="700"
                        fontSize="$6"
                        flex={1} marginHorizontal="$2">
                        Support
                    </Text>
                </XStack>

                {/* Tabs */}
                <XStack height={70} mt="$4" mb="$2" ai="center" jc="center" space="$3">
                    {['faq', 'chat', 'contact'].map((tabKey) => {
                        const isActive = activeTab === tabKey;
                        const label =
                            tabKey === 'faq' ? 'FAQs' :
                                tabKey === 'chat' ? 'Live Chat' :
                                    'Contact';

                        return (
                            <Card
                                key={tabKey}
                                br="$4"
                                px="$6"
                                py="$3"
                                bg={isActive ? colors.primary : colors.card}
                                elevation={isActive ? 2 : 0}
                            >
                                <TouchableOpacity onPress={() => handleTabChange(tabKey as SupportTab)}>
                                    <Text color={isActive ? 'white' : colors.text}>{label}</Text>
                                </TouchableOpacity>
                            </Card>
                        );
                    })}
                </XStack>


                {/* Tab Content */}
                <YStack flex={1} pt="$2">
                    {activeTab === 'faq' && renderFAQTab()}
                    {activeTab === 'chat' && renderChatTab()}
                    {activeTab === 'contact' && renderContactTab()}
                </YStack>
            </KeyboardAvoidingView>
        </GoalBackground>

    );
};

export default SupportScreen;
