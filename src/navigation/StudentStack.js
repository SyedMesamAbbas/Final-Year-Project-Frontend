import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import StudentHome from "../screens/Student/StudentHome";
import StudentFindTutor from "../screens/Student/StudentFindTutor";
import StudentAllClasses from "../screens/Student/StudentAllClasses";
import StudentDrawer from "../screens/Student/StudentDrawer";
import StudentCourses from "../screens/Student/StudentCourses";
import StudentAddCourses from "../screens/Student/StudentAddCourses"
import StudentProfile from "../screens/Student/StudentProfile"

const Stack = createNativeStackNavigator();

const StudentDrawerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentHome" component={StudentHome} />
      <Stack.Screen name="StudentDrawer" component={StudentDrawer} options={{ headerShown: false, presentation: "modal" }}/>
      <Stack.Screen name="StudentCourses" component={StudentCourses} />
      <Stack.Screen name="StudentAddCourses" component={StudentAddCourses} />
      <Stack.Screen name="StudentFindTutor" component={StudentFindTutor} />
      <Stack.Screen name="StudentAllClasses" component={StudentAllClasses} />
      <Stack.Screen name="StudentProfile" component={StudentProfile} />
    </Stack.Navigator>
  );
};

export default StudentDrawerNavigator;
