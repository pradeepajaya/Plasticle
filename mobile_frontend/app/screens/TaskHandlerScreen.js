import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Webcam from "react-webcam";
import jsQR from "jsqr";

const TaskHandlerScreen = () => {
  // States for Generate Bin QR
  const [location, setLocation] = useState(""); // Location address
  const [capacity, setCapacity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null); // Store lat, lng of selected location
  const [qrCode, setQrCode] = useState(null);

  // States for Scan Bottle QR
  const [scanning, setScanning] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const [selectedOption, setSelectedOption] = useState(null); // Track selected option (generateBinQR or scanBottleQR)
  const webcamRef = useRef(null);

  // Google Maps API key
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
    setLocation(`${lat}, ${lng}`); // You can also use Google Places to get a readable address if needed
  };

  // Generate Bin QR Code
  const generateBinQR = async () => {
    if (!location || !capacity) {
      alert("Please enter location and capacity!");
      return;
    }

    const binId = generateBinId(); // Generate unique binId

    const response = await fetch("http://localhost:5000/api/bins/createBin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ binId, location, capacity }),
    });

    const data = await response.json();
    if (data.qrCodeImage) {
      setQrCode(data.qrCodeImage);
    } else {
      alert("Error generating QR code.");
    }
  };

  // Download QR code image
  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = "bin-qr-code.png"; // You can customize the name of the file
    link.click();
  };

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
            validateBottleQRCode(code.data); // Validate the scanned bottle QR code
            setScanning(false);
          }
        };
      }
    }
  };

  // Validate Bottle QR Code and update backend
  const validateBottleQRCode = async (qrData) => {
    try {
      console.log("Raw QR Data:", qrData); // Log the QR data before processing

      let bottleId, manufacturerId;

      // Check if the QR data is a JSON string
      if (qrData.startsWith("{") && qrData.endsWith("}")) {
        try {
          const parsedData = JSON.parse(qrData); // Parse QR data
          bottleId = parsedData.bottleId; // Extract bottleId from JSON
          manufacturerId = parsedData.manufacturerId; // Extract manufacturerId from JSON
        } catch (error) {
          console.error("Error parsing QR code as JSON:", error);
          throw new Error("Invalid QR code format. Expected JSON.");
        }
      } else if (qrData.includes("bottleId") && qrData.includes("manufacturerId")) {
        // Handle key-value pair format (e.g., "bottleId : 'value', manufacturerId : 'value'")
        const bottleIdMatch = qrData.match(/bottleId\s*:\s*"([^"]+)"/);
        const manufacturerIdMatch = qrData.match(/manufacturerId\s*:\s*"([^"]+)"/);

        if (bottleIdMatch && manufacturerIdMatch) {
          bottleId = bottleIdMatch[1].trim(); // Extract bottleId
          manufacturerId = manufacturerIdMatch[1].trim(); // Extract manufacturerId
        } else {
          throw new Error("Invalid QR code format. Could not extract bottleId or manufacturerId.");
        }
      } else {
        // If QR data is not JSON or key-value pairs, assume it contains bottleId and manufacturerId separated by a delimiter (e.g., "|")
        const parts = qrData.split("|");
        if (parts.length === 2) {
          bottleId = parts[0]?.trim(); // Extract and trim bottleId
          manufacturerId = parts[1]?.trim(); // Extract and trim manufacturerId
        } else {
          throw new Error("Invalid QR code format. Expected 'bottleId|manufacturerId'.");
        }
      }

      // Validate extracted data
      if (!bottleId || !manufacturerId) {
        throw new Error("bottleId and manufacturerId are required.");
      }

      console.log("Sending Bottle ID and Manufacturer ID to backend:", { bottleId, manufacturerId });

      setLoading(true); // Start loading
      const response = await fetch("http://localhost:5000/api/task-handler/recycle-bottle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bottleId, manufacturerId }), // Send bottleId and manufacturerId to backend
      });

      if (!response.ok) {
        const errorText = await response.text(); // Log the full response as text
        console.error("Backend Error Response:", errorText);
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      console.log("API Response for Bottle Recycling:", data);

      if (data.message === "Bottle already recycled") {
        setValidationMessage("Bottle already recycled");
      } else {
        setValidationMessage("Bottle added to recycling process!");
      }
    } catch (error) {
      console.error("Error recycling bottle:", error);
      setValidationMessage(`Error recycling bottle: ${error.message}`);
    } finally {
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
    <div style={{ padding: "20px", maxHeight: "100vh", overflowY: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Task Handler</h2>

      {/* Display options if no option is selected */}
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

      {/* Generate Bin QR Section */}
      {selectedOption === "generateBinQR" && (
        <div>
          {/* Google Map with click to select location */}
          <LoadScript googleMapsApiKey={googleMapsApiKey}>
            <GoogleMap
              id="location-picker-map"
              mapContainerStyle={{ width: "100%", height: "400px", marginBottom: "20px" }}
              center={{ lat: 6.9271, lng: 79.8612 }} // Default center (e.g., Colombo)
              zoom={12}
              onClick={onMapClick}
            >
              {selectedLocation && (
                <Marker
                  position={selectedLocation}
                  label="Selected Location"
                />
              )}
            </GoogleMap>
          </LoadScript>

          {/* Input field for location */}
          <div style={{ marginBottom: "15px" }}>
            <input
              type="text"
              placeholder="Selected Location (Lat, Lng)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            />
          </div>

          {/* Input for capacity */}
          <div style={{ marginBottom: "15px" }}>
            <input
              type="number"
              placeholder="Enter bin capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "16px" }}
            />
          </div>

          {/* Generate QR Button */}
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

          {/* QR Code Display */}
          {qrCode && (
            <div style={{ textAlign: "center" }}>
              <h3>Bin QR Code:</h3>
              <img src={qrCode} alt="Bin QR Code" style={{ width: "150px", height: "150px" }} />
              {/* Download Button */}
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

      {/* Scan Bottle QR Section */}
      {selectedOption === "scanBottleQR" && (
        <div style={{ textAlign: "center" }}>
          <h3>Scan Bottle QR</h3>
          {!scanning && (
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
          )}

          {scanning && (
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
