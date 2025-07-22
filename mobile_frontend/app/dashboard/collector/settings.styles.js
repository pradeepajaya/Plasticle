// app/dashboard/collector/settings.styles.js
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create(
	{
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
  top: '18%', // Adjust this value to move it lower or higher
  alignSelf: 'center',
  width: 220, // Adjust size as needed
  height: 220,
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
  /*bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    //backgroundColor: '#ebf3d6ff',
    backgroundColor: 'transparent',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    paddingTop: 10, // Space for profile image
  },*/

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
});