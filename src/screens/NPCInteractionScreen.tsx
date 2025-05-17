import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import NPCDialogue from "../components/npc/NPCDialogue";
import NPCPortrait from "../components/npc/NPCPortrait";
import NPCTrade from "../components/npc/NPCTrade";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../config/theme";
import { useGame } from "../state/GameContext";
import { AppNavigationProp, RootStackParamList } from "../navigation/types";

type NPCInteractionScreenRouteProp = RouteProp<RootStackParamList, "NPCInteraction">;

const NPCInteractionScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute<NPCInteractionScreenRouteProp>();
  const { npcId } = route.params;
  const { state, dispatch } = useGame();

  const [showingTrades, setShowingTrades] = React.useState(false);

  // NPC 및 대화 정보 가져오기
  const npc = state.npcState.npcs[npcId];
  const currentDialogueId = state.npcState.currentDialogueId;
  const currentDialogue = currentDialogueId ? npc.dialogues.find((d) => d.id === currentDialogueId) : null;

  // 화면 진입 시 NPC 인터랙션 시작
  useEffect(() => {
    dispatch({
      type: "START_NPC_INTERACTION",
      payload: { npcId },
    });
  }, [dispatch, npcId]);

  // 대화 선택지 선택 처리
  const handleSelectChoice = (choiceId: string) => {
    dispatch({
      type: "SELECT_DIALOGUE_CHOICE",
      payload: { choiceId },
    });
  };

  // 거래 구매 처리
  const handlePurchase = (tradeId: string, quantity: number) => {
    dispatch({
      type: "TRADE_WITH_NPC",
      payload: {
        npcId,
        tradeId,
        quantity,
      },
    });
  };

  // 화면 종료 시 NPC 인터랙션 종료
  const handleClose = () => {
    dispatch({ type: "END_NPC_INTERACTION" });
    navigation.goBack();
  };

  if (!npc)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <PixelText>NPC 정보를 찾을 수 없습니다.</PixelText>
          <Button title="돌아가기" onPress={handleClose} style={styles.closeButton} />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/character_background.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          {/* NPC 정보 헤더 */}
          <View style={styles.header}>
            <NPCPortrait npcId={npc.id} size="large" />
            <View style={styles.npcInfo}>
              <PixelText variant="subtitle" style={styles.npcName}>
                {npc.name}123
              </PixelText>
              <PixelText variant="caption">{npc.description}</PixelText>
            </View>
          </View>

          {/* 대화 모드 */}
          {!showingTrades && currentDialogue && (
            <NPCDialogue
              npcId={npc.id}
              npcName={npc.name}
              dialogueText={currentDialogue.text}
              choices={currentDialogue.choices}
              onSelectChoice={handleSelectChoice}
            />
          )}

          {/* 거래 모드 */}
          {showingTrades && npc.trades && (
            <NPCTrade
              npcId={npc.id}
              trades={npc.trades}
              onPurchase={handlePurchase}
              onClose={() => setShowingTrades(false)}
            />
          )}

          {/* 대화 종료 시 */}
          {!showingTrades && !currentDialogue && (
            <View style={styles.endedDialogueContainer}>
              <PixelText style={styles.endedDialogueText}>{npc.name}과의 대화가 종료되었습니다.</PixelText>

              {npc.trades && (
                <Button title="거래 보기" onPress={() => setShowingTrades(true)} style={styles.tradeButton} />
              )}

              <Button title="대화 종료" type="secondary" onPress={handleClose} style={styles.closeButton} />
            </View>
          )}

          {/* 거래/대화 전환 버튼 */}
          {currentDialogue && npc.trades && (
            <View style={styles.tradeButtonContainer}>
              <Button
                title={showingTrades ? "대화로 돌아가기" : "거래 보기"}
                type="secondary"
                onPress={() => setShowingTrades(!showingTrades)}
                style={styles.tradeToggleButton}
              />
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
  header: {
    flexDirection: "row",
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  npcInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  npcName: {
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  endedDialogueContainer: {
    backgroundColor: `${COLORS.background.dark}E6`,
    padding: SPACING.lg,
    borderRadius: BORDERS.radius.md,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  endedDialogueText: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  tradeButton: {
    marginBottom: SPACING.md,
    minWidth: 150,
  },
  closeButton: {
    minWidth: 150,
  },
  tradeButtonContainer: {
    marginTop: SPACING.md,
    alignItems: "center",
  },
  tradeToggleButton: {
    minWidth: 150,
  },
});

export default NPCInteractionScreen;
