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
    <LinearGradient colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']} style={styles.gradient}>
      <ScrollView 
        contentContainerStyle={[styles.container, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
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

          {qrCodes.length > 0 && (
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Generated QR Codes:</Text>
              <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={styles.qrRow}
              >
                {qrCodes.map((qr, index) => (
                  <View key={index} style={styles.qrContainer}>
                    <View style={styles.qrImageContainer}>
                      <Image source={{ uri: qr.qrCodeImage }} style={styles.qrCode} />
                    </View>
                    <Text style={styles.qrLabel}>QR #{index + 1}</Text>
                  </View>
                ))}
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
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
    color: '#2e7d32',
  },
  input: {
    borderWidth: 1,
    borderColor: "#81c784",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateButton: {
    backgroundColor: '#2e7d32',
  },
  downloadButton: {
    backgroundColor: '#5e35b1',
  },
  pdfButton: {
    backgroundColor: '#039be5',
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 8,
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  scrollContainer: {
    maxHeight: 300,
    marginTop: 10,
  },
  qrRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  qrContainer: {
    margin: 10,
    alignItems: "center",
    width: '40%',
  },
  qrImageContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 5,
  },
  qrCode: {
    width: 120,
    height: 120,
  },
  qrLabel: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
});



export default ManufacturerDashboard;