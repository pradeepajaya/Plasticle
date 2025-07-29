// without UI
/*import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function ManufacturerLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "index") iconName = focused ? "home" : "home-outline";
          else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
          else if (route.name === "analytics") iconName = focused ? "bar-chart" : "bar-chart-outline";
          else if (route.name === "ManufacturerReportScreen") iconName = focused ? "document-text" : "document-text-outline";
        
          return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF", // active (focused) color
        tabBarInactiveTintColor: "#888",   // inactive (blurred) color
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="ManufacturerReportScreen" options={{ title: "Report" }} />
      
    </Tabs>
  );
}*/

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function ManufacturerLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#043111ff", // eco-friendly green
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          height: Platform.OS === "ios" ? 80 : 65,
          paddingBottom: Platform.OS === "ios" ? 20 : 12,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 10,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName;

          if (route.name === "index") iconName = focused ? "leaf" : "leaf-outline";
          else if (route.name === "analytics") iconName = focused ? "analytics" : "analytics-outline";
          else if (route.name === "ManufacturerReportScreen") iconName = focused ? "document-text" : "document-text-outline";
          else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";

          return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
        },
        tabBarActiveTintColor: "#21e92bff",    // forest green
        tabBarInactiveTintColor: "#A5D6A7",  // soft green
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
      <Tabs.Screen name="ManufacturerReportScreen" options={{ title: "Report" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
