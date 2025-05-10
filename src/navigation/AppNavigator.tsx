import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SCREENS } from "../config/constants";

// 임시 스크린 컴포넌트 (나중에 실제 컴포넌트로 교체)
import SplashScreen from "../screens/SplashScreen";
import HomeScreen from "../screens/HomeScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={SCREENS.SPLASH} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={SCREENS.SPLASH} component={SplashScreen} />
        <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
        {/* 추후 다른 스크린 추가 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
