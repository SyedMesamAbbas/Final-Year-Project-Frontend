import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import RoleScreen from "../screens/Auth/RoleScreen";
import StudentSignUpScreen from "../screens/Auth/StudentSignUpScreen";
import TeacherSignUpScreen from "../screens/Auth/TeacherSignUpScreen";
import MapScreen from "../screens/Auth/MapScreen";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Role" component={RoleScreen} />
      <Stack.Screen name="StudentSignup" component={StudentSignUpScreen} />
      <Stack.Screen name="TeacherSignup" component={TeacherSignUpScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;