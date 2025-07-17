import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


export default function Analytics() {
  return (
    <LinearGradient
      colors={['#e8f5e9', '#a5d6a7', '#388e3c']}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>

	  <Text style={styles.title}>manufacturer Analytics Page</Text>
	  <Text>This is where analytics related to the buyer will be shown.</Text>
      </View>
    </LinearGradient>
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
