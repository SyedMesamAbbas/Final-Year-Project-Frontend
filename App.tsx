import React from "react";
import RootNavigator from "./src/navigation";
import { NavigationContainer } from "@react-navigation/native";
const App = () => {
  return (
  <NavigationContainer>
    <RootNavigator />
  </NavigationContainer>
  );
};

export default App;