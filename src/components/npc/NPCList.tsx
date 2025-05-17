import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { NPC } from "../../models";
import PixelText from "../PixelText";
import NPCPortrait from "./NPCPortrait";

interface NPCListProps {
  npcs: NPC[];
  onSelectNPC: (npcId: string) => void;
}

const NPCList: React.FC<NPCListProps> = ({ npcs, onSelectNPC }) => {
  if (npcs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <PixelText>이 도시에서 상호작용할 수 있는 NPC가 없습니다.</PixelText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {npcs.map((npc) => (
        <TouchableOpacity key={npc.id} style={styles.npcItem} onPress={() => onSelectNPC(npc.id)}>
          <NPCPortrait npcId={npc.id} size="small" />
          <View style={styles.npcInfo}>
            <PixelText style={styles.npcName}>{npc.name}</PixelText>
            <PixelText variant="caption">{getNPCTypeText(npc.type)}</PixelText>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// NPC 유형을 한글로 변환
function getNPCTypeText(type: string): string {
  const typeMap: { [key: string]: string } = {
    merchant: "상인",
    guild_master: "길드 마스터",
    informant: "정보원",
    official: "관리자",
    rival: "경쟁자",
    local: "현지인",
  };

  return typeMap[type] || "기타";
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 300,
    width: "100%",
  },
  emptyContainer: {
    padding: SPACING.md,
    alignItems: "center",
  },
  npcItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    backgroundColor: `${COLORS.secondary}CC`,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.light,
  },
  npcInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  npcName: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
});

export default NPCList;
