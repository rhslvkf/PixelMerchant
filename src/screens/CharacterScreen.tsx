import { useNavigation } from "@react-navigation/native";
import React from "react";
import { ImageBackground, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import ReputationCard from "../components/character/ReputationCard";
import SkillBar from "../components/character/SkillBar";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../config/theme";
import { CITIES, REGIONS } from "../data/cities";
import { formatDate } from "../logic/DateSystem";
import { SkillType } from "../models";
import { useGame } from "../state/GameContext";
import { formatGold } from "../utils/formatting";

const CharacterScreen = () => {
  const navigation = useNavigation();
  const { state } = useGame();
  const { player, currentDate } = state;

  // 모든 스킬 목록
  const skills = Object.values(SkillType);

  // 평판 목록 (값이 있는 것만)
  const reputations = Object.entries(player.reputation)
    .map(([factionId, level]) => ({
      factionId,
      level,
      name: getFactionName(factionId),
    }))
    .filter((rep) => rep.name !== ""); // 이름이 확인된 것만 표시

  // 진영/도시 이름 가져오기
  function getFactionName(factionId: string): string {
    // 도시 확인
    if (CITIES[factionId]) {
      return CITIES[factionId].name;
    }

    // 지역 확인
    if (REGIONS[factionId]) {
      return REGIONS[factionId].name;
    }

    // 그 외 세력 (나중에 추가할 수 있음)
    const otherFactions: Record<string, string> = {
      golden_compass_guild: "황금나침반 길드",
      free_traders_union: "자유 무역 연합",
      mountain_bandits: "산적단",
      desert_caravan: "사막 대상",
    };

    return otherFactions[factionId] || "";
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/character_background.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}>
            {/* 캐릭터 기본 정보 */}
            <View style={styles.characterInfo}>
              <View style={styles.nameContainer}>
                <PixelText variant="subtitle" style={styles.characterName}>
                  {player.name}
                </PixelText>
                <PixelText variant="caption">{formatDate(currentDate)}</PixelText>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <PixelText variant="caption">골드</PixelText>
                  <PixelText style={styles.goldText}>{formatGold(player.gold)}</PixelText>
                </View>

                <View style={styles.statItem}>
                  <PixelText variant="caption">활동 일수</PixelText>
                  <PixelText>{player.stats.daysPlayed}일</PixelText>
                </View>

                <View style={styles.statItem}>
                  <PixelText variant="caption">방문 도시</PixelText>
                  <PixelText>{player.stats.citiesVisited.length}개</PixelText>
                </View>

                <View style={styles.statItem}>
                  <PixelText variant="caption">거래 성사</PixelText>
                  <PixelText>{player.stats.successfulDeals}회</PixelText>
                </View>

                <View style={styles.statItem}>
                  <PixelText variant="caption">총 이익</PixelText>
                  <PixelText style={styles.profitText}>{formatGold(player.stats.totalProfit)}</PixelText>
                </View>

                <View style={styles.statItem}>
                  <PixelText variant="caption">적재 용량</PixelText>
                  <PixelText>{player.maxWeight}</PixelText>
                </View>
              </View>
            </View>

            {/* 스킬 섹션 */}
            <View style={styles.section}>
              <PixelText style={styles.sectionTitle}>스킬</PixelText>
              {skills.map((skill) => (
                <SkillBar key={skill} skill={skill} level={player.skills[skill] || 1} />
              ))}
            </View>

            {/* 평판 섹션 */}
            <View style={styles.section}>
              <PixelText style={styles.sectionTitle}>평판</PixelText>
              {reputations.length > 0 ? (
                reputations.map((rep) => (
                  <ReputationCard
                    key={rep.factionId}
                    factionId={rep.factionId}
                    factionName={rep.name}
                    level={rep.level}
                  />
                ))
              ) : (
                <View style={styles.emptyMessage}>
                  <PixelText>아직 형성된 평판이 없습니다.</PixelText>
                </View>
              )}
            </View>

            {/* 업적 섹션 (미구현) */}
            <View style={styles.section}>
              <PixelText style={styles.sectionTitle}>업적</PixelText>
              <View style={styles.emptyMessage}>
                <PixelText>아직 획득한 업적이 없습니다.</PixelText>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="뒤로가기" onPress={() => navigation.goBack()} size="medium" type="secondary" />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  characterInfo: {
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  nameContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  characterName: {
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: `${COLORS.secondary}80`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  goldText: {
    color: COLORS.gold,
    fontWeight: "bold",
  },
  profitText: {
    color: COLORS.success,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  emptyMessage: {
    padding: SPACING.md,
    alignItems: "center",
    backgroundColor: `${COLORS.secondary}80`,
    borderRadius: BORDERS.radius.sm,
  },
  footer: {
    marginTop: SPACING.md,
  },
});

export default CharacterScreen;
