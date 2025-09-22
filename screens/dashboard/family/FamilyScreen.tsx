import { GoalBackground } from "@/constants/GoalBackground";
import { useAuth } from "@/context/AuthContext";
import { RootStackParamList } from "@/navigation/MainNavigator";
import { useTheme } from "@/styles/ThemeContext";
import { supabase } from "@/supabase/client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import { Dimensions, FlatList, Image, Pressable, ScrollView } from "react-native";
import { Avatar, Card, FAB, Searchbar } from "react-native-paper";
import { Button, Text, XStack, YStack } from "tamagui";

type FamilyContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  category: string | null;
  title: string | null;
  photo?: string | null;
  child_id: string | string[] | null;
};

type Child = {
  id: string;
  name: string;
  photo?: string;
  age?: number;
};

const { width } = Dimensions.get("window");

export default function FamilyContactScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [contacts, setContacts] = useState<FamilyContact[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    "All",
    "Co-parents",
    "Third-Party",
    "Children",
  ];

  // Fetch children
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

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user?.id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("family_contacts")
        .select(`
          *,
          family_contact_children (
              child_id,
              children (id, name)
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching contacts:", error.message);
        setLoading(false);
        return;
      }

      const contactsWithChildren = data.map((contact) => ({
        ...contact,
        child_id:
          contact.family_contact_children?.map(
            (rel: { child_id: any }) => rel.child_id
          ) || [],
      }));

      setContacts(contactsWithChildren);
      setLoading(false);
    };

    fetchContacts();
  }, [user?.id]);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery);
    const matchesTab =
      activeTab === "All" ||
      c.category?.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesTab;
  });

  const getChildNames = (child_id: string | string[] | null) => {
    if (!child_id || child_id.length === 0) return [];
    const ids = Array.isArray(child_id) ? child_id : [child_id];
    return children
      .filter((child) => ids.includes(child.id))
      .map((child) => child.name);
  };

  const tabWidth = (width - 32 - (tabs.length - 1) * 8) / tabs.length;

  const permission = [
    {
      label: "Primary Parent",
      description: "Primary account holder. The owner has unrestricted rights.",
      color: "#4CAF50",
      textColor: "#FFFFFF",
    },
    {
      label: "Co-parent",
      description:
        "Equal collaborator, but cannot override or remove Owner and actions must be approved by co-parent.",
      color: "#DDFFEF",
      textColor: "#006644",
    },
    {
      label: "Third-Party",
      description:
        "Useful for extended family, mediator, or caregiver. They can comment, suggest, or add notes but not finalize changes.",
      color: "#FF9800",
      textColor: "#FFFFFF",
    },
    {
      label: "No Access",
      description:
        "This contact is listed as a family contact, but access to the platform will not been enabled.",
      color: "#F44336",
      textColor: "#FFFFFF",
    },
  ];

  return (
    <GoalBackground>
      <YStack f={1} mb="$9">
        {/* Search + Tabs */}
        <YStack p="$4" mt="$6" mb="$4" jc="center" ai="center">
          <Text fontSize='$4' fontWeight="600" mt="$2">
            Family Contacts
          </Text>

          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={{
              marginTop: 20,
              borderRadius: 12,
              backgroundColor: colors.card,
              width: width * 0.9,
            }}
          />
          <XStack
            mt="$5"
            px="$3"
            space="$2"
            style={{ flexDirection: "row", flexWrap: "nowrap" }}
          >
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  width: tabWidth,
                  backgroundColor: activeTab === tab ? "#FF8500" : colors.card,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: colors.border as any,
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 6,
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? "white" : colors.text,
                    fontWeight: "600",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </XStack>
        </YStack>

        {/* Empty state */}
        {!loading && filteredContacts.length === 0 ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <YStack f={1} ai="center" jc="center" p="$1">
              <Image
                source={require("@/assets/illustration/pana.png")}
                style={{
                  width: width * 0.9,
                  height: (width * 0.9 * 211) / 348, // keep aspect ratio
                  resizeMode: "contain",
                }}
              />

              <Card
                style={{
                  marginTop: 10,
                  padding: 16,
                  backgroundColor: "#fafafa",
                  borderRadius: 16,
                  width: width * 0.9,
                }}
              >
                <Card.Content>
                  <YStack ai="center" space="$2">
                    <Text fontSize='$3' fontWeight="600" textAlign="center">
                      Add People who support your Kids
                    </Text>
                    <Text fontSize='$3' color="#666" textAlign="center">
                      Easily manage all important contacts in one place. Assign
                      roles, control permissions and track activity
                    </Text>
                  </YStack>
                </Card.Content>
              </Card>

              <Button
                mt="$6"
                mb='$5'
                size="$4"
                w={width * 0.8}
                bg="#FF8500"
                color="white"
                icon={
                  <MaterialCommunityIcons name="plus" size={20} color="white" />
                }
                borderRadius={12}
                onPress={() => navigation.navigate("AddFamily" as never)}
              >
                Add Contacts
              </Button>
            </YStack>
          </ScrollView>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const childNames = getChildNames(item.child_id);
              return (
                <Card
                  style={{
                    marginHorizontal: 16,
                    marginVertical: 8,
                    backgroundColor: colors.card,
                    borderRadius: 12,
                    padding: 9,
                    height: 162,
                    width: width * 0.9,
                    alignSelf: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <XStack space="$3" ai="center">
                    {item.photo ? (
                      <Avatar.Image size={48} source={{ uri: item.photo }} />
                    ) : (
                      <Avatar.Text
                        size={48}
                        label={
                          item.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() || "?"
                        }
                        style={{ backgroundColor: colors.primary }}
                        color="white"
                      />
                    )}

                    <YStack flex={1} space="$2">
                      <XStack jc="space-between" ai="center">
                        <Text fontSize="$4" fontWeight="bold">
                          {item.name}
                        </Text>

                        <YStack
                          px="$3"
                          py="$1"
                          borderRadius={9999}
                          bg={
                            permission.find((p) => p.label === item.category)
                              ?.color || colors.primary
                          }
                        >
                          <Text
                            fontSize='$1'
                            fontWeight="500"
                            color={
                              permission.find((p) => p.label === item.category)
                                ?.textColor || "white"
                            }
                          >
                            {item.category}
                          </Text>
                        </YStack>
                      </XStack>

                      {item.title && (
                        <Text fontSize="$2" color={colors.textSecondary}>
                          {item.title}
                        </Text>
                      )}

                      {childNames.length > 0 && (
                        <Text fontSize="$2" color={colors.text}>
                          Connected to: {childNames.join(", ")}
                        </Text>
                      )}
                    </YStack>
                  </XStack>

                  <YStack ai="center" mt="$4">
                    <Button
                      size="$3"
                      w="100%"
                      bg={colors.primary}
                      color={colors.onPrimary}
                      borderRadius="$9"
                      borderWidth={1}
                      borderColor={colors.primary}
                      onPress={() =>
                        navigation.navigate("FamilyDetails", { id: item.id })
                      }
                    >
                      View Details
                    </Button>
                  </YStack>
                </Card>
              );
            }}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        {filteredContacts.length > 0 && (
          <FAB
            icon="plus"
            style={{
              position: "absolute",
              right: 30,
              bottom: 60,
              zIndex: 60,
              borderRadius: 9999,
              backgroundColor: colors.secondary,
            }}
            color="white"
            onPress={() => navigation.navigate("AddFamily" as never)}
          />
        )}
      </YStack>
    </GoalBackground>
  );
}
