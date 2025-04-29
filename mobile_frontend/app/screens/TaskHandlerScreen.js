import React, { useState, useRef, useEffect } from "react";
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