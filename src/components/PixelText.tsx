import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY } from "../config/theme";

type TextVariant = "title" | "subtitle" | "body" | "caption";

interface PixelTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: TextVariant;
  color?: string;
}

// 변형별 스타일 매핑 객체
const VARIANT_STYLES: Record<TextVariant, TextStyle> = {
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.light,
  },
  body: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text.light,
  },
  caption: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.disabled,
  },
};

const PixelText = ({ children, style, variant = "body", color }: PixelTextProps) => {
  const textStyle = [VARIANT_STYLES[variant], color ? { color } : undefined, style].filter(Boolean) as TextStyle[];

  return <Text style={textStyle}>{children}</Text>;
};

export default PixelText;
