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
