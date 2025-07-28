import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Landing() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the App!</Text>

      <TouchableOpacity
        style={[styles.button, styles.loginButton]}
        onPress={() => router.push("/auth/login")}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.signupButton]}
        onPress={() => router.push("/auth/signup")}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#388e3c", 
    paddingHorizontal: 20,
  },
  title: { 
    fontSize: 28, 
    color: "white", 
    fontWeight: "bold", 
    marginBottom: 40,
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  loginButton: {
    backgroundColor: "#10B981", // green
  },
  signupButton: {
    backgroundColor: "#059669", // darker green
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
