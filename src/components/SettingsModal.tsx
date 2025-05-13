import React, { useState } from "react";
import { Modal, StyleSheet, Switch, View } from "react-native";
import { COLORS, SPACING } from "../config/theme";
import { GameSettings } from "../models/index";
import Button from "./Button";
import PixelText from "./PixelText";

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: GameSettings;
  onSaveSettings: (settings: GameSettings) => void;
}

const SettingsModal = ({ visible, onClose, settings, onSaveSettings }: SettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  const handleToggle = (key: keyof GameSettings) => {
    setLocalSettings({
      ...localSettings,
      [key]: !localSettings[key],
    });
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <PixelText variant="subtitle" style={styles.title}>
            설정
          </PixelText>

          <View style={styles.settingRow}>
            <PixelText>음악</PixelText>
            <Switch
              value={localSettings.music}
              onValueChange={() => handleToggle("music")}
              trackColor={{ false: COLORS.disabled, true: COLORS.berdan }}
              thumbColor={localSettings.music ? COLORS.primary : COLORS.text.light}
            />
          </View>

          <View style={styles.settingRow}>
            <PixelText>효과음</PixelText>
            <Switch
              value={localSettings.sound}
              onValueChange={() => handleToggle("sound")}
              trackColor={{ false: COLORS.disabled, true: COLORS.berdan }}
              thumbColor={localSettings.sound ? COLORS.primary : COLORS.text.light}
            />
          </View>

          <View style={styles.settingRow}>
            <PixelText>알림</PixelText>
            <Switch
              value={localSettings.notifications}
              onValueChange={() => handleToggle("notifications")}
              trackColor={{ false: COLORS.disabled, true: COLORS.berdan }}
              thumbColor={localSettings.notifications ? COLORS.primary : COLORS.text.light}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button title="저장" onPress={handleSave} size="medium" style={styles.button} />
            <Button title="취소" onPress={onClose} size="medium" type="secondary" style={styles.button} />
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
    borderColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default SettingsModal;
