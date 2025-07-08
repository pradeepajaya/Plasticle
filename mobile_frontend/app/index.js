import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import AppNavigator from './navigation/AppNavigator';
import { LogBox } from "react-native";


// Suppress the specific warning
LogBox.ignoreLogs(["props.pointerEvents is deprecated. Use style.pointerEvents"]);
export default function App() {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}