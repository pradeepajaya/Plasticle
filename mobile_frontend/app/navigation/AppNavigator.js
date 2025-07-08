import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';


import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BuyerDashboard from '../screens/BuyerDashboard';
import CollectorDashboard from '../screens/CollectorDashboard';
import ManufacturerDashboard from '../screens/ManufacturerDashboard';
import TaskHandlerScreen from '../screens/TaskHandlerScreen';
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
  
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="BuyerDashboard" component={BuyerDashboard} />
        <Stack.Screen name="CollectorDashboard" component={CollectorDashboard} />
        <Stack.Screen name="ManufacturerDashboard" component={ManufacturerDashboard} />
        <Stack.Screen name="TaskHandlerScreen" component={TaskHandlerScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
   
  );
}
