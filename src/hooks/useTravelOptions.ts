import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../navigation/types";
import { TravelDestination } from "../components/travel/DestinationCard";

interface UseTravelOptionsProps {
  destinations: TravelDestination[];
  onClose: () => void;
}

interface UseTravelOptionsResult {
  handleTravel: (destinationId: string) => void;
  destinations: TravelDestination[];
  noDestinationsAvailable: boolean;
}

/**
 * 여행 옵션 관련 로직을 처리하는 커스텀 훅
 */
export const useTravelOptions = ({ destinations, onClose }: UseTravelOptionsProps): UseTravelOptionsResult => {
  const navigation = useNavigation<AppNavigationProp>();

  // 여행 처리 함수
  const handleTravel = useCallback(
    (destinationId: string) => {
      onClose();
      navigation.navigate("Travel", { destination: destinationId });
    },
    [navigation, onClose]
  );

  // 목적지가 있는지 여부 확인
  const noDestinationsAvailable = destinations.length === 0;

  return {
    handleTravel,
    destinations,
    noDestinationsAvailable,
  };
};
