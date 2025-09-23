import { COUNTRY_CODES } from "@/constants/Country";
import { GoalBackground } from "@/constants/GoalBackground";
import { Text } from '@/context/GlobalText';
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { ChevronDown } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from "react-native";
import { Avatar, Divider, TextInput } from "react-native-paper";
import SwitchToggle from "react-native-switch-toggle";
import { Button, Card, H6, XStack, YStack } from "tamagui";

type Contact = {
    id: string;
    name: string;
    photo?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    title?: string | null;
    category?: string | null;
    child_id?: string | string[];
    country_code?: string | null;
};

type Child = {
    id: string;
    name: string;
    photo?: string;
    age?: number;
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
        icon: "🤝",
        description: "Teacher, Nanny School, Health, Mediator, Relatives, Other"
    },
];

const permission = [
    {
        label: "Primary Parent",
        description: "Primary account holder  The owner has unrestricted rights."
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

type FamilyDetailsRouteProp = RouteProp<RootStackParamList, "FamilyDetails">;

export default function FamilyDetailsScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute<FamilyDetailsRouteProp>();
    const { id } = route.params as { id: string };

    const [contact, setContact] = useState<Contact | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [title, setTitle] = useState("");
    const [address, setAddress] = useState("");
    const [countryCode, setCountryCode] = useState("+1");
    const [notifyMe, setNotifyMe] = useState(true);
    const [notifyContact, setNotifyContact] = useState(true);
    const [showCountryCodeDropdown, setShowCountryCodeDropdown] = useState(false);

    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingChange, setPendingChange] = useState<{ type: "category" | "role"; value: string } | null>(null);


    const [category, setCategory] = useState("");
    const [role, setRole] = useState("");

    const [pendingValue, setPendingValue] = useState<{ type: "category" | "role"; value: string } | null>(null);
    const [confirmVisible, setConfirmVisible] = useState(false);

    const handleChange = (type: "category" | "role", value: string) => {
        setPendingValue({ type, value });
        setConfirmVisible(true);
    };

    const confirmChange = () => {
        if (pendingValue) {
            if (pendingValue.type === "category") setCategory(pendingValue.value);
            if (pendingValue.type === "role") setRole(pendingValue.value);
        }
        setPendingValue(null);
        setConfirmVisible(false);
    };

    useEffect(() => {
        const fetchContact = async () => {
            if (!id) return;
            setLoading(true);

            // Fetch contact with children from junction table
            const { data, error } = await supabase
                .from("family_contacts")
                .select(`
                id, 
                name, 
                email, 
                phone, 
                title, 
                category, 
                address, 
                photo, 
                country_code,
                family_contact_children (
                    child_id,
                    children (id, name)
                )
            `)
                .eq("id", id)
                .single();

            if (error) {
                console.error("Error fetching contact:", error.message);
            } else if (data) {
                setContact(data);

                // Set initial editable values
                setName(data.name || "");
                setPhone(data.phone || "");
                setEmail(data.email || "");
                setTitle(data.title || "");
                setCategory(data.category || "");
                setAddress(data.address || "");
                setCountryCode(data.country_code || "+1");

                // Extract child data from junction table
                if (data.family_contact_children && data.family_contact_children.length > 0) {
                    // Use flatMap to flatten the array of arrays into a single array
                    const childData = data.family_contact_children
                        .filter(rel => rel.children)
                        .flatMap(rel => rel.children);

                    setChildren(childData);
                }
            }

            setLoading(false);
        };

        fetchContact();
    }, [id]);

    const handleSave = async () => {
        if (contact?.title !== title) {
            const confirmed = await new Promise<boolean>((resolve) => {
                Alert.alert(
                    "Confirm Role Change",
                    "You are changing the contact's role/title. Are you sure?",
                    [
                        { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
                        { text: "Confirm", onPress: () => resolve(true) },
                    ],
                    { cancelable: false }
                );
            });

            if (!confirmed) return;
        }

        const { error } = await supabase
            .from("family_contacts")
            .update({
                name,
                phone,
                email,
                title,
                category,
                address,
                country_code: countryCode,
                notify_me: notifyMe,
                notify_contact: notifyContact,
            })
            .eq("id", id);

        if (error) {
            console.error("Error updating contact:", error.message);
            return;
        }

        setContact(contact ? { ...contact, name, phone, email, title, category, address, country_code: countryCode } : null);
        setIsEditing(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.5,
            allowsEditing: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setContact(contact ? { ...contact, photo: uri } : contact);
        }
    };

    if (!contact) {
        return (
            <GoalBackground>
                <YStack f={1} ai="center" jc="center">
                    <Text>No contact found</Text>
                </YStack>
            </GoalBackground>
        );
    }

    return (
        <GoalBackground>
            <ScrollView style={{ flex: 1 }}>
                <YStack f={1} p="$3" space="$3" mb="$8">

                    {/* Header */}
                    <XStack space="$4" ai="center" mt='$7' mb='$3'>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
                        </TouchableOpacity>
                        <H6 fontWeight="600" color={colors.text as any}>
                            {isEditing ? "Edit Contact" : "Contact Details"}
                        </H6>
                    </XStack>

                    {/* Editable Fields */}
                    {isEditing ? (
                        <YStack space="$4" mt="$1">
                            <YStack space="$3">
                                <Card bc='transparent' p='$1' br={12} space="$3">
                                    {/* Profile Section */}
                                    <Card ai="center" bc="transparent">
                                        <XStack ai="center" jc="center" mb="$2" style={{ position: "relative" }}>
                                            {contact.photo ? (
                                                <Avatar.Image
                                                    size={90}
                                                    source={{ uri: contact.photo }}
                                                    style={{ borderRadius: 40 }}
                                                />
                                            ) : (
                                                <Avatar.Text
                                                    size={90}
                                                    label={
                                                        contact.name
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("")
                                                            .toUpperCase() || "?"
                                                    }
                                                    style={{ backgroundColor: colors.primary }}
                                                    color="white"
                                                />
                                            )}

                                            {/* Pencil Overlay */}
                                            <TouchableOpacity
                                                onPress={pickImage}
                                                style={{
                                                    position: "absolute",
                                                    bottom: 0,
                                                    right: 0,
                                                    backgroundColor: colors.secondary,
                                                    borderRadius: 18,
                                                    padding: 6,
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <MaterialCommunityIcons name="pencil" size={18} color="white" />
                                            </TouchableOpacity>
                                        </XStack>
                                    </Card>

                                    <XStack>
                                        <Text fontWeight='600'>BASIC INFORMATION</Text>
                                    </XStack>

                                    {/* Contact Name */}
                                    <YStack space='$2'>
                                        <Text fontWeight="bold" color={colors.text}>Contact Name:</Text>
                                        <TextInput
                                            value={name}
                                            onChangeText={setName}
                                            placeholder="Contact Name"
                                            style={{
                                                borderWidth: 1,
                                                backgroundColor: colors.card,
                                                borderColor: colors.border as any,
                                                borderRadius: 12,
                                                padding: 6,
                                                paddingVertical: 1,
                                                marginBottom: 12,
                                                fontSize: 16
                                            }}
                                        />
                                    </YStack>

                                    {/* Email */}
                                    <YStack space='$2'>
                                        <Text fontWeight="bold" color={colors.text}>Email:</Text>
                                        <TextInput
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="Email"
                                            style={{
                                                borderWidth: 1,
                                                backgroundColor: colors.card,
                                                borderColor: colors.border as any,
                                                borderRadius: 12,
                                                padding: 6,
                                                paddingVertical: 1,
                                                marginBottom: 10,
                                                fontSize: 16
                                            }}
                                        />
                                    </YStack>

                                    {/* Phone */}
                                    <YStack space="$2">
                                        <Text fontWeight="bold" color={colors.text}>
                                            Phone:
                                        </Text>

                                        <XStack
                                            borderWidth={1}
                                            borderColor={colors.border as any}
                                            borderRadius="$4"
                                            px="$3"
                                            py="$1"
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
                                                    paddingVertical: 1,
                                                    paddingRight: 12,
                                                    minWidth: 70,
                                                }}
                                            >
                                                <Text fontSize="$5">{countryCode}</Text>
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
                                                    paddingVertical: 1,
                                                    fontSize: 16,
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

                                    {/* Address */}
                                    <YStack space='$2'>
                                        <Text fontWeight="bold" color={colors.text}>Address:</Text>
                                        <TextInput
                                            value={address}
                                            onChangeText={setAddress}
                                            placeholder="Address"
                                            style={{
                                                borderWidth: 1,
                                                backgroundColor: colors.card,
                                                borderColor: colors.border as any,
                                                borderRadius: 12,
                                                padding: 6,
                                                paddingVertical: 1,
                                                marginBottom: 12,
                                                fontSize: 16
                                            }}
                                        />
                                    </YStack>
                                </Card>

                                {/* Role/Category */}
                                <YStack>
                                    <XStack mb='$3'>
                                        <Text fontWeight="600">
                                            CONTACT CATEGORY AND ROLE ACCESS
                                        </Text>
                                    </XStack>

                                    <Card bc="transparent" br={12} p="$2" space="$3">
                                        <YStack space="$3">
                                            {/* Category Dropdown */}
                                            <YStack space="$2">
                                                <Text fontWeight="bold">Category:</Text>
                                                <Picker
                                                    selectedValue={category}
                                                    onValueChange={(val) => handleChange("category", val)}
                                                    style={{ backgroundColor: "white" }}
                                                >
                                                    <Picker.Item label="Select Category" value="" />
                                                    {categories.map((c) => (
                                                        <Picker.Item key={c.label} label={`${c.icon} ${c.label}`} value={c.label} />
                                                    ))}
                                                </Picker>
                                            </YStack>

                                            {/* Role Dropdown */}
                                            <YStack space="$2">
                                                <Text fontWeight="bold">Access Role:</Text>
                                                <Picker
                                                    selectedValue={role}
                                                    onValueChange={(val) => handleChange("role", val)}
                                                    style={{ backgroundColor: "white" }}
                                                >
                                                    <Picker.Item label="Select Role" value="" />
                                                    {permission.map((p) => (
                                                        <Picker.Item key={p.label} label={p.label} value={p.label} />
                                                    ))}
                                                </Picker>
                                            </YStack>

                                            {/* Confirmation Modal */}
                                            <Modal transparent visible={confirmVisible} animationType="fade">
                                                <YStack f={1} jc="center" ai="center" bg="rgba(0,0,0,0.5)">
                                                    <Card
                                                        p="$5"
                                                        br={16}
                                                        bg="white"
                                                        space="$4"
                                                        width={380}
                                                        height={360}
                                                        shadowColor="rgba(0,0,0,0.15)"
                                                        shadowOffset={{ width: 0, height: 4 }}
                                                        shadowOpacity={0.25}
                                                        shadowRadius={8}
                                                    >
                                                        <YStack space="$4" f={1} jc="center" ai="center">
                                                            {/* Title */}
                                                            <H6
                                                                fontWeight="bold"
                                                                color={colors.text}
                                                                textAlign="center"
                                                            >
                                                                Are you sure?
                                                            </H6>

                                                            {/* Body */}
                                                            <Text
                                                                lineHeight={22}
                                                                textAlign="center"
                                                                color={colors.textSecondary}
                                                                px="$3"
                                                            >
                                                                Are you sure you want to change{" "}
                                                                <Text fontWeight="bold" color={colors.text}>
                                                                    {contact.name}
                                                                </Text>{" "}
                                                                from <Text fontWeight="bold">{pendingValue?.type}</Text> to{" "}
                                                                <Text fontWeight="bold">"{pendingValue?.value}"</Text>? They will
                                                                lose their view-only privilege and access to the account.
                                                            </Text>
                                                        </YStack>

                                                        {/* Actions */}
                                                        <YStack jc="center" ai="center" space="$3" mt="$5">
                                                            <Button
                                                                br="$3"
                                                                bc="transparent"
                                                                borderWidth={1}
                                                                borderColor={colors.primary}
                                                                onPress={() => setConfirmVisible(false)}
                                                                width="100%"
                                                            >
                                                                <Text color={colors.primary} fontWeight="600">Cancel</Text>
                                                            </Button>

                                                            <Button
                                                                width="100%"
                                                                bc={colors.primary}
                                                                color={colors.onPrimary}
                                                                onPress={confirmChange}
                                                            >
                                                                Confirm
                                                            </Button>
                                                        </YStack>
                                                    </Card>
                                                </YStack>
                                            </Modal>
                                        </YStack>
                                    </Card>
                                </YStack>
                            </YStack>

                            {/* Notifications */}
                            <YStack>
                                <XStack mb='$2'>
                                    <Text fontWeight='600'>NOTIFICATION</Text>
                                </XStack>

                                <YStack space="$4">
                                    <Card bc={colors.card} br={12} p="$3" space="$2">
                                        <YStack space="$3" mt='$5'>
                                            <XStack ai="center" jc="space-between" mb="$2">
                                                <Text color={colors.text} flexShrink={1} flexWrap="wrap" mr="$3">
                                                    Notify me on all actions carried out by the contact
                                                </Text>
                                                <SwitchToggle
                                                    switchOn={notifyMe}
                                                    onPress={() => setNotifyMe(!notifyMe)}
                                                    circleColorOff="#FFFFFF"
                                                    circleColorOn="#FFFFFF"
                                                    backgroundColorOn="#28A745"
                                                    backgroundColorOff="#28A745"
                                                    containerStyle={{ width: 50, height: 28, borderRadius: 14, padding: 2 }}
                                                    circleStyle={{ width: 24, height: 24, borderRadius: 12 }}
                                                    duration={200}
                                                />
                                            </XStack>

                                            <XStack ai="center" jc="space-between" space='$3'>
                                                <Text color={colors.text} flexShrink={1} flexWrap="wrap" mr="$3">
                                                    Notify this contact about updates that concern them or the child linked to them
                                                </Text>
                                                <SwitchToggle
                                                    switchOn={notifyContact}
                                                    onPress={() => setNotifyContact(!notifyContact)}
                                                    circleColorOff="#FFFFFF"
                                                    circleColorOn="#FFFFFF"
                                                    backgroundColorOn="#28A745"
                                                    backgroundColorOff="#28A745"
                                                    containerStyle={{ width: 50, height: 28, borderRadius: 14, padding: 2 }}
                                                    circleStyle={{ width: 24, height: 24, borderRadius: 12 }}
                                                    duration={200}
                                                />
                                            </XStack>
                                        </YStack>
                                    </Card>
                                </YStack>
                            </YStack>
                        </YStack>
                    ) : (
                        <>
                            {/* View Only Section */}
                            <Card ai="center" bc="transparent">
                                {contact.photo ? (
                                    <Avatar.Image
                                        size={90}
                                        source={{ uri: contact.photo }}
                                        style={{ borderRadius: 40, marginBottom: 16 }}
                                    />
                                ) : (
                                    <Avatar.Text
                                        size={90}
                                        label={
                                            contact.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase() || "?"
                                        }
                                        style={{ backgroundColor: colors.primary, marginBottom: 16 }}
                                        color="white"
                                    />
                                )}

                                <YStack space="$1" mb="$2" ai='center' jc='center'>
                                    <Text fontWeight="500" mb="$2">
                                        {contact.name}
                                    </Text>
                                    <XStack space='$3'>
                                        <View
                                            style={{
                                                backgroundColor: colors.card,
                                                paddingHorizontal: 10,
                                                paddingVertical: 4,
                                                borderRadius: 9999,
                                                alignSelf: "flex-start",
                                            }}
                                        >
                                            <Text fontWeight="500" color={colors.textSecondary}>
                                                {contact.category}
                                            </Text>
                                        </View>


                                        <Text fontWeight="500" color={colors.textSecondary}>
                                            {contact.title}
                                        </Text>
                                    </XStack>

                                    {children.length > 0 && (
                                        <Text
                                            fontWeight="500"
                                            color={colors.textSecondary}
                                            mb="$3"
                                        >
                                            Connected to: {children.map((c) => c.name).join(",  ")}
                                        </Text>
                                    )}

                                    <Button
                                        w="38%"
                                        bg={colors.secondary}
                                        color="white"
                                        borderRadius={8}
                                        onPress={() => navigation.navigate("FamilyInvite" as never)}
                                    >
                                        <Text color="white" ai='center' fontWeight="500">
                                            Invite to App
                                        </Text>
                                    </Button>
                                </YStack>
                            </Card>

                            {/* Contact Information Cards */}
                            <YStack space="$4">
                                {["email", "phone", "address", "category"].map((field) => {
                                    let fieldValue = "";
                                    let iconName = "";

                                    if (field === "email") {
                                        fieldValue = email;
                                        iconName = "email";
                                    } else if (field === "phone") {
                                        fieldValue = `${phone ?? ""}`.trim();
                                        iconName = "phone";
                                    } else if (field === "address") {
                                        fieldValue = address;
                                        iconName = "map-marker";
                                    } else {
                                        fieldValue = category;
                                        iconName = "lock";
                                    }

                                    const label = field.charAt(0).toUpperCase() + field.slice(1);

                                    return (
                                        <Card key={field} bc={colors.card} br={12} p="$4">
                                            <XStack ai="center" space="$3">
                                                <YStack px="$3" py="$3" borderRadius={9999} bg="#FFF4E6">
                                                    <MaterialCommunityIcons
                                                        name={iconName as any}
                                                        size={24}
                                                        color={colors.primary}
                                                    />
                                                </YStack>

                                                <YStack flex={1}>
                                                    <Text fontWeight="500">
                                                        {fieldValue}
                                                    </Text>
                                                    <Text color={colors.textSecondary}>
                                                        {label}
                                                    </Text>
                                                </YStack>
                                            </XStack>
                                            <Divider />
                                        </Card>
                                    )
                                })}
                            </YStack>
                        </>
                    )}

                    {/* Action Buttons */}
                    <XStack jc="space-between" mt="$5" mb='$5'>
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outlined"
                                    size="$5"
                                    w="48%"
                                    bg="transparent"
                                    color={colors.text}
                                    borderRadius={8}
                                    borderWidth={1}
                                    borderColor={colors.primary as any}
                                    onPress={() => {
                                        setIsEditing(false);
                                        if (contact) {
                                            setName(contact.name || "");
                                            setPhone(contact.phone || "");
                                            setEmail(contact.email || "");
                                            setTitle(contact.title || "");
                                            setCategory(contact.category || "");
                                            setAddress(contact.address || "");
                                            setCountryCode(contact.country_code || "+1");
                                        }
                                    }}
                                >
                                    <Text fontWeight="700">Cancel</Text>
                                </Button>

                                <Button
                                    size="$5"
                                    w="48%"
                                    bg={colors.primary}
                                    color="white"
                                    borderRadius={8}
                                    onPress={handleSave}
                                >
                                    <Text color="white" fontWeight="700">Save Changes</Text>
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    size='$5'
                                    w="48%"
                                    bg="transparent"
                                    color={colors.text}
                                    borderRadius={8}
                                    borderWidth={1}
                                    borderColor={colors.primary as any}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text fontWeight="700">Close</Text>
                                </Button>

                                <Button
                                    size='$5'
                                    w="48%"
                                    bg={colors.primary}
                                    color="white"
                                    borderRadius={8}
                                    onPress={() => setIsEditing(true)}
                                >
                                    <Text color="white" fontWeight="700">Edit</Text>
                                </Button>
                            </>
                        )}
                    </XStack>
                </YStack>
            </ScrollView>

            {/* Confirm Modal */}
            <Modal visible={confirmModalOpen} transparent animationType="fade">
                <View style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <Card m="$4" p="$4" br={12} bg={colors.background}>
                        <Text mb="$3" fontWeight="bold">
                            Confirm Change
                        </Text>
                        <Text mb="$4">
                            Are you sure you want to change{" "}
                            {pendingChange?.type === "category" ? "Category" : "Access Role"} to{" "}
                            <Text fontWeight="bold">{pendingChange?.value}</Text>?
                        </Text>
                        <XStack jc="flex-end" space="$3">
                            <Button
                                bg={colors.secondary}
                                onPress={() => {
                                    setConfirmModalOpen(false);
                                    setPendingChange(null);
                                }}
                            >
                                <Text color="white">Cancel</Text>
                            </Button>
                            <Button
                                bg={colors.primary}
                                onPress={() => {
                                    if (pendingChange?.type === "category") {
                                        setCategory(pendingChange.value);
                                    } else if (pendingChange?.type === "role") {
                                        setTitle(pendingChange.value);
                                    }
                                    setConfirmModalOpen(false);
                                    setPendingChange(null);
                                }}
                            >
                                <Text color="white">Confirm</Text>
                            </Button>
                        </XStack>
                    </Card>
                </View>
            </Modal>
        </GoalBackground >
    );
}
