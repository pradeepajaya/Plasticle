/*import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function BuyerLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
        tabBarIcon: ({ focused, color }) => {
  let iconName;
  if (route.name === "home") iconName = focused ? "home" : "home-outline";
  else if (route.name === "index") iconName = focused ? "camera" : "camera-outline";
  else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
  else if (route.name === "analytics") iconName = focused ? "bar-chart" : "bar-chart-outline";
  else if (route.name === "leaderboard/index") iconName = focused ? "trophy" : "trophy-outline";

  return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
}
,
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#888",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="index" options={{ title: "Scan" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="leaderboard/index" options={{ title: "Leaderboard" }} />
    </Tabs>
  );
}
*/

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function BuyerLayout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#094c1cff", // soft light green background
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 80 : 65,
          paddingBottom: Platform.OS === "ios" ? 20 : 12,
          paddingTop: 10,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 5,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "home") iconName = focused ? "leaf" : "leaf-outline"; // Changed to eco icon
          else if (route.name === "index") iconName = focused ? "scan-circle" : "scan-circle-outline";
          else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
          else if (route.name === "analytics") iconName = focused ? "bar-chart" : "bar-chart-outline";
          else if (route.name === "leaderboard/index") iconName = focused ? "trophy" : "trophy-outline";

          return <Ionicons name={iconName} size={focused ? 28 : 22} color={color} />;
        },
        tabBarActiveTintColor: "#0fd153ff", // Deep green
        tabBarInactiveTintColor: "#87dce1ff", // Muted gray-blue
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="index" options={{ title: "Scan" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="leaderboard/index" options={{ title: "Leaderboard" }} />
    </Tabs>
  );
}
