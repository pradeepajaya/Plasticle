import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";


const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width } = Dimensions.get('window');

export default function BuyerDashboard() {
  const router = useRouter();
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [scanBin, setScanBin] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [binId, setBinId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanButton, setShowScanButton] = useState(true);

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
        setShowScanButton(true);
      } else {
        setValidationMessage(`Error: ${data.message}`);
        setShowScanButton(true);
      }
    } catch (error) {
      console.error("Error parsing or validating Bin QR Code:", error);
      setValidationMessage("Error: Invalid Bin QR Code format");
      setShowScanButton(true);
    } finally {
      setLoading(false);
    }
  };

  const validateBottleQRCode = async (qrData) => {
    if (!binId || !userId) {
      setValidationMessage("Error: Bin ID or User ID is missing. Please scan the bin QR first.");
      setShowScanButton(true);
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
        setValidationMessage("Error: Bottle ID not found in QR code");
        setShowScanButton(true);
        return;
      }
    } catch (error) {
      console.error("Error parsing Bottle QR Code:", error);
      setValidationMessage("Error: Invalid Bottle QR Code format");
      setShowScanButton(true);
      return;
    }

    setLoading(true);
    setShowScanButton(false);
    try {
      const response = await fetch(`${API_URL}/buyer/validate-bottle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId, binId, userId }),
      });

      const data = await response.json();
      if (data.message === "Bottle added to bin") {
        setValidationMessage("Success: Bottle added to bin successfully");
        setTimeout(() => {
          setScanBin(true);
          setBinId(null);
          setValidationMessage("");
          setShowScanButton(true);
        }, 3000);
      } else {
        setValidationMessage(`Error: ${data.message}`);
        setShowScanButton(true);
      }
    } catch (error) {
      console.error("Bottle validation error:", error);
      setValidationMessage("Error: Failed to validate Bottle QR Code");
      setShowScanButton(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const handleCameraBack = () => {
    if (scanBin) {
      setIsCameraVisible(false);
    } else {
      setScanBin(true);
      setBinId(null);
      setIsCameraVisible(false);
      setValidationMessage("Please scan the Bin QR again.");
      setShowScanButton(true);
    }
  };

  const handleScanBottleBack = () => {
    setScanBin(true);
    setBinId(null);
    setValidationMessage("Please scan the Bin QR again.");
    setShowScanButton(true);
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
    <LinearGradient 
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]} 
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
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
            <TouchableOpacity style={styles.flipIcon} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse-outline" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={handleCameraBack}>
              <Ionicons name="arrow-back-circle" size={35} color="white" />
            </TouchableOpacity>
          </CameraView>
        </View>
      )}

      {!isCameraVisible && (
        <View style={styles.uiContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          ) : (
            <>
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
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" style={styles.icon} />
                  )}
                  <Text style={styles.statusText}>
                    {validationMessage}
                  </Text>
                </View>
              ) : (
                <View style={styles.welcomeContainer}>
                  <Ionicons name="qr-code" size={60} color="#4CAF50" style={styles.qrIcon} />
                  <Text style={styles.welcomeText}>Plasticle</Text>
                  <Text style={styles.subText}>Scan QR codes to get points</Text>
                </View>
              )}

              {showScanButton && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => setIsCameraVisible(true)}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons 
                      name="camera" 
                      size={24} 
                      color="white" 
                      style={styles.cameraIcon} 
                    />
                    <Text style={styles.buttonText}>
                      {scanBin ? "Scan Bin QR" : "Scan Bottle QR"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {!scanBin && showScanButton && (
                <TouchableOpacity style={styles.backButtonText} onPress={handleScanBottleBack}>
                  <Text style={styles.backButtonLabel}>
                    <Ionicons name="arrow-back" size={16} color="#4CAF50" /> Back to Bin Scan
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: { 
    textAlign: "center", 
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
  cameraContainer: {
    width: width - 40,
    height: width - 40,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  camera: { 
    flex: 1,
  },
  overlay: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanArea: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaBorder: {
    width: '90%',
    height: '90%',
    borderWidth: 3,
    borderColor: "#4CAF50",
    borderRadius: 10,
  },
  uiContainer: {
    width: width - 40,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  successContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrIcon: {
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
    flexShrink: 1,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    marginRight: 10,
  },
  buttonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "600",
    textAlign: 'center',
  },
  flipIcon: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 50,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 50,
  },
  backButtonText: {
    marginTop: 25,
  },
  backButtonLabel: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    marginRight: 10,
  },
});

