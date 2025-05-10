import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../config/theme";
import Button from "../components/Button";
import PixelText from "../components/PixelText";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <PixelText variant="title">픽셀 상인: 무역 제국</PixelText>
      <View style={styles.buttonContainer}>
        <Button title="새 게임" onPress={() => console.log("새 게임")} size="large" />
        <Button title="이어하기" onPress={() => console.log("이어하기")} size="large" type="secondary" />
        <Button title="설정" onPress={() => console.log("설정")} size="large" />
      </View>
      <View style={styles.footer}>
        <PixelText variant="caption">v0.1.0 - 개발 중</PixelText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    padding: SPACING.lg,
  },
  buttonContainer: {
    width: "80%",
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  footer: {
    position: "absolute",
    bottom: SPACING.lg,
  },
});

export default HomeScreen;
