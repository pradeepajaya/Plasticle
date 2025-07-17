import { StyleSheet } from "react-native";

export default StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    marginBottom: 20,
    borderRadius: 50,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 15,
  },
  linkText: {
    textAlign: "center",
    color: "#2e7d32",
    marginBottom: 8,
  },
  linkBold: {
    textDecorationLine: "underline",
    fontWeight: "bold",
  },
});