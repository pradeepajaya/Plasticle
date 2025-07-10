import { View, Text, StyleSheet } from 'react-native';

export default function Settings() {
  return (
	<View style={styles.container}>
	  <Text style={styles.title}>Task-Handler Settings Page</Text>
	  <Text>This is where buyer-specific settings will be managed.</Text>
	</View>
  );
}

const styles = StyleSheet.create({
  container: {
	flex: 1,
	padding: 20,
	justifyContent: 'center',
	backgroundColor: '#fff',
  },
  title: {
	fontSize: 22,
	fontWeight: 'bold',
	marginBottom: 10,
  },
});
