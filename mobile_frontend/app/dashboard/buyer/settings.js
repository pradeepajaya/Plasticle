// inside Settings.js
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from "expo-router";


const router = useRouter();

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Settings() {
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    nickname: '',
    dateOfBirth: '',
    gender: '',
    hometown: '',
  });

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(`${API_URL}/buyer/update-profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert("Success", "Profile updated!");
      setModalVisible(false);
    } catch (error) {
      console.error("Update error", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };


  const handleDeleteAccount = () => {
  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete your account? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`${API_URL}/auth/delete-account`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            await AsyncStorage.removeItem("userToken");
            router.replace("/auth/login");
          } catch (err) {
            console.error("Delete account error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete account");
          }
        },
      },
    ]
  );
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Buyer Settings Page</Text>
      <Button title="Update Profile" onPress={() => setModalVisible(true)} />
      <Button title="Delete My Account" color="red" onPress={handleDeleteAccount} />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text>Nickname:</Text>
          <TextInput value={form.nickname} onChangeText={(v) => setForm({ ...form, nickname: v })} />

          <Text>Date of Birth:</Text>
          <TextInput placeholder="YYYY-MM-DD" value={form.dateOfBirth} onChangeText={(v) => setForm({ ...form, dateOfBirth: v })} />

          <Text>Gender:</Text>
          <TextInput placeholder="male/female/other" value={form.gender} onChangeText={(v) => setForm({ ...form, gender: v })} />

          <Text>Hometown:</Text>
          <TextInput value={form.hometown} onChangeText={(v) => setForm({ ...form, hometown: v })} />

          <Button title="Submit" onPress={handleUpdate} />
          <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
