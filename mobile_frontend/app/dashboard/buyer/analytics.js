import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, ActivityIndicator, StyleSheet } from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

function groupBy(data, key) {
  const grouped = {};
  data.forEach((item) => {
    const groupKey = item[key];
    if (!grouped[groupKey]) grouped[groupKey] = 0;
    grouped[groupKey] += item.totalBottles;
  });
  return Object.entries(grouped).map(([label, totalBottles]) => ({
    label,
    value: totalBottles,
  }));
}

export default function StatsScreen() {
  const [rawStats, setRawStats] = useState([]);
  const [byProvinceData, setByProvinceData] = useState([]);
  const [byAgeGroupData, setByAgeGroupData] = useState([]);
  const [byManufacturerData, setByManufacturerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = `${process.env.EXPO_PUBLIC_API_URL}/stats/bottle-summary`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();

        setRawStats(data);

        setByProvinceData(groupBy(data, "province"));
        setByAgeGroupData(groupBy(data, "ageGroup"));
        setByManufacturerData(groupBy(data, "manufacturer"));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Convert grouped data for BarChart (labels and datasets)
  const prepareBarChartData = (data) => ({
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.value),
      },
    ],
  });

  // Prepare data for PieChart (array of objects with name, population, color)
  const preparePieChartData = (data) => {
    const colors = ["#4ade80", "#60a5fa", "#fbbf24", "#f87171", "#a78bfa", "#34d399"];
    return data.map((d, i) => ({
      name: d.label,
      population: d.value,
      color: colors[i % colors.length],
      legendFontColor: "#333",
      legendFontSize: 12,
    }));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text>Loading statistics...</Text>
      </View>
    );
  }

  if (!rawStats.length) {
    return (
      <View style={styles.center}>
        <Text>No statistics found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Bottle Collection Statistics</Text>

      {/* Province Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>By Province</Text>
        <BarChart
          data={prepareBarChartData(byProvinceData)}
          width={screenWidth - 40}
          height={250}
          yAxisLabel=""
          chartConfig={provinceChartConfig}
          verticalLabelRotation={30}
          style={styles.chart}
        />
      </View>

      {/* Age Group Pie Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>By Age Group</Text>
        <PieChart
          data={preparePieChartData(byAgeGroupData)}
          width={screenWidth - 40}
          height={220}
          chartConfig={pieChartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

      {/* Manufacturer Bar Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>By Manufacturer</Text>
        <BarChart
          data={prepareBarChartData(byManufacturerData)}
          width={screenWidth - 40}
          height={300}
          yAxisLabel=""
          chartConfig={manufacturerChartConfig}
          verticalLabelRotation={90}
          style={styles.chart}
          fromZero
        />
      </View>
    </ScrollView>
  );
}

const commonChartConfig = {
  decimalPlaces: 0, // show integers
  style: {
    borderRadius: 15,
  },
  propsForBackgroundLines: {
    strokeDasharray: "", // solid lines
    stroke: "#e3e3e3",
  },
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

// Province Bar Chart config (green)
const provinceChartConfig = {
  ...commonChartConfig,
  backgroundGradientFrom: "#a5d6a7",
  backgroundGradientTo: "#4caf50",
  color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`, // green bars
  fillShadowGradient: '#4ade80',
  fillShadowGradientOpacity: 1,
};

// Manufacturer Bar Chart config (yellow)
const manufacturerChartConfig = {
  ...commonChartConfig,
  backgroundGradientFrom: "#fef3c7",
  backgroundGradientTo: "#fbbf24",
  color: (opacity = 1) => `rgba(251, 191, 36, ${opacity})`, // yellow bars
  fillShadowGradient: '#fbbf24',
  fillShadowGradientOpacity: 1,
};

// Pie Chart config
const pieChartConfig = {
  backgroundGradientFrom: "#34d399",
  backgroundGradientTo: "#059669",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#388e3c",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  chartContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  chart: {
    borderRadius: 15,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
