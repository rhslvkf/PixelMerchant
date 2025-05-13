import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { SCREENS } from "../config/constants";

// 화면 임포트
import CharacterCreationScreen from "../screens/CharacterCreationScreen";
import CityScreen from "../screens/CityScreen";
import HomeScreen from "../screens/HomeScreen";
import MarketScreen from "../screens/MarketScreen";
import SplashScreen from "../screens/SplashScreen";
import TravelScreen from "../screens/TravelScreen";
import InventoryScreen from "../screens/InventoryScreen";
import CharacterScreen from "../screens/CharacterScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={SCREENS.SPLASH} screenOptions={{ headerShown: false }}>
        <Stack.Screen name={SCREENS.SPLASH} component={SplashScreen} />
        <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
        <Stack.Screen name={SCREENS.CHARACTER_CREATION} component={CharacterCreationScreen} />
        <Stack.Screen name={SCREENS.CITY} component={CityScreen} />
        <Stack.Screen name={SCREENS.MARKET} component={MarketScreen} />
        <Stack.Screen name={SCREENS.TRAVEL} component={TravelScreen} />
        <Stack.Screen name={SCREENS.INVENTORY} component={InventoryScreen} />
        <Stack.Screen name={SCREENS.CHARACTER} component={CharacterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
