import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
//const API_URL = "http://localhost:5000/api"; 
const API_URL = "http://10.10.21.99:5000/api";


const LoginScreen = () => {
  const navigation = useNavigation();
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
        navigation.replace("BuyerDashboard");
      } else if (user.role === "collector") {
        navigation.replace("CollectorDashboard");
      } else if (user.role === "manufacturer") {
        navigation.replace("ManufacturerDashboard");
      } else if(user.role==="taskhandler"){
        navigation.replace("TaskHandlerScreen")
      }
      else {
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
      <Button title="Register" onPress={() => navigation.navigate("Register")} />
      <Button title="Forgot Password?" onPress={() => navigation.navigate("ForgotPassword")} />
    </View>
  );
};

export default LoginScreen;