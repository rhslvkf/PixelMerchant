import React from "react";
import { Modal, View, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING, SHADOWS, BORDERS } from "../config/theme";
import Button from "./Button";
import PixelText from "./PixelText";
import DestinationCard, { TravelDestination } from "./travel/DestinationCard";
import { useTravelOptions } from "../hooks/useTravelOptions";

// 상수 추출
const MODAL_BACKGROUND_OPACITY = 0.7;
const MODAL_WIDTH_PERCENTAGE = "90%";
const MODAL_MAX_HEIGHT_PERCENTAGE = "80%";

interface TravelModalProps {
  visible: boolean;
  onClose: () => void;
  destinations: TravelDestination[];
}

const TravelModal = ({ visible, onClose, destinations }: TravelModalProps) => {
  // 커스텀 훅으로 로직 분리
  const { handleTravel, noDestinationsAvailable } = useTravelOptions({
    destinations,
    onClose,
  });

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <PixelText variant="subtitle" style={styles.title}>
            여행 목적지 선택
          </PixelText>

          <ScrollView style={styles.destinationList}>
            {destinations.map((item, index) => (
              <DestinationCard key={index} destination={item} onTravel={handleTravel} />
            ))}

            {noDestinationsAvailable && (
              <PixelText style={styles.noDestinations}>이용 가능한 여행 목적지가 없습니다.</PixelText>
            )}
          </ScrollView>

          <Button title="닫기" type="secondary" size="medium" onPress={onClose} style={styles.closeButton} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: `rgba(0, 0, 0, ${MODAL_BACKGROUND_OPACITY})`,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: MODAL_WIDTH_PERCENTAGE,
    maxHeight: MODAL_MAX_HEIGHT_PERCENTAGE,
    backgroundColor: COLORS.background.dark,
    borderWidth: 2,
    borderColor: COLORS.berdan,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.lg,
    color: COLORS.primary,
  },
  destinationList: {
    maxHeight: 400,
  },
  noDestinations: {
    textAlign: "center",
    padding: SPACING.lg,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
});

export default TravelModal;
