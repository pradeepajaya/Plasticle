import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");


const index_styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    textAlign: "center",
    marginTop: 20,
  },
  cameraContainer: {
    width: width - 40,
    height: width - 40,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanArea: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaBorder: {
    width: '90%',
    height: '90%',
    borderWidth: 3,
    borderColor: "#2E8B57",
    borderRadius: 10,
  },
  uiContainer: {
    width: width - 60,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E8B57',
    marginTop: 10,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: "#2E8B57",
  },
  secondaryButton: {
    backgroundColor: "#3CB371",
  },
  activeButton: {
    backgroundColor: "#4CAF50",
  },
  inactiveButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  successContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  flipIcon: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 10,
    borderRadius: 50,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 50,
  },
  icon: {
    marginRight: 10,
  },
});


export default index_styles;