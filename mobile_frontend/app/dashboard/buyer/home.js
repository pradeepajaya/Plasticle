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
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import Carousel from "react-native-reanimated-carousel";
import { router } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Haptics from 'expo-haptics';
import { styles } from './home.styles';

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

  // Separate posts by type
  const newsPosts = posts.filter(p => p.type === "news");
  const blogPosts = posts.filter(p => p.type === "blog");

  // Use default news if no news posts
  const newsPost = newsPosts.length > 0 ? newsPosts[0] : {
    _id: 'default-news',
    title: 'Plasticle News',
    content: 'Stay tuned for updates from Plasticle Corporation.',
    date: 'Today',
    image: null,
    imageUrl: null,
  };

  // Use default blog if no blog posts
  const communityPosts = blogPosts.length > 0 ? blogPosts : [{
    _id: 'default-community',
    content: 'Join our community to share recycling tips and earn rewards! With Plasticle, every bottle gets a unique QR code at the manufacturer store. When collected and recycled, you can track its journey and environmental impact.',
    image: 'recycle_default.png',
    likes: 24,
    time: 'Today',
    isDefault: true
  }];

  const getImageSource = (item) => {
    if(item.isDefault) return DEFAULT_IMAGE;
    if(item.imageUrl) return { uri: item.imageUrl };
    if(item.image) return { uri: `${API_URL}/uploads/${item.image}` };
    return DEFAULT_IMAGE;
  };

  // Render news card with image
  const renderNewsCard = (news, index) => (
    <View 
      key={news._id} 
      style={[
        styles.newsCard,
        index === 0 && styles.firstNewsCard,
        index === newsPosts.length - 1 && styles.lastNewsCard,
        { minHeight: 220 } 
      ]}
    >
      { (news.image || news.imageUrl) && (
        <Image
          source={getImageSource(news)}
          style={{ width: '100%', height: 200, borderRadius: 10, marginBottom: 8 }}
          resizeMode="cover"
          defaultSource={DEFAULT_IMAGE}
        />
      )}
      <Text style={styles.newsTitle}>{news.title}</Text>
      <Text style={styles.newsContent}>{news.content}</Text>
      <View style={styles.newsFooter}>
        <Text style={styles.newsDate}>{news.date || 'Today'}</Text>
      </View>
    </View>
  );

  // Render community card - unchanged
  const renderCommunityCard = ({ item }) => (
    <View style={styles.communityCard}>
      <Image
        source={getImageSource(item)}
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
              {[newsPost, ...newsPosts.slice(1)].map((news, index) => renderNewsCard(news, index))}
            </View>
          ) : (
            renderNewsCard(newsPost, 0)
          )}
        </View>

        {/* Community Posts Section */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account-group" size={22} color="#4caf50" />
              <Text style={styles.sectionTitle}>Community Posts</Text>
            </View>
          </View>

          <View style={styles.communityPostsContainer}>
            <Carousel
              width={width * 0.9}
              height={520}
              data={communityPosts}
              autoPlay={true}
              autoPlayInterval={5000}
              loop={true}
              scrollAnimationDuration={1000}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 40,
              }}
              renderItem={renderCommunityCard}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
