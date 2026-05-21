import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TutorHome from "../screens/Tutor/TutorHome";
import TutorDrawer from "../screens/Tutor/TutorDrawer"
import TutorStudentRequest from "../screens/Tutor/TutorStudentRequest";
import TutorTodayClasses from "../screens/Tutor/TutorTodayClasses";
import TutorAllClasses from "../screens/Tutor/TutorAllClasses"
import TutorAddSubject from "../screens/Tutor/TutorAddSubject";
import TutorProfile from "../screens/Tutor/TutorProfile"
import StudentProfile from "../screens/Tutor/StudentProfile"

const Stack = createNativeStackNavigator();

const TutorStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TutorHome" component={TutorHome} />
          <Stack.Screen
          name="TutorDrawer"
          component={TutorDrawer}
          options={{ headerShown: false, presentation: "modal" }}/>
        <Stack.Screen name="TutorStudentRequest" component={TutorStudentRequest} />
        <Stack.Screen name="TutorTodayClasses" component={TutorTodayClasses} />
        <Stack.Screen name="TutorAllClasses" component={TutorAllClasses} />
        <Stack.Screen name="TutorAddSubject" component={TutorAddSubject} />
        <Stack.Screen name="TutorProfile" component={TutorProfile} />
        <Stack.Screen name="StudentProfile" component={StudentProfile} />
    </Stack.Navigator>
  );
};

export default TutorStack;