import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, Modal, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
//import { CheckBox } from "react-native";  // No need to install anything extra
//import CheckBox from "@react-native-community/checkbox"; // Install if not installed
import axios from "axios";
import { Checkbox } from 'react-native-paper';
//import { API_URL } from '@env';
import{ useRouter} from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;
//const API_URL = "http://192.168.65.221:5000/api";
//nst API_URL = process.env.API_mobilefrontend_URL;

//const API_URL = "http:// 192.168.50.38:5000/api"; // Replace with your backend IP

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
      router.replace("/auth/login"); // ✅ use router instead of navigation
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


              {/* ✅ Paper Checkbox Implementation */}
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

      

      

      {/* Privacy Policy Modal */}
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


