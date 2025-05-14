import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SPACING } from "../../config/theme";
import { EventChoice as EventChoiceType, SkillType } from "../../models";
import PixelText from "../PixelText";

interface EventChoiceProps {
  choice: EventChoiceType;
  isSelected: boolean;
  canSelect: boolean;
  onSelect: (choiceId: string) => void;
}

const EventChoice: React.FC<EventChoiceProps> = ({ choice, isSelected, canSelect, onSelect }) => {
  // 스킬 이름 가져오기
  const getSkillName = (skill: SkillType): string => {
    const skillNames: Record<SkillType, string> = {
      [SkillType.TRADE]: "거래",
      [SkillType.LOGISTICS]: "물류",
      [SkillType.INSIGHT]: "통찰",
      [SkillType.DIPLOMACY]: "외교",
      [SkillType.EXPLORATION]: "탐험",
    };

    return skillNames[skill] || String(skill);
  };

  // 아이템 이름 가져오기
  const getItemName = (itemId: string): string => {
    const itemNames: Record<string, string> = {
      wheat: "밀",
      cotton: "목화",
      iron_ore: "철광석",
      silk: "비단",
      spices: "향신료",
      wine: "포도주",
      gemstones: "보석",
      leather: "가죽",
      pottery: "도자기",
      herbs: "약초",
    };

    return itemNames[itemId] || itemId;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer, !canSelect && styles.disabledContainer]}
      onPress={() => canSelect && onSelect(choice.id)}
      disabled={!canSelect}
    >
      <PixelText style={[styles.text, !canSelect && styles.disabledText]}>{choice.text}</PixelText>

      {/* 요구 사항 표시 */}
      <View style={styles.requirementsContainer}>
        {choice.requiredSkill && (
          <PixelText
            variant="caption"
            style={[styles.requirementText, canSelect ? styles.metRequirement : styles.unmetRequirement]}
          >
            {getSkillName(choice.requiredSkill.skill)} Lv.{choice.requiredSkill.level} 필요
          </PixelText>
        )}

        {choice.requiredItem && (
          <PixelText
            variant="caption"
            style={[styles.requirementText, canSelect ? styles.metRequirement : styles.unmetRequirement]}
          >
            {getItemName(choice.requiredItem)} 필요
          </PixelText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedContainer: {
    backgroundColor: COLORS.berdan,
    borderColor: COLORS.primary,
  },
  disabledContainer: {
    opacity: 0.7,
    backgroundColor: `${COLORS.secondary}80`,
  },
  text: {
    color: COLORS.text.light,
  },
  disabledText: {
    color: COLORS.disabled,
  },
  requirementsContainer: {
    marginTop: SPACING.xs,
  },
  requirementText: {
    marginTop: SPACING.xs,
  },
  metRequirement: {
    color: COLORS.success,
  },
  unmetRequirement: {
    color: COLORS.danger,
  },
});

export default EventChoice;
