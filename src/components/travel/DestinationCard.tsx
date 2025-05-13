import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, SHADOWS, BORDERS } from "../../config/theme";
import Button from "../Button";
import PixelText from "../PixelText";
import { City, TravelConnection } from "../../models";
import { REGIONS } from "../../data/cities";
import { getTransportName } from "../../utils/localization";
import { formatRating } from "../../utils/formatting";

export interface TravelDestination {
  city: City;
  connection: TravelConnection;
}

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
    <Button title="여행" size="medium" style={styles.travelButton} onPress={() => onTravel(destination.city.id)} />
  </View>
);

// 공통 스타일 속성
const cardStyle = {
  borderRadius: BORDERS.radius.md,
  borderWidth: 1,
  ...SHADOWS.light,
};

const styles = StyleSheet.create({
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
  travelButton: {
    minWidth: 80,
    minHeight: 44,
  },
});

export default DestinationCard;
