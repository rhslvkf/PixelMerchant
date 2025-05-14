import React from "react";
import { StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { EventOutcome as EventOutcomeType } from "../../models";
import Button from "../Button";
import PixelText from "../PixelText";

interface EventOutcomeProps {
  outcome: EventOutcomeType;
  onContinue: () => void;
}

const EventOutcome: React.FC<EventOutcomeProps> = ({ outcome, onContinue }) => {
  // 효과 요약 텍스트 생성
  const getEffectsSummary = () => {
    const effects = [];

    if (outcome.effects.gold) {
      const sign = outcome.effects.gold > 0 ? "+" : "";
      effects.push(`${sign}${outcome.effects.gold} 골드`);
    }

    if (outcome.effects.items?.length) {
      outcome.effects.items.forEach((item) => {
        const sign = item.quantity > 0 ? "+" : "";
        effects.push(`${sign}${item.quantity} ${getItemName(item.id)}`);
      });
    }

    if (outcome.effects.skills?.length) {
      outcome.effects.skills.forEach((skill) => {
        effects.push(`${getSkillName(skill.skill)} +${skill.exp} 경험치`);
      });
    }

    if (outcome.effects.reputation?.length) {
      outcome.effects.reputation.forEach((rep) => {
        const sign = rep.change > 0 ? "+" : "";
        effects.push(`${getFactionName(rep.factionId)} 평판 ${sign}${rep.change}`);
      });
    }

    return effects.length > 0 ? effects.join(", ") : "효과 없음";
  };

  // 스킬 이름 가져오기
  const getSkillName = (skill: string): string => {
    const skillNames: Record<string, string> = {
      trade: "거래",
      logistics: "물류",
      insight: "통찰",
      diplomacy: "외교",
      exploration: "탐험",
    };

    return skillNames[skill] || skill;
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

  // 세력 이름 가져오기
  const getFactionName = (factionId: string): string => {
    const factionNames: Record<string, string> = {
      berdan_empire: "베르단 제국",
      riona_union: "리오나 연합",
      kragmore_mountains: "크라그모어 산맥",
      sahel_desert: "사헬 사막",
      azure_islands: "아주르 제도",
      mountain_bandits: "산적단",
      golden_compass_guild: "황금나침반 길드",
    };

    return factionNames[factionId] || factionId;
  };

  return (
    <View style={styles.container}>
      <View style={styles.descriptionContainer}>
        <PixelText style={styles.description}>{outcome.description}</PixelText>
      </View>

      <View style={styles.effectsContainer}>
        <PixelText variant="caption" style={styles.effectsTitle}>
          결과:
        </PixelText>
        <PixelText style={styles.effectsText}>{getEffectsSummary()}</PixelText>
      </View>

      <Button title="계속하기" size="medium" onPress={onContinue} style={styles.continueButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.background.dark}B3`,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  descriptionContainer: {
    marginBottom: SPACING.md,
  },
  description: {
    lineHeight: 22,
  },
  effectsContainer: {
    backgroundColor: `${COLORS.secondary}80`,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  effectsTitle: {
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  effectsText: {
    color: COLORS.text.light,
  },
  continueButton: {
    alignSelf: "center",
    minWidth: 150,
  },
});

export default EventOutcome;
