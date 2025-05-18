import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import NPCList from "../components/npc/NPCList";
import NPCModal from "../components/npc/NPCModal";
import PixelText from "../components/PixelText";
import TravelModal from "../components/TravelModal";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { CITY_IMAGES } from "../data/CityImages";
import { ITEMS } from "../data/items";
import { useNPCInteraction } from "../hooks/useNPCInteraction";
import { formatDate, getSeasonName } from "../logic/DateSystem";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";
import { formatRating } from "../utils/formatting";
import { getCultureName } from "../utils/localization";
import SaveSlotModal from "../components/SaveSlotModal";
import { StorageService } from "../storage/StorageService";

// 공통 컨테이너 스타일을 위한 상수
const CONTAINER_BACKGROUND = `${COLORS.background.dark}B3`;

// 도시 정보 항목 컴포넌트
interface InfoItemProps {
  label: string;
  value: string;
  hasBorder?: boolean;
}

const InfoItem = React.memo(({ label, value, hasBorder = false }: InfoItemProps) => (
  <View style={[styles.infoItem, hasBorder ? { borderRightWidth: 1 } : {}]}>
    <PixelText style={styles.infoLabel}>{label}</PixelText>
    <PixelText>{value}</PixelText>
  </View>
));

// 특산품 항목 컴포넌트
interface SpecialtyItemProps {
  itemId: string;
}

const SpecialtyItem = React.memo(({ itemId }: SpecialtyItemProps) => (
  <View style={styles.specialtyItem}>
    <PixelText>{ITEMS[itemId]?.name || itemId}</PixelText>
  </View>
));

// 장소 버튼 컴포넌트
interface PlaceButtonProps {
  name: string;
  onPress?: () => void;
}

const PlaceButton = React.memo(({ name, onPress }: PlaceButtonProps) => (
  <TouchableOpacity style={styles.placeButton} onPress={onPress}>
    <PixelText>{name}</PixelText>
  </TouchableOpacity>
));

// 도시 설명 컴포넌트
interface CityInfoProps {
  description: string;
}

const CityInfo = React.memo(({ description }: CityInfoProps) => (
  <View style={styles.descriptionContainer}>
    <PixelText style={styles.descriptionText}>{description}</PixelText>
  </View>
));

// 특산품 목록 컴포넌트
interface SpecialtiesListProps {
  specialties: string[];
}

const SpecialtiesList = React.memo(({ specialties }: SpecialtiesListProps) => (
  <View style={styles.specialtiesContainer}>
    <PixelText style={styles.sectionTitle}>특산품</PixelText>
    <View style={styles.specialtiesList}>
      {specialties.map((itemId, index) => (
        <SpecialtyItem key={index} itemId={itemId} />
      ))}
    </View>
  </View>
));

// 장소 목록 컴포넌트
interface PlacesGridProps {
  onMarketPress: () => void;
  onQuestPress: () => void;
}

const PlacesGrid = React.memo(({ onMarketPress, onQuestPress }: PlacesGridProps) => (
  <View style={styles.placesContainer}>
    <PixelText style={styles.sectionTitle}>이용 가능 장소</PixelText>
    <View style={styles.placesGrid}>
      <PlaceButton name="시장" onPress={onMarketPress} />
      <PlaceButton name="길드" onPress={onQuestPress} />
      <PlaceButton name="여관" />
    </View>
  </View>
));

const CityScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { state, dispatch } = useGame();
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [showNPCList, setShowNPCList] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { npcsInCurrentCity, npcModalVisible, startInteraction, endInteraction } = useNPCInteraction();

  // 현재 도시 정보 가져오기
  const currentCity = state.world.cities[state.currentCityId];
  const currentRegion = state.world.regions[currentCity.regionId];

  // 날짜와 시간 정보 포맷팅
  const dateString = useMemo(() => formatDate(state.currentDate), [state.currentDate]);
  const seasonName = useMemo(() => getSeasonName(state.currentDate.season), [state.currentDate.season]);

  // 연결된 도시 정보 가져오기 (최적화)
  const connectedCities = useMemo(() => {
    return currentCity.travelConnections.map((conn) => ({
      connection: conn,
      city: state.world.cities[conn.destinationId],
    }));
  }, [currentCity.travelConnections, state.world.cities]);

  // 도시 배경 이미지 가져오기 (최적화)
  const cityBackgroundImage = useMemo(() => {
    return currentCity.backgroundImage && CITY_IMAGES[currentCity.backgroundImage]
      ? CITY_IMAGES[currentCity.backgroundImage]
      : CITY_IMAGES.default_city_bg;
  }, [currentCity.backgroundImage]);

  // 도시 진입 시 시장 업데이트
  useEffect(() => {
    dispatch({
      type: "UPDATE_MARKET",
      payload: { cityId: state.currentCityId },
    });
  }, [state.currentCityId, dispatch]);

  // 이벤트 핸들러들
  const toggleTravelModal = () => setShowTravelModal(!showTravelModal);
  const goToMarket = () => navigation.navigate("Market");
  const goToQuest = () => navigation.navigate("Quest");
  const goToInventory = () => navigation.navigate("Inventory");
  const goToCharacter = () => navigation.navigate("Character");

  // NPC 선택 핸들러
  const handleSelectNPC = (npcId: string) => {
    startInteraction(npcId);
  };

  const handleSaveGame = async (slotId: string) => {
    // 현재 게임 상태 저장
    const success = await StorageService.saveGameToSlot(state, slotId);
    if (success) {
      // 저장 성공 메시지 (선택 사항 - 알림 컴포넌트가 있다면 활용)
      console.log(`게임이 "${slotId}" 슬롯에 저장되었습니다.`);
    } else {
      // 저장 실패 메시지
      console.error(`저장에 실패했습니다.`);
    }
  };

  // UI 렌더링
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={cityBackgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
        {/* 헤더 섹션 */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <PixelText variant="subtitle" style={styles.cityName}>
              {currentCity.name}
            </PixelText>
            <PixelText variant="caption">{currentRegion.name}</PixelText>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.currencyContainer}>
              <View style={styles.currencyItem}>
                <Image source={require("../assets/images/gold_coin.webp")} style={styles.coinIcon} />
                <PixelText style={styles.goldText}>{Math.round(state.player.gold)}</PixelText>
              </View>
              <View style={styles.currencyItem}>
                <Image source={require("../assets/images/silver_coin.webp")} style={styles.coinIcon} />
                <PixelText style={styles.silverText}>{Math.round((state.player.gold % 1) * 100)}</PixelText>
              </View>
            </View>
            <PixelText variant="caption">
              {dateString} ({seasonName})
            </PixelText>
          </View>
        </View>

        {/* 컨텐츠 섹션 */}
        <ScrollView style={styles.contentContainer}>
          <CityInfo description={currentCity.description} />

          <View style={styles.infoContainer}>
            <InfoItem label="규모" value={formatRating(currentCity.size)} hasBorder />
            <InfoItem label="부유함" value={formatRating(currentCity.wealthLevel)} hasBorder />
            <InfoItem label="문화" value={getCultureName(currentRegion.culture)} />
          </View>

          <SpecialtiesList specialties={currentCity.specialties} />

          {/* NPC 목록 섹션 추가 */}
          <View style={styles.npcContainer}>
            <PixelText style={styles.sectionTitle}>주민</PixelText>
            <NPCList npcs={npcsInCurrentCity} onSelectNPC={handleSelectNPC} />
          </View>

          <PlacesGrid onMarketPress={goToMarket} onQuestPress={goToQuest} />
        </ScrollView>

        {/* 푸터 섹션 */}
        <View style={styles.footer}>
          <Button title="인벤토리" size="medium" type="secondary" onPress={goToInventory} style={styles.footerButton} />
          <Button title="여행" size="medium" onPress={toggleTravelModal} style={styles.footerButton} />
          <Button
            title="저장"
            size="medium"
            type="secondary"
            onPress={() => setShowSaveModal(true)}
            style={styles.footerButton}
          />
          <Button title="캐릭터" size="medium" type="secondary" onPress={goToCharacter} style={styles.footerButton} />
        </View>
      </ImageBackground>

      {/* 모달 */}
      <TravelModal visible={showTravelModal} onClose={toggleTravelModal} destinations={connectedCities} />
      <NPCModal visible={npcModalVisible} onClose={endInteraction} />

      {/* NPC 목록 모달 */}
      {showNPCList && (
        <Modal transparent animationType="fade" visible={showNPCList} onRequestClose={() => setShowNPCList(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <PixelText variant="subtitle" style={styles.modalTitle}>
                도시 주민
              </PixelText>
              <NPCList
                npcs={npcsInCurrentCity}
                onSelectNPC={(npcId) => {
                  setShowNPCList(false);
                  startInteraction(npcId);
                }}
              />
              <Button title="닫기" onPress={() => setShowNPCList(false)} type="secondary" style={styles.closeButton} />
            </View>
          </View>
        </Modal>
      )}

      <SaveSlotModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveGame}
        isSaveMode={true}
      />
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
    width: "31%",
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
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  silverText: {
    color: COLORS.silver,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
  npcContainer: {
    ...containerStyle,
  },
});

export default CityScreen;
