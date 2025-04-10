import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import axios from "axios";


const API_URL = "http://localhost:5000/api"; // Replace with your backend URL

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      Alert.alert("Success", "Password reset link sent to your email.");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Enter your email to reset password:</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Button title="Send Reset Link" onPress={handleForgotPassword} />
    </View>
  );
};

export default ForgotPasswordScreen;
