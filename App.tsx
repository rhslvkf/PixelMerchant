import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { GameProvider } from "./src/state/GameContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <GameProvider>
        <AppNavigator />
      </GameProvider>
    </SafeAreaProvider>
  );
}
