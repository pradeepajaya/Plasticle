import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
//import { API_URL } from '@env';

import { useRouter } from "expo-router"; // Expo Router navigation if needed

// Optional: Use env var or hardcoded fallback
const API_URL = process.env.EXPO_PUBLIC_API_URL;
//const API_URL = "http://192.168.204.221:5000/api";

export default function BuyerDashboard() {
  const router = useRouter(); // <-- if you want to navigate somewhere
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [scanBin, setScanBin] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [binId, setBinId] = useState(null);
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

  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    router.replace("/auth/login"); // Replace the screen with login
  } catch (error) {
    console.error("Logout Error:", error);
    Alert.alert("Error", "Failed to log out.");
  }
};


  const handleScan = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setIsCameraVisible(false);
      if (scanBin) {
        await validateBinQRCode(data);
      } else {
        await validateBottleQRCode(data);
      }
      setTimeout(() => setScanned(false), 3000);
    }
  };

  const validateBinQRCode = async (qrData) => {
    try {
      const parsed = JSON.parse(qrData);
      const scannedBinId = parsed.binId;

      setLoading(true);
      const response = await fetch(`${API_URL}/buyer/validate-bin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binId: scannedBinId }),
      });

      const data = await response.json();
      if (data.message === "Bin is valid") {
        setValidationMessage("Bin validated successfully");
        setBinId(scannedBinId);
        setScanBin(false);
      } else {
        setValidationMessage(`${data.message}`);
      }
    } catch (error) {
      console.error("Error parsing or validating Bin QR Code:", error);
      setValidationMessage("Invalid Bin QR Code format");
    } finally {
      setLoading(false);
    }
  };

  const validateBottleQRCode = async (qrData) => {
    if (!binId || !userId) {
      setValidationMessage("Bin ID or User ID is missing. Please scan the bin QR first.");
      return;
    }

    let bottleId;
    try {
      const lines = qrData.split("\n");
      for (const line of lines) {
        if (line.includes("bottleId")) {
          bottleId = line.split(":")[1].trim().replace(/"/g, "");
          break;
        }
      }

      if (!bottleId) {
        setValidationMessage("Bottle ID not found in QR code");
        return;
      }
    } catch (error) {
      console.error("Error parsing Bottle QR Code:", error);
      setValidationMessage("Invalid Bottle QR Code format");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/buyer/validate-bottle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId, binId, userId }),
      });

      const data = await response.json();
      if (data.message === "Bottle added to bin") {
        setValidationMessage("Bottle added to bin successfully");
        setScanBin(true);
        setBinId(null);
        setTimeout(() => setValidationMessage(""), 5000);
      } else {
        setValidationMessage(`${data.message}`);
      }
    } catch (error) {
      console.error("Bottle validation error:", error);
      setValidationMessage("Error validating Bottle QR Code");
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isCameraVisible && (
        <CameraView
          style={styles.camera}
          facing={facing}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleScan}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea} />
          </View>
          <TouchableOpacity style={styles.flipIcon} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse-outline" size={30} color="white" />
          </TouchableOpacity>
        </CameraView>
      )}

      {!isCameraVisible && (
        <View style={styles.uiContainer}>
          {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 10 }} />}
          <Text style={styles.statusText}>
            {validationMessage || "Welcome to the Buyer Dashboard"}
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsCameraVisible(true)}>
            <Text style={styles.buttonText}>{scanBin ? "Scan Bin QR" : "Scan Bottle QR"}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ marginVertical: 10 }}>
  <Button title="Logout" color="red" onPress={handleLogout} />
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: "center", marginTop: 20 },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: "white", borderRadius: 10 },
  uiContainer: { justifyContent: "center", alignItems: "center", flex: 1 },
  actionButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 18 },
  statusText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    fontWeight: "500",
    color: "green",
    paddingHorizontal: 20,
  },
  flipIcon: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 50,
  },
});
