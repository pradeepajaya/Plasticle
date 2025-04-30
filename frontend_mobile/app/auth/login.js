import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { API_URL } from '@env';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

//nst API_URL = process.env.API_mobilefrontend_URL;

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { user, token } = response.data;

      if (!user || !user.role) {
        Alert.alert("Login failed", "User role not found.");
        return;
      }

      // Save token to AsyncStorage
      await AsyncStorage.setItem("userToken", token);

      // Navigate based on user role
      if (user.role === "buyer") {
        router.replace("/dashboard/buyer");
      } else if (user.role === "collector") {
        router.replace("/dashboard/collector");
      } else if (user.role === "manufacturer") {
        router.replace("/dashboard/manufacturer");
      } else if (user.role === "taskhandler") {
        router.replace("/dashboard/task-handler");
      } else {
        Alert.alert("Login failed", "Invalid user role.");
      }
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      Alert.alert("Login Error", error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Text>Password:</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />

      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push( "/auth/register")}/>
      <Button title="Forgot Password?" onPress={() => router.push("/auth/forgot-password")}/>
    </View>
  );
};

export default LoginScreen;
