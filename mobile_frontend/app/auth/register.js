import React, { useState } from "react";
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


              {/*Paper Checkbox Implementation */}
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


/*import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, Button, Alert, Modal, ScrollView,
  TouchableOpacity, StyleSheet
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Checkbox } from "react-native-paper";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import axios from "axios";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const privacyPolicies = {
  buyer: "Buyer Privacy Policy: You agree to share personal information for transactions.",
  collector: "Collector Privacy Policy: You agree to handle collected materials responsibly.",
  manufacturer: "Manufacturer Privacy Policy: You must ensure compliance with regulations."
};

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", role: "buyer"
  });
  const [isChecked, setIsChecked] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "mobile_frontend" // Replace with your actual app scheme
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    redirectUri,
    scopes: ["profile", "email"]
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      handleGoogleAuth(authentication.accessToken);
    }
  }, [response]);

  const handleGoogleAuth = async (accessToken) => {
    try {
      const res = await axios.post(`${API_URL}/auth/google`, {
        accessToken,
        role: formData.role
      });
      Alert.alert("Success", res.data.message);
      router.replace("/auth/login");
    } catch (error) {
      console.error("Google Auth Error:", error?.response?.data || error.message);
      Alert.alert("Error", error?.response?.data?.message || "Google authentication failed");
    }
  };

  const handleRegister = async () => {
    if (!isChecked) {
      Alert.alert("Error", "You must accept the Privacy Policy to continue.");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/register`, formData);
      Alert.alert(res.data.message);
      router.replace("/auth/login");
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={styles.title}>Register</Text>

      <Text>Username:</Text>
      <TextInput
        value={formData.username}
        onChangeText={(text) => setFormData({ ...formData, username: text })}
        style={styles.input}
      />

      <Text>Email:</Text>
      <TextInput
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        style={styles.input}
      />

      <Text>Password:</Text>
      <TextInput
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        style={styles.input}
      />

      <Text>Role:</Text>
      <Picker
        selectedValue={formData.role}
        onValueChange={(itemValue) => setFormData({ ...formData, role: itemValue })}
        style={styles.picker}
      >
        <Picker.Item label="Consumer" value="buyer" />
        <Picker.Item label="Collector" value="collector" />
        <Picker.Item label="Manufacturer" value="manufacturer" />
      </Picker>

      <View style={styles.checkboxContainer}>
        <Checkbox
          status={isChecked ? "checked" : "unchecked"}
          onPress={() => setIsChecked(!isChecked)}
        />
        <Text onPress={() => setModalVisible(true)} style={styles.privacyText}>
          Accept Privacy Policy
        </Text>
      </View>

      <Button
        title="Register"
        onPress={handleRegister}
        disabled={!isChecked}
      />

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.googleButton}
        onPress={() => promptAsync()}
        disabled={!isChecked || !request}
      >
        <Text style={styles.googleButtonText}>Sign up with Google</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <Text>{privacyPolicies[formData.role]}</Text>
            </ScrollView>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, padding: 8, marginBottom: 10, borderRadius: 5 },
  picker: { borderWidth: 1, marginBottom: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  privacyText: { textDecorationLine: "underline", color: "blue" },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#ccc" },
  dividerText: { marginHorizontal: 10, fontWeight: "bold" },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 12,
    borderRadius: 5,
    alignItems: "center"
  },
  googleButtonText: { color: "white", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)"
  },
  modalContent: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 10,
    maxHeight: "80%"
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 }
});
*/

// App.js

// working code for oauth with google signin

/*import React, { useEffect, useState } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure( {
  webClientId: // check env file 
});


const Index = () => {
  const [userInfo, setUserInfo] = useState(null);

  const handleGoogleSignIn = async () => { 
    
    try { 

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn(); 
  if (isSuccessResponse(response)) {
         setUserInfo(response.data);
    } else {
      console.error("singin was cancelled by user");
    }

  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          Alert.alert('Sign-in in progress');
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          Alert.alert('Play services not available or outdated');
          break;
        default:
        // some other error happened
      }
    } else {
      Alert.alert('An unknown error occurred');
    }
  }
};
  return (
    <View style={styles.container}>
      <Text>Index</Text>
{userInfo ? (<Text> {JSON.stringify(userInfo,null,2)}</Text>
) : (
      <GoogleSigninButton
        style={{ width: 192, height: 48 }}
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark} 
        onPress={handleGoogleSignIn} />
)}
    </View>
  );
}
   export default Index;
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, marginVertical: 8 },
}); 
*/
// oauth working with structured data showing 

/*
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: // check env file for webClientId
});

export default function Index() {
  const [userInfo, setUserInfo] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      console.log("Google Sign-In Full Response:", response);

      // ✅ Correct user data path
      setUserInfo(response.data.user);
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Cancelled", "Google sign-in was cancelled.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("In Progress", "Google sign-in is already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Unavailable", "Google Play Services not available.");
      } else {
        Alert.alert("Error", "An unknown error occurred during sign-in.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Google Sign-In</Text>

      {userInfo ? (
        <View style={styles.profileContainer}>
          {userInfo.photo && (
            <Image source={{ uri: userInfo.photo }} style={styles.avatar} />
          )}
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{userInfo.name}</Text>

          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{userInfo.email}</Text>

          <Text style={styles.label}>Google ID:</Text>
          <Text style={styles.value}>{userInfo.id}</Text>
        </View>
      ) : (
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  profileContainer: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 20 },
  label: { fontWeight: 'bold', fontSize: 16 },
  value: { fontSize: 16, marginBottom: 10 },
});
*/