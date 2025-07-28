// app/dashboard/buyer/leaderboard/index.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("Fetching leaderboard from:", `${process.env.EXPO_PUBLIC_API_URL}/api/buyer/leaderboard`);
  axios.get(`${process.env.EXPO_PUBLIC_API_URL}/buyer/leaderboard`)
    .then(res => setLeaderboard(res.data))
    .catch(err => console.error("Leaderboard fetch error:", err))
    .finally(() => setLoading(false));
}, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.rank}>{item.rank}</Text>
      <View style={styles.info}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.province}>{item.province}</Text>
      </View>
      <Text style={styles.score}>{item.totalBottlesCollected} 🧴</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Collectors 🏆</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#10B981" />
      ) : (
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#388e3c",  // change this to the same green as analytics screen
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center",
    color: "white",  // add white color for text to be readable on green
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  rank: { fontSize: 18, fontWeight: "bold", width: 30, textAlign: "center" },
  info: { flex: 1, paddingLeft: 10 },
  username: { fontSize: 16, fontWeight: "bold" },
  province: { fontSize: 14, color: "#666" },
  score: { fontSize: 16, fontWeight: "bold", color: "#10B981" },
});
