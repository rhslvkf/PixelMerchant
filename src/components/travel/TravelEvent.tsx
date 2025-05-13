import React, { useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../../config/theme";
import PixelText from "../PixelText";
import Button from "../Button";
import { getEventById } from "../../data/travelEvents";
import { useGame } from "../../state/GameContext";
import { EventChoice, SkillType } from "../../models";

interface TravelEventProps {
  event: any; // 실제로는 TravelEvent 타입
  onChoice: (outcomeId: string) => void;
}

const TravelEvent: React.FC<TravelEventProps> = ({ event, onChoice }) => {
  const { state } = useGame();
  const [eventInfo, setEventInfo] = useState<any>(null);

  useEffect(() => {
    // 이벤트 ID로 실제 이벤트 정보 가져오기
    const eventData = getEventById(event.id);
    setEventInfo(eventData);
  }, [event.id]);

  if (!eventInfo) {
    return (
      <View style={styles.container}>
        <PixelText>이벤트 정보를 불러오는 중...</PixelText>
      </View>
    );
  }

  // 스킬 요구사항 확인 함수
  const hasRequiredSkill = (choice: EventChoice): boolean => {
    if (!choice.requiredSkill) return true;

    const playerSkillLevel = state.player.skills[choice.requiredSkill.skill] || 0;
    return playerSkillLevel >= choice.requiredSkill.level;
  };

  // 아이템 요구사항 확인 함수
  const hasRequiredItem = (choice: EventChoice): boolean => {
    if (!choice.requiredItem) return true;

    return state.player.inventory.some((item) => item.itemId === choice.requiredItem && item.quantity > 0);
  };

  return (
    <View style={styles.container}>
      <PixelText variant="subtitle" style={styles.title}>
        {eventInfo.title}
      </PixelText>

      <View style={styles.descriptionContainer}>
        <PixelText style={styles.description}>{eventInfo.description}</PixelText>
      </View>

      <View style={styles.choicesContainer}>
        <PixelText style={styles.choiceHeader}>어떻게 하시겠습니까?</PixelText>

        {eventInfo.choices.map((choice: EventChoice) => {
          const canChoose = hasRequiredSkill(choice) && hasRequiredItem(choice);

          return (
            <View key={choice.id} style={styles.choiceWrapper}>
              <Button
                title={choice.text}
                onPress={() => onChoice(choice.id)}
                size="medium"
                style={styles.choiceButton}
                disabled={!canChoose}
              />

              {choice.requiredSkill && (
                <PixelText
                  variant="caption"
                  style={[
                    styles.requirementText,
                    hasRequiredSkill(choice) ? styles.metRequirement : styles.unmetRequirement,
                  ]}
                >
                  {getSkillName(choice.requiredSkill.skill)} 레벨 {choice.requiredSkill.level} 필요
                </PixelText>
              )}

              {choice.requiredItem && (
                <PixelText
                  variant="caption"
                  style={[
                    styles.requirementText,
                    hasRequiredItem(choice) ? styles.metRequirement : styles.unmetRequirement,
                  ]}
                >
                  {getItemName(choice.requiredItem)} 필요
                </PixelText>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

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

// 아이템 이름 가져오기 (실제로는 아이템 데이터베이스 연결 필요)
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: `${COLORS.background.dark}B3`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  descriptionContainer: {
    backgroundColor: `${COLORS.secondary}80`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.lg,
  },
  description: {
    lineHeight: 22,
  },
  choicesContainer: {
    flex: 1,
  },
  choiceHeader: {
    fontWeight: "bold",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  choiceWrapper: {
    marginBottom: SPACING.md,
  },
  choiceButton: {
    marginBottom: SPACING.xs,
  },
  requirementText: {
    textAlign: "center",
    fontSize: 10,
    marginTop: -SPACING.xs,
    marginBottom: SPACING.xs,
  },
  metRequirement: {
    color: COLORS.success,
  },
  unmetRequirement: {
    color: COLORS.danger,
  },
});

export default TravelEvent;
