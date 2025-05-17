import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { PlayerQuest, Quest, QuestDifficulty, QuestStatus, QuestType } from "../../models";
import PixelText from "../PixelText";

interface QuestListItemProps {
  quest: Quest;
  playerQuest?: PlayerQuest;
  onPress: (quest: Quest) => void;
}

const QuestListItem: React.FC<QuestListItemProps> = ({ quest, playerQuest, onPress }) => {
  // 퀘스트 유형 아이콘
  const getQuestTypeIcon = (type: QuestType): string => {
    switch (type) {
      case QuestType.TRADE:
        return "💰";
      case QuestType.DELIVERY:
        return "📦";
      case QuestType.DIPLOMACY:
        return "🤝";
      case QuestType.COLLECTION:
        return "🔍";
      case QuestType.EXPLORATION:
        return "🧭";
      default:
        return "📜";
    }
  };

  // 퀘스트 난이도 표시
  const getDifficultyStars = (difficulty: QuestDifficulty): string => {
    switch (difficulty) {
      case QuestDifficulty.EASY:
        return "★";
      case QuestDifficulty.MEDIUM:
        return "★★";
      case QuestDifficulty.HARD:
        return "★★★";
      case QuestDifficulty.EXPERT:
        return "★★★★";
      default:
        return "★";
    }
  };

  // 퀘스트 상태에 따른 스타일 설정
  const getStatusColor = (): string => {
    if (!playerQuest) return COLORS.primary; // 수락 가능한 퀘스트

    switch (playerQuest.status) {
      case QuestStatus.ACTIVE:
        return COLORS.info;
      case QuestStatus.COMPLETED:
        return COLORS.success;
      case QuestStatus.FAILED:
      case QuestStatus.EXPIRED:
        return COLORS.danger;
      default:
        return COLORS.primary;
    }
  };

  // 퀘스트 진행 상태 표시
  const getStatusText = (): string => {
    if (!playerQuest) return "수락 가능";

    switch (playerQuest.status) {
      case QuestStatus.ACTIVE:
        // 완료된 목표 수 / 전체 목표 수
        const completedCount = playerQuest.objectives.filter((obj) => obj.completed).length;
        const totalCount = playerQuest.objectives.length;
        return `진행 중 (${completedCount}/${totalCount})`;
      case QuestStatus.COMPLETED:
        return "완료됨";
      case QuestStatus.FAILED:
        return "실패";
      case QuestStatus.EXPIRED:
        return "기간 만료";
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity style={[styles.container, { borderColor: getStatusColor() }]} onPress={() => onPress(quest)}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <PixelText variant="caption" style={styles.typeIcon}>
            {getQuestTypeIcon(quest.type)}
          </PixelText>
          <PixelText style={styles.title}>{quest.title}</PixelText>
        </View>
        <PixelText variant="caption" style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </PixelText>
      </View>

      <PixelText variant="caption" style={styles.description}>
        {quest.description}
      </PixelText>

      <View style={styles.footer}>
        <PixelText variant="caption" style={[styles.difficulty, { color: getStatusColor() }]}>
          {getDifficultyStars(quest.difficulty)}
        </PixelText>

        {quest.rewards.gold ? (
          <PixelText variant="caption" style={styles.reward}>
            보상: {quest.rewards.gold} 골드
          </PixelText>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.background.dark}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    ...SHADOWS.light,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIcon: {
    marginRight: SPACING.xs,
    fontSize: 16,
  },
  title: {
    fontWeight: "bold",
    color: COLORS.text.light,
    flex: 1,
  },
  statusText: {
    fontSize: 12,
  },
  description: {
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficulty: {
    fontSize: 12,
  },
  reward: {
    color: COLORS.gold,
  },
});

export default QuestListItem;
