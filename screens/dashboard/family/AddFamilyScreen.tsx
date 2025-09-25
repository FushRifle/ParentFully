import { COUNTRY_CODES } from "@/constants/Country";
import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { Text } from '@/context/GlobalText';
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Camera, ChevronDown } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Country } from 'react-native-country-picker-modal';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Avatar, ProgressBar, TextInput } from "react-native-paper";
import SwitchToggle from 'react-native-switch-toggle';
import {
    Button, Card,
    H6,
    Image,
    RadioGroup,
    View,
    XStack, YStack
} from "tamagui";

type Child = {
    id: string;
    name: string;
    photo?: string;
    age?: number;
};

type Contact = {
    id: string;
    name: string;
    photo?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    title?: string | null;
    permission?: string | null;
    category?: string | null;
    child_id?: string | string[];
    country_code?: string | null;
};

export default function AddFamilyContactScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();
    const navigation = useNavigation();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    // Step 1: Category
    const [category, setCategory] = useState<"Co-parent" | "Child" | "Third Party" | null>(null);

    // Step 2: Who is it for?
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

    // Step 3: Personal Info
    const [photo, setPhoto] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [title, setTitle] = useState("");
    const [countryCode, setCountryCode] = useState("+234");
    const [country, setCountry] = useState<Country | null>(null);
    const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);
    const [contact, setContact] = useState<Contact | null>(null);

    // Step 4: Access and Permission
    const [permission, setPermission] = useState<string | null>(null);
    const [canViewSchedule, setCanViewSchedule] = useState(true);
    const [canEditTasks, setCanEditTasks] = useState(false);
    const [canMessage, setCanMessage] = useState(true);

    // Step 5: Notifications
    const [notifyMe, setNotifyMe] = useState(true);
    const [notifyContact, setNotifyContact] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const nextStep = () => setStep((s) => Math.min(s + 1, 6));
    const prevStep = () => setStep((s) => Math.max(s - 1, 1));

    useEffect(() => {
        const fetchChildren = async () => {
            if (!user?.id) return;
            const { data, error } = await supabase
                .from("children")
                .select("id, name, age, photo")
                .eq("user_id", user.id);

            if (error) {
                console.error("Error fetching children:", error.message);
                return;
            }
            setChildren(data || []);
        };

        fetchChildren();
    }, [user?.id]);

    const handleSaveContact = async () => {
        if (!user?.id) return;
        setSaving(true);

        try {
            // Insert the contact
            const { data: contactData, error: contactError } = await supabase
                .from("family_contacts")
                .insert({
                    user_id: user.id,
                    category,
                    permission,
                    name,
                    email,
                    phone: `${countryCode}${phone}`,
                    address,
                    title,
                    photo,
                    can_view_schedule: canViewSchedule,
                    can_edit_tasks: canEditTasks,
                    can_message: canMessage,
                    notify_me: notifyMe,
                    notify_contact: notifyContact,
                    created_at: new Date(),
                })
                .select("id")
                .single();

            if (contactError) {
                console.error("Error saving contact:", contactError.message);
                Alert.alert("Error", "Something went wrong while saving the contact.");
                return;
            }

            // Insert child relationships ONLY if children are selected
            if (selectedChildren.length > 0) {
                const junctionRecords = selectedChildren.map((childId) => ({
                    family_contact_id: contactData.id,
                    child_id: childId,
                }));

                const { error: junctionError } = await supabase
                    .from("family_contact_children")
                    .insert(junctionRecords);

                if (junctionError) {
                    console.error("Error saving child relationships:", junctionError.message);
                    Alert.alert("Error", "Contact saved but failed to link children.");
                    return;
                }
            }

            setSaving(false);
            setShowSuccessModal(true);
        } catch (err) {
            console.error("Unexpected error saving contact:", err);
            Alert.alert("Error", "Unexpected error occurred.");
        }
    };


    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setPhoto(uri);
        }
    };

    const categories = [
        {
            label: "Child",
            icon: "👶",
            description: "Your Child"
        },
        {
            label: "Co-parent",
            icon: "👨‍👩‍👧",
            description: "Other Parent or Guardian."
        },
        {
            label: "Third Party",
            icon: "👩🏼",
            description: "Teacher, Nanny School, Relatives, Other"
        },
    ];

    const permissions = [
        {
            label: "Primary Parent",
            description: "Primary account holder. The owner has unrestricted rights."
        },
        {
            label: "Co-parent Access",
            description: "Equal collaborator, but cannot override or remove Owner and actions must be approved by co-parent"
        },
        {
            label: "Third-Party Access",
            description: "Useful for extended family, mediator, or caregiver. They can comment, suggest, or add notes but not finalize changes."
        },
        {
            label: "No Access",
            description: "This contact is listed as a family contact, but access to the platform will not been enabled."
        },
    ];

    const renderReview = () => (
        <YStack space="$4" mt="$1">
            <YStack space='$2' mb='$3'>
                <H6 fontWeight="600">Review and Save</H6>
                <Text color={colors.textSecondary} fontWeight="500">
                    Here is a summary of the contact details, role, and permissions
                </Text>
            </YStack>

            {/* Read-only Info */}
            <Card bc={colors.card} br={12} p="$4" space="$2">
                <YStack>
                    <Text fontWeight="700" color={colors.textSecondary}>Category:</Text>
                    <Text fontWeight="400">{category}</Text>
                </YStack>
            </Card>

            <Card bc={colors.card} br={12} p="$4" space="$2">
                <YStack>
                    <Text fontWeight="600" color={colors.textSecondary}>Child Links:</Text>
                    <Text fontWeight="400">
                        {selectedChildren.map(childId => {
                            const child = children.find(c => c.id === childId);
                            return child ? child.name : "Unknown";
                        }).join(", ")}
                    </Text>
                </YStack>
            </Card>

            {/* Editable Fields */}
            <YStack space="$4">
                <Text>PERSONAL INFORMATION</Text>
                <XStack jc="flex-start" mb="$2">
                    {photo ? (
                        <Avatar.Image
                            size={90}
                            source={{ uri: photo }}
                            style={{ borderRadius: 40 }}
                        />
                    ) : (
                        <Avatar.Text
                            size={90}
                            label={
                                name
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase() || "?"
                            }
                            style={{ backgroundColor: colors.primary }}
                            color="white"
                        />
                    )}
                </XStack>

                <Card>
                    <TextInput
                        label="Contact Name"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        outlineColor={colors.border as any}
                        activeOutlineColor="#FF8500"
                    />
                </Card>

                <Card>
                    <TextInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        mode="outlined"
                        outlineColor={colors.border as any}
                        activeOutlineColor="#FF8500"
                    />
                </Card>

                <Card>
                    <TextInput
                        label="Phone"
                        value={phone}
                        onChangeText={setPhone}
                        mode="outlined"
                        outlineColor={colors.border as any}
                        activeOutlineColor="#FF8500"
                    />
                </Card>

                <Card>
                    <TextInput
                        label="Address"
                        value={address}
                        onChangeText={setAddress}
                        mode="outlined"
                        outlineColor={colors.border as any}
                        activeOutlineColor="#FF8500"
                    />
                </Card>

                <Card>
                    <TextInput
                        label="Title / Role"
                        value={title}
                        onChangeText={setTitle}
                        mode="outlined"
                        outlineColor={colors.border as any}
                        activeOutlineColor="#FF8500"
                    />
                </Card>
            </YStack>

            {/* More Read-only Info */}
            <YStack space="$4">
                <Card bc={colors.card} br={12} p="$4" space="$2">
                    <Text fontWeight="700" color={colors.textSecondary}>Access Role:</Text>
                    <Text fontWeight="400">
                        <Text fontWeight="400">{permission}</Text>
                    </Text>
                </Card>

                {/* More Read-only Info
                <Card bc={colors.card} br={12} p="$4" space="$2">
                    <Text fontWeight="700" color={colors.textSecondary}>Permissions:</Text>
                    <Text fontWeight="400">
                        {canViewSchedule ? " View Schedule" : ""}
                        {canEditTasks ? " Edit Tasks" : ""}
                        {canMessage ? " Message" : ""}
                    </Text>
                </Card>
                 */}

                <Card bc={colors.card} br={12} p="$4" space="$2">
                    <Text fontWeight="700" color={colors.textSecondary}>Notifications:</Text>
                    <Text fontWeight="400">
                        {notifyContact ? "Set notifications for this contact and yourself" : ""}
                        {notifyMe ? " Notify me on all actions carried out by the contact" : ""}
                    </Text>
                </Card>
            </YStack>
        </YStack>
    );

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }}>
                <YStack f={1} p="$4" space="$4" mb='$5'>
                    <YStack space="$4" mt="$6">
                        {/* Header */}
                        <XStack space="$4" ai="center">
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <MaterialCommunityIcons name="arrow-left" size={26} color="black" />
                            </TouchableOpacity>
                            <H6 fontWeight="600" color={colors.text as any}>
                                Add Contact
                            </H6>
                        </XStack>

                        {/* Step Indicator */}
                        <YStack space="$2">
                            <XStack jc="space-between">
                                <Text color={colors.text}>
                                    Step {step} of 5
                                </Text>
                            </XStack>
                            <ProgressBar
                                progress={step / 5}
                                color={colors.secondaryContainer as any}
                                style={{ height: 8, borderRadius: 8 }}
                            />
                        </YStack>
                    </YStack>

                    {/* Step Content */}
                    {step === 1 && (
                        <YStack space="$3">
                            <H6 fontWeight="600" mb='$2' mt='$3'>
                                What category is this Contact ?
                            </H6>

                            <RadioGroup
                                value={category ?? ""}
                                onValueChange={(val) => setCategory(val as any)}
                            >
                                <YStack space="$3" mt="$3">
                                    {categories.map(({ label, icon, description }) => (
                                        <Card
                                            key={label}
                                            bordered
                                            pressStyle={{ scale: 0.97 }}
                                            onPress={() => setCategory(label as any)}
                                            width="100%"
                                            height={100}
                                            br={12}
                                            bg={category === label ? "#FFEDD7" : colors.card}
                                            borderColor={category === label ? colors.primary : colors.border as any}
                                        >
                                            <XStack f={1} jc="space-between" ai="center" px="$3">
                                                {/* Left side: emoji + text */}
                                                <XStack ai="center" space="$5">
                                                    <Text fontSize={25}>{icon}</Text>
                                                    <YStack>
                                                        <Text
                                                            fontWeight="500"
                                                            color={category === label ? colors.textSecondary : colors.textSecondary}
                                                        >
                                                            {label}
                                                        </Text>
                                                        <Text
                                                            color={category === label ? colors.textSecondary : colors.textSecondary}
                                                            flexShrink={2}
                                                            flexWrap="wrap"
                                                            lineHeight={18}
                                                        >
                                                            {description}
                                                        </Text>
                                                    </YStack>
                                                </XStack>

                                                {/* Right side: Radio button */}
                                                <RadioGroup.Item
                                                    value={label}
                                                    id={label}
                                                    size="$3"
                                                    bg={category === label ? colors.primary : "transparent"}
                                                    borderColor={category === label ? colors.primary : "#888"}
                                                >
                                                    <RadioGroup.Indicator bg={category === label ? colors.primary : "transparent"} />
                                                </RadioGroup.Item>
                                            </XStack>
                                        </Card>
                                    ))}
                                </YStack>
                            </RadioGroup>
                        </YStack>
                    )}

                    {step === 2 && (
                        <YStack space="$3">
                            <H6 fontWeight="600">
                                Who is this contact for?
                            </H6>

                            <YStack space="$3" mt="$3">
                                {children.length === 0 ? (
                                    <Text color={colors.textSecondary}>
                                        No children found. Please add a child first.
                                    </Text>
                                ) : (
                                    children.map((child) => {
                                        const isSelected = selectedChildren.includes(child.id);

                                        return (
                                            <Card
                                                key={child.id}
                                                bordered
                                                pressStyle={{ scale: 0.97 }}
                                                onPress={() => {
                                                    if (isSelected) {
                                                        // remove from selection
                                                        setSelectedChildren((prev) =>
                                                            prev.filter((id) => id !== child.id)
                                                        );
                                                    } else {
                                                        // add to selection
                                                        setSelectedChildren((prev) => [...prev, child.id]);
                                                    }
                                                }}
                                                width="100%"
                                                height={70}
                                                br={12}
                                                bg={isSelected ? "#FFEDD7" : colors.card}
                                                borderColor={isSelected ? colors.primary : (colors.border as any)}
                                            >
                                                <XStack f={1} jc="space-between" ai="center" px="$4">
                                                    {/* left side: image + name + age */}
                                                    <XStack ai="center" space="$5" f={1}>
                                                        <Image
                                                            source={
                                                                child.photo
                                                                    ? { uri: child.photo }
                                                                    : require("@/assets/images/profile.jpg")
                                                            }
                                                            style={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: 24,
                                                            }}
                                                        />

                                                        <YStack f={1}>
                                                            <Text
                                                                fontWeight="600"
                                                                color={colors.text}
                                                            >
                                                                {child.name}
                                                            </Text>
                                                            <Text color={colors.text}>
                                                                Age: {child.age}
                                                            </Text>
                                                        </YStack>
                                                    </XStack>

                                                    {/* Right side: checkbox */}
                                                    <XStack
                                                        width={20}
                                                        height={20}
                                                        br={4}
                                                        bw={1}
                                                        borderColor={isSelected ? colors.primary : "#888"}
                                                        bg={isSelected ? colors.primary : "transparent"}
                                                        jc="center"
                                                        ai="center"
                                                    >
                                                        {isSelected && (
                                                            <Text color="white" fontWeight="700">
                                                                ✓
                                                            </Text>
                                                        )}
                                                    </XStack>
                                                </XStack>
                                            </Card>
                                        );
                                    })
                                )}
                            </YStack>
                        </YStack>
                    )}

                    {step === 3 && (
                        <YStack space="$4" mt='$4'>
                            <H6 fontWeight="600">
                                Contact Personal Information
                            </H6>

                            <KeyboardAwareScrollView enableOnAndroid extraScrollHeight={150} keyboardOpeningTime={0}>
                                <Card
                                    ai="center"
                                    mt="$2"
                                    px="$3"
                                    py="$8"
                                    space="$3"
                                    bc={colors.card}
                                    borderColor={colors.border as any}
                                >
                                    {photo ? (
                                        <Avatar.Image
                                            size={80}
                                            source={{ uri: photo }}
                                            style={{ borderRadius: 40 }}
                                        />
                                    ) : (
                                        <YStack ai="center" jc="center">
                                            <Camera />
                                            <TouchableOpacity
                                                onPress={pickImage}
                                            >
                                                <Text color={colors.primary} textAlign="center">
                                                    Upload Photo
                                                </Text>
                                                <Text color={colors.textSecondary} textAlign="center">
                                                    PNG, JPEG (Max 5MB)
                                                </Text>
                                            </TouchableOpacity>
                                        </YStack>
                                    )}
                                </Card>

                                <YStack space='$3' mt='$3'>
                                    <YStack space="$2">
                                        <Text>Contact Name</Text>
                                        <TextInput
                                            label="Full Name"
                                            value={name}
                                            onChangeText={setName}
                                            mode="outlined"
                                            style={{ backgroundColor: "white" }}
                                            outlineColor={colors.border as any}
                                            activeOutlineColor="#FF8500"
                                        />
                                    </YStack>

                                    <YStack space="$2">
                                        <Text>Contact Email</Text>
                                        <TextInput
                                            label="Email"
                                            value={email}
                                            onChangeText={setEmail}
                                            mode="outlined"
                                            style={{ backgroundColor: "white" }}
                                            outlineColor={colors.border as any}
                                            activeOutlineColor="#FF8500"
                                        />
                                    </YStack>

                                    <YStack space="$2">
                                        <Text color={colors.text}>
                                            Phone:
                                        </Text>

                                        <XStack
                                            borderWidth={1}
                                            borderColor={colors.border as any}
                                            borderRadius="$4"
                                            px="$3"
                                            py="$2"
                                            ai="center"
                                            space="$2"
                                            backgroundColor="white"
                                        >
                                            <TouchableOpacity
                                                onPress={() => setShowCountryCodeDropdown(true)}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    borderRightWidth: 1,
                                                    borderRightColor: colors.border as any,
                                                    paddingRight: 12,
                                                    minWidth: 70,
                                                }}
                                            >
                                                <Text>{countryCode}</Text>
                                                <ChevronDown
                                                    size={18}
                                                    style={{ marginLeft: 6 }}
                                                    color={colors.text as any}
                                                />
                                            </TouchableOpacity>

                                            <TextInput
                                                value={phone}
                                                onChangeText={setPhone}
                                                outlineColor={colors.border as any}
                                                placeholder="Phone Number"
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: "white",
                                                    paddingHorizontal: 8,
                                                    fontSize: 14,
                                                }}
                                                keyboardType="phone-pad"
                                            />
                                        </XStack>

                                        {/* Dropdown in a Modal */}
                                        <Modal
                                            visible={showCountryCodeDropdown}
                                            transparent
                                            animationType="fade"
                                            onRequestClose={() => setShowCountryCodeDropdown(false)}
                                        >
                                            <TouchableWithoutFeedback onPress={() => setShowCountryCodeDropdown(false)}>
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        backgroundColor: "rgba(0,0,0,0.3)",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <View
                                                        style={{
                                                            width: 200,
                                                            maxHeight: 300,
                                                            backgroundColor: "white",
                                                            borderRadius: 6,
                                                            borderWidth: 1,
                                                            borderColor: colors.border as any,
                                                        }}
                                                    >
                                                        <ScrollView
                                                            nestedScrollEnabled
                                                            showsVerticalScrollIndicator
                                                            contentContainerStyle={{ paddingVertical: 4 }}
                                                        >
                                                            {COUNTRY_CODES.map((item) => (
                                                                <TouchableOpacity
                                                                    key={item.code}
                                                                    onPress={() => {
                                                                        setCountryCode(item.code);
                                                                        setShowCountryCodeDropdown(false);
                                                                    }}
                                                                    style={{
                                                                        padding: 12,
                                                                        borderBottomWidth: 1,
                                                                        borderBottomColor: colors.border as any,
                                                                    }}
                                                                >
                                                                    <Text numberOfLines={1}>
                                                                        {item.code} ({item.country})
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    </View>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        </Modal>
                                    </YStack>

                                    <YStack space="$2">
                                        <Text>Address</Text>
                                        <TextInput
                                            label="Address"
                                            value={address}
                                            onChangeText={setAddress}
                                            mode="outlined"
                                            style={{ backgroundColor: "white" }}
                                            outlineColor={colors.border as any}
                                            activeOutlineColor="#FF8500"
                                        />
                                    </YStack>

                                    <YStack space="$2">
                                        <Text>Title</Text>
                                        <TextInput
                                            label="Title / Role"
                                            value={title}
                                            onChangeText={setTitle}
                                            mode="outlined"
                                            style={{ backgroundColor: "white" }}
                                            outlineColor={colors.border as any}
                                            activeOutlineColor="#FF8500"
                                        />
                                    </YStack>
                                </YStack>
                            </KeyboardAwareScrollView>
                        </YStack>
                    )}

                    {step === 4 && (
                        <YStack space="$3">
                            <H6 fontWeight="600" mb="$3" mt="$3">
                                Set Access and Permissions
                            </H6>

                            <RadioGroup
                                value={permission ?? ""}
                                onValueChange={(val) => setPermission(val as any)}
                            >
                                <YStack space="$3">
                                    {permissions.map(({ label, description }) => {
                                        const isSelected = permission === label;

                                        return (
                                            <Card
                                                key={label}
                                                bordered
                                                pressStyle={{ scale: 0.97 }}
                                                onPress={() => setPermission(label as any)}
                                                width="100%"
                                                height={100}
                                                br={12}
                                                bg={isSelected ? "#FFEDD7" : colors.card}
                                                borderColor={isSelected ? colors.primary : (colors.border as any)}
                                            >
                                                <XStack f={1} jc="space-between" ai="center" px="$4">
                                                    <YStack f={1} jc="center" space="$2">
                                                        <XStack jc="space-between" ai="center">
                                                            <Text
                                                                fontWeight="600"
                                                                color={colors.text}
                                                            >
                                                                {label}
                                                            </Text>

                                                            <RadioGroup.Item
                                                                value={label}
                                                                id={label}
                                                                size="$3"
                                                                bg={isSelected ? colors.primary : "transparent"}
                                                                borderColor={isSelected ? colors.primary : "#888"}
                                                            >
                                                                <RadioGroup.Indicator bg={isSelected ? colors.primary : "transparent"} />
                                                            </RadioGroup.Item>
                                                        </XStack>

                                                        <Text
                                                            fontSize='$3'
                                                            color={colors.textSecondary}
                                                            flexShrink={1}
                                                            flexWrap="wrap"
                                                        >
                                                            {description}
                                                        </Text>
                                                    </YStack>
                                                </XStack>
                                            </Card>
                                        );
                                    })}
                                </YStack>
                            </RadioGroup>
                        </YStack>
                    )}

                    {step === 5 && (
                        <YStack space="$3" mt='$5'>
                            <YStack space='$3' mb='$3'>
                                <H6 fontWeight="600">
                                    Notifications
                                </H6>
                                <Text color={colors.textSecondary} fontWeight="600">
                                    Set notifications for this contact and yourself
                                </Text>
                            </YStack>

                            <Card
                                bordered
                                pressStyle={{ scale: 0.97 }}
                                width="100%"
                                height={160}
                                br={12}
                                bg={colors.card}
                                borderColor={colors.border as any}
                                px="$4"
                                py="$3"
                                space="$6"
                            >
                                <XStack ai="center" jc="space-between" mb="$2">
                                    <Text
                                        color={colors.text}
                                        flexShrink={1}
                                        flexWrap="wrap"
                                        mr="$3"
                                    >
                                        Notify me on all actions carried out by the contact
                                    </Text>

                                    <SwitchToggle
                                        switchOn={notifyMe}
                                        onPress={() => setNotifyMe(!notifyMe)}
                                        circleColorOff="#FFFFFF"
                                        circleColorOn="#FFFFFF"
                                        backgroundColorOn="#28A745" // green when on
                                        backgroundColorOff="#C4C4C4" // gray when off
                                        containerStyle={{
                                            width: 50,
                                            height: 28,
                                            borderRadius: 14,
                                            padding: 2,
                                        }}
                                        circleStyle={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                        }}
                                        duration={200}
                                    />
                                </XStack>

                                <XStack ai="center" jc="space-between" space="$3">
                                    <Text
                                        color={colors.text}
                                        flexShrink={1}
                                        flexWrap="wrap"
                                        mr="$3"
                                    >
                                        Notify this contact about updates that concern them or the child linked to them
                                    </Text>

                                    <SwitchToggle
                                        switchOn={notifyContact}
                                        onPress={() => setNotifyContact(!notifyContact)}
                                        circleColorOff="#FFFFFF"
                                        circleColorOn="#FFFFFF"
                                        backgroundColorOn="#28A745" // green when on
                                        backgroundColorOff="#C4C4C4" // gray when off
                                        containerStyle={{
                                            width: 50,
                                            height: 28,
                                            borderRadius: 14,
                                            padding: 2,
                                        }}
                                        circleStyle={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 12,
                                        }}
                                        duration={200}
                                    />
                                </XStack>

                            </Card>

                        </YStack>
                    )}

                    {step === 6 ? renderReview() : null}

                    {/* Navigation Buttons */}
                    <XStack mt="$6" jc="space-between">
                        {step > 1 ? (
                            <Button
                                size="$4"
                                variant="outlined"
                                w='48%'
                                bg="white"
                                color={colors.primary}
                                borderRadius={8}
                                borderWidth={1}
                                borderColor={colors.primary}
                                onPress={prevStep}
                            >
                                Back
                            </Button>
                        ) : (
                            <XStack />
                        )}
                        {step < 6 ? (
                            <Button
                                size="$4"
                                w='40%'
                                bg="#FF8500"
                                color="white"
                                borderRadius={8}
                                onPress={nextStep}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                size="$4"
                                w="48%"
                                bg="#FF8500"
                                color="white"
                                borderRadius={8}
                                disabled={saving}
                                onPress={handleSaveContact}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        )}
                    </XStack>
                </YStack>
            </ScrollView>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                >
                    <View
                        style={{
                            backgroundColor: "white",
                            padding: 20,
                            borderRadius: 10,
                            alignItems: "center",
                            width: "80%",
                            height: 400,
                        }}
                    >
                        <YStack ai='center' jc='center'>
                            <MaterialCommunityIcons name="check-circle" size={50} color="#4CAF50" />
                            <Text fontWeight="bold" marginVertical={10}>
                                Contact Saved!
                            </Text>
                            <Text marginVertical={10}>
                                This contact has been added to your family contact
                            </Text>
                        </YStack>

                        <Button
                            mt="$9"
                            size='$5'
                            width='100%'
                            bg={colors.primary}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.navigate("FamilyInvite" as never);
                            }}
                        >
                            <Text color="white" fontWeight="700">
                                Invite to App
                            </Text>
                        </Button>

                        <Button
                            mt="$4"
                            size='$5'
                            width='100%'
                            variant="outlined"
                            bg='transparent'
                            borderWidth={1}
                            borderColor={colors.primary as any}
                            onPress={() => {
                                setShowSuccessModal(false);
                                navigation.goBack();
                            }}
                        >
                            <Text color={colors.text} fontWeight="700">
                                Done
                            </Text>
                        </Button>
                    </View>
                </View>
            </Modal>
        </GoalBackground>
    );
}