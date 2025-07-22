import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image,
  SafeAreaView
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width, height } = Dimensions.get("window");

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
  const [totalBinsCollected, setTotalBinsCollected] = useState(0);
  const [monthlyBinsCollected, setMonthlyBinsCollected] = useState(0);
  const [token, setToken] = useState(null); 

  useEffect(() => {
    const fetchTokenAndUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (!storedToken) {
          Alert.alert('Error', 'User token not found. Please log in again.');
          return;
        }
        setToken(storedToken);

        const response = await fetch(`${API_URL}/auth/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserId(data.user._id);
        } else {
          Alert.alert('Error', data.error || 'Failed to fetch user details');
        }
      } catch (error) {
        console.error('Fetch User ID Error:', error);
        Alert.alert('Error', 'Something went wrong while fetching user details');
      }
    };

    fetchTokenAndUser();
  }, []);

  const fetchCollectionCount = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("Error", "Token not found. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/collector/collection-count`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTotalBinsCollected(data.totalBinsCollected);
        setMonthlyBinsCollected(data.monthlyBinsCollected);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch collection counts");
      }

    } catch (error) {
      console.error("Fetch Error:", error);
      Alert.alert("Error", "Something went wrong while fetching collection counts");
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchCollectionCount();
      setLoading(false);
    };
    
    loadInitialData();
  }, []);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

      // Check if token exists
      if (!token) {
        setValidationMessage("Error: Authentication token not found. Please log in again.");
        setTimeout(() => setValidationMessage(""), 5000);
        return;
      }

      setLoading(true);
      console.log("Making request to validate bin:", binId);
      const response = await fetch(`${API_URL}/collector/validate-bin`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ binId, userId }),
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();

      if (response.ok) {
        await fetchCollectionCount();
        setValidationMessage(data.message || "Bin successfully collected!");
        setTimeout(() => setValidationMessage(""), 5000);
      } else {
        setValidationMessage(`Error: ${data.message || "Failed to validate bin"}`);
        setTimeout(() => setValidationMessage(""), 5000);
      }

    } catch (error) {
      console.error("Error during fetch:", error);
      setValidationMessage("Error: Network or server issue");
      setTimeout(() => setValidationMessage(""), 5000);
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
      setTimeout(() => setValidationMessage(""), 5000); 
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
    <SafeAreaView style={styles.container}>

      <View style={styles.imageContainer}>
        <Text style={styles.welcomeText}>Hello Collector</Text>
        <Image
          source={require('../../../assets/images/collector.jpg')}
          style={styles.collectorImage}
          resizeMode="contain"
        />
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>Total Bins Collected</Text>
            <Text style={styles.statValue}>{totalBinsCollected}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar" size={24} color="#4CAF50" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statValue}>{monthlyBinsCollected}</Text>
          </View>
        </View>
      </View>


      {/* Fixed Position Message Overlay */}
      {validationMessage && (
        <View style={[
          styles.messageOverlay,
          validationMessage.startsWith("Error")
            ? styles.errorOverlay
            : styles.successOverlay
        ]}>
          <View style={styles.messageContent}>
            <Ionicons
              name={validationMessage.startsWith("Error") ? "close-circle" : "checkmark-circle"}
              size={22}
              color={validationMessage.startsWith("Error") ? "#FF3B30" : "#4CAF50"}
            />
            <Text style={styles.messageText}>
              {validationMessage}
            </Text>
          </View>
        </View>
      )}

      {isCameraVisible && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleScan}
          >
            <View style={styles.scanOverlay}>
              <View style={styles.scanArea}>
                <View style={styles.scanAreaBorder} />
              </View>
            </View>
            <TouchableOpacity style={styles.backButton} onPress={() => setIsCameraVisible(false)}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </CameraView>
        </View>
      )}

      {!isCameraVisible && (
        <View style={styles.buttonContainer}>
          {/* Main Action Button - Circular Scan */}
          <View style={styles.scanButtonContainer}>
            <TouchableOpacity
              style={[styles.circularScanButton, styles.scanButton]}
              onPress={() => setIsCameraVisible(true)}
            >
              <Ionicons name="camera" size={40} color="white" />
            </TouchableOpacity>
            <Text style={styles.scanButtonLabel}>Scan Bin</Text>
          </View>

          {/* Secondary Action Buttons */}
          <View style={styles.secondaryButtonsRow}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                activePersonal ? styles.activeSecondaryButton : styles.inactiveSecondaryButton
              ]}
              onPress={toggleAvailability}
            >
              <Ionicons
                name={activePersonal ? "checkmark-circle" : "close-circle"}
                size={24}
                color="white"
              />
              <Text style={styles.secondaryButtonText}>
                {activePersonal ? "Available" : "Unavailable"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, styles.locationSecondaryButton]}
              onPress={updateCollectorStatus}
            >
              <Ionicons name="navigate" size={24} color="white" />
              <Text style={styles.secondaryButtonText}>Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E8B57" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(176, 219, 156)",
    padding: 25,
    paddingTop: 0,
    alignItems: "center",
  },

  imageContainer: {
    height: height * 0.4,
    width: '120%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
    backgroundColor: 'rgba(240,241,245,255)',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 55,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  collectorImage: {
    width: '70%',
    height: '70%',
    borderRadius: 10,
  },


  cameraContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 100,
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(196, 241, 206, 0)',
  },
  scanArea: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(53, 53, 53, 0)',
  },
  scanAreaBorder: {
    width: '90%',
    height: '90%',
    borderWidth: 4,
    borderColor: "#00E676",
    borderRadius: 15,
    borderStyle: 'dashed',
    shadowColor: '#00E676',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
    padding: 25,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1 }],
  },
  scanButton: {
    backgroundColor: '#2E8B57',
    background: 'linear-gradient(135deg, #2E8B57 0%, #3CB371 100%)',
  },
  locationButton: {
    backgroundColor: '#20B2AA',
    background: 'linear-gradient(135deg, #20B2AA 0%, #48D1CC 100%)',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
    background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
  },
  inactiveButton: {
    backgroundColor: '#78909C',
    background: 'linear-gradient(135deg, #78909C 0%, #90A4AE 100%)',
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 15,
    marginHorizontal: 20,
    marginTop: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  errorContainer: {
    borderLeftWidth: 6,
    borderLeftColor: '#F44336',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  successContainer: {
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: '#2C3E50',
    lineHeight: 22,
  },
  backButton: {
    position: "absolute",
    left: 25,
    top: 55,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 253, 248, 0.9)',
    zIndex: 1000,
  },
  
  // New Statistics Card Styles
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 234, 218, 0.98)',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(46, 139, 87, 0.08)',
  },
  
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(46, 139, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  statTextContainer: {
    flex: 1,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7A7A7A',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    textShadowColor: 'rgba(46, 139, 87, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Fixed Message Overlay Styles
  messageOverlay: {
    position: 'absolute',
    top: height * 0.65,
    left: 20,
    right: 20,
    zIndex: 999,
    alignItems: 'center',
  },
  
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 139, 87, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  errorOverlay: {
    // Error-specific overlay styling if needed
  },
  
  successOverlay: {
    // Success-specific overlay styling if needed
  },
  
  messageText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  
  // Redesigned Scan Button Styles
  scanButtonContainer: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 10,
  },
  
  circularScanButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E8B57',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  scanButtonLabel: {
    color: '#2E8B57',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(46, 139, 87, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  secondaryButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  
  activeSecondaryButton: {
    backgroundColor: '#4CAF50',
  },
  
  inactiveSecondaryButton: {
    backgroundColor: '#78909C',
  },
  
  locationSecondaryButton: {
    backgroundColor: '#20B2AA',
  },
  
  secondaryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});