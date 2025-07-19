/*import { useState } from 'react';
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
*/

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Modal,
  Alert,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur'; // ✅ Using BlurView for iOS/Android blur

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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Error', 'Failed to log out.');
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
      {/* 🌟 Glassy Container */}
      <BlurView intensity={60} tint="light" style={styles.glassBox}>
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
      </BlurView>

      <Modal visible={modalVisible} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Company Profile</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Name</Text>
            <TextInput
              style={styles.input}
              value={form.companyName}
              onChangeText={(v) => setForm({ ...form, companyName: v })}
              placeholder="Enter company name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company Location</Text>
            <TextInput
              style={styles.input}
              value={form.companyLocation}
              onChangeText={(v) => setForm({ ...form, companyLocation: v })}
              placeholder="Enter location"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Number</Text>
            <TextInput
              style={styles.input}
              value={form.companyRegNumber}
              onChangeText={(v) => setForm({ ...form, companyRegNumber: v })}
              placeholder="Enter reg number"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Telephone Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={form.companyTelephone}
              onChangeText={(v) => setForm({ ...form, companyTelephone: v })}
              placeholder="Enter telephone"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonGroup}>
            <Button title="Submit" onPress={handleUpdate} />
            <View style={{ marginVertical: 6 }} />
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
    backgroundColor: '#d4f5e9',
    justifyContent: 'center',
    padding: 20,
  },
  glassBox: {
    padding: 24,
    borderRadius: 20,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.85)' : 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 22,
    marginVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  buttonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flexGrow: 1,
    padding: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    margin: 20,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#222',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    fontSize: 14,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonGroup: {
    marginTop: 20,
    borderRadius: 30,
    borderColor: 'rgba(255,255,255,0.3)'
  },
});

/*import { useState } from 'react';
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
*/

