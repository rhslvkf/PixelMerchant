import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Animated, Dimensions, Image, ImageBackground, StyleSheet, View } from "react-native";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";
import PixelText from "../components/PixelText";
import SaveSlotModal from "../components/SaveSlotModal"; // 추가: SaveSlotModal 임포트
import SettingsModal from "../components/SettingsModal";
import { SCREENS } from "../config/constants";
import { SPACING } from "../config/theme";
import { useGame } from "../state/GameContext";
import { StorageService } from "../storage/StorageService";

const { width, height } = Dimensions.get("window");

const HomeScreen = () => {
  const navigation = useNavigation();
  const { state, dispatch } = useGame();
  const [hasSaveData, setHasSaveData] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false); // 추가: 로드 모달 표시 상태
  const [fadeIn] = useState(new Animated.Value(0));
  const [logoScale] = useState(new Animated.Value(0.95));

  // 저장된 게임 데이터 확인
  useEffect(() => {
    const checkSaveData = async () => {
      const savedGame = await StorageService.loadCurrentGame();
      setHasSaveData(savedGame !== null);
    };

    checkSaveData();
  }, []);

  // 애니메이션 효과
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoScale, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(logoScale, {
            toValue: 0.95,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);

  // 새 게임 시작
  const handleStartNewGame = () => {
    if (hasSaveData) {
      setShowConfirmation(true);
    } else {
      startNewGame();
    }
  };

  const startNewGame = () => {
    setShowConfirmation(false);
    navigation.navigate(SCREENS.CHARACTER_CREATION as never);
  };

  // 게임 이어하기 - 슬롯 선택 모달 표시로 변경
  const handleContinueGame = () => {
    setShowLoadModal(true);
  };

  // 추가: 저장 슬롯에서 게임 로드
  const handleLoadGameFromSlot = async (slotId: string): Promise<boolean> => {
    try {
      // 슬롯에서 게임 로드
      const savedGame = await StorageService.loadGameFromSlot(slotId);

      if (savedGame) {
        // 게임 상태 로드
        dispatch({ type: "LOAD_GAME", payload: { gameState: savedGame } });

        // 도시 화면으로 이동
        navigation.navigate(SCREENS.CITY as never);
        return true;
      } else {
        console.error(`슬롯 ${slotId}에서 게임을 로드할 수 없습니다.`);
        return false;
      }
    } catch (error) {
      console.error("게임 로드 중 오류 발생:", error);
      return false;
    }
  };

  // 설정 열기
  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  return (
    <ImageBackground
      source={require("../assets/images/home_background.webp")}
      style={styles.container}
      resizeMode="cover"
    >
      <Animated.View style={[styles.overlay, { opacity: fadeIn }]}>
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <Image source={require("../assets/images/game_logo.webp")} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <View style={styles.buttonContainer}>
          <Button title="새 게임" onPress={handleStartNewGame} size="large" style={styles.button} />

          <Button
            title="이어하기"
            onPress={handleContinueGame}
            size="large"
            type="secondary"
            disabled={!hasSaveData}
            style={styles.button}
          />

          <Button title="설정" onPress={handleOpenSettings} size="large" style={styles.button} />
        </View>

        <View style={styles.footer}>
          <PixelText variant="caption">v0.1.0 - 개발 중</PixelText>
        </View>
      </Animated.View>

      {/* 설정 모달 */}
      <SettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        settings={state.gameSettings}
        onSaveSettings={(newSettings) => {
          dispatch({
            type: "UPDATE_SETTINGS",
            payload: { settings: newSettings },
          });
          setShowSettings(false);
        }}
      />

      {/* 확인 모달 */}
      <ConfirmationModal
        visible={showConfirmation}
        title="새 게임 시작"
        message="이미 저장된 게임이 있습니다. 새 게임을 시작하면 저장된 게임이 덮어씌워질 수 있습니다. 계속하시겠습니까?"
        confirmText="새 게임 시작"
        cancelText="취소"
        onConfirm={startNewGame}
        onCancel={() => setShowConfirmation(false)}
      />

      {/* 저장 슬롯 선택 모달 추가 */}
      <SaveSlotModal
        visible={showLoadModal}
        onClose={() => setShowLoadModal(false)}
        onSave={handleLoadGameFromSlot}
        isSaveMode={false}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // 스타일은 변경 없음, 기존 코드 그대로 유지
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  logoContainer: {
    width: width * 0.8,
    height: height * 0.3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    width: "80%",
    marginBottom: SPACING.xl,
  },
  button: {
    marginBottom: SPACING.md,
  },
  footer: {
    position: "absolute",
    bottom: SPACING.lg,
    flexDirection: "row",
    justifyContent: "center",
  },
});

export default HomeScreen;
