 
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
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    padding: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 10,
    backdropFilter: "blur(10px)",
  },

  header: {
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
    boarder: "1px solid #ccc",
  },

  input: {
    marginBottom: 12,
    borderRadius: 50,        // <-- Rounded corners
    backgroundColor: "#fff", // Optional: ensure background doesn't look transparent
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  privacyText: {
    color: "blue",
    textDecorationLine: "underline",
  },
  registerButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  loginLink: {
    textAlign: "center",
    marginTop: 10,
    color: "#333",
  },
  modalContainer: {
    backgroundColor: "purple",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
});
