import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import TravelEvent from "../components/travel/TravelEvent";
import TravelMap from "../components/travel/TravelMap";
import TravelProgress from "../components/travel/TravelProgress";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { formatDate } from "../logic/DateSystem";
import { TransportType } from "../models";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";
import { useGame } from "../state/GameContext";

type TravelScreenRouteProp = RouteProp<RootStackParamList, "Travel">;

const TravelScreen = () => {
  const { state, dispatch } = useGame();
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<TravelScreenRouteProp>();
  const { destination } = route.params;

  // 상태 관리
  const [isTraveling, setIsTraveling] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [selectedTransport, setSelectedTransport] = useState<TransportType>(TransportType.FOOT);

  // 도시 정보
  const fromCity = state.world.cities[state.currentCityId];
  const toCity = state.world.cities[destination];

  // 여행 상태 체크
  const travelState = state.travelState;
  const isInTravel = travelState !== undefined;

  // 여행 연결 정보 찾기
  const connection = fromCity.travelConnections.find((conn) => conn.destinationId === destination);

  // 컴포넌트 마운트 시 여행 상태 확인
  useEffect(() => {
    if (isInTravel) {
      setIsTraveling(true);
      checkForEvents();
    }
  }, [isInTravel, travelState]);

  // 이벤트 확인 함수
  const checkForEvents = () => {
    if (!travelState) return;

    // 현재 날에 일어난 이벤트 찾기
    const activeEvent = travelState.events.find((event) => event.day === travelState.currentDay && !event.processed);

    if (activeEvent) {
      setCurrentEvent(activeEvent);
      setShowEvent(true);
    } else {
      setShowEvent(false);
    }
  };

  // 이벤트 발생 시마다 확인
  useEffect(() => {
    checkForEvents();
  }, [travelState?.currentDay]);

  // 여행 시작 함수
  const handleStartTravel = () => {
    if (!connection) return;

    // 여행 시작 액션
    dispatch({
      type: "START_TRAVEL",
      payload: {
        toCityId: destination,
        transportType: selectedTransport,
      },
    });

    setIsTraveling(true);
  };

  // 다음 날로 진행 함수
  const handleNextDay = () => {
    dispatch({ type: "PROGRESS_TRAVEL" });
  };

  // 이벤트 처리 함수
  const handleEventChoice = (choiceId: string) => {
    if (!currentEvent) return;

    // 이벤트 처리 액션 디스패치
    dispatch({
      type: "PROCESS_TRAVEL_EVENT",
      payload: {
        eventId: currentEvent.id,
        choiceId: choiceId,
      },
    });

    setShowEvent(false);

    // 모든 날이 지났으면 여행 완료
    if (travelState && travelState.currentDay >= travelState.route.estimatedDays) {
      handleCompleteTravel();
    }
  };

  // 여행 완료 함수
  const handleCompleteTravel = () => {
    dispatch({ type: "COMPLETE_TRAVEL" });
    navigation.navigate("City");
  };

  // 여행 취소 함수
  const handleCancelTravel = () => {
    navigation.goBack();
  };

  // 사용 가능한 이동 수단 렌더링
  const renderTransportOptions = () => {
    if (!connection) return null;

    return (
      <View style={styles.transportOptions}>
        <PixelText style={styles.sectionTitle}>이동 수단 선택</PixelText>
        <View style={styles.transportButtonsContainer}>
          {connection.transportOptions.map((transport) => (
            <Button
              key={transport}
              title={getTransportName(transport)}
              size="medium"
              type={selectedTransport === transport ? "primary" : "secondary"}
              onPress={() => setSelectedTransport(transport)}
              style={styles.transportButton}
            />
          ))}
        </View>
      </View>
    );
  };

  // 이동 수단 이름 가져오기
  const getTransportName = (transport: TransportType): string => {
    switch (transport) {
      case TransportType.FOOT:
        return "도보";
      case TransportType.CART:
        return "마차";
      case TransportType.SHIP:
        return "배";
      case TransportType.SPECIAL:
        return "특수 이동";
      default:
        return String(transport);
    }
  };

  if (!fromCity || !toCity || !connection) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <PixelText>여행 정보를 불러올 수 없습니다.</PixelText>
          <Button title="돌아가기" onPress={handleCancelTravel} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom", "left", "right"]} style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/travel_background.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <PixelText variant="subtitle">
              {fromCity.name} → {toCity.name}
            </PixelText>
            <PixelText>
              {isInTravel && travelState
                ? `${travelState.currentDay}일차 / ${travelState.route.estimatedDays}일`
                : `예상 소요 일수: ${Math.ceil(connection.distance / getSpeedFactor(selectedTransport))}일`}
            </PixelText>
          </View>

          {/* 여행 지도 */}
          <TravelMap
            fromCity={fromCity}
            toCity={toCity}
            progress={isInTravel ? travelState.currentDay / travelState.route.estimatedDays : 0}
          />

          {/* 여행 진행 정보 */}
          {isInTravel && travelState && (
            <TravelProgress
              currentDay={travelState.currentDay}
              totalDays={travelState.route.estimatedDays}
              currentDate={state.currentDate}
              arrivalDate={travelState.arrivalDate}
              dangerLevel={connection.dangerLevel}
              transportType={travelState.route.transportType}
            />
          )}

          {/* 여행 전 화면 */}
          {!isTraveling && (
            <View style={styles.contentContainer}>
              <View style={styles.infoContainer}>
                <PixelText style={styles.sectionTitle}>여행 정보</PixelText>
                <View style={styles.infoRow}>
                  <PixelText>출발지:</PixelText>
                  <PixelText>{fromCity.name}</PixelText>
                </View>
                <View style={styles.infoRow}>
                  <PixelText>목적지:</PixelText>
                  <PixelText>{toCity.name}</PixelText>
                </View>
                <View style={styles.infoRow}>
                  <PixelText>거리:</PixelText>
                  <PixelText>{connection.distance} 마일</PixelText>
                </View>
                <View style={styles.infoRow}>
                  <PixelText>위험도:</PixelText>
                  <PixelText>{"★".repeat(connection.dangerLevel)}</PixelText>
                </View>
                <View style={styles.infoRow}>
                  <PixelText>현재 날짜:</PixelText>
                  <PixelText>{formatDate(state.currentDate)}</PixelText>
                </View>
              </View>

              {renderTransportOptions()}

              <View style={styles.buttonContainer}>
                <Button
                  title="여행 시작"
                  size="large"
                  onPress={handleStartTravel}
                  disabled={!connection.transportOptions.includes(selectedTransport)}
                />
                <Button
                  title="취소"
                  size="medium"
                  type="secondary"
                  onPress={handleCancelTravel}
                  style={styles.cancelButton}
                />
              </View>
            </View>
          )}

          {/* 여행 중 화면 */}
          {isTraveling && !showEvent && (
            <View style={styles.travelingContainer}>
              <View style={styles.journeyTextContainer}>
                <PixelText variant="body" style={styles.journeyText}>
                  {getTravelDescription(travelState?.route.transportType || selectedTransport)}
                </PixelText>
              </View>

              <View style={styles.travelButtonContainer}>
                {travelState && travelState.currentDay >= travelState.route.estimatedDays ? (
                  <Button title="목적지 도착" size="large" onPress={handleCompleteTravel} />
                ) : (
                  <Button title="다음 날로" size="large" onPress={handleNextDay} />
                )}
              </View>
            </View>
          )}

          {/* 이벤트 화면 */}
          {isTraveling && showEvent && currentEvent && (
            <TravelEvent event={currentEvent} onChoice={handleEventChoice} />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// 이동 수단별 속도 계수
const getSpeedFactor = (transport: TransportType): number => {
  switch (transport) {
    case TransportType.FOOT:
      return 1;
    case TransportType.CART:
      return 1.5;
    case TransportType.SHIP:
      return 2;
    case TransportType.SPECIAL:
      return 3;
    default:
      return 1;
  }
};

// 여행 설명 텍스트
const getTravelDescription = (transport: TransportType): string => {
  const descriptions: Record<TransportType, string[]> = {
    [TransportType.FOOT]: [
      "먼지가 일어나는 길 위에서 또 하루가 지나갑니다. 다행히 날씨가 좋아 여행이 수월합니다.",
      "발에 물집이 생기기 시작했지만, 목적지를 향해 계속 걸어갑니다.",
      "길가의 풍경을 감상하며 꾸준히 전진합니다. 이동 거리를 잘 유지하고 있습니다.",
    ],
    [TransportType.CART]: [
      "마차가 울퉁불퉁한 길을 따라 흔들리지만, 도보보다는 훨씬 편안합니다.",
      "마차 바퀴가 진흙에 잠시 빠졌지만, 곧 다시 길을 계속 갑니다.",
      "나무 그늘 아래서 말에게 휴식을 주고 다시 길을 나섭니다.",
    ],
    [TransportType.SHIP]: [
      "배는 순조로운 바람을 타고 목적지를 향해 항해 중입니다.",
      "약간의 파도가 있지만, 선원들은 능숙하게 배를 조종하고 있습니다.",
      "갑판에서 바다 풍경을 즐기며 여행을 계속합니다.",
    ],
    [TransportType.SPECIAL]: [
      "특별한 이동 수단은 일반적인 여행보다 훨씬 빠른 속도로 목적지를 향해 나아갑니다.",
      "고급 기술로 만들어진 이 이동 수단은 거의 모든 지형을 쉽게 통과합니다.",
      "빠른 속도로 이동하여 예상보다 빨리 목적지에 도착할 것 같습니다.",
    ],
  };

  const options = descriptions[transport] || descriptions[TransportType.FOOT];
  return options[Math.round(Math.random() * options.length)];
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
  header: {
    alignItems: "center",
    marginBottom: SPACING.lg,
    backgroundColor: `${COLORS.background.dark}99`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    ...SHADOWS.light,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  infoContainer: {
    backgroundColor: `${COLORS.background.dark}B3`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "bold",
    marginBottom: SPACING.sm,
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  transportOptions: {
    backgroundColor: `${COLORS.background.dark}B3`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  transportButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  transportButton: {
    margin: SPACING.xs,
    minWidth: 100,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cancelButton: {
    marginTop: SPACING.md,
  },
  travelingContainer: {
    flex: 1,
    backgroundColor: `${COLORS.background.dark}B3`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    ...SHADOWS.light,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  journeyTextContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  journeyText: {
    textAlign: "center",
    lineHeight: 24,
  },
  travelButtonContainer: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
});

export default TravelScreen;
