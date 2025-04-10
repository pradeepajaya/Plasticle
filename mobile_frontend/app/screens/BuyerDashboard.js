import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import AsyncStorage from "@react-native-async-storage/async-storage";


const BuyerDashboard = () => {
  const [scanBin, setScanBin] = useState(true); // Step 1: Scan Bin QR first
  const [showScanButton, setShowScanButton] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [data, setData] = useState(null);
  const [binId, setBinId] = useState(null); // State to store binId
  const [userId, setUserId] = useState(null); // Replace with actual userId from login
  const [loading, setLoading] = useState(false); // Loading state
  const webcamRef = useRef(null);

  
useEffect(() => {
  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken"); // Retrieve token from storage
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
        setUserId(data.user._id); // Store the fetched userId in state
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
              validateBinQRCode(code.data); // Pass only binId
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
      const binId = JSON.parse(qrData).binId; // Extract binId from the full QR data
      console.log("Scanned Bin ID:", binId); // Log the binId for debugging

      setLoading(true); // Start loading
      fetch("http://localhost:5000/api/buyer/validate-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binId }), // Send only binId
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("API Response Data for Bin:", data); // Log API response
          if (data.message === "Bin is valid") {
            setValidationMessage("Bin QR Code validated successfully!");
            setBinId(binId); // Set binId in state
            setScanBin(false); // Move to bottle scanning
          } else {
            setValidationMessage(data.message);
          }
        })
        .catch(() => setValidationMessage("Error validating Bin QR Code."))
        .finally(() => setLoading(false)); // Stop loading
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      setValidationMessage("Invalid Bin QR Code format.");
      setLoading(false); // Stop loading
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
      const lines = qrData.split("\n"); // Split the QR data by newlines
      for (const line of lines) {
        if (line.includes("bottleId")) {
          bottleId = line.split(":")[1].trim().replace(/"/g, ""); // Extract and clean bottleId
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
  
    console.log("Extracted Bottle ID:", bottleId); // Log the extracted bottleId
  
    setLoading(true); // Start loading
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
      .finally(() => setLoading(false)); // Stop loading
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