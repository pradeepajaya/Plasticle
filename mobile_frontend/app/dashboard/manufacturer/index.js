import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  Alert,
  Text,
  ActivityIndicator,
  Platform,
  Image,
  Linking,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { height } = Dimensions.get('window');

const ManufacturerDashboard = () => {
  const router = useRouter();
  const [count, setCount] = useState(1);
  const [qrCodes, setQRCodes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [produceCount, setProduceCount] = useState(0);
  const [recycleCount, setRecycleCount] = useState(0);


 useEffect(() => {
    const checkMediaPermission = async () => {
      try {
        const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
        if (status === 'granted') {
          setHasPermission(true);
          return;
        }
        if (canAskAgain) {
          const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
          setHasPermission(newStatus === 'granted');
        } else {
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Permission error:", error);
        setHasPermission(false);
      }
    };

    checkMediaPermission();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("Error", "User token not found. Please log in again.");
          return;
        }

        const response = await fetch(`${API_URL}/auth/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserId(data.user._id);
        } else {
          Alert.alert("Error", data.error || "Failed to fetch user details");
        }
      } catch (error) {
        console.error("Fetch User ID Error:", error);
        Alert.alert("Error", "Something went wrong while fetching user details");
      }
    };

    fetchUserId();
  }, []);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("Error", "User token not found. Please log in again.");
        return;
      }

      const statsRes = await fetch(`${API_URL}/manufacturer/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const statsData = await statsRes.json();

      if (statsRes.ok) {
        setProduceCount(statsData.stats.totalBottlesProduced || 0);
        setRecycleCount(statsData.stats.totalBottlesRecycled || 0);
      } else {
        console.error("Stats Fetch Error", statsData.message);
        Alert.alert("Error", statsData.message || "Failed to fetch stats");
      }

    } catch (error) {
      console.error("Fetch Stats Error:", error);
      Alert.alert("Error", "Something went wrong while fetching stats");
    }
  };

  fetchStats();
}, []);



  const generateQRCodes = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    if (!count || count <= 0) {
      Alert.alert("Error", "Please enter a valid number of QR codes.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/manufacturer/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturerId: userId, count }),
      });

      const data = await response.json();
      if (response.ok) {
        setQRCodes(data.bottles);
        setProduceCount(prev => prev + parseInt(count)); 
      } else {
        Alert.alert("Error", data.error || "Failed to generate QR codes");
      }
    } catch (error) {
      console.error("QR Code Generation Error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };


const downloadAllQRCodes = async () => {
  if (Platform.OS === "web") {
    // Web: trigger downloads directly
    qrCodes.forEach((qr, index) => {
      const link = document.createElement("a");
      link.href = qr.qrCodeImage;
      link.download = `qr_code_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    setQRCodes([]);
    return;
  }

  // Request media library permission first
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      "Permission Denied",
      "Permission to save images to your gallery was denied. QR codes were not saved.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() }
      ]
    );
    return; 
  }

  setLoading(true);

  try {
    const fileUris = [];

    // Save all QR code images to cacheDirectory
    for (let i = 0; i < qrCodes.length; i++) {
      const fileName = `qr_code_${i + 1}.png`;
      const path = FileSystem.cacheDirectory + fileName;

      // Remove the "data:image/png;base64," prefix
      const base64Image = qrCodes[i].qrCodeImage.replace(/^data:image\/png;base64,/, "");

      await FileSystem.writeAsStringAsync(path, base64Image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      fileUris.push(path);
    }

    // Now add files to the MediaLibrary (Gallery)
    const assets = [];
    for (const uri of fileUris) {
      const asset = await MediaLibrary.createAssetAsync(uri);
      assets.push(asset);
    }

    // Create or add to the "Download" album
    let album = await MediaLibrary.getAlbumAsync("Download");
    if (album == null) {
      await MediaLibrary.createAlbumAsync("Download", assets[0], false);
      if (assets.length > 1) {
        await MediaLibrary.addAssetsToAlbumAsync(assets.slice(1), "Download", false);
      }
    } else {
      await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
    }

    Alert.alert("Success", `Saved ${assets.length} QR codes to your gallery!`);
    setQRCodes([]);
  } catch (error) {
    console.error("Download failed:", error);
    Alert.alert("Error", "Failed to save QR codes.");
    setQRCodes([]);
  } finally {
    setLoading(false);
  }
};



  // Save all QR codes as a single PDF file
  const saveQRCodesAsPDF = async () => {
    if (qrCodes.length === 0) {
      Alert.alert('No QR Codes', 'Please generate QR codes first.');
      return;
    }
    try {
      // Build HTML for all QR codes
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif;">
            <h2>Generated QR Codes</h2>
            <div style="display: flex; flex-wrap: wrap;">
              ${qrCodes.map((qr, idx) => `
                <div style="margin: 10px; text-align: center;">
                  <img src="${qr.qrCodeImage}" width="150" height="150" />
                  <div>QR #${idx + 1}</div>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
        setQRCodes([]);
      } else {
        Alert.alert('PDF Saved', 'PDF file has been created. Please check your downloads or share it from your browser.');
        setQRCodes([]);  
      }
    } catch (error) {
      console.error('Failed to save PDF', error);
      Alert.alert('Error', 'Failed to save QR codes as PDF.');
    }
  };

  return (
    <LinearGradient colors={['#1b5e20', '#2e7d32', '#4caf50', '#81c784']} style={styles.gradient}>
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.contentContainer}>
        {/* Top Welcome Section */}
        <View style={styles.topSection}>
          <Image source={require('../../../assets/images/logoplasticle.png')} style={styles.logo} />
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.welcomeText}>Welcome back</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{produceCount}</Text>
            <Text style={styles.statText}>Bottles Generated</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recycleCount}</Text>
            <Text style={styles.statText}>Bottles Recycled</Text>
          </View>
        </View>

        {/* QR Code Generator Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Enter the number of QR Codes to generate:</Text>
          <TextInput
            placeholder="Enter Count"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={count.toString()}
            onChangeText={(text) =>
              setCount(isNaN(parseInt(text, 10)) ? "" : parseInt(text, 10))
            }
            style={styles.input}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#2e7d32" />
          ) : qrCodes.length === 0 ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.generateButton]} 
              onPress={generateQRCodes}
            >
              <Ionicons name="qr-code-outline" size={20} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Generate QR Codes</Text>
            </TouchableOpacity>
          ) : null}

          {qrCodes.length > 0 && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.downloadButton]} 
                onPress={downloadAllQRCodes} 
                disabled={loading}
              >
                <Ionicons name="download-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Download All QR Codes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.pdfButton]}
                onPress={saveQRCodesAsPDF}
                disabled={loading}
              >
                <Ionicons name="document-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Save All as PDF</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* QR Code Grid */}
        {qrCodes.length > 0 && (
          <View style={[styles.card]}>
            <Text style={styles.sectionTitle}>Generated QR Codes:</Text>
            <ScrollView 
              style={styles.qrScrollContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              <View style={styles.qrRow}>
                {qrCodes.map((qr, index) => (
                  <View key={index} style={styles.qrContainer}>
                    <View style={styles.qrImageContainer}>
                      <Image source={{ uri: qr.qrCodeImage }} style={styles.qrCode} />
                    </View>
                    <Text style={styles.qrLabel}>QR #{index + 1}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  </LinearGradient>
);

};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingVertical: 25,
    paddingHorizontal: 5,
  },
  contentContainer: {
    width: '100%',
    padding: 20,
    justifyContent: 'center',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  welcomeTextContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  helloText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    flex: 0.48,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1b5e20',
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    marginHorizontal: 5,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 20,
    fontSize: 20,
    color: '#1b5e20',
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: '#81c784',
    padding: 18,
    marginVertical: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    padding: 18,
    borderRadius: 15,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minHeight: 55,
  },
  generateButton: {
    backgroundColor: '#2e7d32',
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  downloadButton: {
    backgroundColor: '#388e3c',
    borderWidth: 2,
    borderColor: '#66bb6a',
  },
  pdfButton: {
    backgroundColor: '#43a047',
    borderWidth: 2,
    borderColor: '#81c784',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
    marginLeft: 8,
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  scrollContainer: {
    marginTop: 15,
  },
  qrScrollContainer: {
    maxHeight: 450,
    borderWidth: 1,
    borderColor: '#4caf50',
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  qrRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  qrContainer: {
    marginVertical: 20,
    marginHorizontal: 10,
    alignItems: 'center',
    width: '40%',
    marginBottom: 20,
  },
  qrImageContainer: {
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4caf50',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  qrCode: {
    width: 110,
    height: 110,
    borderRadius: 8,
  },
  qrLabel: {
    fontSize: 14,
    color: '#1b5e20',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 1,
    overflow: 'hidden',
  },
});

export default ManufacturerDashboard;