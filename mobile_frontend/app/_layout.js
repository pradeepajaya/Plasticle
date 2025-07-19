/*import { Stack } from 'expo-router';

export default function Layout() {
  return <Stack  screenOptions={{ headerShown: false }} />;
}
*/

import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';

export default function Layout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}
