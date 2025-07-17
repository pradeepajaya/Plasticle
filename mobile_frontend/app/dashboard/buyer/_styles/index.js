import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

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
    fontSize: 16,
    color: '#333',
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
    borderColor: "#4CAF50",
    borderRadius: 10,
  },
  uiContainer: {
    width: width - 40,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    padding: 30,
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
  loadingContainer: {
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#333',
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
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrIcon: {
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
    flexShrink: 1,
  },
  actionButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    marginRight: 10,
  },
  buttonText: { 
    color: "white", 
    fontSize: 18, 
    fontWeight: "600",
    textAlign: 'center',
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
  backButtonText: {
    marginTop: 25,
  },
  backButtonLabel: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    marginRight: 10,
  },
});

export default index_styles;