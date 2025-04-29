/*import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import Webcam from "react-webcam";
import jsQR from "jsqr";

const GOOGLE_MAPS_LIBRARIES = ["marker"];

const TaskHandlerScreen = () => {
  // States for Generate Bin QR
  const [location, setLocation] = useState(""); 
  const [capacity, setCapacity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null); 
  const [qrCode, setQrCode] = useState(null);

  // States for Scan Bottle QR
  const [scanning, setScanning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [loading, setLoading] = useState(false); 
  const [selectedOption, setSelectedOption] = useState(null); 
  const webcamRef = useRef(null);

  // Google Maps Refs and API key
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const googleMapsApiKey = "AIzaSyCiB4iiZYHPtCR6BW3PM2XFnbgiqkaz1AI";

  // Function to generate a unique binId
  const generateBinId = () => {
    return `BIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Handle the map click event to get lat, lng
  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedLocation({ lat, lng });
    setLocation(`${lat}, ${lng}`); 
  };

  // Handle map load
  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  // Create or update AdvancedMarkerElement when location changes
  useEffect(() => {
    if (!selectedLocation || !mapRef.current || !window.google?.maps?.marker?.AdvancedMarkerElement) {
      return;
    }

    // Clean up previous marker if it exists
    if (markerRef.current) {
      markerRef.current.map = null;
      markerRef.current = null;
    }

    // Create new AdvancedMarkerElement
    markerRef.current = new window.google.maps.marker.AdvancedMarkerElement({
      map: mapRef.current,
      position: selectedLocation,
      title: "Selected Location",
    });

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
      }
    };
  }, [selectedLocation]);

  // Generate Bin QR Code
  const generateBinQR = async () => {
    if (!location || !capacity) {
      alert("Please enter location and capacity!");
      return;
    }

    const binId = generateBinId(); 

    try {
      const response = await fetch("http://localhost:5000/api/bins/createBin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binId, location, capacity }),
      });

      if (!response.ok) {
        throw new Error("Error generating bin QR code");
      }

      const data = await response.json();
      
      if (data.qrCodeImage) {
        setQrCode(data.qrCodeImage);
      } else {
        throw new Error("No QR code received from server");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  // Download QR code image
  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "bin-qr-code.png"; 
    link.click();
  };

  // Function to start scanning
  const startScanning = () => {
    setScanning(true);
  };

  // Function to scan QR code
  const scanQRCode = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = 640;
      canvas.height = 480;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      
      if (code) {
        validateBottleQRCode(code.data); 
        setScanning(false);
      }
    };
  };

  // Validate Bottle QR Code and update backend
  const validateBottleQRCode = async (qrData) => {
    try {
      let bottleId, manufacturerId;

      // Check if the QR data is a JSON string
      if (qrData.startsWith("{") && qrData.endsWith("}")) {
        try {
          const parsedData = JSON.parse(qrData); 
          bottleId = parsedData.bottleId;
          manufacturerId = parsedData.manufacturerId;
        } catch (error) {
          throw new Error("Invalid QR code format. Expected JSON.");
        }
      } 
      // Handle key-value pair format
      else if (qrData.includes("bottleId") && qrData.includes("manufacturerId")) {
        const bottleIdMatch = qrData.match(/bottleId\s*:\s*"([^"]+)"/);
        const manufacturerIdMatch = qrData.match(/manufacturerId\s*:\s*"([^"]+)"/);

        if (bottleIdMatch && manufacturerIdMatch) {
          bottleId = bottleIdMatch[1].trim(); 
          manufacturerId = manufacturerIdMatch[1].trim(); 
        } else {
          throw new Error("Invalid QR code format. Could not extract IDs.");
        }
      } 
      // Handle pipe-delimited format
      else {
        const parts = qrData.split("|");
        if (parts.length === 2) {
          bottleId = parts[0]?.trim();
          manufacturerId = parts[1]?.trim(); 
        } else {
          throw new Error("Invalid QR code format. Expected 'bottleId|manufacturerId'.");
        }
      }

      if (!bottleId || !manufacturerId) {
        throw new Error("bottleId and manufacturerId are required.");
      }

      setLoading(true);
      const response = await fetch("http://localhost:5000/api/task-handler/recycle-bottle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId, manufacturerId }), 
      });

      if (!response.ok) {
        const errorText = await response.text(); 
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setValidationMessage(
        data.message === "Bottle already recycled" 
          ? "Bottle already recycled" 
          : "Bottle added to recycling process!"
      );
    } catch (error) {
      console.error("Error recycling bottle:", error);
      setValidationMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false); 
    }
  };

  // Start/stop scanning when scanning state changes
  useEffect(() => {
    let intervalId;
    if (scanning) {
      intervalId = setInterval(scanQRCode, 1000); 
    }
    return () => clearInterval(intervalId);
  }, [scanning]);

  return (
    <div style={{ padding: "20px", maxHeight: "100vh", overflowY: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Task Handler</h2>

      {!selectedOption && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => setSelectedOption("generateBinQR")}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              margin: "10px",
            }}
          >
            Generate Bin QR Code
          </button>
          <button
            onClick={() => setSelectedOption("scanBottleQR")}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              margin: "10px",
            }}
          >
            Scan Bottle QR
          </button>
        </div>
      )}

      {selectedOption === "generateBinQR" && (
        <div>
          <LoadScript 
            googleMapsApiKey={googleMapsApiKey}
            libraries={GOOGLE_MAPS_LIBRARIES} 
          >
            <GoogleMap
              id="location-picker-map"
              mapContainerStyle={{ width: "100%", height: "400px", marginBottom: "20px" }}
              center={{ lat: 6.9271, lng: 79.8612 }} 
              zoom={12}
              onClick={onMapClick}
              onLoad={handleMapLoad}
            />
          </LoadScript>

          <div style={{ marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Selected Location (Lat, Lng)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <input
              type="number"
              placeholder="Enter bin capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            />
          </div>

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <button
              onClick={generateBinQR}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Generate Bin QR
            </button>
          </div>

          {qrCode && (
            <div style={{ textAlign: "center" }}>
              <h3>Bin QR Code:</h3>
              <img src={qrCode} alt="Bin QR Code" style={{ width: "150px", height: "150px" }} />
              <div style={{ marginTop: "10px" }}>
                <button
                  onClick={downloadQR}
                  style={{
                    padding: "10px 20px",
                    fontSize: "16px",
                    backgroundColor: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Download QR Code
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedOption === "scanBottleQR" && (
        <div style={{ textAlign: "center" }}>
          <h3>Scan Bottle QR</h3>
          {!scanning ? (
            <button
              onClick={startScanning}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Scan Bottle QR
            </button>
          ) : (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{ facingMode: "environment", width: 640, height: 480 }}
              />
              <button
                onClick={() => setScanning(false)}
                style={{
                  marginTop: "10px",
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#F44336",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Stop Scanning
              </button>
            </div>
          )}

          {validationMessage && <p>{validationMessage}</p>}
          {loading && <p>Loading...</p>}
        </div>
      )}
    </div>
  );
};

export default TaskHandlerScreen;

*/


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
  StyleSheet 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from "@expo/vector-icons";
import {API_URL} from "@env";

const TaskHandlerScreen = () => {
  // State declarations
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