import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { COLORS, SPACING } from "../config/theme";
import PixelText from "./PixelText";
import Button from "./Button";

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <PixelText variant="subtitle" style={styles.title}>
            {title}
          </PixelText>
          <PixelText style={styles.message}>{message}</PixelText>

          <View style={styles.buttonRow}>
            <Button title={confirmText} onPress={onConfirm} size="medium" type="danger" style={styles.button} />
            <Button title={cancelText} onPress={onCancel} size="medium" style={styles.button} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: COLORS.background.dark,
    borderWidth: 2,
    borderColor: COLORS.danger,
    borderRadius: 8,
    padding: SPACING.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  message: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default ConfirmationModal;
