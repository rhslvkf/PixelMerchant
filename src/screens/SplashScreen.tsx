import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SCREENS } from "../config/constants";

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    // 3초 후 홈 화면으로 이동 (임시)
    const timer = setTimeout(() => {
      navigation.replace(SCREENS.HOME);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>픽셀 상인: 무역 제국</Text>
      <Text style={styles.subtitle}>로딩 중...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A3A5A",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E6B422",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});

export default SplashScreen;
