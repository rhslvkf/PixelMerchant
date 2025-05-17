import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { BORDERS, COLORS } from "../../config/theme";
import { NPC_PORTRAITS } from "../../data/npcs";
import { useGame } from "../../state/GameContext";

interface NPCPortraitProps {
  npcId: string;
  size?: "small" | "medium" | "large";
}

const NPCPortrait: React.FC<NPCPortraitProps> = ({ npcId, size = "medium" }) => {
  const { state } = useGame();
  const npc = state.npcState.npcs[npcId];

  if (!npc) return null;

  // 초상화 이미지 가져오기
  const portraitSource = NPC_PORTRAITS[npc.portraitId];

  // 관계 레벨에 따른 테두리 색상
  const getBorderColor = () => {
    const interaction = state.npcState.interactions[npcId];
    const reputation = interaction ? interaction.reputation : npc.reputation;

    if (reputation <= -2) return COLORS.danger;
    if (reputation <= -1) return COLORS.berdan;
    if (reputation <= 1) return COLORS.secondary;
    if (reputation <= 3) return COLORS.info;
    if (reputation <= 5) return COLORS.success;
    return COLORS.gold;
  };

  // 크기에 따른 스타일
  const sizeStyles = {
    small: { width: 40, height: 40, borderWidth: 1 },
    medium: { width: 60, height: 60, borderWidth: 2 },
    large: { width: 100, height: 100, borderWidth: 3 },
  };

  return (
    <View style={[styles.container, sizeStyles[size], { borderColor: getBorderColor() }]}>
      {portraitSource ? (
        <Image source={portraitSource} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.fallbackImage, { backgroundColor: COLORS.secondary }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDERS.radius.round,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  fallbackImage: {
    width: "100%",
    height: "100%",
  },
});

export default NPCPortrait;
