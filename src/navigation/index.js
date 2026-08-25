import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";
import TutorStack from "./TutorStack";
import StudentStack from "./StudentStack";
import AdminStack from "./AdminStack"
import ParentStack from "./ParentStack"

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthStack" component={AuthStack} />
      <Stack.Screen name="TutorStack" component={TutorStack} />
      <Stack.Screen name="StudentStack" component={StudentStack} />
      <Stack.Screen name="AdminStack" component={AdminStack} />
      <Stack.Screen name="ParentStack" component={ParentStack} />
    </Stack.Navigator>
  );
};

export default RootNavigator;