import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// IMPORT from the new file
import { UserContext } from "./UserContext"; 

import LoginScreen from "./screens/LoginScreen";
import StudentHome from "./screens/StudentHome";
import CreatorDashboard from "./screens/CreatorDashboard";
import UploadScreen from "./screens/UploadScreen";

const Stack = createStackNavigator();

export default function App() {
  // We use 'user' object now, matching your login logic
  const [user, setUser] = useState(null); 

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="StudentHome" component={StudentHome} />
          <Stack.Screen name="CreatorDashboard" component={CreatorDashboard} />
          <Stack.Screen name="UploadScreen" component={UploadScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}