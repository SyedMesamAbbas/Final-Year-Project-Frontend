// import React from "react";
// import { TouchableOpacity } from "react-native";
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { createStackNavigator } from "@react-navigation/stack";

// import AdminHome from "../screens/Admin/AdminHome"
// import AdminTutorScreen from "../screens/Admin/AdminTutorScreen";
// import AdminStudentScreen from "../screens/Admin/AdminStudentScreen";
// import AdminSubjectScreen from "../screens/Admin/AdminSubjectScreen";
// import AdminDrawerScreen from "../screens/Admin/AdminDrawerScreen";
// import AdminClassesScreen from "../screens/Admin/AdminClassesScreen";
// import AdminBlockListScreen from "../screens/Admin/AdminBlockListScreen";
// import AdminFeedbackScreen from "../screens/Admin/AdminFeedbackScreen";
// import AdminProfileScreen from "../screens/Admin/AdminProfileScreen";

// const Stack = createStackNavigator();

// const AdminStack = () => {
//   return (
//     <Stack.Navigator
//       screenOptions={({ navigation }) => ({
//         headerShown: true,

//         // 🔥 GLOBAL HAMBURGER ICON
//         headerLeft: () => (
//           <TouchableOpacity
//             style={{ marginLeft: 15 }}
//             onPress={() => navigation.navigate("AdminDrawer")}
//           >
//             <Icon name="menu" size={26} color="#000" />
//           </TouchableOpacity>
//         ),

//         headerTitleAlign: "center",
//       })}
//     >
//       <Stack.Screen name="AdminHome" component={AdminHome} />
//       <Stack.Screen name="AdminTutor" component={AdminTutorScreen} />
//       <Stack.Screen name="AdminStudent" component={AdminStudentScreen} />
//       <Stack.Screen name="AdminSubject" component={AdminSubjectScreen} />
//       <Stack.Screen name="AdminClasses" component={AdminClassesScreen} />
//       <Stack.Screen name="BlockList" component={AdminBlockListScreen} />
//       <Stack.Screen name="Feedback" component={AdminFeedbackScreen} />
//       <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />

//       {/* Drawer Screen (hidden header) */}
//       <Stack.Screen
//         name="AdminDrawer"
//         component={AdminDrawerScreen}
//         options={{
//           headerShown: false,
//           presentation: "modal", // optional (nice effect)
//         }}
//       />
//     </Stack.Navigator>
//   );
// };

// export default AdminStack;
















import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdminHome from "../screens/Admin/AdminHome";
import AdminTutorScreen from "../screens/Admin/AdminTutorScreen";
import AdminStudentScreen from "../screens/Admin/AdminStudentScreen";
import AdminSubjectScreen from "../screens/Admin/AdminSubjectScreen";
import AdminDrawerScreen from "../screens/Admin/AdminDrawerScreen";
import AdminClassesScreen from "../screens/Admin/AdminClassesScreen";
import AdminBlockListScreen from "../screens/Admin/AdminBlockListScreen";
import AdminBlockedStudent from "../screens/Admin/AdminBlockedStudents";
import AdminFeedbackScreen from "../screens/Admin/AdminFeedbackScreen";
import AdminProfileScreen from "../screens/Admin/AdminProfileScreen";
import AdminTutorDetailScreen from "../screens/Admin/AdminTutorDetailScreen"
import AdminTutorCourses from "../screens/Admin/TutorCourses"
import AdminApprovedTutor from "../screens/Admin/AdminApprovedTutor"


const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHome} />
      <Stack.Screen
          name="AdminDrawer"
          component={AdminDrawerScreen}
          options={{ headerShown: false, presentation: "modal" }}
        />
      <Stack.Screen name="AdminTutor" component={AdminTutorScreen} />
      <Stack.Screen name="AdminStudent" component={AdminStudentScreen} />
      <Stack.Screen name="AdminSubject" component={AdminSubjectScreen} />
      <Stack.Screen name="AdminClasses" component={AdminClassesScreen} />
      <Stack.Screen name="BlockList" component={AdminBlockListScreen} />
      <Stack.Screen name="AdminBlockedStudent" component={AdminBlockedStudent} />
      <Stack.Screen name="Feedback" component={AdminFeedbackScreen} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Stack.Screen name="AdminTutorDetailScreen" component={AdminTutorDetailScreen} />
      <Stack.Screen name="AdminTutorCourses" component={AdminTutorCourses} />
      <Stack.Screen name="AdminApprovedTutor" component={AdminApprovedTutor} />
    </Stack.Navigator>
  );
};

export default AdminStack;