
     //without UI
// app/dashboard/buyer/_layout.js
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
          return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
        },
        tabBarActiveTintColor: "#10B981",
        tabBarInactiveTintColor: "#888",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="index" options={{ title: "Scan" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
    </Tabs>
  );
}*/

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
          backgroundColor: "#094329ff", // eco light green
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

          if (route.name === "home") iconName = focused ? "leaf" : "leaf-outline";
          else if (route.name === "index") iconName = focused ? "camera" : "camera-outline";
          else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
          else if (route.name === "analytics") iconName = focused ? "bar-chart" : "bar-chart-outline";

          return (
            <Ionicons
              name={iconName}
              size={focused ? 26 : 22}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#13ef1eff",    // Forest Green
        tabBarInactiveTintColor: "#A5D6A7",  // Pale Leaf Green
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" options={{ title: "EcoHome" }} />
      <Tabs.Screen name="index" options={{ title: "Scan" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Insights" }} />
    </Tabs>
  );
}


