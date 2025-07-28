import { Stack } from "expo-router";
import { Provider as PaperProvider } from "react-native-paper";

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="landing"  // Start with landing page first
      >
        <Stack.Screen name="landing" />
        <Stack.Screen name="index" />
        {/* add other screens or tabs if needed */}
      </Stack>
    </PaperProvider>
  );
}
