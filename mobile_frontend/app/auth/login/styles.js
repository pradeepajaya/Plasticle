// ui updated new

import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#2c786c",
  },
  topContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: "#2c786c",
  },
  image: {
    width: 260,
    height: 260,
    marginTop: 5,
  },
  title: {
    fontSize: 50,
    color: "#f4b400",
    fontWeight: "bold",
    marginTop: 10,
    fontFamily:"Roboto",
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffff",
    marginTop: 5,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 25,
    paddingTop: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 10,
    elevation: 10,
  },
  input: {
    width: "100%",
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#555",
    marginBottom: 20,
  },
  loginButton: {
    width: "100%",
    borderRadius: 30,
    paddingVertical: 10,
    backgroundColor: "#2c786c",
    marginBottom: 10,
  },
  orText: {
    marginVertical: 10,
    color: "#888",
  },
  createAccountButton: {
    width: "100%",
    backgroundColor: "#c9e4ca",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  createAccountText: {
    color: "#1b4332",
    fontWeight: "600",
    fontSize: 16,
  },
});

// ui updated old 

/*import { StyleSheet } from "react-native";

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
});*/