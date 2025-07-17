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


import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

const GREEN = "#22c55e"; // Customize your green shade if needed

export default function CollectorLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: GREEN,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 80 : 60,
          paddingBottom: Platform.OS === "ios" ? 20 : 10,
        },
        tabBarContentContainerStyle: {
          justifyContent: 'space-around', // Distribute tabs evenly
          alignItems: 'center',
        },
        tabBarItemStyle: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarIcon: ({ focused }) => {
          let iconName;
          let iconColor = focused ? "#fff" : "#14532d"; // White for active, dark green for inactive

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else if (route.name === "analytics") {
            iconName = focused ? "bar-chart" : "bar-chart-outline";
          }

          return <Ionicons name={iconName} size={focused ? 26 : 22} color={iconColor} />;
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#14532d",
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics" }} />
    </Tabs>
  );
}
