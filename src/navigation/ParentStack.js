import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../screens/Parents/Dashboard";
import ParentChildProfile from "../screens/Parents/ParentChildProfile";
import ParentChildCourses from "../screens/Parents/ParentChildCourses";
import ParentChildSchedule from "../screens/Parents/ParentChildSchedule";
import ParentChildTutors from "../screens/Parents/ParentChildTutors";
import ParentChildDetail from "../screens/Parents/ParentChildDetail";
import ParentChildClasses from "../screens/Parents/ParentChildClasses";
import ParentChildFee from "../screens/Parents/ParentChildFee";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="ParentChildProfile" component={ParentChildProfile}/>
      <Stack.Screen name="ParentChildCourses" component={ParentChildCourses}/>
      <Stack.Screen name="ParentChildSchedule" component={ParentChildSchedule}/>
      <Stack.Screen name="ParentChildDetail" component={ParentChildDetail}/>
      <Stack.Screen name="ParentChildTutors" component={ParentChildTutors}/>
      <Stack.Screen name="ParentChildClasses" component={ParentChildClasses}/>
      <Stack.Screen name="ParentChildFee" component={ParentChildFee}/>
    </Stack.Navigator>
  );
};

export default AuthStack;