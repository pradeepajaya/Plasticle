import React from "react";
import { LogBox } from "react-native";
import AppNavigator from "../app/navigation/AppNavigator";


// Suppress the specific warning
LogBox.ignoreLogs(["props.pointerEvents is deprecated. Use style.pointerEvents"]);
// Enable verbose logging for warnings
LogBox.ignoreAllLogs(false); // Ensure warnings are not ignored
console.disableYellowBox = false; // Enable yellow box warnings

export default function App() {
  return <AppNavigator />;
}
