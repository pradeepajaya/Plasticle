import React, { useState, useEffect } from "react";
import { View, Button, ScrollView, TextInput, Alert, StyleSheet, Text, ActivityIndicator, Platform, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { API_URL } from '@env';
import { useRouter } from "expo-router"; // Expo Router navigation if needed
// Replace this with your actual API URL


const ManufacturerDashboard = () => {
  const router = useRouter(); // <-- if you want to navigate somewhere
  const [count, setCount] = useState(1);
  const [qrCodes, setQRCodes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) return Alert.alert("Error", "User token not found. Please log in again.");

        const res = await fetch(`${API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        const data = await res.json();

        if (res.ok) setUserId(data.user._id);
        else Alert.alert("Error", data.error || "Failed to fetch user details");
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to fetch user details.");
      }
    })();
  }, []);

  const generateQRCodes = async () => {
    if (!userId || count <= 0) {
      Alert.alert("Error", "Please provide valid inputs.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/manufacturer/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturerId: userId, count }),
      });

      const data = await res.json();
      if (res.ok) setQRCodes(data.bottles);
      else Alert.alert("Error", data.error || "Failed to generate QR Codes.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const saveQRCode = async (base64Image, index) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Permission is needed to save QR codes.");
        return;
      }

      const fileName = `qr_code_${index + 1}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, base64Image.replace(/^data:image\/png;base64,/, ""), {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      console.log(`Saved QR Code ${index + 1}`);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save QR Code.");
    }
  };

  const downloadAllQRCodes = () => {
    if (Platform.OS === "web") {
      qrCodes.forEach((qr, idx) => {
        const link = document.createElement("a");
        link.href = qr.qrCodeImage;
        link.download = `qr_code_${idx + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      qrCodes.forEach((qr, idx) => saveQRCode(qr.qrCodeImage, idx));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the number of QR Codes:</Text>
      <TextInput
        placeholder="Enter Count"
        keyboardType="numeric"
        value={count.toString()}
        onChangeText={(text) => setCount(Number(text) || 0)}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Generate QR Codes" onPress={generateQRCodes} />
      )}

      {qrCodes.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Button title="Download All QR Codes" onPress={downloadAllQRCodes} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.qrRow}>
        {qrCodes.map((qr, idx) => (
          <View key={idx} style={styles.qrContainer}>
            <Image source={{ uri: qr.qrCodeImage }} style={styles.qrCode} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  qrRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  qrContainer: {
    margin: 10,
    alignItems: "center",
    width: "40%",
  },
  qrCode: {
    width: 150,
    height: 150,
  },
});

export default ManufacturerDashboard;
