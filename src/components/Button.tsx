import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, BORDERS } from "../config/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  // 버튼 타입에 따른 스타일
  const getTypeStyle = () => {
    switch (type) {
      case "primary":
        return {
          backgroundColor: COLORS.berdan,
          borderColor: COLORS.primary,
        };
      case "secondary":
        return {
          backgroundColor: COLORS.secondary,
          borderColor: COLORS.primary,
        };
      case "danger":
        return {
          backgroundColor: COLORS.danger,
          borderColor: COLORS.text.light,
        };
    }
  };

  // 버튼 크기에 따른 스타일
  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: SPACING.xs,
          paddingHorizontal: SPACING.md,
          borderWidth: BORDERS.width.thin,
        };
      case "medium":
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderWidth: BORDERS.width.regular,
        };
      case "large":
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          borderWidth: BORDERS.width.regular,
        };
    }
  };

  // 텍스트 크기에 따른 스타일
  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return {
          fontSize: TYPOGRAPHY.fontSize.sm,
        };
      case "medium":
        return {
          fontSize: TYPOGRAPHY.fontSize.md,
        };
      case "large":
        return {
          fontSize: TYPOGRAPHY.fontSize.lg,
        };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getTypeStyle(), getSizeStyle(), disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, getTextSizeStyle(), disabled && styles.disabledText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BORDERS.radius.md,
  },
  text: {
    color: COLORS.text.light,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
    opacity: 0.7,
  },
  disabledText: {
    color: COLORS.text.dark,
  },
});

export default Button;
