// ui updated new
import { StyleSheet } from "react-native";

const uiStyles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerWrapper: {
    alignItems: "flex-start",
    paddingBottom: 20,
    paddingLeft: 10,
  },
  title: {
    fontSize: 30,
    color: "white",
  },
  boldTitle: {
    fontSize: 40,
    color: "white",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  privacyText: {
    fontSize: 13,
    color: "#333",
  },
  button: {
    backgroundColor: "#1d5c4a",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInText: {
    textAlign: "center",
    marginTop: 10,
    color: "#444",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
});

export default uiStyles;


// ui updated old
/* 
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
*/