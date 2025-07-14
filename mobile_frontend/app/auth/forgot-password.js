import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  useTheme,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { colors } = useTheme();

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
    <LinearGradient colors={["#d4edda", "#a9dfbf", "#76c893"]} style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="headlineMedium" style={styles.header}>
                Forgot Password
              </Text>

              <Text style={styles.description}>
                Enter your email address below. We’ll send you a link to reset your password.
              </Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleForgotPassword}
                style={styles.button}
              >
                Send Reset Link
              </Button>

              <Button
                mode="text"
                onPress={() => router.replace("/auth/login")}
                style={{ marginTop: 10 }}
              >
                Back to Login
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 20,
    elevation: 8,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  description: {
    fontSize: 14,
    color: "#4f4f4f",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2e7d32",
  },
});


/*
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
*/