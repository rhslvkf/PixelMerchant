import React from "react";
import { StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SPACING } from "../../config/theme";
import { SkillType } from "../../models";
import PixelText from "../PixelText";

interface SkillBarProps {
  skill: SkillType;
  level: number;
  maxLevel?: number;
}

const SkillBar: React.FC<SkillBarProps> = ({ skill, level, maxLevel = 10 }) => {
  // 스킬 이름 매핑
  const skillNames: Record<SkillType, string> = {
    [SkillType.TRADE]: "거래",
    [SkillType.LOGISTICS]: "물류",
    [SkillType.INSIGHT]: "통찰",
    [SkillType.DIPLOMACY]: "외교",
    [SkillType.EXPLORATION]: "탐험",
  };

  // 스킬 설명 매핑
  const skillDescriptions: Record<SkillType, string> = {
    [SkillType.TRADE]: "거래 이익 증가, 협상 능력 향상",
    [SkillType.LOGISTICS]: "화물 용량 증가, 이동 효율성 향상",
    [SkillType.INSIGHT]: "시장 정보 정확도 향상, 가격 예측 능력",
    [SkillType.DIPLOMACY]: "평판 획득 증가, 관계 구축 능력",
    [SkillType.EXPLORATION]: "새로운 경로 발견, 여행 위험 감소",
  };

  // 스킬 효과 계산 (레벨에 따른 효과)
  const skillEffect = (() => {
    switch (skill) {
      case SkillType.TRADE:
        return `거래 이익 ${(level * 2).toFixed(0)}% 증가`;
      case SkillType.LOGISTICS:
        return `이동 속도 ${(level * 5).toFixed(0)}% 증가`;
      case SkillType.INSIGHT:
        return `정보 정확도 ${(level * 3).toFixed(0)}% 향상`;
      case SkillType.DIPLOMACY:
        return `평판 획득 ${(level * 4).toFixed(0)}% 증가`;
      case SkillType.EXPLORATION:
        return `이벤트 조정 ${(level * 3).toFixed(0)}% 향상`;
      default:
        return "";
    }
  })();

  // 진행률 계산
  const progress = (level / maxLevel) * 100;

  // 스킬별 색상 테마
  const getSkillColor = (skillType: SkillType): string => {
    switch (skillType) {
      case SkillType.TRADE:
        return COLORS.gold;
      case SkillType.LOGISTICS:
        return COLORS.riona;
      case SkillType.INSIGHT:
        return COLORS.azure;
      case SkillType.DIPLOMACY:
        return COLORS.sahel;
      case SkillType.EXPLORATION:
        return COLORS.kragmore;
      default:
        return COLORS.primary;
    }
  };

  const skillColor = getSkillColor(skill);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <PixelText style={[styles.skillName, { color: skillColor }]}>
          {skillNames[skill]} Lv.{level}
        </PixelText>
        <PixelText variant="caption">
          {level}/{maxLevel}
        </PixelText>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: skillColor }]} />
      </View>

      <PixelText variant="caption" style={styles.description}>
        {skillDescriptions[skill]}
      </PixelText>

      <PixelText style={styles.effect}>{skillEffect}</PixelText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.secondary}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  skillName: {
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: `${COLORS.background.dark}80`,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: BORDERS.radius.sm,
  },
  description: {
    marginBottom: SPACING.xs,
  },
  effect: {
    fontWeight: "bold",
    color: COLORS.text.light,
  },
});

export default SkillBar;
