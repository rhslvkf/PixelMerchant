import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { SCREENS } from "../config/constants";

// 화면 임포트
import SplashScreen from "../screens/SplashScreen";
import HomeScreen from "../screens/HomeScreen";
import CharacterCreationScreen from "../screens/CharacterCreationScreen";
import CityScreen from "../screens/CityScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={SCREENS.SPLASH} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={SCREENS.SPLASH} component={SplashScreen} />
        <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
        <Stack.Screen name={SCREENS.CHARACTER_CREATION} component={CharacterCreationScreen} />
        <Stack.Screen name={SCREENS.CITY} component={CityScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
