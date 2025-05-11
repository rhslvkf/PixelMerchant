import React from "react";
import { Modal, View, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, SHADOWS, BORDERS } from "../config/theme";
import Button from "./Button";
import PixelText from "./PixelText";
import { City, TravelConnection } from "../models/types";
import { AppNavigationProp } from "../navigation/types";
import { REGIONS } from "../data/cities"; // REGIONS 데이터 임포트
import { getTransportName } from "../utils/localization"; // 추가된 유틸리티 함수 임포트
import { formatRating } from "../utils/formatting";

interface TravelDestination {
  city: City;
  connection: TravelConnection;
}

interface TravelModalProps {
  visible: boolean;
  onClose: () => void;
  destinations: TravelDestination[];
}

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
              <View key={index} style={styles.travelDestination}>
                <View style={styles.destinationInfo}>
                  <PixelText style={styles.destinationName}>{item.city.name}</PixelText>

                  {/* regionId 대신 REGIONS에서 name 사용 */}
                  <PixelText variant="caption" style={styles.destinationRegion}>
                    {REGIONS[item.city.regionId]?.name || item.city.regionId}
                  </PixelText>

                  {/* 도시 규모와 부유함 추가 */}
                  <View style={styles.cityStats}>
                    <PixelText variant="caption">규모: {formatRating(item.city.size)}</PixelText>
                    <PixelText variant="caption" style={styles.wealthStat}>
                      부유함: {formatRating(item.city.wealthLevel)}
                    </PixelText>
                  </View>

                  <View style={styles.destinationDetails}>
                    <PixelText variant="caption">
                      거리: {item.connection.distance} • 위험도: {formatRating(item.connection.dangerLevel)}
                    </PixelText>

                    {/* 이동 수단을 한국어로 표시 */}
                    <PixelText variant="caption">
                      이동 수단: {item.connection.transportOptions.map((t) => getTransportName(t)).join(", ")}
                    </PixelText>
                  </View>
                </View>
                <Button title="여행" size="small" onPress={() => handleTravel(item.city.id)} />
              </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.berdan,
    ...SHADOWS.light,
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
