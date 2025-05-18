import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../config/theme";
import { StorageService } from "../storage/StorageService";
import Button from "./Button";
import ConfirmationModal from "./ConfirmationModal";
import PixelText from "./PixelText";

interface SaveSlotModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (slotId: string) => Promise<boolean>; // Promise<boolean> 반환 타입 추가
  isSaveMode: boolean; // true: 저장 모드, false: 불러오기 모드
}

interface SaveSlotInfo {
  slotId: string;
  displayName: string;
  savedAt: string | null;
  isEmpty: boolean;
}

const SaveSlotModal: React.FC<SaveSlotModalProps> = ({ visible, onClose, onSave, isSaveMode }) => {
  const [slots, setSlots] = useState<SaveSlotInfo[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // 저장 중 상태 추가

  useEffect(() => {
    if (visible) {
      loadSlotInfo();
    }
  }, [visible]);

  const loadSlotInfo = async () => {
    // 수동 저장 슬롯 (1, 2)과 자동 저장 슬롯 (auto)
    const slotIds = ["slot1", "slot2", "auto"];
    const slotInfo: SaveSlotInfo[] = [];

    for (const slotId of slotIds) {
      const saveData = await StorageService.loadGameFromSlot(slotId);
      const displayName = slotId === "auto" ? "자동 저장" : `저장 슬롯 ${slotId.slice(-1)}`;
      const isEmpty = saveData === null;

      let savedAtStr = null;
      if (!isEmpty && saveData) {
        // savedAt 정보를 문자열로 변환
        try {
          const savedAt = saveData?.player?.stats?.daysPlayed || 0;
          savedAtStr = `게임 ${savedAt}일차`;
        } catch (e) {
          savedAtStr = "저장 정보 있음";
        }
      }

      slotInfo.push({
        slotId,
        displayName,
        savedAt: savedAtStr,
        isEmpty,
      });
    }

    setSlots(slotInfo);
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);

    // 저장 모드에서 이미 데이터가 있는 슬롯 선택 시 확인 모달 표시
    if (isSaveMode) {
      const slot = slots.find((s) => s.slotId === slotId);
      if (slot && !slot.isEmpty) {
        setShowConfirmation(true);
        return;
      }
    }

    // 저장 작업 시작
    handleSaveToSlot(slotId);
  };

  // 저장 작업을 처리하는 별도의 함수
  const handleSaveToSlot = async (slotId: string) => {
    if (isSaving) return; // 이미 저장 중이면 중복 실행 방지

    setIsSaving(true); // 저장 시작 표시

    try {
      const success = await onSave(slotId);

      // 저장 완료 후 모달 닫기
      if (success) {
        setShowConfirmation(false);
        onClose();
      }
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
    } finally {
      setIsSaving(false); // 저장 작업 완료 표시
    }
  };

  const handleConfirmOverwrite = () => {
    if (selectedSlot) {
      // 확인 모달 먼저 닫고 저장 시작
      setShowConfirmation(false);
      handleSaveToSlot(selectedSlot);
    }
  };

  // 모든 모달 닫기
  const handleCancelAll = () => {
    setShowConfirmation(false);
    setSelectedSlot(null);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleCancelAll}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <PixelText variant="subtitle" style={styles.title}>
            {isSaveMode ? "게임 저장" : "저장 데이터 불러오기"}
          </PixelText>

          {isSaving ? (
            // 저장 중 로딩 표시
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <PixelText style={styles.loadingText}>저장 중...</PixelText>
            </View>
          ) : (
            <View style={styles.slotsContainer}>
              {slots.map((slot) => (
                <TouchableOpacity
                  key={slot.slotId}
                  style={[
                    styles.slotItem,
                    slot.slotId === "auto" && styles.autoSlot,
                    slot.isEmpty && isSaveMode === false && styles.disabledSlot,
                  ]}
                  onPress={() => handleSlotSelect(slot.slotId)}
                  disabled={slot.isEmpty && isSaveMode === false}
                >
                  <PixelText style={styles.slotName}>{slot.displayName}</PixelText>
                  {slot.isEmpty ? (
                    <PixelText style={styles.emptyText}>비어 있음</PixelText>
                  ) : (
                    <PixelText style={styles.savedAtText}>{slot.savedAt}</PixelText>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Button
            title="취소"
            onPress={handleCancelAll}
            type="secondary"
            style={styles.cancelButton}
            disabled={isSaving}
          />
        </View>
      </View>

      <ConfirmationModal
        visible={showConfirmation}
        title="저장 덮어쓰기"
        message="이미 저장된 데이터가 있습니다. 덮어쓰시겠습니까?"
        confirmText="덮어쓰기"
        cancelText="취소"
        onConfirm={handleConfirmOverwrite}
        onCancel={() => setShowConfirmation(false)}
      />
    </Modal>
  );
};

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoSlot: {
    backgroundColor: COLORS.berdan,
    borderColor: COLORS.gold,
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
});

export default SaveSlotModal;
