import React from "react";
import { StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SPACING } from "../../config/theme";
import { ReputationLevel } from "../../models";
import PixelText from "../PixelText";

interface ReputationCardProps {
  factionId: string;
  factionName: string;
  level: ReputationLevel;
}

const ReputationCard: React.FC<ReputationCardProps> = ({ factionId, factionName, level }) => {
  // 평판 레벨 이름 매핑
  const levelNames: Record<ReputationLevel, string> = {
    [ReputationLevel.HATED]: "불신",
    [ReputationLevel.DISLIKED]: "싫음",
    [ReputationLevel.NEUTRAL]: "중립",
    [ReputationLevel.LIKED]: "호감",
    [ReputationLevel.TRUSTED]: "신뢰",
    [ReputationLevel.ADMIRED]: "존경",
    [ReputationLevel.REVERED]: "전설",
  };

  // 평판 효과 설명
  const getReputationEffect = (repLevel: ReputationLevel): string => {
    switch (repLevel) {
      case ReputationLevel.HATED:
        return "거래 가격 20% 할증";
      case ReputationLevel.DISLIKED:
        return "거래 가격 10% 할증";
      case ReputationLevel.NEUTRAL:
        return "기본 거래 조건";
      case ReputationLevel.LIKED:
        return "거래 가격 5% 할인";
      case ReputationLevel.TRUSTED:
        return "거래 가격 10% 할인";
      case ReputationLevel.ADMIRED:
        return "거래 가격 15% 할인";
      case ReputationLevel.REVERED:
        return "거래 가격 20% 할인, 특별 기회";
      default:
        return "";
    }
  };

  // 평판 레벨 색상
  const getLevelColor = (repLevel: ReputationLevel): string => {
    switch (repLevel) {
      case ReputationLevel.HATED:
      case ReputationLevel.DISLIKED:
        return COLORS.danger;
      case ReputationLevel.NEUTRAL:
        return COLORS.text.light;
      case ReputationLevel.LIKED:
      case ReputationLevel.TRUSTED:
        return COLORS.success;
      case ReputationLevel.ADMIRED:
      case ReputationLevel.REVERED:
        return COLORS.primary;
      default:
        return COLORS.text.light;
    }
  };

  // 진행률 계산 (시각적 표현용)
  const getProgressWidth = (repLevel: ReputationLevel): string | number => {
    const levelValues = {
      [ReputationLevel.HATED]: 10,
      [ReputationLevel.DISLIKED]: 25,
      [ReputationLevel.NEUTRAL]: 40,
      [ReputationLevel.LIKED]: 55,
      [ReputationLevel.TRUSTED]: 70,
      [ReputationLevel.ADMIRED]: 85,
      [ReputationLevel.REVERED]: 100,
    };

    return `${levelValues[repLevel] || 40}%`;
  };

  // 진영별 색상 테마 (간단한 예시)
  const getFactionColor = (faction: string): string => {
    const colors: Record<string, string> = {
      berdan_empire: COLORS.berdan,
      riona_union: COLORS.riona,
      kragmore_mountains: COLORS.kragmore,
      sahel_desert: COLORS.sahel,
      azure_islands: COLORS.azure,
      golden_harbor: COLORS.berdan,
      royal_market: COLORS.berdan,
      silver_tide: COLORS.riona,
      mistwood: COLORS.riona,
      iron_peak: COLORS.kragmore,
      stone_gate: COLORS.kragmore,
      sunset_oasis: COLORS.sahel,
      red_dune: COLORS.sahel,
    };

    return colors[faction] || COLORS.primary;
  };

  const levelColor = getLevelColor(level);
  const factionColor = getFactionColor(factionId);
  const progressWidth = getProgressWidth(level);

  return (
    <View style={[styles.container, { borderColor: factionColor }]}>
      <View style={styles.header}>
        <PixelText style={[styles.factionName, { color: factionColor }]}>{factionName}</PixelText>
        <PixelText style={[styles.levelName, { color: levelColor }]}>{levelNames[level]}</PixelText>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: progressWidth as any,
              backgroundColor: factionColor,
            },
          ]}
        />
      </View>

      <PixelText style={styles.effect}>{getReputationEffect(level)}</PixelText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.secondary}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  factionName: {
    fontWeight: "bold",
  },
  levelName: {
    fontWeight: "bold",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: `${COLORS.background.dark}80`,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: BORDERS.radius.sm,
  },
  effect: {
    color: COLORS.text.light,
  },
});

export default ReputationCard;
