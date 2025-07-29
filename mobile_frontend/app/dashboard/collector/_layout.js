// app/dashboard/collector/_layout.js
/*import { Tabs } from 'expo-router';

export default function CollectorLayout() {
  return (
  <Tabs>
    <Tabs.Screen name="index" options={{ title: 'Home' }} />
    <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
  </Tabs>
  );
}*/

// without UI
/*import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function CollectorLayout() {
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
          else if (route.name === "calendar") iconName = focused ? "calendar" : "calendar-outline";

          return <Ionicons name={iconName} size={focused ? 26 : 22} color={color} />;
        },
        tabBarActiveTintColor: "#007AFF", // active (focused) color
        tabBarInactiveTintColor: "#888",   // inactive (blurred) color
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
    </Tabs>
  );
}*/

// with UI
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#043c11ff", // soft light green
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 10,
          height: Platform.OS === "ios" ? 80 : 65,
          paddingBottom: Platform.OS === "ios" ? 20 : 12,
          paddingTop: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "index") iconName = focused ? "leaf" : "leaf-outline";
          else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";
          //else if (route.name === "analytics") iconName = focused ? "analytics" : "analytics-outline";
          else if (route.name === "calendar") iconName = focused ? "calendar" : "calendar-outline";

          return (
            <Ionicons
              name={iconName}
              size={focused ? 26 : 22}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: "#31ed3aff", // rich green
        tabBarInactiveTintColor: "#87dd8dff", // soft green
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
