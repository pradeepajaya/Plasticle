/*import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View, Button, Alert } from "react-native";

const BuyerDashboard = () => {
  const [scanBin, setScanBin] = useState(true); 
  const [showScanButton, setShowScanButton] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [data, setData] = useState(null);
  const [binId, setBinId] = useState(null); 
  const [userId, setUserId] = useState(null); 
  const [loading, setLoading] = useState(false); 
  const webcamRef = useRef(null);
  
useEffect(() => {
  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken"); 
      if (!token) {
        Alert.alert("Error", "User token not found. Please log in again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/auth/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
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



  // Function to start scanning
  const startScanning = () => {
    setScanning(true);
    setShowScanButton(false);
  };

  // Function to scan QR code
  const scanQRCode = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
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
            setData(code.data);
            if (scanBin) {
              validateBinQRCode(code.data); 
            } else {
              validateBottleQRCode(code.data);
            }
            setScanning(false);
            setShowScanButton(true);
          }
        };
      }
    }
  };

  // Validate Bin QR Code
  const validateBinQRCode = (qrData) => {
    try {
      const binId = JSON.parse(qrData).binId; 
      console.log("Scanned Bin ID:", binId); 

      setLoading(true); 
      fetch("http://localhost:5000/api/buyer/validate-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binId }), 
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("API Response Data for Bin:", data); 
          if (data.message === "Bin is valid") {
            setValidationMessage("Bin QR Code validated successfully!");
            setBinId(binId);
            setScanBin(false); 
          } else {
            setValidationMessage(data.message);
          }
        })
        .catch(() => setValidationMessage("Error validating Bin QR Code."))
        .finally(() => setLoading(false)); 
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      setValidationMessage("Invalid Bin QR Code format.");
      setLoading(false); 
    }
  };

  //validate bottle qr
  const validateBottleQRCode = (qrData) => {
    if (!binId || !userId) {
      setValidationMessage("Bin ID or User ID is missing. Please scan the bin QR first.");
      return;
    }
  
    // Parse the QR code data to extract bottleId
    let bottleId;
    try {
      const lines = qrData.split("\n"); 
      for (const line of lines) {
        if (line.includes("bottleId")) {
          bottleId = line.split(":")[1].trim().replace(/"/g, ""); 
          break;
        }
      }
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      setValidationMessage("Invalid Bottle QR Code format.");
      return;
    }
  
    if (!bottleId) {
      setValidationMessage("Bottle ID not found in QR code.");
      return;
    }
  
    console.log("Extracted Bottle ID:", bottleId); 
  
    setLoading(true); 
    fetch("http://localhost:5000/api/buyer/validate-bottle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bottleId, binId, userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Bottle added to bin") {
          setValidationMessage("Bottle added to bin");
        } else {
          setValidationMessage(data.message);
        }
      })
      .catch(() => setValidationMessage("Error validating Bottle QR Code."))
      .finally(() => setLoading(false)); 
  };

  useEffect(() => {
    let intervalId;
    if (scanning) {
      intervalId = setInterval(scanQRCode, 500);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [scanning]);

  return (
    <div style={{ textAlign: "center", overflowY: "auto", maxHeight: "80vh" }}>
      <h1>Buyer Dashboard</h1>

      {scanning && (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{ facingMode: "environment", width: 640, height: 480 }}
        />
      )}

      {validationMessage && <p>{validationMessage}</p>}

      {loading && <p>Loading...</p>}

      {showScanButton && scanBin && (
        <button onClick={startScanning} style={{ marginTop: "20px" }}>
          Scan Bin QR
        </button>
      )}

      {!scanBin && showScanButton && (
        <button onClick={startScanning} style={{ marginTop: "20px" }}>
          Scan Bottle QR
        </button>
      )}

      {scanning && (
        <button onClick={() => setScanning(false)} style={{ marginTop: "20px" }}>
          OK
        </button>
      )}
    </div>
  );
};

export default BuyerDashboard;

*/


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

const BuyerDashboard = () => {
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

        const response = await fetch("http://192.168.8.100:5000/api/auth/user", {
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
      const response = await fetch("http://192.168.8.100:5000/api/buyer/validate-bin", {
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
      const response = await fetch("http://192.168.8.100:5000/api/buyer/validate-bottle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId, binId, userId }),
      });

      const data = await response.json();
      if (data.message === "Bottle added to bin") {
        setValidationMessage("Bottle added to bin successfully");
        setScanBin(true); // Reset to scan bin again
        setBinId(null);
        setTimeout(() => {
          setValidationMessage("");
        }, 5000);
  
      } else {
        setValidationMessage(` ${data.message}`);
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

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsCameraVisible(true)}
          >
            <Text style={styles.buttonText}>{scanBin ? "Scan Bin QR" : "Scan Bottle QR"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

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

export default BuyerDashboard;
