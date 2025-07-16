// inside Settings.js
import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
//profile image 
import * as ImagePicker from 'expo-image-picker';
import { Image, TouchableOpacity } from 'react-native';

const router = useRouter();

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Settings() {
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const[profilename, setProfileName] = useState(null);
  const [form, setForm] = useState({
    nickname: '',
    dateOfBirth: new Date(), // Date object instead of string
    gender: '',
    hometown: '',
  });

const [showDatePicker, setShowDatePicker] = useState(false);

  // Function for user profile picture and username 

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.get(`${API_URL}/buyer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = res.data.user;
      setProfileImage(user.profilePicture || null);

       //  New: Get user data (username)
      const res2 = await axios.get(`${API_URL}/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = res2.data.user;
      setProfileName(userInfo.username || "User")

    } catch (err) {
      console.error("Error loading profile", err);
    }
  };

  fetchProfile();
}, []);

  const pickImage = async () => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access media library is required!");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const asset = result.assets[0];
    const base64Image = `data:image/jpeg;base64,${asset.base64}`;
    setProfileImage(asset.uri); // display image

    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(
        `${API_URL}/buyer/update-profile-picture`,
        { profilePicture: base64Image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Profile picture updated!");
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to upload profile picture");
    }
  }
};
// Function to handle logout

  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    router.replace("/auth/login"); 
  } catch (error) {
    console.error("Logout Error:", error);
    Alert.alert("Error", "Failed to log out.");
  }
};

// Function to handle profile update
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(`${API_URL}/buyer/update-profile`, {
  ...form,
  dateOfBirth: form.dateOfBirth.toISOString().split('T')[0], // Convert to YYYY-MM-DD
}, {
  headers: { Authorization: `Bearer ${token}` },
});

      Alert.alert("Success", "Profile updated!");
      setModalVisible(false);
    } catch (error) {
      console.error("Update error", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update profile");
    }
  };

// Function to handle account deletion
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
    <View style={styles.outerContainer}>
  <View style={styles.glassContainer}>
    <TouchableOpacity onPress={pickImage}>
      <Image
        source={
          profileImage
            ? { uri: profileImage }
            : require('../../../assets/images/logoplasticle.png')
        }
        style={styles.profileImage}
      />
    </TouchableOpacity>

    <Text style={styles.greeting}>Hello, {profilename} 👋</Text>
    <Text style={styles.title}>Buyer Settings</Text>

    <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
      <Text style={styles.buttonText}>Update Profile</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDeleteAccount}>
      <Text style={styles.buttonText}>Delete My Account</Text>
    </TouchableOpacity>

    <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
      <Text style={styles.buttonText}>Logout</Text>
    </TouchableOpacity>
  </View>

  <Modal visible={modalVisible} animationType="slide" transparent>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Edit Profile</Text>

         {/* Nickname Input */}
<TextInput
  placeholder="Nickname"
  value={form.nickname}
  onChangeText={(v) => setForm({ ...form, nickname: v })}
  style={styles.input}
  placeholderTextColor="#ccc"
/>

{/* Date of Birth Picker */}
<TouchableOpacity
  onPress={() => setShowDatePicker(true)}
  style={styles.input}
>
  <Text style={{ color: form.dateOfBirth ? '#000' : '#ccc' }}>
    {form.dateOfBirth ? form.dateOfBirth.toDateString() : 'Select Date of Birth'}
  </Text>
</TouchableOpacity>
{showDatePicker && (
  <DateTimePicker
    value={form.dateOfBirth || new Date()}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    onChange={(event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        setForm({ ...form, dateOfBirth: selectedDate });
      }
    }}
    maximumDate={new Date()}
  />
)}

{/* Gender Dropdown */}
<View style={styles.pickerWrapper}>
  <Picker
    selectedValue={form.gender}
    onValueChange={(itemValue) => setForm({ ...form, gender: itemValue })}
    style={styles.picker}
  >
    <Picker.Item label="Select Gender" value="" />
    <Picker.Item label="Male" value="male" />
    <Picker.Item label="Female" value="female" />
    <Picker.Item label="Other" value="other" />
  </Picker>
</View>

{/* Hometown Input */}
<TextInput
  placeholder="Hometown"
  value={form.hometown}
  onChangeText={(v) => setForm({ ...form, hometown: v })}
  style={styles.input}
  placeholderTextColor="#ccc"
/>

        
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
</View>


  );
}

const styles = StyleSheet.create({
  
  outerContainer: {
    flex: 1,
    backgroundColor: '#c8facc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassContainer: {
    padding: 25,
    borderRadius: 20,
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    color: '#111',
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 80, 80, 0.2)',
  },
  cancelButton: {
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
modalContent: {
  width: '90%',
  backgroundColor: 'rgba(255, 255, 255, 0.92)', // <–– LESS transparent
  borderRadius: 20,
  padding: 20,
  borderColor: 'rgba(255,255,255,0.3)',
  borderWidth: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 10,
},

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#000',
    textAlign: 'center',
  },
input: {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 12,
  marginVertical: 8,
  color: '#000',
  borderWidth: 1,
  borderColor: '#ccc',
},

pickerWrapper: {
  backgroundColor: '#fff',
  borderRadius: 12,
  borderColor: '#ccc',
  borderWidth: 1,
  marginVertical: 8,
  overflow: 'hidden',
},
picker: {
  height: 50,
  width: '100%',
  color: '#000',
},

});