<<<<<<< HEAD
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
=======
/*// inside Settings.js
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

         {/* Nickname Input *//*}
<TextInput
  placeholder="Nickname"
  value={form.nickname}
  onChangeText={(v) => setForm({ ...form, nickname: v })}
  style={styles.input}
  placeholderTextColor="#ccc"
/>

{/* Date of Birth Picker *//*}
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

{/* Gender Dropdown *//*}
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

{/* Hometown Input *//*}
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

});*/

import { useState, useEffect } from 'react';
import { View, Text, TextInput, Modal, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from "expo-router";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { styles } from './settings.styles';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function Settings() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profilename, setProfileName] = useState(null);
  const [form, setForm] = useState({
    nickname: '',
    dateOfBirth: new Date(),
    gender: '',
    hometown: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isDobSet, setIsDobSet] = useState(false);


  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const res = await axios.get(`${API_URL}/buyer/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data.user;
        setProfileImage(user.profilePicture || null);

        const res2 = await axios.get(`${API_URL}/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userInfo = res2.data.user;
        setProfileName(userInfo.username || "User");

        // Set form data if available
        if (user.nickname || user.dateOfBirth || user.gender || user.hometown) {
          setForm({
            nickname: user.nickname || '',
            dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : new Date(),
            gender: user.gender || '',
            hometown: user.hometown || '',
          });
          if (user.dateOfBirth) {
    setIsDobSet(true); // ✅ DOB already set
  }
        }
      } catch (err) {
        console.error("Error loading profile", err);
      }
    };

    fetchProfile();
  }, []);

  // Image picker function
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
      setProfileImage(asset.uri);

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

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/auth/login"); 
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out.");
    }
  };

  // Profile update function
  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.put(`${API_URL}/buyer/update-profile`, {
        ...form,
        dateOfBirth: form.dateOfBirth.toISOString().split('T')[0],
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

  // Account deletion function
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
    {/* Blue header at top */}
    <View style={styles.topHeader}>
     <Text style={styles.greetingText}>Helo! {profilename || 'there'},</Text>
  <Text style={styles.subGreetingText}>Manage your account settings</Text>
   
    </View>

    {/* Profile section that extends into the green area */}
    <View style={styles.profileContainer}>
      <TouchableOpacity onPress={pickImage} style={styles.profileImageWrapper}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../../../assets/images/logoplasticle.png')}
          style={styles.profileImage}
        />
      </TouchableOpacity>
    </View>

    {/* Green curved container at bottom */}
    <View style={styles.bottomContainer}>
      <Image
    source={require('../../../assets/images/buyimg.png')} // replace with your image path
    style={styles.bottomImage}
    resizeMode="contain"
  />
      <View style={styles.optionsContainer}>
        <BlurView intensity={70} tint="light" style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={() => setModalVisible(true)}>
                <Ionicons name="create-outline" size={22} color="#4A90E2" />
                <Text style={styles.optionText}>Edit Profile</Text>
                 <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
         </BlurView>

        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.optionButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#4A90E2" />
          <Text style={styles.optionText}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.optionButton} onPress={handleDeleteAccount}>
          <Ionicons name="trash-outline" size={22} color="#4A90E2" />
          <Text style={[styles.optionText, styles.deleteText]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nickname</Text>
            <TextInput
              placeholder="Enter your nickname"
              value={form.nickname}
              onChangeText={(v) => setForm({ ...form, nickname: v })}
              style={styles.input}
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity
  onPress={() => {
    if (!isDobSet) setShowDatePicker(true);
    else Alert.alert("Not Allowed", "Date of Birth cannot be changed once set.");
  }}
  style={[styles.input, isDobSet && { backgroundColor: '#e0e0e0' }]}
>
  <Text style={{ color: '#333' }}>
    {form.dateOfBirth ? form.dateOfBirth.toDateString() : 'Select your birth date'}
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

            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(itemValue) => setForm({ ...form, gender: itemValue })}
                style={styles.picker}
              >
                <Picker.Item label="Select your gender" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

            <Text style={styles.inputLabel}>Hometown</Text>
            <TextInput
              placeholder="Enter your hometown"
              value={form.hometown}
              onChangeText={(v) => setForm({ ...form, hometown: v })}
              style={styles.input}
              placeholderTextColor="#999"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleUpdate}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/*const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#7afa69ff', // Blue background for top
  },
  topHeader: {
    paddingTop: 90,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
bottomImage: {
  position: 'absolute',
  top: '15%', // Adjust this value to move it lower or higher
  alignSelf: 'center',
  width: 200, // Adjust size as needed
  height: 200,
  resizeMode: 'contain',
  zIndex: 3, // Must be higher than optionsContainer
},



  greetingText: {
  fontSize: 30,
  fontWeight: '700',
  color: '#fff',
},
subGreetingText: {
  fontSize: 20,
  color: '#24211ee0',
  marginTop: 6,
},

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  profileContainer: {
    position: 'absolute',
    top: '25%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  profileImageWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
 
  bottomContainer: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '70%',
  borderTopLeftRadius: 80,
  borderTopRightRadius: 80,
  paddingTop: 160,
  overflow: 'hidden', // Required for border radius to clip blur
  backgroundColor: 'rgba(255, 255, 255, 0.6)', // Optional fallback
},

 optionsContainer: {
  backgroundColor: '#ebf3d6ff',
  borderRadius: 20,
  marginHorizontal: 20,
  marginTop: 50,
  paddingHorizontal: 20,
  paddingVertical: 10,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 3,
  zIndex: 1, // Add this line
  
},

  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
     flex: 1,
     marginLeft: 10,
  },

  deleteText: {
    color: '#FF6B6B',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: -15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});*/
>>>>>>> main
