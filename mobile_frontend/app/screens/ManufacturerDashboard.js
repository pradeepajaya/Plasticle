/*export default function ManufacturerDashboard() {
    return (
      <View style={{ padding: 20 }}>
        <Text>Welcome Manufacturer</Text>
      </View>
    );
  }
  */
/*
import React, { useState, useEffect } from "react";
import { View, Button, ScrollView, TextInput, Alert, StyleSheet, Text, ActivityIndicator } from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5000/api"; // Replace with your backend IP

const ManufacturerDashboard = () => {
  const [count, setCount] = useState(1);
  const [qrCodes, setQRCodes] = useState([]);
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

        // Fetch user details from backend using token
        const response = await fetch(`${API_URL}/auth/user`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserId(data.user._id); // Set user ID from backend response
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

  const generateQRCodes = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/manufacturer/generate-qr`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ manufacturerId: userId, count }),
      });

      const data = await response.json();
      if (response.ok) {
        setQRCodes(data.bottles);
      } else {
        Alert.alert("Error", data.error || "Failed to generate QR codes");
      }
    } catch (error) {
      console.error("QR Code Generation Error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the number of QR Codes:</Text>

      <TextInput
        placeholder="Enter Count"
        keyboardType="numeric"
        value={count.toString()}
        onChangeText={(text) => setCount(text ? parseInt(text, 10) : 0)}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Generate QR Codes" onPress={generateQRCodes} />
      )}

      <ScrollView>
        {qrCodes.map((qr, index) => (
          <View key={index} style={styles.qrContainer}>
            <QRCode value={qr.bottleId} size={200} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  qrContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
});

export default ManufacturerDashboard;*/
 
import React, { useState, useEffect } from "react";
import { 
  View, Button, ScrollView, TextInput, Alert, 
  StyleSheet, Text, ActivityIndicator 
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5000/api"; // Replace with actual backend IP

const ManufacturerDashboard = () => {
  const [count, setCount] = useState(1);
  const [qrCodes, setQRCodes] = useState([]);
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

        const response = await fetch(`${API_URL}/auth/user`, {
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

  const generateQRCodes = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found. Please log in again.");
      return;
    }

    if (!count || count <= 0) {
      Alert.alert("Error", "Please enter a valid number of QR codes.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/manufacturer/generate-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manufacturerId: userId, count }),
      });

      const data = await response.json();
      if (response.ok) {
        setQRCodes(data.bottles);
      } else {
        Alert.alert("Error", data.error || "Failed to generate QR codes");
      }
    } catch (error) {
      console.error("QR Code Generation Error:", error);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter the number of QR Codes:</Text>

      <TextInput
        placeholder="Enter Count"
        keyboardType="numeric"
        value={count.toString()}
        onChangeText={(text) => setCount(isNaN(parseInt(text, 10)) ? "" : parseInt(text, 10))}
        style={styles.input}
      />

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <Button title="Generate QR Codes" onPress={generateQRCodes} />
      )}

      <ScrollView>
        {qrCodes.map((qr, index) => (
          <View key={index} style={styles.qrContainer}>
            {qr.bottleId && <QRCode value={qr.bottleId} size={200} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "flex-start",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
  qrContainer: {
    marginVertical: 10,
    alignItems: "center",
  },
});

export default ManufacturerDashboard;

