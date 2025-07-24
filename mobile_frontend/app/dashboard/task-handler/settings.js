import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function TaskHandlerSettings() {
  const [bins, setBins] = useState([]);
  const [username, setUsername] = useState("");
  const [handlerId, setHandlerId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAssignedBins = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) throw new Error("No token found");

      const userRes = await axios.get(`${API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = userRes.data.user;
      setUsername(user.username);

      const handlerRes = await axios.get(`${API_URL}/taskhandlers/by-user/${user._id}`);
      const handler = handlerRes.data;
      setHandlerId(handler._id);

      const binsRes = await axios.get(`${API_URL}/taskhandlers/assigned-bins/${handler._id}`);
      setBins(binsRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      Alert.alert("Error", "Failed to load assigned bins.");
    } finally {
      setLoading(false);
    }
  };

  const handleCollectBin = async (binId) => {
    try {
      await axios.patch(`${API_URL}/taskhandlers/collect-bin/${binId}/${handlerId}`);
      Alert.alert("Success", "Bin marked as collected");
      fetchAssignedBins();
    } catch (err) {
      console.error("Collect error:", err);
      Alert.alert("Error", "Failed to collect bin.");
    }
  };

  useEffect(() => {
    fetchAssignedBins();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🌱 Hello, {username}!</Text>
        <TouchableOpacity onPress={fetchAssignedBins} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#2e7d32" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Your Assigned Bins</Text>

      {bins.length === 0 ? (
        <Text style={styles.noData}>🎉 All bins collected!</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContainer}
          data={bins}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <LinearGradient
              colors={["#e0f8e9", "#c5eccd"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.binCard}
            >
              <Text style={styles.binText}>
                🗑️ <Text style={styles.bold}>Bin ID:</Text> {item.binId}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      item.locationName || item.location
                    )}`
                  )
                }
              >
                <Text style={[styles.binText, styles.locationLink]}>
                  📍 <Text style={styles.bold}>Location:</Text>{" "}
                  {item.locationName || item.location}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.collectButton}
                onPress={() => handleCollectBin(item._id)}
              >
                <Text style={styles.collectText}>✅ Mark as Collected</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#e6f5ea",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e6f5ea",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#2f5d34",
  },
  refreshButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 30,
  },
  subHeader: {
    fontSize: 18,
    color: "#4b6043",
    marginBottom: 20,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 20,
  },
  binCard: {
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  binText: {
    fontSize: 16,
    color: "#2e4731",
    marginBottom: 6,
  },
  bold: {
    fontWeight: "600",
  },
  collectButton: {
    marginTop: 12,
    backgroundColor: "#2e7d32",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  collectText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  noData: {
    textAlign: "center",
    fontSize: 18,
    color: "#4b6043",
    marginTop: 50,
  },
  locationLink: {
    color: "#1e88e5",
    textDecorationLine: "underline",
  },
});
