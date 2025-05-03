import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Button,
  ActivityIndicator, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";  
import { useRouter } from "expo-router"; // Expo Router navigation if needed
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TaskHandlerScreen = () => {
  // State declarations
  const router = useRouter(); 
  const [selectedOption, setSelectedOption] = useState(null);
  const [location, setLocation] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [textLocation, setTextLocation] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [facing, setFacing] = useState("back");
  const [scanned, setScanned] = useState(false);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [mediaPermission, setMediaPermission] = useState(null);

  // Request media library permission
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setMediaPermission(status === 'granted');
    })();
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
     //"http:// 192.168.50.38:5000/api/bins/createBin"
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
        setCapacity('');
        setLocation(null);
        setTextLocation('');
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
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please grant permission to access media library.');
        return;
      }

      const fileUri = FileSystem.documentDirectory + 'bin-qr-code.png';
      await FileSystem.writeAsStringAsync(fileUri, qrCode.replace(/^data:image\/png;base64,/, ''), {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('Success', 'QR Code saved to gallery.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to download QR code.');
    }
  };

  const handleBottleScan = async ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setIsCameraVisible(false);
      await validateBottleQRCode(data);
      setTimeout(() => setScanned(false), 3000);
      setTimeout(() => { setValidationMessage(""); }, 3000);
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
       //"http:// 192.168.50.38:5000/api/task-handler/recycle-bottle"
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
    } catch (error) {
      console.error("Bottle Validation Error:", error);
      setValidationMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  if (!permission) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need camera access to scan bottles</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!selectedOption && (
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.optionButton, { backgroundColor: '#4CAF50' }]} 
            onPress={() => setSelectedOption('generateBinQR')}
          >
            <Text style={styles.buttonText}>Generate Bin QR</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.optionButton, { backgroundColor: '#FF9800' }]} 
            onPress={() => setSelectedOption('scanBottleQR')}
          >
            <Text style={styles.buttonText}>Scan Bottle QR</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedOption === 'generateBinQR' && (
        <View>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setSelectedOption(null);
              setQrCode(null);
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Enter Location (optional if using map):</Text>
          <TextInput
            placeholder="Enter Location Name"
            value={textLocation}
            onChangeText={setTextLocation}
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Or select location on map:</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 6.9271,
              longitude: 79.8612,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            {location && <Marker coordinate={location} />}
          </MapView>

          <Text style={styles.label}>
            Selected Location: {textLocation || (location ? `${location.latitude}, ${location.longitude}` : 'None')}
          </Text>

          <TextInput
            placeholder="Enter Bin Capacity"
            value={capacity}
            onChangeText={setCapacity}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#2196F3' }]} 
            onPress={generateBinQR}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Generate QR</Text>
            )}
          </TouchableOpacity>

          {qrCode && (
            <View style={styles.qrContainer}>
              <Text style={styles.qrLabel}>Bin QR Code:</Text>
              <Image source={{ uri: qrCode }} style={styles.qrImage} />
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#673AB7' }]} 
                onPress={downloadQR}
                disabled={!mediaPermission}
              >
                <Text style={styles.buttonText}>Download QR</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {selectedOption === 'scanBottleQR' && (
        <View>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              setSelectedOption(null);
              setValidationMessage('');
            }}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.cameraSection}>
            {isCameraVisible ? (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing={facing}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={scanned ? undefined : handleBottleScan}
                >
                  <View style={styles.cameraOverlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.scanHelpText}>Align QR code within frame</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.flipButton} 
                    onPress={toggleCameraFacing}
                  >
                    <Ionicons name="camera-reverse-outline" size={30} color="white" />
                  </TouchableOpacity>
                </CameraView>
              </View>
            ) : (
              <View style={styles.scanPromptContainer}>
                {loading && <ActivityIndicator size="large" color="#007bff" />}
                <Text style={[
                  styles.statusText,
                  validationMessage.includes("Error") ? styles.errorText : styles.successText
                ]}>
                  {validationMessage || "Ready to scan bottles"}
                </Text>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                  onPress={() => setIsCameraVisible(true)}
                >
                  <Text style={styles.buttonText}>Scan Bottle QR</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
      <View style={{ marginVertical: 10 }}>
  <Button title="Logout" color="red" onPress={handleLogout} />
</View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  optionButton: {
    padding: 15,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 10,
    fontSize: 16,
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    marginBottom: 10,
    fontSize: 14,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  qrLabel: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
  cameraSection: {
    marginTop: 20,
  },
  cameraContainer: {
    height: 400,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
  },
  scanHelpText: {
    color: 'white',
    marginTop: 20,
    fontSize: 16,
  },
  flipButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 10,
  },
  scanPromptContainer: {
    alignItems: 'center',
    padding: 20,
  },
  statusText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
  },
  successText: {
    color: '#4CAF50',
  },
});

export default TaskHandlerScreen;