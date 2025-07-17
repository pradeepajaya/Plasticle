import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./_styles";

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
        setValidationMessage(`Error: ${data.error || "Failed to validate bin"}`);
      }
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      setValidationMessage("Error: Invalid Bin QR Code format");
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
      setValidationMessage("Success: Location updated successfully");
      setTimeout(() => setValidationMessage(""), 5000);
    } catch (err) {
      console.error("Error updating status:", err);
      setValidationMessage(`Error: ${err.message || "Failed to update location"}`);
    }
  };

  const toggleAvailability = () => {
    setActivePersonal((prev) => !prev);
    setValidationMessage(`You are now ${!activePersonal ? "available" : "unavailable"}`);
    setTimeout(() => setValidationMessage(""), 3000);
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
    <LinearGradient colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]} style={styles.container}>
      {isCameraVisible && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleScan}
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea}>
                <View style={styles.scanAreaBorder} />
              </View>
            </View>
            <TouchableOpacity style={styles.backButton} onPress={() => setIsCameraVisible(false)}>
              <Ionicons name="arrow-back-circle" size={35} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.flipIcon} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse-outline" size={30} color="white" />
            </TouchableOpacity>
          </CameraView>
        </View>
      )}

      {!isCameraVisible && (
        <View style={styles.uiContainer}>
          <View style={styles.header}>
            <Ionicons name="trash-bin" size={40} color="#2E8B57" />
            <Text style={styles.title}>Plasticle</Text>
          </View>

          {loading && <ActivityIndicator size="large" color="#2E8B57" />}

          {validationMessage ? (
            <View style={[
              styles.messageContainer,
              validationMessage.startsWith("Error") 
                ? styles.errorContainer 
                : styles.successContainer
            ]}>
              {validationMessage.startsWith("Error") ? (
                <Ionicons name="close-circle" size={24} color="#FF3B30" style={styles.icon} />
              ) : (
                <Ionicons name="checkmark-circle" size={24} color="#2E8B57" style={styles.icon} />
              )}
              <Text style={styles.statusText}>
                {validationMessage}
              </Text>
            </View>
          ) : null}

          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => setIsCameraVisible(true)}
            >
              <Ionicons name="qr-code" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Scan Bin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                activePersonal ? styles.activeButton : styles.inactiveButton
              ]}
              onPress={toggleAvailability}
            >
              <Ionicons 
                name={activePersonal ? "checkmark-circle" : "close-circle"} 
                size={24} 
                color="white" 
                style={styles.buttonIcon} 
              />
              <Text style={styles.buttonText}>
                {activePersonal ? "Available" : "Unavailable"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={updateCollectorStatus}
            >
              <Ionicons name="navigate" size={24} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Update Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

