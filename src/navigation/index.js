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


// import React from "react";
// import AuthStack from "./AuthStack";
// import MainStack from "./MainStack";

// const RootNavigator = () => {
//   const isLoggedIn = false;

//   return isLoggedIn ? <MainStack /> : <AuthStack />;
// };

// export default RootNavigator;








// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import AuthStack from "./AuthStack";
// import MainStack from "./MainStack"; // your app screens

// const RootNavigator = () => {
//   const isLoggedIn = false; // replace with auth state

//   return (
//     <NavigationContainer>
//       {isLoggedIn ? <MainStack /> : <AuthStack />}
//     </NavigationContainer>
//   );
// };

// export default RootNavigator;