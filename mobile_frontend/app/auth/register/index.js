/*import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Modal, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { Checkbox } from 'react-native-paper';
import{ useRouter} from "expo-router";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const privacyPolicies = {
  buyer: "Buyer Privacy Policy: You agree to share personal information for transactions.",
  collector: "Collector Privacy Policy: You agree to handle collected materials responsibly.",
  manufacturer: "Manufacturer Privacy Policy: You must ensure compliance with regulations."
};

export default function RegisterScreen(){

 const router = useRouter();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "buyer" });
  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRegister = async () => {
    if (!isChecked) {
      Alert.alert("Error", "You must accept the Privacy Policy to continue.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      Alert.alert(response.data.message);
      router.replace("/auth/login"); //use router instead of navigation
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      Alert.alert( error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Username:</Text>
      <TextInput 
        value={formData.username} 
        onChangeText={(text) => setFormData({ ...formData, username: text })} 
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} 
      />
      
      <Text>Email:</Text>
      <TextInput 
        value={formData.email} 
        onChangeText={(text) => setFormData({ ...formData, email: text })} 
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} 
      />
      
      <Text>Password:</Text>
      <TextInput 
        secureTextEntry 
        value={formData.password} 
        onChangeText={(text) => setFormData({ ...formData, password: text })} 
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }} 
      />

      <Text>Role:</Text>
      <Picker
        selectedValue={formData.role}
        onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
        style={{ borderWidth: 1, marginBottom: 10 }}
      >
        <Picker.Item label="Consumer" value="buyer" />
        <Picker.Item label="Collector" value="collector" />
        <Picker.Item label="Manufacturer" value="manufacturer" />
      </Picker>


              {/*Paper Checkbox Implementation *//*}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Checkbox
          status={isChecked ? "checked" : "unchecked"}
          onPress={() => setIsChecked(!isChecked)}
        />
        <Text onPress={() => setModalVisible(true)} style={{ color: "blue", marginLeft: 8 }}>
          Accept Privacy Policy
        </Text>
      </View> 

      <Button title="Register" onPress={handleRegister} disabled={!isChecked} />

      

      

      {/* Privacy Policy Modal *//*}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}>
            <ScrollView>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Privacy Policy</Text>
              <Text>{privacyPolicies[formData.role]}</Text>
            </ScrollView>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};
*/
import React, { useState } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput, Button, Modal, Portal, Checkbox, ProgressBar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import axios from "axios";
import styles from "./styles";




const API_URL = process.env.EXPO_PUBLIC_API_URL;

const passwordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score / 4; // normalize to 0-1 for ProgressBar
};


const privacyPolicies = {
  buyer: "Buyer Privacy Policy: You agree to share personal information for transactions.",
  collector: "Collector Privacy Policy: You agree to handle collected materials responsibly.",
  manufacturer: "Manufacturer Privacy Policy: You must ensure compliance with regulations.",
};

export default function RegisterScreen() {
  const router = useRouter();
  

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });

  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleRegister = async () => {
    if (!isChecked) {
      Alert.alert("Error", "You must accept the Privacy Policy to continue.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      Alert.alert(response.data.message);
      router.replace("/auth/login");
    } catch (error) {
      //console.error("Registration Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Registration failed");
    }
  };

  const passwordScore = passwordStrength(formData.password);
  
  return (
    <LinearGradient colors={["#cde9b8", "#a3d977", "#76b852"]} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text variant="headlineMedium" style={styles.header}>
              Register
            </Text>

            <TextInput
              label="Username"
              value={formData.username}
              onChangeText={(text) => setFormData({ ...formData, username: text })}
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 20 }} // ← this makes it rounded
            />

            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 20 }}
            />

            <TextInput
              label="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 20 }}
            />

            <TextInput
              label="Confirm Password"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              style={styles.input}
              mode="outlined"
              theme={{ roundness: 20 }}
            />

            <Text style={{ marginBottom: 5 }}  >Register Me As </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
              >
                <Picker.Item label="Consumer" value="buyer" />
                <Picker.Item label="Collector" value="collector" />
                <Picker.Item label="Manufacturer" value="manufacturer" />
              </Picker>
            </View>

            <View style={styles.checkboxRow}>
              <Checkbox
                status={isChecked ? "checked" : "unchecked"}
                onPress={() => setIsChecked(!isChecked)}
              />
              <Text onPress={() => setModalVisible(true)} style={styles.privacyText}>
                Accept Privacy Policy
              </Text>
            </View>

            {formData.password.length > 0 && (
        <View style={{ marginBottom: 10 }}>
          <ProgressBar progress={passwordScore} color={
            passwordScore < 0.3 ? 'red' :
            passwordScore < 0.6 ? 'orange' :
            'green'
          } />
          <Text style={{ fontSize: 12, color: "#555" }}>
            Strength: {["Weak", "Moderate", "Strong", "Very Strong"][Math.floor(passwordScore * 4)]}
          </Text>
        </View>
      )}

            <Button
              mode="contained"
              onPress={handleRegister}
              disabled={!isChecked}
              style={styles.registerButton}>Register</Button>

            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={styles.loginLink}>
                Already have an account? <Text style={{ textDecorationLine: "underline", color:"#4CAF50"}} >Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Privacy Policy Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text variant="titleMedium" style={{ marginBottom: 10 }}>Privacy Policy</Text>
            <Text style={{color:"#4CAF50"}}>{privacyPolicies[formData.role]}</Text>
            <Button mode="outlined" onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              Close
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </LinearGradient>
  );
}

