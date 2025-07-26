import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient"; 

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const screenWidth = Dimensions.get("window").width;

const ManufacturerReportScreen = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          Alert.alert("Error", "User token not found. Please log in again.");
          setLoading(false);
          return;
        }

        const currentYear = new Date().getFullYear();

        const response = await fetch(
          `${API_URL}/manufacturer/monthly-report/${currentYear}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const responseText = await response.text();
        console.log("Raw response:", responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (err) {
          console.error("JSON parse error:", err);
          Alert.alert("Error", "Invalid server response");
          setLoading(false);
          return;
        }

        if (response.ok && data.success) {
          setReport(data);
        } else {
          Alert.alert("Error", data.message || "Failed to fetch report");
        }
      } catch (error) {
        console.error("Fetch report error:", error);
        Alert.alert("Error", "Something went wrong while fetching the report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        style={styles.loading}
        color="#2e7d32"
      />
    );
  }

  if (!report) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>No report data available.</Text>
      </View>
    );
  }

  const months = Object.keys(report.monthlyReport);
  const productionData = months.map(
    (month) => report.monthlyReport[month].produced
  );
  const recycledData = months.map(
    (month) => report.monthlyReport[month].recycled
  );

  return (
     <LinearGradient
      colors={["#ffffffff", "#155020ff"]}  
      style={styles.gradientContainer}
    >

    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Manufacturer Report - {report.year}</Text>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Total Bottles Produced: {report.totalProduced}
        </Text>
        <Text style={styles.summaryText}>
          Total Bottles Recycled: {report.totalRecycled}
        </Text>
        <Text style={styles.summaryText}>
          Recycling Rate: {report.recycleRate}
        </Text>
      </View>

      <Text style={styles.chartLabel}>Production vs Recycling Trend</Text>
      <LineChart
        data={{
          labels: months.map((m) => m.slice(5)), // "MM" only
          datasets: [
            {
              data: productionData,
              color: () => "rgba(245, 183, 12, 1)", 
              strokeWidth: 2,
              label: "Produced",
            },
            {
              data: recycledData,
              color: () => "rgba(25, 116, 31, 1)", // darker green
              strokeWidth: 2,
              label: "Recycled",
            },
          ],
          legend: ["Produced", "Recycled"],
        }}
        width={screenWidth - 20}
        height={280}
        chartConfig={{
          backgroundColor: "#ffffffff",
          backgroundGradientFrom: "#ffffffff",
          backgroundGradientTo: "#ffffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          labelColor: () => "#333",
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "3",
            strokeWidth: "2",
            stroke: "#2e7d32",
          },
        }}
        style={[styles.chart, { alignSelf: 'center' }]}
        bezier
      />

      <Text style={styles.tipsHeader}>Suggestions to Improve:</Text>
      {report.suggestions && report.suggestions.length > 0 ? (
        report.suggestions.map((tip, index) => (
          <Text key={index} style={styles.tipItem}>
            • {tip}
          </Text>
        ))
      ) : (
        <Text style={styles.tipItem}>No suggestions available.</Text>
      )}
    </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
   gradientContainer: {
    flex: 1,
  },
  container: {
    padding: 15,
    paddingBottom: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: 30,
    color: "#2e7d32",
    textAlign: "center",
  },
  summary: {
    backgroundColor: "#b3f3b5ff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: "600",
    color: "#1b5e20",
  },
  chartLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#2a572cff",
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
    marginBottom: 20,
  },
  tipsHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f1f1f1ff",
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 15,
    marginBottom: 6,
    paddingLeft: 10,
    color: "#eaf5e5ff",
  },
});

export default ManufacturerReportScreen;