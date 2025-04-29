import { useEffect, useState } from 'react';
import { useRouter, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (!rootNavigationState?.key || hasNavigated) return;
    setHasNavigated(true);
    router.replace('/auth/login');
  }, [rootNavigationState]);

  return (
    <View >
      <ActivityIndicator  />
    </View>
  );
}

// app/index.js
/*import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Hello World from Index Screen 🌎</Text>
    </View>
  );
}*/
