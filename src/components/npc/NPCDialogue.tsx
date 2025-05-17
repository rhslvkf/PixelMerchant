import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../../config/theme";
import { NPCDialogueChoice } from "../../models/npc";
import PixelText from "../PixelText";
import NPCPortrait from "./NPCPortrait";

interface NPCDialogueProps {
  npcId: string;
  npcName: string;
  dialogueText: string;
  choices: NPCDialogueChoice[];
  onSelectChoice: (choiceId: string) => void;
}

const NPCDialogue: React.FC<NPCDialogueProps> = ({ npcId, npcName, dialogueText, choices, onSelectChoice }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <NPCPortrait npcId={npcId} size="medium" />
        <PixelText variant="subtitle" style={styles.npcName}>
          {npcName}
        </PixelText>
      </View>

      <View style={styles.dialogueContainer}>
        <PixelText style={styles.dialogueText}>{dialogueText}</PixelText>
      </View>

      <ScrollView style={styles.choicesContainer}>
        {choices.map((choice) => (
          <TouchableOpacity key={choice.id} style={styles.choiceButton} onPress={() => onSelectChoice(choice.id)}>
            <PixelText style={styles.choiceText}>{choice.text}</PixelText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.background.dark}E6`,
    borderRadius: BORDERS.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    ...SHADOWS.medium,
    maxHeight: 500,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.berdan,
    paddingBottom: SPACING.sm,
  },
  npcName: {
    marginLeft: SPACING.md,
    color: COLORS.primary,
  },
  dialogueContainer: {
    backgroundColor: `${COLORS.secondary}99`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.md,
  },
  dialogueText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    lineHeight: 22,
  },
  choicesContainer: {
    maxHeight: 250,
  },
  choiceButton: {
    backgroundColor: COLORS.berdan,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  choiceText: {
    textAlign: "center",
    color: COLORS.text.light,
  },
});

export default NPCDialogue;
