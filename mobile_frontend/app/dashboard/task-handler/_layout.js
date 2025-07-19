// app/dashboard/task-handler/_layout.js
/*import { Tabs } from 'expo-router';

export default function TaskHandlerLayout() {
  return (
	<Tabs>
	  <Tabs.Screen name="index" options={{ title: 'Home' }} />
	  <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
	  <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
	</Tabs>
  );
}*/

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TaskHandlerLayout() {
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
    </Tabs>
  );
}