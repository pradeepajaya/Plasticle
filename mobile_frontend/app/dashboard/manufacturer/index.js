import React, { useState, useEffect } from "react";
import { 
  View, 
  Button, 
  ScrollView, 
  TextInput, 
  Alert, 
  StyleSheet, 
  Text, 
  ActivityIndicator, 
  Platform, 
  Image,
  Linking 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

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
      qrCodes.forEach((qr, index) => {
        const link = document.createElement("a");
        link.href = qr.qrCodeImage;
        link.download = `qr_code_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      // Reset to initial state
      setQRCodes([]);
      return;
    }

    if (hasPermission === false) {
      Alert.alert(
        "Permission Denied",
        "Please enable storage permission in settings to download files.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    if (hasPermission === null) {
      Alert.alert(
        "Checking Permissions",
        "Please wait while we verify storage permissions."
      );
      return;
    }

    setLoading(true);
    let savedCount = 0;
    let errorCount = 0;

    try {
      const fileUris = [];
      for (let i = 0; i < qrCodes.length; i++) {
        try {
          const fileName = `qr_code_${i + 1}.png`;
          const path = FileSystem.cacheDirectory + fileName;
          const base64Image = qrCodes[i].qrCodeImage.replace(/^data:image\/png;base64,/, "");

          await FileSystem.writeAsStringAsync(path, base64Image, {
            encoding: FileSystem.EncodingType.Base64,
          });
          fileUris.push(path);
        } catch (fileError) {
          console.error(`Error saving QR ${i + 1}:`, fileError);
          errorCount++;
        }
      }

      const assets = [];
      for (const uri of fileUris) {
        try {
          const asset = await MediaLibrary.createAssetAsync(uri);
          assets.push(asset);
          savedCount++;
        } catch (assetError) {
          console.error("Error creating asset:", assetError);
          errorCount++;
        }
      }

      if (assets.length > 0) {
        try {
          const album = await MediaLibrary.getAlbumAsync("Download");
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync(assets, album, false);
          } else {
            await MediaLibrary.createAlbumAsync("Download", assets[0], false);
            if (assets.length > 1) {
              await MediaLibrary.addAssetsToAlbumAsync(assets.slice(1), "Download", false);
            }
          }
        } catch (albumError) {
          console.error("Album error:", albumError);
        }
      }

      if (savedCount === qrCodes.length) {
        Alert.alert("Success", `All ${savedCount} QR codes saved successfully!`);
        setQRCodes([]); // Reset to initial state after successful download
      } else if (savedCount > 0) {
        Alert.alert(
          "Partial Success", 
          `Saved ${savedCount} QR codes. ${errorCount > 0 ? `${errorCount} failed to save.` : ''}`
        );
        setQRCodes([]); // Still reset even if partial
      } else {
        Alert.alert("Error", "Failed to save any QR codes");
      }
    } catch (error) {
      console.error("Download failed", error);
      if (savedCount > 0) {
        Alert.alert(
          "Partial Success", 
          `Saved ${savedCount} QR codes. ${errorCount > 0 ? `${errorCount} failed to save.` : ''}`
        );
        setQRCodes([]);
      } else {
        Alert.alert("Error", "Failed to save QR codes");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the number of QR Codes:</Text>
      <TextInput
        placeholder="Enter Count"
        keyboardType="numeric"
        value={count.toString()}
        onChangeText={(text) =>
          setCount(isNaN(parseInt(text, 10)) ? "" : parseInt(text, 10))
        }
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : qrCodes.length === 0 ? (
        <Button title="Generate QR Codes" onPress={generateQRCodes} />
      ) : null}

      {qrCodes.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Button 
            title="Download All QR Codes" 
            onPress={downloadAllQRCodes} 
            disabled={loading}
          />
        </View>
      )}

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.qrRow}>
          {qrCodes.map((qr, index) => (
            <View key={index} style={styles.qrContainer}>
              <Image source={{ uri: qr.qrCodeImage }} style={styles.qrCode} />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{ marginVertical: 10 }}>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  qrRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  qrContainer: {
    margin: 10,
    alignItems: "center",
    width: "40%",
  },
  scrollContainer: {
    maxHeight: "50%",
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 5,
  },
});

export default ManufacturerDashboard;
