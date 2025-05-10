import React from "react";
import { Text, TextStyle, StyleSheet } from "react-native";
import { COLORS, TYPOGRAPHY } from "../config/theme";

interface PixelTextProps {
  children: React.ReactNode;
  style?: TextStyle;
  variant?: "title" | "subtitle" | "body" | "caption";
  color?: string;
}

const PixelText = ({ children, style, variant = "body", color }: PixelTextProps) => {
  // 변형에 따른 스타일
  const getVariantStyle = () => {
    switch (variant) {
      case "title":
        return styles.title;
      case "subtitle":
        return styles.subtitle;
      case "body":
        return styles.body;
      case "caption":
        return styles.caption;
    }
  };

  return <Text style={[getVariantStyle(), color ? { color } : {}, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
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
});

export default PixelText;
