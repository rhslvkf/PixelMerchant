import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../config/theme";
import { formatDate } from "../logic/DateSystem";
import { StorageService } from "../storage/StorageService";
import Button from "./Button";
import PixelText from "./PixelText";

// 모달 상태를 나타내는 열거형
enum ModalState {
  SLOT_SELECTION, // 저장 슬롯 선택 화면
  CONFIRM_OVERWRITE, // 덮어쓰기 확인 화면
  PROCESSING, // 저장/로드 중 화면
  OPERATION_COMPLETE, // 작업 완료 화면
}

interface SaveSlotModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (slotId: string) => Promise<boolean>;
  isSaveMode: boolean; // true: 저장 모드, false: 불러오기 모드
}

interface SaveSlotInfo {
  slotId: string;
  displayName: string;
  playerName: string | null;
  gameDate: string | null;
  realSavedAt: string | null;
  isEmpty: boolean;
  isAutoSave: boolean;
}

const SaveSlotModal: React.FC<SaveSlotModalProps> = ({ visible, onClose, onSave, isSaveMode }) => {
  const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(ModalState.SLOT_SELECTION);
  const [savedSlotName, setSavedSlotName] = useState("");

  useEffect(() => {
    if (visible) {
      loadSlotInfo();
      setModalState(ModalState.SLOT_SELECTION);
    }
  }, [visible]);

  const loadSlotInfo = async () => {
    // 수동 저장 슬롯 (1, 2)과 자동 저장 슬롯 (auto)
    const slotIds = ["slot1", "slot2", "auto"];
    const slotInfo: SaveSlotInfo[] = [];

    for (const slotId of slotIds) {
      const isAutoSave = slotId === "auto";
      const displayName = isAutoSave ? "자동 저장" : `저장 슬롯 ${slotId.slice(-1)}`;

      const saveResult = await StorageService.loadGameFromSlot(slotId);
      const isEmpty = saveResult === null;

      let playerName = null;
      let gameDate = null;
      let realSavedAt = null;

      if (!isEmpty && saveResult) {
        try {
          // 저장된 데이터에서 정보 추출
          const saveData = saveResult;

          // 플레이어 이름
          playerName = saveData.player?.name || null;

          // 게임 내 날짜
          if (saveData.currentDate) {
            gameDate = formatDate(saveData.currentDate);
          }

          // 실제 저장 시간 (ISO 문자열을 가독성 있게 변환)
          const savedAtTimestamp = await StorageService.getSavedAtTime(slotId);
          if (savedAtTimestamp) {
            const date = new Date(savedAtTimestamp);
            realSavedAt = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date
              .getDate()
              .toString()
              .padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
          }
        } catch (e) {
          console.error(`데이터 파싱 오류: ${e}`);
        }
      }

      slotInfo.push({
        slotId,
        displayName,
        playerName,
        gameDate,
        realSavedAt,
        isEmpty,
        isAutoSave,
      });
    }

    setSlots(slotInfo);
  };

  const handleSlotSelect = (slotId: string) => {
    // 로드 모드에서는 비어있는 슬롯 선택 불가
    const slot = slots.find((s) => s.slotId === slotId);
    if (!isSaveMode && slot?.isEmpty) {
      return;
    }

    // 저장 모드에서는 자동 저장 슬롯 선택 불가
    if (isSaveMode && slot?.isAutoSave) {
      return;
    }

    setSelectedSlot(slotId);

    // 저장 모드에서 이미 데이터가 있는 슬롯 선택 시 확인 모달 표시
    if (isSaveMode && slot && !slot.isEmpty) {
      setModalState(ModalState.CONFIRM_OVERWRITE);
      return;
    }

    // 저장/로드 작업 시작
    handleProcessSlot(slotId);
  };

  // 저장/로드 작업을 처리하는 별도의 함수
  const handleProcessSlot = async (slotId: string) => {
    if (modalState === ModalState.PROCESSING) return; // 이미 처리 중이면 중복 실행 방지

    // 처리 시작
    setModalState(ModalState.PROCESSING);

    try {
      const success = await onSave(slotId);

      // 작업 완료
      if (success) {
        const slot = slots.find((s) => s.slotId === slotId);
        setSavedSlotName(slot?.displayName || "선택한 슬롯");
        setModalState(ModalState.OPERATION_COMPLETE);
      } else {
        // 작업 실패 시 슬롯 선택 화면으로 돌아감
        setModalState(ModalState.SLOT_SELECTION);
      }
    } catch (error) {
      console.error("작업 중 오류 발생:", error);
      // 오류 발생 시 슬롯 선택 화면으로 돌아감
      setModalState(ModalState.SLOT_SELECTION);
    }
  };

  const handleConfirmOverwrite = () => {
    if (selectedSlot) {
      handleProcessSlot(selectedSlot);
    }
  };

  // 완료 후 모달 닫기
  const handleComplete = () => {
    onClose();
  };

  // 취소 또는 닫기
  const handleCancel = () => {
    onClose();
  };

  // 현재 모달 상태에 따라 내용 렌더링
  const renderModalContent = () => {
    switch (modalState) {
      case ModalState.SLOT_SELECTION:
        return (
          <>
            <PixelText variant="subtitle" style={styles.title}>
              {isSaveMode ? "게임 저장" : "저장 데이터 불러오기"}
            </PixelText>
            <View style={styles.slotsContainer}>
              {slots.map((slot) => (
                <TouchableOpacity
                  key={slot.slotId}
                  style={[
                    styles.slotItem,
                    slot.isAutoSave && styles.autoSlot,
                    slot.isEmpty && !isSaveMode && styles.disabledSlot,
                    isSaveMode && slot.isAutoSave && styles.disabledSlot,
                  ]}
                  onPress={() => handleSlotSelect(slot.slotId)}
                  disabled={(slot.isEmpty && !isSaveMode) || (isSaveMode && slot.isAutoSave)}
                >
                  {/* 슬롯 기본 정보 */}
                  <View style={styles.slotHeader}>
                    <PixelText style={styles.slotName}>{slot.displayName}</PixelText>
                    {slot.isAutoSave && <PixelText style={styles.autoSaveTag}>자동</PixelText>}
                  </View>

                  {/* 슬롯 상세 정보 */}
                  {slot.isEmpty ? (
                    <PixelText style={styles.emptyText}>비어 있음</PixelText>
                  ) : (
                    <View style={styles.slotDetails}>
                      {slot.playerName && (
                        <PixelText style={styles.slotDetailText}>플레이어: {slot.playerName}</PixelText>
                      )}
                      {slot.gameDate && <PixelText style={styles.slotDetailText}>게임 날짜: {slot.gameDate}</PixelText>}
                      {slot.realSavedAt && (
                        <PixelText style={styles.savedAtText}>저장 시간: {slot.realSavedAt}</PixelText>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            <Button title="취소" onPress={handleCancel} type="secondary" style={styles.cancelButton} />
          </>
        );

      case ModalState.CONFIRM_OVERWRITE:
        return (
          <>
            <PixelText variant="subtitle" style={styles.title}>
              저장 덮어쓰기
            </PixelText>
            <PixelText style={styles.confirmMessage}>이미 저장된 데이터가 있습니다. 덮어쓰시겠습니까?</PixelText>
            <View style={styles.buttonRow}>
              <Button title="덮어쓰기" onPress={handleConfirmOverwrite} type="danger" style={styles.confirmButton} />
              <Button
                title="취소"
                onPress={() => setModalState(ModalState.SLOT_SELECTION)}
                type="secondary"
                style={styles.confirmButton}
              />
            </View>
          </>
        );

      case ModalState.PROCESSING:
        return (
          <>
            <PixelText variant="subtitle" style={styles.title}>
              {isSaveMode ? "저장 중" : "불러오는 중"}
            </PixelText>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <PixelText style={styles.loadingText}>{isSaveMode ? "저장 중..." : "불러오는 중..."}</PixelText>
            </View>
          </>
        );

      case ModalState.OPERATION_COMPLETE:
        return (
          <>
            <PixelText variant="subtitle" style={styles.completeTitle}>
              {isSaveMode ? "저장 완료" : "불러오기 완료"}
            </PixelText>
            <PixelText style={styles.completeMessage}>
              {isSaveMode
                ? `게임이 "${savedSlotName}"에 성공적으로 저장되었습니다.`
                : `"${savedSlotName}"에서 게임을 성공적으로 불러왔습니다.`}
            </PixelText>
            <Button title="확인" onPress={handleComplete} style={styles.completeButton} />
          </>
        );
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleCancel}>
      <View style={styles.overlay}>
        <View style={styles.container}>{renderModalContent()}</View>
      </View>
    </Modal>
  );
};

// 기존 스타일은 유지
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.lg,
    color: COLORS.primary,
  },
  slotsContainer: {
    marginBottom: SPACING.lg,
  },
  slotItem: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  slotHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  slotDetails: {
    marginTop: SPACING.xs,
  },
  slotDetailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  autoSlot: {
    backgroundColor: COLORS.berdan,
    borderColor: COLORS.gold,
  },
  autoSaveTag: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "bold",
  },
  disabledSlot: {
    opacity: 0.5,
    borderColor: COLORS.disabled,
  },
  slotName: {
    fontWeight: "bold",
  },
  emptyText: {
    color: COLORS.disabled,
    fontStyle: "italic",
  },
  savedAtText: {
    color: COLORS.info,
    fontSize: 12,
  },
  cancelButton: {
    marginTop: SPACING.sm,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.primary,
  },
  // 완료 스타일
  completeTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.success,
  },
  completeMessage: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  completeButton: {
    minWidth: 120,
    alignSelf: "center",
  },
  // 덮어쓰기 확인 스타일
  confirmMessage: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default SaveSlotModal;
