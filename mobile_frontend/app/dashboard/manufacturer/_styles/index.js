import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get('window');

const index_styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
    color: '#2e7d32',
  },
  input: {
    borderWidth: 1,
    borderColor: "#81c784",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: 'white',
    fontSize: 16,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  generateButton: {
    backgroundColor: '#2e7d32',
  },
  downloadButton: {
    backgroundColor: '#5e35b1',
  },
  pdfButton: {
    backgroundColor: '#039be5',
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 8,
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  scrollContainer: {
    maxHeight: 300,
    marginTop: 10,
  },
  qrRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
  },
  qrContainer: {
    margin: 10,
    alignItems: "center",
    width: '40%',
  },
  qrImageContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 5,
  },
  qrCode: {
    width: 120,
    height: 120,
  },
  qrLabel: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
});

export default index_styles;