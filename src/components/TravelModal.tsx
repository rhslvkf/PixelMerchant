import React from "react";
import { Modal, View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, SHADOWS, BORDERS } from "../config/theme";
import Button from "./Button";
import PixelText from "./PixelText";
import { City, TravelConnection } from "../models/types";
import { AppNavigationProp } from "../navigation/types";
import { REGIONS } from "../data/cities";
import { getTransportName } from "../utils/localization";
import { formatRating } from "../utils/formatting";

// 상수 추출
const MODAL_BACKGROUND_OPACITY = 0.7;
const MODAL_WIDTH_PERCENTAGE = "90%";
const MODAL_MAX_HEIGHT_PERCENTAGE = "80%";

interface TravelDestination {
  city: City;
  connection: TravelConnection;
}

interface TravelModalProps {
  visible: boolean;
  onClose: () => void;
  destinations: TravelDestination[];
}

// 도시 정보 표시 서브 컴포넌트
interface DestinationCardProps {
  destination: TravelDestination;
  onTravel: (destinationId: string) => void;
}

const DestinationCard = ({ destination, onTravel }: DestinationCardProps) => (
  <View style={styles.travelDestination}>
    <View style={styles.destinationInfo}>
      <PixelText style={styles.destinationName}>{destination.city.name}</PixelText>

      <PixelText variant="caption" style={styles.destinationRegion}>
        {REGIONS[destination.city.regionId]?.name || destination.city.regionId}
      </PixelText>

      <View style={styles.cityStats}>
        <PixelText variant="caption">규모: {formatRating(destination.city.size)}</PixelText>
        <PixelText variant="caption" style={styles.wealthStat}>
          부유함: {formatRating(destination.city.wealthLevel)}
        </PixelText>
      </View>

      <View style={styles.destinationDetails}>
        <PixelText variant="caption">
          거리: {destination.connection.distance} • 위험도: {formatRating(destination.connection.dangerLevel)}
        </PixelText>

        <PixelText variant="caption">
          이동 수단: {destination.connection.transportOptions.map(getTransportName).join(", ")}
        </PixelText>
      </View>
    </View>
    <Button title="여행" size="small" onPress={() => onTravel(destination.city.id)} />
  </View>
);

const TravelModal = ({ visible, onClose, destinations }: TravelModalProps) => {
  const navigation = useNavigation<AppNavigationProp>();

  const handleTravel = (destinationId: string) => {
    onClose();
    navigation.navigate("Travel", { destination: destinationId });
  };

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

            {destinations.length === 0 && (
              <PixelText style={styles.noDestinations}>이용 가능한 여행 목적지가 없습니다.</PixelText>
            )}
          </ScrollView>

          <Button title="닫기" type="secondary" size="medium" onPress={onClose} style={styles.closeButton} />
        </View>
      </View>
    </Modal>
  );
};

// 공통 스타일 속성
const cardStyle = {
  borderRadius: BORDERS.radius.md,
  borderWidth: 1,
  ...SHADOWS.light,
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
  travelDestination: {
    ...cardStyle,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderColor: COLORS.berdan,
  },
  destinationInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  destinationName: {
    fontWeight: "bold",
    marginBottom: SPACING.xs,
    color: COLORS.primary,
  },
  destinationRegion: {
    marginBottom: SPACING.xs,
  },
  cityStats: {
    flexDirection: "row",
    marginBottom: SPACING.xs,
  },
  wealthStat: {
    marginLeft: SPACING.md,
  },
  destinationDetails: {
    marginTop: SPACING.xs,
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
