import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import TravelModal from "../components/TravelModal";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { CITY_IMAGES } from "../data/CityImages";
import { ITEMS } from "../data/items";
import { formatDate, getSeasonName } from "../logic/DateSystem";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";
import { getCultureName } from "../utils/localization";
import { formatRating } from "../utils/formatting";

// 공통 컨테이너 스타일을 위한 상수
const CONTAINER_BACKGROUND = `${COLORS.background.dark}B3`;

// 도시 정보 항목 컴포넌트
interface InfoItemProps {
  label: string;
  value: string;
  hasBorder?: boolean;
}

const InfoItem = ({ label, value, hasBorder = false }: InfoItemProps) => (
  <View style={[styles.infoItem, hasBorder ? { borderRightWidth: 1 } : {}]}>
    <PixelText style={styles.infoLabel}>{label}</PixelText>
    <PixelText>{value}</PixelText>
  </View>
);

// 특산품 항목 컴포넌트
interface SpecialtyItemProps {
  itemId: string;
}

const SpecialtyItem = ({ itemId }: SpecialtyItemProps) => (
  <View style={styles.specialtyItem}>
    <PixelText>{ITEMS[itemId]?.name || itemId}</PixelText>
  </View>
);

// 장소 버튼 컴포넌트
interface PlaceButtonProps {
  name: string;
  onPress?: () => void;
}

const PlaceButton = ({ name, onPress }: PlaceButtonProps) => (
  <TouchableOpacity style={styles.placeButton} onPress={onPress}>
    <PixelText>{name}</PixelText>
  </TouchableOpacity>
);

const CityScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { state, dispatch } = useGame();
  const [showTravelModal, setShowTravelModal] = useState(false);

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

  // 도시 진입 시 시장 업데이트
  useEffect(() => {
    dispatch({
      type: "UPDATE_MARKET",
      payload: { cityId: state.currentCityId },
    });
  }, [state.currentCityId, dispatch]);

  // 도시 배경 이미지 가져오기
  const getCityBackgroundImage = () => {
    return currentCity.backgroundImage && CITY_IMAGES[currentCity.backgroundImage]
      ? CITY_IMAGES[currentCity.backgroundImage]
      : CITY_IMAGES.default_city_bg;
  };

  // 이벤트 핸들러들
  const toggleTravelModal = () => setShowTravelModal(!showTravelModal);
  const goToMarket = () => navigation.navigate("Market");
  const goToInventory = () => navigation.navigate("Inventory");
  const goToCharacter = () => navigation.navigate("Character");

  // UI 렌더링
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={getCityBackgroundImage()} style={styles.background} imageStyle={styles.backgroundImage}>
        {/* 헤더 섹션 */}
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

        {/* 컨텐츠 섹션 */}
        <ScrollView style={styles.contentContainer}>
          <View style={styles.descriptionContainer}>
            <PixelText style={styles.descriptionText}>{currentCity.description}</PixelText>
          </View>

          <View style={styles.infoContainer}>
            <InfoItem label="규모" value={formatRating(currentCity.size)} hasBorder />
            <InfoItem label="부유함" value={formatRating(currentCity.wealthLevel)} hasBorder />
            <InfoItem label="문화" value={getCultureName(currentRegion.culture)} />
          </View>

          <View style={styles.specialtiesContainer}>
            <PixelText style={styles.sectionTitle}>특산품</PixelText>
            <View style={styles.specialtiesList}>
              {currentCity.specialties.map((itemId, index) => (
                <SpecialtyItem key={index} itemId={itemId} />
              ))}
            </View>
          </View>

          <View style={styles.placesContainer}>
            <PixelText style={styles.sectionTitle}>이용 가능 장소</PixelText>
            <View style={styles.placesGrid}>
              <PlaceButton name="시장" onPress={goToMarket} />
              <PlaceButton name="여관" />
              <PlaceButton name="길드" />
              <PlaceButton name="항구" />
            </View>
          </View>
        </ScrollView>

        {/* 푸터 섹션 */}
        <View style={styles.footer}>
          <Button title="인벤토리" size="medium" type="secondary" onPress={goToInventory} style={styles.footerButton} />
          <Button title="여행" size="medium" onPress={toggleTravelModal} style={styles.footerButton} />
          <Button title="캐릭터" size="medium" type="secondary" onPress={goToCharacter} style={styles.footerButton} />
        </View>
      </ImageBackground>

      <TravelModal visible={showTravelModal} onClose={toggleTravelModal} destinations={connectedCities} />
    </SafeAreaView>
  );
};

// 공통 스타일 속성 추출
const containerStyle = {
  backgroundColor: CONTAINER_BACKGROUND,
  borderRadius: BORDERS.radius.md,
  padding: SPACING.md,
  marginBottom: SPACING.md,
  ...SHADOWS.medium,
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
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: CONTAINER_BACKGROUND,
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
    ...containerStyle,
  },
  descriptionText: {
    lineHeight: 20,
  },
  infoContainer: {
    ...containerStyle,
    flexDirection: "row",
    justifyContent: "center",
  },
  infoItem: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: SPACING.sm,
    borderRightColor: COLORS.primary,
  },
  infoLabel: {
    marginBottom: SPACING.xs,
    color: COLORS.info,
  },
  specialtiesContainer: {
    ...containerStyle,
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
    ...containerStyle,
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
