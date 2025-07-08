import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter(); //for navigation

  const handleForgotPassword = async () => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      Alert.alert("Success", "Password reset link sent to your email.");
      router.replace("/auth/login"); 
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter your email to reset password:</Text>
      <TextInput 
        value={email} 
        onChangeText={setEmail} 
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} 
        keyboardType="email-address" 
        autoCapitalize="none"
      />
      <Button title="Send Reset Link" onPress={handleForgotPassword} />
    </View>
  );
}
