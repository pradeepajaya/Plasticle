import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  SafeAreaView
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { styles } from './index.styles';
import socket from "../../utils/socket";


// const CustomAlert = ({ show, onClose, location }) => {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//       <div className="bg-white rounded-lg shadow-2xl max-w-sm mx-4 overflow-hidden border-l-4 border-green-500">
//         <div className="p-6">
//           <div className="flex items-center mb-4">
//             <div className="bg-green-100 rounded-full p-2 mr-3">
//               <CheckCircle className="w-6 h-6 text-green-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-gray-900">Bin Assigned</h3>
//             <button
//               onClick={onClose}
//               className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           <div className="mb-6">
//             <p className="text-gray-700 leading-relaxed">
//               <span className="font-medium text-green-700">{location}?{location}:"A bin"</span> has been assigned to you.
//             </p>
//             <p className="text-gray-600 mt-1">
//               Please check calendar for more details...
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//           >
//             Okay
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };






const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CollectorDashboard() {
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
  const [assignedBin, setAssignedBin] = useState(null);
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

  const toggleAvailability = async () => {
    const newStatus = !activePersonal;
    setActivePersonal(newStatus);
    setValidationMessage(`You are now ${newStatus ? "available" : "unavailable"}`);
    setTimeout(() => setValidationMessage(""), 3000);

    try {
      const response = await fetch(`${API_URL}/collector/toggle-availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, activePersonal: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      console.log("Availability status updated:", data.message);
    } catch (error) {
      console.error("Error updating availability:", error);
      setValidationMessage(`Error: ${error.message}`);
      setTimeout(() => setValidationMessage(""), 3000);
    }

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

  const handleAcceptAssignment = () => {
    setValidationMessage("Bin assignment accepted.");
    setAssignedBin(null); // Close popup
    setTimeout(() => setValidationMessage(""), 3000);
  };

  const handleRejectAssignment = () => {
    if (!assignedBin || !userId) return;

    socket.emit("bin-rejected", {
      userId,
      binId: assignedBin.binId,
    });

    setValidationMessage("Bin assignment rejected.");
    setAssignedBin(null); // Close popup
    setTimeout(() => setValidationMessage(""), 3000);
  };

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
            {`${assignData.location?assignData.location:"A bin"} has been assigned to you.\nPlease check calendar for more...`}
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsCameraVisible(false)}
            >
              <Ionicons name="arrow-back" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.flipButton}
              onPress={() => setFacing(current => (current === 'back' ? 'front' : 'back'))}
            >
              <Ionicons name="camera-reverse" size={30} color="white" />
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

      {assignedBin && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999
        }}>
          <View style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 10,
            width: "80%",
            alignItems: "center",
          }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              New Bin Assigned, Continue Collection
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#4CAF50",
                  padding: 10,
                  marginRight: 5,
                  borderRadius: 5,
                  alignItems: "center"
                }}
                onPress={handleAcceptAssignment}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#FF3B30",
                  padding: 10,
                  marginLeft: 5,
                  borderRadius: 5,
                  alignItems: "center"
                }}
                onPress={handleRejectAssignment}
              >
                <Text style={{ color: "white", fontWeight: "bold" }}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}