import React from "react";
import { StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../../config/theme";
import PixelText from "../PixelText";
import { GameDate, TransportType } from "../../models";
import { formatDate, getSeasonName } from "../../logic/DateSystem";

interface TravelProgressProps {
  currentDay: number;
  totalDays: number;
  currentDate: GameDate;
  arrivalDate: GameDate;
  dangerLevel: number;
  transportType: TransportType;
}

const TravelProgress: React.FC<TravelProgressProps> = ({
  currentDay,
  totalDays,
  currentDate,
  arrivalDate,
  dangerLevel,
  transportType,
}) => {
  // 진행률 계산
  const progress = Math.min(1, currentDay / totalDays);
  const progressPercent = Math.round(progress * 100);

  // 이동 수단 이름 가져오기
  const getTransportName = (type: TransportType): string => {
    switch (type) {
      case TransportType.FOOT:
        return "도보";
      case TransportType.CART:
        return "마차";
      case TransportType.SHIP:
        return "배";
      case TransportType.SPECIAL:
        return "특수 이동";
      default:
        return String(type);
    }
  };

  return (
    <View style={styles.container}>
      <PixelText style={styles.sectionTitle}>여행 진행 상황</PixelText>

      {/* 진행바 */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
      </View>
      <PixelText style={styles.progressText}>{progressPercent}% 완료</PixelText>

      <View style={styles.infoGrid}>
        <View style={styles.infoItem}>
          <PixelText variant="caption">현재 날짜</PixelText>
          <PixelText>{formatDate(currentDate)}</PixelText>
          <PixelText variant="caption">{getSeasonName(currentDate.season)}</PixelText>
        </View>

        <View style={styles.infoItem}>
          <PixelText variant="caption">예상 도착일</PixelText>
          <PixelText>{formatDate(arrivalDate)}</PixelText>
          <PixelText variant="caption">{getSeasonName(arrivalDate.season)}</PixelText>
        </View>

        <View style={styles.infoItem}>
          <PixelText variant="caption">이동 수단</PixelText>
          <PixelText>{getTransportName(transportType)}</PixelText>
        </View>

        <View style={styles.infoItem}>
          <PixelText variant="caption">위험도</PixelText>
          <PixelText style={styles.dangerLevel}>{"★".repeat(dangerLevel)}</PixelText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.background.dark}B3`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginVertical: SPACING.md,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "bold",
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 20,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.sm,
    marginVertical: SPACING.sm,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.berdan,
    borderRadius: BORDERS.radius.sm,
  },
  progressText: {
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    backgroundColor: `${COLORS.secondary}80`,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  dangerLevel: {
    color: COLORS.danger,
  },
});

export default TravelProgress;
