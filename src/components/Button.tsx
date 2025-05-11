import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, BORDERS } from "../config/theme";

type ButtonType = "primary" | "secondary" | "danger";
type ButtonSize = "small" | "medium" | "large";

interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  size?: ButtonSize;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// 스타일 매핑 객체 정의
const TYPE_STYLES: Record<ButtonType, ViewStyle> = {
  primary: {
    backgroundColor: COLORS.berdan,
    borderColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.primary,
  },
  danger: {
    backgroundColor: COLORS.danger,
    borderColor: COLORS.text.light,
  },
};

const SIZE_STYLES: Record<ButtonSize, ViewStyle> = {
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderWidth: BORDERS.width.thin,
  },
  medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderWidth: BORDERS.width.regular,
  },
  large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderWidth: BORDERS.width.regular,
  },
};

const TEXT_SIZE_STYLES: Record<ButtonSize, TextStyle> = {
  small: {
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  medium: {
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  large: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
};

const Button = ({
  title,
  onPress,
  type = "primary",
  size = "medium",
  disabled = false,
  style,
  textStyle,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.button, TYPE_STYLES[type], SIZE_STYLES[size], disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, TEXT_SIZE_STYLES[size], disabled && styles.disabledText, textStyle]}>{title}</Text>
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
