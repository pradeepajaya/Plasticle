import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from './index.styles';
import socket from "../../utils/socket";


const API_URL = process.env.EXPO_PUBLIC_API_URL;

const capacityOptions = [1000, 1500, 2000];

export default function TaskHandlerScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(null);
  const [location, setLocation] = useState(null);
  const [capacity, setCapacity] = useState("");
  const [textLocation, setTextLocation] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [facing, setFacing] = useState("back");
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [mediaPermission, setMediaPermission] = useState(null);
  const [showResultScreen, setShowResultScreen] = useState(false);
  const [showCapacityDropdown, setShowCapacityDropdown] = useState(false);

  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [assignData, setAssignData] = useState(null);


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
          console.log(data)
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





  useEffect(() => {
    if (!userId) return;

    socket.connect();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("joinCollector", { userId });
    });

    socket.off("bin-assigned");
    socket.on("bin-assigned", (data) => {
      console.log("Received bin assigning:", data);
      //if (data.location){
      //Alert.alert("Bin Assigned", `${data.location} has been assigned to you.\nPlease check calendar for more...`);
      setAssignData(data)
      setShowNotification(true)

      //}else{
      //Alert.alert("Bin Assigned", `Bin has been assigned to you.\nPlease check calendar for more...`);

      //}


    });

  }, [userId]);




  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(status === "granted");
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/auth/login");
      socket.disconnect();
      console.log("Socket Disconnected");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const generateBinQR = async () => {
    if (!capacity || (!textLocation && !location)) {
      Alert.alert("Error", "Please provide bin capacity and either a typed location or select one on the map.");
      return;
    }

    const locationString = textLocation || `${location.latitude},${location.longitude}`;
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/bins/createBin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: locationString,
          capacity: parseInt(capacity),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();

      if (data.qrCodeImage) {
        setQrCode(data.qrCodeImage);
        setCapacity("");
        setLocation(null);
        setTextLocation("");
      } else {
        throw new Error("No QR code received from server");
      }
    } catch (error) {
      console.error("Error generating QR:", error);
      Alert.alert("Error", `Error generating QR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Please grant permission to access media library.");
        return;
      }

      const fileUri = FileSystem.documentDirectory + "bin-qr-code.png";
      await FileSystem.writeAsStringAsync(fileUri, qrCode.replace(/^data:image\/png;base64,/, ""), {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert("Success", "QR Code saved to gallery.");

      setQrCode(null);
      setSelectedOption("generateBinQR");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to download QR code.");
    }
  };

  const handleBottleScan = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setIsCameraVisible(false);
      await validateBottleQRCode(data);
    }
  };

  const validateBottleQRCode = async (qrData) => {
    try {
      console.log("Raw Bottle QR Data:", qrData);
      let bottleId, manufacturerId;

      if (qrData.startsWith("{") && qrData.endsWith("}")) {
        const parsedData = JSON.parse(qrData);
        bottleId = parsedData.bottleId;
        manufacturerId = parsedData.manufacturerId;
      } else if (qrData.includes("bottleId") && qrData.includes("manufacturerId")) {
        const bottleIdMatch = qrData.match(/bottleId\s*:\s*"([^"]+)"/);
        const manufacturerIdMatch = qrData.match(/manufacturerId\s*:\s*"([^"]+)"/);
        bottleId = bottleIdMatch?.[1]?.trim();
        manufacturerId = manufacturerIdMatch?.[1]?.trim();
      } else {
        const parts = qrData.split("|");
        if (parts.length === 2) {
          bottleId = parts[0]?.trim();
          manufacturerId = parts[1]?.trim();
        }
      }

      if (!bottleId || !manufacturerId) {
        throw new Error("Invalid bottle QR format");
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/task-handler/recycle-bottle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId, manufacturerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to validate bottle");
      }

      setValidationMessage(
        data.message === "Bottle already recycled"
          ? "Bottle already recycled"
          : "Bottle recycled successfully!"
      );
      setShowResultScreen(true);

      setTimeout(() => {
        setShowResultScreen(false);
        setValidationMessage("");
        setScanned(false);
      }, 3000);

    } catch (error) {
      console.error("Bottle Validation Error:", error);
      setValidationMessage(error.message);
      setShowResultScreen(true);
      setTimeout(() => {
        setShowResultScreen(false);
        setValidationMessage("");
        setScanned(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const selectCapacity = (value) => {
    setCapacity(value.toString());
    setShowCapacityDropdown(false);
  };

  if (!permission) {
    return (
      <LinearGradient colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </LinearGradient>
    );
  }

  if (!permission.granted) {
    return (
      <LinearGradient colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']} style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera access to scan bottles</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#e8f5e9', '#c8e6c9', '#a5d6a7']} style={styles.gradient}>
      {/* Header Section - Only shown on home screen */}
      {!selectedOption && !isCameraVisible && !showResultScreen && (
        <View style={styles.imageContainer}>
          <Text style={styles.welcomeText}>Hello Taskhandler,</Text>
          <Text style={styles.Text}>Lead the change with Plasticle</Text>
          <Image
            source={require('../../../assets/images/recycling.jpg')}
            style={styles.collectorImage}
            resizeMode="contain"
          />
        </View>
      )}



      {showNotification && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          backgroundColor: '#e6f9ec',
          borderLeftWidth: 6,
          borderLeftColor: '#34a853',
          borderRadius: 10,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          zIndex: 1000,
        }}>
          <Text style={{ color: '#1b5e20', fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
            Bin Assigned
          </Text>
          <Text style={{ color: '#2e7d32', marginBottom: 12 }}>
            {`${assignData.location ? assignData.location : "A bin"} has been assigned to you.\nPlease check calendar for more...`}
          </Text>
          <TouchableOpacity
            onPress={() => setShowNotification(false)}
            style={{
              alignSelf: 'flex-end',
              backgroundColor: '#34a853',
              paddingVertical: 6,
              paddingHorizontal: 14,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>OK</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mainContainer}>
        {/* Home Screen with Two Options */}
        {!selectedOption && !isCameraVisible && !showResultScreen && (
          <View style={styles.homeContainer}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.optionButton, styles.generateButton]}
                onPress={() => setSelectedOption("generateBinQR")}
              >
                <Ionicons name="qr-code-outline" size={28} color="white" />
                <Text style={styles.buttonText}>Generate Bin QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, styles.scanButton]}
                onPress={() => setIsCameraVisible(true)}
              >
                <Ionicons name="scan-outline" size={28} color="white" />
                <Text style={styles.buttonText}>Scan Bottle QR</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Generate Bin QR Section */}
        {selectedOption === "generateBinQR" && !isCameraVisible && !showResultScreen && (
          <ScrollView style={styles.card} contentContainerStyle={styles.cardContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedOption(null);
                setQrCode(null);
              }}
            >
              <Ionicons name="arrow-back" size={24} color="#2e7d32" />
              <Text style={styles.backText}>Back to Options</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Enter Location (optional if using map):</Text>
            <TextInput
              placeholder="Enter Location Name"
              value={textLocation}
              onChangeText={setTextLocation}
              style={styles.input}
              placeholderTextColor="#888"
            />

            <Text style={styles.sectionTitle}>Or select location on map:</Text>
            <MapView
              style={styles.map}
              initialRegion={{ latitude: 6.9271, longitude: 79.8612, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
              onPress={handleMapPress}
            >
              {location && <Marker coordinate={location} pinColor="#2e7d32" />}
            </MapView>

            <Text style={styles.label}>
              Selected Location: {textLocation || (location ? `${location.latitude}, ${location.longitude}` : "None")}
            </Text>

            <Text style={styles.sectionTitle}>Select Bin Capacity :</Text>
            <TouchableOpacity
              style={styles.capacityInput}
              onPress={() => setShowCapacityDropdown(true)}
            >
              <Text style={capacity ? styles.capacityText : styles.capacityPlaceholder}>
                {capacity || "Select capacity"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#2e7d32" />
            </TouchableOpacity>

            <Modal
              transparent={true}
              visible={showCapacityDropdown}
              onRequestClose={() => setShowCapacityDropdown(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setShowCapacityDropdown(false)}
              >
                <View style={styles.dropdownContainer}>
                  {capacityOptions.map((option) => (
                    <Pressable
                      key={option}
                      style={styles.dropdownOption}
                      onPress={() => selectCapacity(option)}
                    >
                      <Text style={styles.dropdownOptionText}>{option} bottles </Text>
                    </Pressable>
                  ))}
                </View>
              </Pressable>
            </Modal>

            {!qrCode && (
              <TouchableOpacity
                style={[styles.actionButton, styles.generateButton]}
                onPress={generateBinQR}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="qr-code" size={20} color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Generate QR</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {qrCode && (
              <View style={styles.qrContainer}>
                <Text style={styles.qrLabel}>Bin QR Code:</Text>
                <View style={styles.qrImageContainer}>
                  <Image source={{ uri: qrCode }} style={styles.qrImage} />
                </View>
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={downloadQR}
                  disabled={!mediaPermission}
                >
                  <Ionicons name="download-outline" size={20} color="white" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Download QR</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}

        {/* Camera Screen */}
        {isCameraVisible && !showResultScreen && (
          <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.cameraFullScreenContainer}>
            <View style={styles.cameraInstructionContainer}>
              <Text style={styles.scanHelpText}>Align bottle QR code within the frame</Text>
            </View>

            <View style={styles.cameraSquareContainer}>
              <CameraView
                style={styles.cameraSquare}
                facing={facing}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={scanned ? undefined : handleBottleScan}
              >
                <View style={styles.cameraOverlay}>
                  <View style={styles.scanFrame} />
                </View>
              </CameraView>
            </View>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.closeCameraButton}
                onPress={() => setIsCameraVisible(false)}
              >
                <Ionicons name="close" size={30} color="#2e7d32" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse-outline" size={30} color="#2e7d32" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        )}

        {/* Result Screen */}
        {showResultScreen && (
          <LinearGradient colors={['#e8f5e9', '#c8e6c9']} style={styles.resultScreen}>
            <Text style={[
              styles.resultText,
              validationMessage.includes("Error") ? styles.errorText : styles.successText
            ]}>
              {validationMessage}
            </Text>
          </LinearGradient>
        )}
      </View>
    </LinearGradient>
  );
};
