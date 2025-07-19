import { View, Text, StyleSheet } from 'react-native';

export default function Analytics() {
  return (
	<View style={styles.container}>
	  <Text style={styles.title}>manufacturer Analytics Page</Text>
	  <Text>This is where analytics related to the buyer will be shown.</Text>
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
