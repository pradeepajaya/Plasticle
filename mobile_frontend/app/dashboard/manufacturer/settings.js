import { useState } from 'react';
import {View,Text,TextInput,Button,Modal,StyleSheet,Alert,TouchableOpacity,ScrollView,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ManufacturerSettings() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    companyLocation: '',
    companyRegNumber: '',
    companyTelephone: '',
  });

// handle logout
  const handleLogout = async () => {
      try {
        await AsyncStorage.removeItem("userToken");
        router.replace("/auth/login");
      } catch (error) {
        console.error("Logout Error:", error);
        Alert.alert("Error", "Failed to log out.");
      }
    };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      await axios.put(`${API_URL}/manufacturer/update-profile`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Profile updated!');
      setModalVisible(false);
    } catch (error) {
      console.error('Update error', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('userToken');
              await axios.delete(`${API_URL}/auth/delete-account`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              await AsyncStorage.removeItem('userToken');
              router.replace('/auth/login');
            } catch (err) {
              console.error('Delete account error:', err.response?.data || err.message);
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manufacturer Settings</Text>

      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete My Account</Text>
      </TouchableOpacity>
        
      <TouchableOpacity style={styles.button} onPress={handleLogout}> 
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Company Profile</Text>

          <Text style={styles.label}>Company Name:</Text>
          <TextInput
            style={styles.input}
            value={form.companyName}
            onChangeText={(v) => setForm({ ...form, companyName: v })}
          />

          <Text style={styles.label}>Company Location:</Text>
          <TextInput
            style={styles.input}
            value={form.companyLocation}
            onChangeText={(v) => setForm({ ...form, companyLocation: v })}
          />

          <Text style={styles.label}>CompanyRegNumber:</Text>
          <TextInput
            style={styles.input}
            value={form.companyRegNumber}
            onChangeText={(v) => setForm({ ...form, companyRegNumber: v })}
          />

          <Text style={styles.label}>Telephone Number:</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            value={form.companyTelephone}
            onChangeText={(v) => setForm({ ...form, companyTelephone: v })}
          />

          <View style={styles.buttonGroup}>
            <Button title="Submit" onPress={handleUpdate} />
            <Button title="Cancel" color="gray" onPress={() => setModalVisible(false)} />
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonGroup: {
    marginTop: 10,
  },
});
