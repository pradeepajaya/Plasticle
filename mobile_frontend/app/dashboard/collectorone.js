/*import React, { useEffect, useState } from "react";
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
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CollectorDashboard() {
  const router = useRouter();
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [activePersonal, setActivePersonal] = useState(false);

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

  const handleScan = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setIsCameraVisible(false);
      await validateBinQRCode(data);
      setTimeout(() => setScanned(false), 3000);
    }
  };

  const validateBinQRCode = async (qrData) => {
    try {
      let binId;
      if (qrData.startsWith("{") && qrData.endsWith("}")) {
        const parsedData = JSON.parse(qrData);
        binId = parsedData.binId;
      } else {
        binId = qrData;
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/collector/validate-bin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binId, userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setValidationMessage(data.message || "Bin successfully collected!");
        setTimeout(() => setValidationMessage(""), 5000);
      } else {
        setValidationMessage(data.error || "Error validating bin.");
      }
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      setValidationMessage("Invalid Bin QR Code format.");
    } finally {
      setLoading(false);
    }
  };

  const updateCollectorStatus = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const latitude = loc.coords.latitude;
      const longitude = loc.coords.longitude;

      setLocation({ latitude, longitude });

      const response = await fetch(`${API_URL}/collector/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
          activePersonal,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      Alert.alert("Success", "Status updated successfully");
    } catch (err) {
      console.error("Error updating status:", err);
      Alert.alert("Error", err.message || "Failed to update status");
    }
  };

  const toggleAvailability = () => {
    setActivePersonal((prev) => !prev);
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
            {validationMessage || "Welcome to the Collector Dashboard"}
          </Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsCameraVisible(true)}
          >
            <Text style={styles.buttonText}>Scan Bin QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: activePersonal ? "green" : "gray" }]}
            onPress={toggleAvailability}
          >
            <Text style={styles.buttonText}>
              Mark as {activePersonal ? "Unavailable" : "Available"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={updateCollectorStatus}
          >
            <Text style={styles.buttonText}>Update Location</Text>
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
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
  },
  uiContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  actionButton: {
    backgroundColor: "black",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
  },
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
*/