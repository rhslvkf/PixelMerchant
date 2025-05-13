import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import PixelText from "../PixelText";
import Button from "../Button";

interface NotificationDialogProps {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

const NotificationDialog = ({ visible, type, title, message, onClose }: NotificationDialogProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconContainer, { backgroundColor: type === "success" ? COLORS.berdan : COLORS.danger }]}>
            <PixelText variant="subtitle" style={styles.iconText}>
              {type === "success" ? "✓" : "✗"}
            </PixelText>
          </View>

          <PixelText
            variant="subtitle"
            style={{
              ...styles.title,
              color: type === "success" ? COLORS.berdan : COLORS.danger,
            }}
          >
            {title}
          </PixelText>

          <PixelText style={styles.message}>{message}</PixelText>

          <Button
            title="확인"
            onPress={onClose}
            type={type === "success" ? "primary" : "secondary"}
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconText: {
    color: COLORS.text.light,
    fontSize: 30,
  },
  title: {
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 120,
  },
});

export default NotificationDialog;
