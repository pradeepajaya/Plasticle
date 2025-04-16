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
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import  { Camera } from 'expo-camera';
console.log('Camera:', Camera);
import {AsyncStorage} from '@react-native-async-storage/async-storage';

const BuyerDashboard = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanBin, setScanBin] = useState(true);
  const [validationMessage, setValidationMessage] = useState('');
  const [binId, setBinId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  // Ask camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Fetch userId using token
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'User token not found. Please log in again.');
          return;
        }

        const response = await fetch('http://192.168.8.101:5000/api/auth/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
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

    fetchUserId();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    if (scanBin) {
      validateBinQRCode(data);
    } else {
      validateBottleQRCode(data);
    }
  };

  const validateBinQRCode = (qrData) => {
    try {
      const parsed = JSON.parse(qrData);
      const scannedBinId = parsed.binId;
      if (!scannedBinId) throw new Error('Missing binId');

      setLoading(true);
      fetch('http://192.168.8.101:5000/api/buyer/validate-bin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ binId: scannedBinId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === 'Bin is valid') {
            setValidationMessage('Bin QR Code validated successfully!');
            setBinId(scannedBinId);
            setScanBin(false); // Move to bottle scan
          } else {
            setValidationMessage(data.message);
          }
        })
        .catch(() => setValidationMessage('Error validating Bin QR Code.'))
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('QR Parsing Error:', error);
      setValidationMessage('Invalid Bin QR Code format.');
    }
  };

  const validateBottleQRCode = (qrData) => {
    if (!binId || !userId) {
      setValidationMessage('Bin ID or User ID is missing. Please scan the bin QR first.');
      return;
    }

    try {
      const parsed = JSON.parse(qrData);
      const bottleId = parsed.bottleId;
      if (!bottleId) throw new Error('Missing bottleId');

      setLoading(true);
      fetch('http://192.168.8.101:5000/api/buyer/validate-bottle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bottleId, binId, userId }),
      })
        .then((res) => res.json())
        .then((data) => {
          setValidationMessage(data.message || 'Bottle added to bin');
        })
        .catch(() => setValidationMessage('Error validating Bottle QR Code.'))
        .finally(() => setLoading(false));
    } catch (error) {
      console.error('QR Parsing Error:', error);
      setValidationMessage('Invalid Bottle QR Code format.');
    }
  };

  if (hasPermission === null) return <Text>Requesting camera permission...</Text>;
  if (hasPermission === false) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buyer Dashboard</Text>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {validationMessage ? <Text style={styles.message}>{validationMessage}</Text> : null}

      {!scanning && (
        <Button
          title={scanBin ? 'Scan Bin QR Code' : 'Scan Bottle QR Code'}
          onPress={() => setScanning(true)}
        />
      )}

      {scanning && (
        <>
          <Camera
            ref={cameraRef}
            onBarCodeScanned={handleBarCodeScanned}
            barCodeScannerSettings={{ barCodeTypes: ['qr'] }}
            ratio="16:9"
          />
          <Button title="Cancel Scan" onPress={() => setScanning(false)} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  message: { textAlign: 'center', marginVertical: 10, color: 'green' },
  camera: {
    flex: 1,
    height: 400,
    borderRadius: 10,
    marginVertical: 20,
  },
});

export default BuyerDashboard;
