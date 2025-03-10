import React from "react";
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from "../app/navigation/AppNavigator";

export default function App() {

  return <AppNavigator />;

  /*return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );*/
}
