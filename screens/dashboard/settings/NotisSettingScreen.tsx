import React, { useState } from "react";
import { Separator, Switch, Text, XStack, YStack } from "tamagui";

interface SettingItemProps {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (val: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({ title, description, value, onValueChange }) => (
    <YStack space="$1" paddingVertical="$3">
        <XStack jc="space-between" ai="center">
            <YStack flex={1}>
                <Text fontWeight="600" fontSize="$4">
                    {title}
                </Text>
                <Text fontSize="$3" color="$gray10">
                    {description}
                </Text>
            </YStack>
            <Switch
                size="$3"
                checked={value}
                onCheckedChange={onValueChange}
                backgroundColor={value ? "green" : "$gray5"}
            >
                <Switch.Thumb animation="bouncy" />
            </Switch>
        </XStack>
    </YStack>
);

const NotificationSettingsScreen = () => {
    const [settings, setSettings] = useState({
        scheduleUpdates: true,
        activityReminders: true,
        milestoneAchievements: true,
        messages: true,
        expenseRequests: true,
        paymentReminders: true,
        appUpdates: true,
        securityAlerts: true,
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <YStack f={1} bg="$background" padding="$4" space="$6">
            {/* Children Activities */}
            <YStack space="$2">
                <Text fontSize="$6" fontWeight="700">
                    Children Activities
                </Text>
                <Separator />
                <SettingItem
                    title="Schedule Updates"
                    description="When activities are added or changed"
                    value={settings.scheduleUpdates}
                    onValueChange={() => toggleSetting("scheduleUpdates")}
                />
                <Separator />
                <SettingItem
                    title="Activity Reminders"
                    description="30 minutes before scheduled activities"
                    value={settings.activityReminders}
                    onValueChange={() => toggleSetting("activityReminders")}
                />
                <Separator />
                <SettingItem
                    title="Milestone Achievements"
                    description="When your children reach new milestones"
                    value={settings.milestoneAchievements}
                    onValueChange={() => toggleSetting("milestoneAchievements")}
                />
            </YStack>

            {/* Co-Parenting */}
            <YStack space="$2">
                <Text fontSize="$6" fontWeight="700">
                    Co-Parenting
                </Text>
                <Separator />
                <SettingItem
                    title="Messages"
                    description="New messages from co-parents"
                    value={settings.messages}
                    onValueChange={() => toggleSetting("messages")}
                />
                <Separator />
                <SettingItem
                    title="Expense Requests"
                    description="New shared expense requests"
                    value={settings.expenseRequests}
                    onValueChange={() => toggleSetting("expenseRequests")}
                />
                <Separator />
                <SettingItem
                    title="Payment Reminders"
                    description="Upcoming payment due dates"
                    value={settings.paymentReminders}
                    onValueChange={() => toggleSetting("paymentReminders")}
                />
            </YStack>

            {/* System */}
            <YStack space="$2">
                <Text fontSize="$6" fontWeight="700">
                    System
                </Text>
                <Separator />
                <SettingItem
                    title="App Updates"
                    description="New features and improvements"
                    value={settings.appUpdates}
                    onValueChange={() => toggleSetting("appUpdates")}
                />
                <Separator />
                <SettingItem
                    title="Security Alerts"
                    description="Important security notifications"
                    value={settings.securityAlerts}
                    onValueChange={() => toggleSetting("securityAlerts")}
                />
            </YStack>
        </YStack>
    );
};

export default NotificationSettingsScreen;
