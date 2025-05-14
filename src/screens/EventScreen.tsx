import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import EventCard from "../components/events/EventCard";
import { COLORS, SPACING } from "../config/theme";
import { useEvents } from "../hooks/useEvents";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";
import { useGame } from "../state/GameContext";

type EventScreenRouteProp = RouteProp<RootStackParamList, "Event">;

const EventScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<EventScreenRouteProp>();
  const { eventId } = route.params;
  const { state, dispatch } = useGame();

  // 이벤트 로직 훅 사용
  const {
    currentEvent,
    isLoading,
    hasChoicePending,
    selectedChoice,
    selectedOutcome,
    selectChoice,
    confirmChoice,
    canSelectChoice,
    dismissEvent,
  } = useEvents(eventId);

  // 화면 진입 시 이벤트 진행 처리
  useEffect(() => {
    if (eventId) {
      dispatch({
        type: "PROGRESS_EVENT",
        payload: { eventId },
      });
    }
  }, [eventId, dispatch]);

  // 뒤로 가기 처리
  const handleBack = () => {
    dismissEvent();
  };

  // 로딩 중
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <PixelText>이벤트 정보를 불러오는 중...</PixelText>
        </View>
      </SafeAreaView>
    );
  }

  // 이벤트 없음
  if (!currentEvent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noEventContainer}>
          <PixelText>진행 중인 이벤트가 없습니다.</PixelText>
          <Button title="돌아가기" onPress={handleBack} style={styles.backButton} />
        </View>
      </SafeAreaView>
    );
  }

  // 배경 이미지 선택
  const getBackgroundImage = () => {
    const eventTypeMap = {
      travel: require("../assets/images/travel_background.webp"),
      city: require("../assets/images/cities/default_city_bg.webp"),
      // story: require("../assets/images/event_background.webp"),
      story: require("../assets/images/travel_background.webp"),
      trade: require("../assets/images/market_background.webp"),
    };

    return eventTypeMap[currentEvent.type] || eventTypeMap.story;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={getBackgroundImage()} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.container}>
          <EventCard
            event={currentEvent}
            selectedChoice={selectedChoice}
            selectedOutcome={selectedOutcome}
            onSelectChoice={selectChoice}
            onConfirmChoice={confirmChoice}
            canSelectChoice={canSelectChoice}
          />

          {!hasChoicePending && !selectedChoice && (
            <View style={styles.footer}>
              <Button title="무시하기" onPress={handleBack} type="secondary" size="medium" />
            </View>
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  backButton: {
    marginTop: SPACING.md,
    minWidth: 150,
  },
});

export default EventScreen;
