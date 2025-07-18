import React, { useEffect, useState } from "react";
import { View, Text, Image, Dimensions, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from "react-native-reanimated-carousel";
import { router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const PET_FACTS = [
    "PET bottles are 100% recyclable and can be made into new bottles or clothing.",
    "Recycling one plastic bottle saves enough energy to power a light bulb for 3 hours.",
    "Over 1.5 billion pounds of used PET bottles and containers are recovered in the US each year.",
    "Recycling helps reduce landfill waste and conserves resources for our planet.",
];

function MotivationalBanner() {
    const [factIdx, setFactIdx] = React.useState(Math.floor(Math.random() * PET_FACTS.length));
    React.useEffect(() => {
        const interval = setInterval(() => {
            setFactIdx(idx => (idx + 1) % PET_FACTS.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);
    return (
        <View style={{ alignSelf: 'center', width: width * 0.95, height: 130, borderRadius: 18, overflow: 'hidden', marginBottom: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2 }}>
            <Text style={{ fontFamily: 'Poppins', fontSize: 17, fontWeight: 'bold', color: '#111', textAlign: 'center' }}>
                {PET_FACTS[factIdx]}
            </Text>
        </View>
    );
}

export default function BuyerHome() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buyerName, setBuyerName] = useState("");


    useEffect(() => {
        // Fetch posts
        fetch(`${API_URL}/posts/buyer-visible`)
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));

        // Fetch buyer name
        const fetchBuyerName = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                if (!token) return;
                const res = await axios.get(`${API_URL}/auth/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const name = res.data?.user?.username || res.data?.user?.name || "Buyer";
                setBuyerName(name);
            } catch (err) {
                setBuyerName("Buyer");
            }
        };
        fetchBuyerName();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <View style={styles.centered}>
                <Text style={{ fontFamily: 'Poppins', fontSize: 17, fontWeight: 'bold', color: '#065f46', textAlign: 'center', textShadowColor: '#fff', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>No posts to show.</Text>
            </View>
        );
    }

    //first post without image, or default
    let newsPost = posts.find(p => !p.image) || {
        _id: 'default-news',
        title: 'Plasticle News',
        content: 'Stay tuned for updates and news from Plasticle Corporation.'
    };
    //Community Posts (all except the news)
    let communityPosts = posts.filter(p => p._id !== newsPost._id);


    return (
        <LinearGradient
            colors={['#34C759', '#2E865F']}
            style={{ flex: 1 }}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                {/* Centered logo */}
                <View style={{ alignSelf: 'center', marginTop: 28 }}>
                    <Image source={require('../../../assets/images/logoplasticle.png')} style={{ width: 120, height: 120, borderRadius: 60, resizeMode: 'cover' }} />
                </View>

                {/* Welcome message */}
                <Text style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: 'bold', color: '#fff', alignSelf: 'center', marginTop: 12, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
                    Welcome {buyerName}
                </Text>

                {/* Glassmorphic news card*/}
                <View style={{ marginHorizontal: 20, marginTop: 24, backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialCommunityIcons name="newspaper" size={24} color="#219653" style={{ marginRight: 8 }} />
                        <Text style={{ fontFamily: 'Poppins', fontSize: 19, fontWeight: 'bold', color: '#219653', marginBottom: 6 }}>News & Updates</Text>
                    </View>
                    <Text style={{ fontFamily: 'Poppins', fontSize: 16, color: '#222', textAlign: 'center' }}>{newsPost.content}</Text>
                </View>

                {/* Add space between news card and Community Posts */}
                <View style={{ height: 24 }} />

                {/* Floating scan button */}
                <TouchableOpacity
                    style={{ position: 'absolute', top: 120, right: 20, elevation: 4 }}
                    onPress={() => router.navigate('/dashboard/buyer')}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="camera" size={80} color="#fff" style={{ alignSelf: 'center' }} />
                </TouchableOpacity>

                {/* Section title 'Community Posts' */}
                <Text style={{ fontFamily: 'Poppins', fontSize: 18, fontWeight: '500', color: '#fff', marginLeft: 20, marginTop: 24 }}>
                    Community Posts
                </Text>

                {/* Community Posts */}
                {communityPosts.length > 1 ? (
                    <Carousel
                        width={width * 0.96}
                        height={240}
                        data={communityPosts}
                        renderItem={({ item }) => (
                            <View
                                style={{ borderRadius: 18, marginHorizontal: 6, padding: 0, alignItems: 'center', elevation: 3, width: width * 0.94, height: 450, justifyContent: 'flex-start', overflow: 'hidden', backgroundColor: '#fff' }}
                            >
                                {(item._id === 'default') ? (
    <Image
        source={require('../../../assets/images/recycle_default.png')}
        style={{ width: '100%', height: 170, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
        resizeMode="cover"
    />
) : ( (item.imageUrl || item.image) && (
    <Image
        source={{ uri: item.imageUrl ? item.imageUrl : `${API_URL}/uploads/${item.image}` }}
        style={{ width: '100%', height: 170, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
        resizeMode="cover"
    />
))}
                                <Text style={{ fontFamily: 'Poppins', fontSize: 16, color: '#222', padding: 12, textAlign: 'center', width: '100%' }} numberOfLines={3}>{item.content}</Text>
                            </View>
                        )}
                        style={{ alignSelf: 'center', marginTop: 12 }}
                        loop
                        autoPlay
                        autoPlayInterval={7000}
                    />
                ) : (
                    communityPosts.map(post => (
                        <View
                            key={post._id}
                            style={{ marginHorizontal: 20, marginTop: 16, marginBottom: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 2 }}
                        >
                            {(post._id === 'default') ? (
    <Image
        source={require('../../../assets/images/recycle_default.png')}
        style={{ width: '100%', height: 170, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
        resizeMode="cover"
    />
) : ( (post.imageUrl || post.image) && (
    <Image
        source={{ uri: post.imageUrl ? post.imageUrl : `${API_URL}/uploads/${post.image}` }}
        style={{ width: '100%', height: 170, borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
        resizeMode="cover"
    />
))}
                            <Text style={{ fontFamily: 'Poppins', fontSize: 16, color: '#222', padding: 12, textAlign: 'center', width: '100%' }} numberOfLines={3}>{post.content}</Text>
                        </View>
                    ))
                )}

                <View style={{ height: 28 }} />

                <MotivationalBanner />
            </ScrollView>
        </LinearGradient>
    );
}


const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 10,
    },
    logoImage: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: 'rgba(255,255,255,0.5)',
        shadowColor: '#219653',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        width: 120,
        height: 120,
        borderRadius: 60,
        resizeMode: 'cover',
    },
    welcomeText: {
        fontFamily: 'Dancing Script, cursive',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#219653',
        alignSelf: 'center',
        marginTop: 12,
        textShadowColor: '#fff',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    glassCard: {
        marginHorizontal: 20,
        marginTop: 24,
        backgroundColor: 'rgba(255,255,255,0.45)',
        borderRadius: 14,
        padding: 16,
        elevation: 2,
        shadowColor: '#219653',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.09,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(200,255,200,0.18)',
    },
    cameraButton: {
        position: 'absolute',
        top: 120,
        right: 20,
        elevation: 4,
        backgroundColor: 'rgba(255,255,255,0.65)',
        borderRadius: 50,
        padding: 18,
        shadowColor: '#219653',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 15,
        marginBottom: 6,
    },
    cameraIcon: {
        alignSelf: 'center',
    },
    sectionTitle: {
        fontFamily: 'Poppins',
        fontSize: 18,
        fontWeight: '500',
        color: '#222',
        marginLeft: 20,
        marginTop: 24,
    },
    postCard: {
        marginHorizontal: 20,
        marginTop: 12,
        backgroundColor: 'rgba(255,255,255,0.55)',
        borderRadius: 14,
        padding: 16,
        elevation: 2,
        shadowColor: '#219653',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(200,255,200,0.13)',
        overflow: 'hidden',
    },
    postImage: {
        width: '100%',
        height: 170,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
    postContent: {
        fontFamily: 'Poppins',
        fontSize: 16,
        color: '#222',
        padding: 12,
        textAlign: 'center',
        width: '100%',
    },
    motivationalBanner: {
        backgroundColor: 'rgba(33,150,83,0.15)',
        borderRadius: 16,
        padding: 16,
        width: '90%',
        shadowColor: '#219653',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(33,150,83,0.08)',
        alignSelf: 'center',
        marginVertical: 18,
    },
    petGallery: {
        marginLeft: 18,
        marginBottom: 32,
    },
    petImage: {
        width: 120,
        height: 90,
        borderRadius: 14,
        marginRight: 12,
        backgroundColor: '#e5f9ee',
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        minHeight: 320,
        marginVertical: 20,
        width: width * 0.9,
    },
    image: {
        width: "100%",
        height: 180,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: "#e5e7eb",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#065f46",
        marginBottom: 6,
        textAlign: "center",
    },
    type: {
        fontSize: 14,
        color: "#10B981",
        marginBottom: 10,
        textAlign: "center",
    },
    content: {
        fontSize: 16,
        color: "#222",
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        right: 24,
        bottom: 36,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#10B981",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
});


