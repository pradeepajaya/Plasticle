import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Replace with your backend IP

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "buyer" });

  const handleRegister = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      Alert.alert("Success", "Registration completed");
      navigation.replace("Login");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Username:</Text>
      <TextInput value={formData.username} onChangeText={(text) => setFormData({ ...formData, username: text })} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Text>Email:</Text>
      <TextInput value={formData.email} onChangeText={(text) => setFormData({ ...formData, email: text })} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Text>Password:</Text>
      <TextInput secureTextEntry value={formData.password} onChangeText={(text) => setFormData({ ...formData, password: text })} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Text>Role:</Text>
      <TextInput value={formData.role} onChangeText={(text) => setFormData({ ...formData, role: text })} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Button title="Register" onPress={handleRegister} />
    </View>
  );
};

export default RegisterScreen;