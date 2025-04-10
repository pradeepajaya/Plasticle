import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CollectorDashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [binId, setBinId] = useState(null); // State to store binId
  const [userId, setUserId] = useState(null); // Store logged-in userId
  const [loading, setLoading] = useState(false); // Loading state
  const webcamRef = useRef(null);

  // Fetch user ID from AsyncStorage after login
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          alert("User token not found. Please log in again.");
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
          alert(data.error || "Failed to fetch user details");
        }
      } catch (error) {
        console.error("Fetch User ID Error:", error);
        alert("Something went wrong while fetching user details");
      }
    };

    fetchUserId();
  }, []);

  // Function to start scanning
  const startScanning = () => {
    setScanning(true);
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
            setBinId(code.data); // Extract binId from QR code
            validateBinQRCode(code.data); // Validate the scanned binId
            setScanning(false);
          }
        };
      }
    }
  };

  // Validate Bin QR Code and update backend
  const validateBinQRCode = (qrData) => {
    try {
      console.log("Raw QR Data:", qrData); // Log the QR data before processing

      let binId;
      // Check if the QR data is a JSON string
      if (qrData.startsWith("{") && qrData.endsWith("}")) {
        const parsedData = JSON.parse(qrData); // Parse QR data
        binId = parsedData.binId; // Extract binId from JSON
      } else {
        binId = qrData; // Use the QR data directly as binId
      }

      console.log("Sending Bin ID to backend:", binId); // Log binId

      setLoading(true); // Start loading
      fetch("http://localhost:5000/api/collector/validate-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ binId, userId }), // Send binId and userId
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(`Server error: ${text}`);
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("API Response for Bin Collection:", data);
          if (data.message === "Bin successfully collected") {
            setValidationMessage("Bin successfully collected!");
          } else {
            setValidationMessage(data.message || "Error collecting bin.");
          }
        })
        .catch((error) => {
          console.error("Error validating Bin QR Code:", error);
          setValidationMessage(`Error validating Bin QR Code: ${error.message}`);
        })
        .finally(() => setLoading(false)); // Stop loading
    } catch (error) {
      console.error("Error parsing QR code data:", error);
      setValidationMessage("Invalid Bin QR Code format.");
      setLoading(false); // Stop loading
    }
  };

  // Start/stop scanning when scanning state changes
  useEffect(() => {
    let intervalId;
    if (scanning) {
      intervalId = setInterval(scanQRCode, 1000); // Scan every 1 second
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [scanning]);

  return (
    <div style={{ textAlign: "center", overflowY: "auto", maxHeight: "80vh" }}>
      <h1>Collector Dashboard</h1>

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

      {!scanning && (
        <button onClick={startScanning} style={{ marginTop: "20px" }}>
          Scan Bin QR
        </button>
      )}

      {scanning && (
        <button onClick={() => setScanning(false)} style={{ marginTop: "20px" }}>
          Stop Scanning
        </button>
      )}
    </div>
  );
};

export default CollectorDashboard;