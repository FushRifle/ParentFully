import { useTheme } from '@/styles/ThemeContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Image, Platform, ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type RootStackParamList = {
    Support: undefined;
    // Add other routes as needed
};

const CommunityScreen = () => {
    const { colors } = useTheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    // Sample community posts data
    const communityPosts = [
        {
            id: '1',
            user: 'ParentingPro',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            time: '2h ago',
            content: 'Has anyone tried the new positive reinforcement techniques from the latest webinar? Would love to hear experiences!',
            likes: 24,
            comments: 8,
            isLiked: false
        },
        {
            id: '2',
            user: 'DadOfThree',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            time: '5h ago',
            content: 'Sharing our screen time rules that actually work for our teens: 1) No devices after 9pm 2) Earn weekend time with chores 3) Family meals are device-free. What works for your family?',
            likes: 42,
            comments: 15,
            isLiked: true
        },
        {
            id: '3',
            user: 'NewMom2023',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            time: '1d ago',
            content: 'First-time mom here looking for advice on establishing good sleep routines for a 6-month-old. Any tips appreciated!',
            likes: 18,
            comments: 12,
            isLiked: false
        }
    ];

    const popularTopics = [
        { name: 'Discipline Strategies', icon: 'scale' },
        { name: 'Screen Time', icon: 'tablet' },
        { name: 'Healthy Eating', icon: 'apple' },
        { name: 'School Success', icon: 'school' },
        { name: 'Sibling Rivalry', icon: 'people' },
        { name: 'Self-Care for Parents', icon: 'spa' }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    activeOpacity={0.7}
                >
                    <Icon
                        name="chevron-back"
                        size={24}
                        color={colors.primary}
                    />
                    <Text style={[styles.backText, { color: colors.primary }]}>
                        Back
                    </Text>
                </TouchableOpacity>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Welcome Section */}
                <View style={[styles.welcomeCard, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                        Welcome to our Parenting and More Community!
                    </Text>
                    <Text style={[styles.welcomeText, { color: colors.primary }]}>
                        Connect with thousands of parents sharing tips, advice, and support.
                    </Text>
                </View>

                {/* Popular Topics */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Popular Topics
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.topicsContainer}
                >
                    {popularTopics.map((topic, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.topicCard, { backgroundColor: colors.cardBackground }]}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons
                                name={topic.icon}
                                size={24}
                                color={colors.primary}
                            />
                            <Text style={[styles.topicText, { color: colors.text }]}>
                                {topic.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recent Discussions */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
                    Recent Discussions
                </Text>
                <View style={styles.postsContainer}>
                    {communityPosts.map(post => (
                        <View key={post.id} style={[styles.postCard, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.postHeader}>
                                <Image
                                    source={{ uri: post.avatar }}
                                    style={styles.avatar}
                                />
                                <View style={styles.postUserInfo}>
                                    <Text style={[styles.userName, { color: colors.primary }]}>
                                        {post.user}
                                    </Text>
                                    <Text style={[styles.postTime, { color: colors.primary }]}>
                                        {post.time} ago
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.postContent, { color: colors.text }]}>
                                {post.content}
                            </Text>

                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                    <FontAwesome
                                        name={post.isLiked ? 'heart' : 'heart-o'}
                                        size={18}
                                        color={post.isLiked ? colors.primary : colors.primary}
                                    />
                                    <Text style={[styles.actionText, { color: colors.primary }]}>
                                        {post.likes}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                    <MaterialIcons
                                        name="comment"
                                        size={18}
                                        color={colors.primary}
                                    />
                                    <Text style={[styles.actionText, { color: colors.primary }]}>
                                        {post.comments}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                                    <MaterialIcons
                                        name="share"
                                        size={18}
                                        color={colors.primary}
                                    />
                                    <Text style={[styles.actionText, { color: colors.primary }]}>
                                        Share
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Create Post Button */}
                <TouchableOpacity
                    style={[styles.createPostButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="edit" size={20} color="white" />
                    <Text style={styles.createPostText}>Create Post</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 8,
        marginTop: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: 'transparent',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        fontSize: 16,
        marginLeft: 4,
        fontWeight: '500',
    },
    headerTitle: {
        marginTop: 70,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    welcomeCard: {
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 5,
    },
    welcomeTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    topicsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    topicCard: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
    },
    postsContainer: {
        paddingHorizontal: 16,
    },
    postCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    postUserInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
    },
    postTime: {
        fontSize: 12,
        marginTop: 2,
    },
    postContent: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 14,
        marginLeft: 6,
    },
    createPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 25,
        marginHorizontal: 16,
        marginBottom: 60
    },
    createPostText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
    },
});

export default CommunityScreen;