import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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

    // oauth works fine but cannot test using expo go app , want to use dev build android Emulator 
/*
import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Modal, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { user, token } = response.data;
      await AsyncStorage.setItem("userToken", token);
      redirectUser(user.role);
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      Alert.alert("Login Error", error.response?.data?.message || "Invalid credentials");
    }
  };

  const redirectUser = (role) => {
    if (role === "buyer") router.replace("/dashboard/buyer");
    else if (role === "collector") router.replace("/dashboard/collector");
    else if (role === "manufacturer") router.replace("/dashboard/manufacturer");
    else if (role === "taskhandler") router.replace("/dashboard/task-handler");
    else Alert.alert("Login failed", "Invalid user role.");
  };

  const handleGoogleSignIn = async () => {
    setModalVisible(true); // Ask for role first
  };

const proceedWithGoogle = async (selectedRole) => {
  setModalVisible(false);
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    const { name, email } = response.data.user;
    console.log("Google User Data:", { name, email, selectedRole });
    const res = await axios.post(`${API_URL}/auth/google`, {
      name,
      email,
      role: selectedRole,
    });

    const { token, user: backendUser } = res.data;
    await AsyncStorage.setItem("userToken", token);
    redirectUser(backendUser.role);
  } catch (error) {
    console.error("Google OAuth Error:", error.response?.data || error.message);
    Alert.alert("OAuth Login Failed", error.response?.data?.message || "Try again");
  }
};


  return (
    <View style={{ padding: 20 }}>
      <Text>Email:</Text>
      <TextInput value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />
      <Text>Password:</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} />

      <Button title="Login" onPress={handleLogin} />
      <Button title="Register" onPress={() => router.push("/auth/register")} />
      <Button title="Forgot Password?" onPress={() => router.push("/auth/forgot-password")} />

      <View style={{ marginVertical: 20, alignItems: 'center' }}>
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
        />
      </View>

      {/* Role Selection Modal *//*}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000000aa", justifyContent: "center", alignItems: "center" }}>
          <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Select Your Role</Text>
            {["buyer", "collector", "manufacturer"].map((r) => (
              <TouchableOpacity key={r} onPress={() => proceedWithGoogle(r)} style={{ padding: 10 }}>
                <Text style={{ fontSize: 16 }}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};
export default LoginScreen;
*/