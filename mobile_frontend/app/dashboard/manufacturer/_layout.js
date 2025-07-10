// app/dashboard/manufacturer/_layout.js
import { Tabs } from 'expo-router';

export default function ManufacturerLayout() {
  return (
	<Tabs>
	  <Tabs.Screen name="index" options={{ title: 'Home' }} />
	  <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
	  <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
	</Tabs>
  );
}
