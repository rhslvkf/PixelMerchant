import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { COLORS, SPACING } from "../../config/theme";
import { useGame } from "../../state/GameContext";
import PixelText from "../PixelText";
import Button from "../Button";
import NPCDialogue from "./NPCDialogue";
import NPCTrade from "./NPCTrade";

interface NPCModalProps {
  visible: boolean;
  onClose: () => void;
}

const NPCModal: React.FC<NPCModalProps> = ({ visible, onClose }) => {
  const { state, dispatch } = useGame();
  const [showingTrades, setShowingTrades] = useState(false);

  const { activeNPC, currentDialogueId } = state.npcState;

  if (!visible || !activeNPC) return null;

  const npc = state.npcState.npcs[activeNPC];

  if (!npc) return null;

  // 현재 대화 가져오기
  const currentDialogue = currentDialogueId ? npc.dialogues.find((d) => d.id === currentDialogueId) : null;

  // 거래 전환 처리
  const handleToggleTrades = () => {
    setShowingTrades(!showingTrades);
  };

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
        npcId: activeNPC,
        tradeId,
        quantity,
      },
    });
  };

  // 대화 종료 처리
  const handleClose = () => {
    dispatch({ type: "END_NPC_INTERACTION" });
    setShowingTrades(false);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
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

          {/* 하단 버튼 */}
          {!showingTrades && !currentDialogue && (
            <View style={styles.endedDialogueContainer}>
              <PixelText style={styles.endedDialogueText}>{npc.name}과의 대화가 종료되었습니다.</PixelText>

              {npc.trades && <Button title="거래 보기" onPress={handleToggleTrades} style={styles.tradeButton} />}

              <Button title="대화 종료" type="secondary" onPress={handleClose} style={styles.closeButton} />
            </View>
          )}

          {/* 거래/대화 전환 버튼 */}
          {currentDialogue && npc.trades && (
            <View style={styles.tradeButtonContainer}>
              <Button
                title={showingTrades ? "대화로 돌아가기" : "거래 보기"}
                type="secondary"
                onPress={handleToggleTrades}
                style={styles.tradeToggleButton}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
  },
  endedDialogueContainer: {
    backgroundColor: `${COLORS.background.dark}E6`,
    padding: SPACING.lg,
    borderRadius: 8,
    alignItems: "center",
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

export default NPCModal;
