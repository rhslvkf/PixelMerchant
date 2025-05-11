import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { CITY_IMAGES } from "../data/CityImages";
import { ITEMS } from "../data/items";
import { formatDate, getSeasonName } from "../logic/DateSystem";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";
import { getCultureName } from "../utils/localization";

const CityScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { state, dispatch } = useGame();
  const [showTravelOptions, setShowTravelOptions] = useState(false);

  // 현재 도시 정보 가져오기
  const currentCity = state.world.cities[state.currentCityId];
  const currentRegion = state.world.regions[currentCity.regionId];

  // 날짜와 시간 정보 포맷팅
  const dateString = formatDate(state.currentDate);
  const seasonName = getSeasonName(state.currentDate.season);

  // 연결된 도시 정보 가져오기
  const connectedCities = currentCity.travelConnections.map((conn) => ({
    connection: conn,
    city: state.world.cities[conn.destinationId],
  }));

  // 도시 배경 이미지 가져오기
  const getCityBackgroundImage = () => {
    // 도시별 배경 이미지가 설정되어 있으면 해당 이미지 사용
    if (currentCity.backgroundImage && CITY_IMAGES[currentCity.backgroundImage]) {
      return CITY_IMAGES[currentCity.backgroundImage];
    }
    // 배경 이미지 설정이 없거나 매핑되지 않은 이미지면 기본 이미지 사용
    return CITY_IMAGES.default_city_bg;
  };

  // 도시 진입 시 시장 업데이트
  useEffect(() => {
    dispatch({
      type: "UPDATE_MARKET",
      payload: { cityId: state.currentCityId },
    });
  }, [state.currentCityId]);

  // 장소로 이동하는 함수들
  const goToMarket = () => {
    navigation.navigate("Market");
  };

  const goToInventory = () => {
    navigation.navigate("Inventory");
  };

  const goToCharacter = () => {
    navigation.navigate("Character");
  };

  const toggleTravelOptions = () => {
    setShowTravelOptions(!showTravelOptions);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={getCityBackgroundImage()} style={styles.background}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <PixelText variant="subtitle" style={styles.cityName}>
              {currentCity.name}
            </PixelText>
            <PixelText variant="caption">{currentRegion.name}</PixelText>
          </View>
          <View style={styles.headerRight}>
            <PixelText>
              <PixelText style={styles.goldText}>{state.player.gold}</PixelText> 골드
            </PixelText>
            <PixelText variant="caption">
              {dateString} ({seasonName})
            </PixelText>
          </View>
        </View>

        <ScrollView style={styles.contentContainer}>
          <View style={styles.descriptionContainer}>
            <PixelText style={styles.descriptionText}>{currentCity.description}</PixelText>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <PixelText style={styles.infoLabel}>규모</PixelText>
              <PixelText>{getRatingText(currentCity.size)}</PixelText>
            </View>
            <View style={styles.infoItem}>
              <PixelText style={styles.infoLabel}>부유함</PixelText>
              <PixelText>{getRatingText(currentCity.wealthLevel)}</PixelText>
            </View>
            <View style={styles.infoItem}>
              <PixelText style={styles.infoLabel}>문화</PixelText>
              <PixelText>{getCultureName(currentRegion.culture)}</PixelText>
            </View>
          </View>

          <View style={styles.specialtiesContainer}>
            <PixelText style={styles.sectionTitle}>특산품</PixelText>
            <View style={styles.specialtiesList}>
              {currentCity.specialties.map((itemId, index) => (
                <View key={index} style={styles.specialtyItem}>
                  <PixelText>{ITEMS[itemId]?.name || itemId}</PixelText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.placesContainer}>
            <PixelText style={styles.sectionTitle}>이용 가능 장소</PixelText>
            <View style={styles.placesGrid}>
              <TouchableOpacity style={styles.placeButton} onPress={goToMarket}>
                <PixelText>시장</PixelText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.placeButton}>
                <PixelText>여관</PixelText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.placeButton}>
                <PixelText>길드</PixelText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.placeButton}>
                <PixelText>항구</PixelText>
              </TouchableOpacity>
            </View>
          </View>

          {showTravelOptions ? (
            <View style={styles.travelOptionsContainer}>
              <PixelText style={styles.sectionTitle}>여행 가능 도시</PixelText>
              {connectedCities.map((item, index) => (
                <View key={index} style={styles.travelDestination}>
                  <View style={styles.destinationInfo}>
                    <PixelText style={styles.destinationName}>{item.city.name}</PixelText>
                    <PixelText variant="caption">
                      거리: {item.connection.distance} • 위험도: {getRatingText(item.connection.dangerLevel)}
                    </PixelText>
                  </View>
                  <Button
                    title="여행"
                    size="small"
                    onPress={() => navigation.navigate("Travel", { destination: item.city.id })}
                  />
                </View>
              ))}
              <Button
                title="취소"
                type="secondary"
                size="medium"
                onPress={toggleTravelOptions}
                style={styles.closeButton}
              />
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="인벤토리" size="medium" type="secondary" onPress={goToInventory} style={styles.footerButton} />
          <Button title="여행" size="medium" onPress={toggleTravelOptions} style={styles.footerButton} />
          <Button title="캐릭터" size="medium" type="secondary" onPress={goToCharacter} style={styles.footerButton} />
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// 1-5 등급 텍스트 변환 헬퍼 함수
function getRatingText(rating: number): string {
  const symbols = ["★", "★★", "★★★", "★★★★", "★★★★★"];
  return symbols[Math.min(Math.max(0, rating - 1), 4)];
}

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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: `${COLORS.background.dark}CC`,
  },
  headerLeft: {
    flex: 2,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  cityName: {
    marginBottom: SPACING.xs,
  },
  goldText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    padding: SPACING.lg,
  },
  descriptionContainer: {
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  descriptionText: {
    lineHeight: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    marginBottom: SPACING.xs,
    color: COLORS.info,
  },
  specialtiesContainer: {
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "bold",
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  specialtiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  specialtyItem: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    margin: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  placesContainer: {
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  placesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  placeButton: {
    width: "48%",
    backgroundColor: COLORS.berdan,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: "center",
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  travelOptionsContainer: {
    backgroundColor: `${COLORS.background.dark}E0`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  travelDestination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.berdan,
  },
  destinationInfo: {
    flex: 1,
  },
  destinationName: {
    fontWeight: "bold",
    marginBottom: SPACING.xs,
  },
  closeButton: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: SPACING.md,
    backgroundColor: `${COLORS.background.dark}90`,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default CityScreen;
