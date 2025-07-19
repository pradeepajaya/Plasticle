import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Index() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {  
    const checkTokenAndRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken"); 

        if (token) {
          // Call backend to get user role
          const res = await fetch(`${API_URL}/auth/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await res.json(); 

          if (res.ok && data.user?.role) {
            const role = data.user.role;
            if (role === "buyer") router.replace("/dashboard/buyer");
            else if (role === "collector") router.replace("/dashboard/collector");
            else if (role === "manufacturer") router.replace("/dashboard/manufacturer");
            else if (role === "taskhandler") router.replace("/dashboard/task-handler");
            else {
              await AsyncStorage.removeItem("userToken");
              router.replace("/auth/login");
            }
          } else {
            await AsyncStorage.removeItem("userToken");
            router.replace("/auth/login");
          }
        } else {
          router.replace("/auth/login");
        }
      } catch (err) {
        console.error("Startup auth check error:", err);
        Alert.alert("Error", "Something went wrong. Redirecting to login.");
        router.replace("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkTokenAndRedirect();
 } , []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}



/*import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsReady(true);
    }, 100); // small delay to ensure layout mounts

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isReady) {
      router.replace("/auth/login");
    }
  }, [isReady]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
*/
   
