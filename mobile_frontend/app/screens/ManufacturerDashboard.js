/*export default function ManufacturerDashboard() {
/*export default function ManufacturerDashboard() {
    return (
      <View style={{ padding: 20 }}>
        <Text>Welcome Manufacturer</Text>
      </View>
    );
  }
  */
/*
import React, { useState, useEffect } from "react";
import { View, Button, ScrollView, TextInput, Alert, StyleSheet, Text, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5000/api"; // Replace with your backend IP

const ManufacturerDashboard = () => {
  const [count, setCount] = useState(1);
  const [qrCodes, setQRCodes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("Error", "User token not found. Please log in again.");
          return;
        }

        // Fetch user details from backend using token
        const response = await fetch(`${API_URL}/auth/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserId(data.user._id); // Set user ID from backend response
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

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/manufacturer/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the number of QR Codes:</Text>

      <TextInput
        placeholder="Enter Count"
        keyboardType="numeric"
        value={count.toString()}
        onChangeText={(text) => setCount(text ? parseInt(text, 10) : 0)}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Generate QR Codes" onPress={generateQRCodes} />
      )}

      <ScrollView>
        {qrCodes.map((qr, index) => (
          <View key={index} style={styles.qrContainer}>
            <QRCode value={qr.bottleId} size={200} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  qrContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
});

export default ManufacturerDashboard;*/

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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

const API_URL = "http://192.168.8.100:5000/api"; // Update with your IP

const ManufacturerDashboard = () => {
  const [count, setCount] = useState(1);
  const [qrCodes, setQRCodes] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const downloadQRCode = async (qrImage, index) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Storage permission is required to download files");
        return;
      }

      const fileName = `qr_code_${index + 1}.png`;
      const path = FileSystem.documentDirectory + fileName;

      const base64Image = qrImage.replace(/^data:image\/png;base64,/, "");

      await FileSystem.writeAsStringAsync(path, base64Image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.createAssetAsync(path);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("Success", `QR Code saved to your device.`);
    } catch (error) {
      console.error("Download failed", error);
      Alert.alert("Error", "Failed to save QR code.");
    }
  };

  const downloadAllQRCodes = () => {
    if (Platform.OS === "web") {
      qrCodes.forEach((qr, index) => {
        const link = document.createElement("a");
        link.href = qr.qrCodeImage;
        link.download = `qr_code_${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    } else {
      qrCodes.forEach((qr, index) => downloadQRCode(qr.qrCodeImage, index));
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
      ) : (
        <Button title="Generate QR Codes" onPress={generateQRCodes} />
      )}

      {qrCodes.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Button title="Download All QR Codes" onPress={downloadAllQRCodes} />
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
    marginBottom: 10,
  },
});

export default ManufacturerDashboard;
