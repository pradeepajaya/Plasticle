import React, { useEffect, useState, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  Dimensions, 
  ActivityIndicator, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  LayoutAnimation,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from "react-native-reanimated-carousel";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get("window");
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const DEFAULT_IMAGE = require('../../../assets/images/recycle_default.png');

export default function BuyerHome() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [expandedNews, setExpandedNews] = useState(false);

  // Combine stats and animation here
  const [stats, setStats] = useState({
    totalBottlesCollected: 0,
    monthlyBottlesCollected: 0,
  });

  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchData();
    fetchStats();
    animateScanButton();
  }, []);

  const animateScanButton = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  };

  // Fetch stats reusable function
  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(`${API_URL}/buyer/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setStats({
          totalBottlesCollected: response.data.totalBottlesCollected || 0,
          monthlyBottlesCollected: response.data.monthlyBottlesCollected || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching buyer stats:", error);
    }
  };

  const fetchData = async () => {
    try {
      const [postsRes, userRes] = await Promise.all([
        fetch(`${API_URL}/posts/buyer-visible`),
        axios.get(`${API_URL}/auth/user`, {
          headers: { 
            Authorization: `Bearer ${await AsyncStorage.getItem("userToken")}` 
          }
        })
      ]);
      
      const postsData = await postsRes.json();
      setPosts(postsData || []);
      
      const name = userRes.data?.user?.username || "Buyer";
      setBuyerName(name);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    await fetchStats();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(false);
  };

  const toggleNewsExpansion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedNews(!expandedNews);
    Haptics.selectionAsync();
  };

  const handleScanPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.navigate('/dashboard/buyer');
  };

  const StatItem = ({ icon, value, label }) => (
    <View style={styles.statItem}>
      <MaterialCommunityIcons name={icon} size={32} color="#ffffff" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Process posts
  let newsPost = posts.find(p => !p.image) || {
    _id: 'default-news',
    title: 'Plasticle News',
    content: 'Stay tuned for updates from Plasticle Corporation.',
    date: 'Today'
  };

  let communityPosts = posts.filter(p => p._id !== newsPost._id);
  if (communityPosts.length === 0) {
    communityPosts = [{
      _id: 'default-community',
      content: 'Join our community to share recycling tips and earn rewards! With Plasticle, every bottle gets a unique QR code at the manufacturer store. When collected and recycled, you can track its journey and environmental impact.',
      image: 'recycle_default.png',
      likes: 24,
      time: 'Today',
      isDefault: true
    }];
  }

  const renderCommunityCard = ({ item }) => (
    <View style={styles.communityCard}>
      <Image
        source={
          item.isDefault 
            ? DEFAULT_IMAGE 
            : item.imageUrl 
              ? { uri: item.imageUrl } 
              : item.image 
                ? { uri: `${API_URL}/uploads/${item.image}` }
                : DEFAULT_IMAGE
        }
        style={styles.communityImage}
        resizeMode="cover"
        defaultSource={DEFAULT_IMAGE}
      />
      
      <View style={styles.communityContent}>
        <ScrollView 
          style={styles.communityTextScroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.communityText}>
            {item.content}
          </Text>
        </ScrollView>
        <View style={styles.communityFooter}>
          <Text style={styles.communityLikes}>❤️ {item.likes || 0} Likes</Text>
          <Text style={styles.communityTime}>{item.time || 'Recently'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#2d5016', '#4caf50']}
        style={styles.headerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileContainer}>
            <Image 
              source={require('../../../assets/images/logoplasticle.png')} 
              style={styles.logo} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.userName}>{buyerName}</Text>
            </View>
          </View>
          
          <Animated.View style={[styles.scanButtonContainer, { transform: [{ scale: bounceAnim }] }]}>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPress}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="camera" size={24} color="#fff" />
              <Text style={styles.scanButtonText}>Scan</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        <View style={styles.statsContainer}>
          <StatItem icon="recycle" value={stats.totalBottlesCollected} label="Total Bottles" />
          <StatItem icon="calendar-month" value={stats.monthlyBottlesCollected} label="This Month" />
          <StatItem icon="star" value={stats.totalBottlesCollected} label="Points" />
        </View>
      </LinearGradient>

      {/* Rest of the content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4caf50"
          />
        }
      >
        {/* News Section */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader}
            onPress={toggleNewsExpansion}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="newspaper" size={22} color="#4caf50" />
              <Text style={styles.sectionTitle}>News & Updates</Text>
            </View>
            <Ionicons 
              name={expandedNews ? "chevron-up" : "chevron-down"} 
              size={22} 
              color="#4caf50" 
            />
          </TouchableOpacity>

          {expandedNews ? (
            <View style={styles.newsContainer}>
              {[newsPost, ...posts.filter(p => p._id !== newsPost._id && !p.image)].map((news, index) => (
                <View 
                  key={news._id} 
                  style={[
                    styles.newsCard,
                    index === 0 && styles.firstNewsCard,
                    index === posts.filter(p => !p.image).length && styles.lastNewsCard
                  ]}
                >
                  <Text style={styles.newsTitle}>{news.title}</Text>
                  <Text style={styles.newsContent}>{news.content}</Text>
                  <View style={styles.newsFooter}>
                    <Text style={styles.newsDate}>{news.date || 'Today'}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={[styles.newsCard, styles.singleNewsCard]}>
              <Text style={styles.newsTitle}>{newsPost.title}</Text>
              <Text 
                style={styles.newsContent}
                numberOfLines={3}
                ellipsizeMode="tail"
              >
                {newsPost.content}
              </Text>
              <View style={styles.newsFooter}>
                <Text style={styles.newsDate}>{newsPost.date || 'Today'}</Text>
                <Ionicons name="chevron-forward" size={18} color="#4caf50" />
              </View>
            </View>
          )}
        </View>

        {/* Community Posts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people" size={22} color="#4caf50" />
              <Text style={styles.sectionTitle}>Community Posts</Text>
            </View>
          </View>

          <Carousel
            width={width * 0.95}
            height={400}
            data={communityPosts}
            renderItem={renderCommunityCard}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 0.9,
              parallaxScrollingOffset: 50,
            }}
            style={{ marginBottom: 20 }}
            loop
            autoPlay
            autoPlayInterval={3000}
          />
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userInfo: {
    marginLeft: 15,
  },
  welcomeText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#fff',
    marginTop: 2,
  },
  scanButtonContainer: {
    alignSelf: 'flex-start',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  scanButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#fff',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    padding: 10,
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#fff',
    marginVertical: 5,
  },
  statLabel: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#4caf50',
    marginLeft: 10,
  },
  newsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  newsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  firstNewsCard: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastNewsCard: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 0,
  },
  singleNewsCard: {
    borderRadius: 12,
  },
  newsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#2d5016',
    marginBottom: 8,
  },
  newsContent: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  newsDate: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888',
  },
  carousel: {
    marginTop: 10,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    height: '100%',
  },
  communityImage: {
    width: '100%',
    height: 150,
  },
  communityContent: {
    flex: 1,
    padding: 15,
  },
  communityTextScroll: {
    flex: 1,
    minHeight: 80,
  },
  communityText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  communityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  communityLikes: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#4CAF50',
  },
  communityTime: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#888',
  },
});