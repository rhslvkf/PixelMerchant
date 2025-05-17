import React from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { ItemQuality, PlayerQuest, Quest, QuestStatus } from "../../models";
import Button from "../Button";
import PixelText from "../PixelText";
import { ITEMS } from "../../data/items";
import { useLocalization } from "../../hooks/useLocalization";

interface QuestDetailsModalProps {
  visible: boolean;
  quest: Quest | null;
  playerQuest?: PlayerQuest;
  onClose: () => void;
  onAccept: (questId: string) => void;
  onAbandon: (questId: string) => void;
  onComplete: (questId: string) => void;
}

const QuestDetailsModal: React.FC<QuestDetailsModalProps> = ({
  visible,
  quest,
  playerQuest,
  onClose,
  onAccept,
  onAbandon,
  onComplete,
}) => {
  const { getCultureName, t } = useLocalization();

  if (!quest) return null;

  // 퀘스트 상태 확인
  const isActive = playerQuest?.status === QuestStatus.ACTIVE;
  const isCompleted = playerQuest?.status === QuestStatus.COMPLETED;
  const isFailed = playerQuest?.status === QuestStatus.FAILED || playerQuest?.status === QuestStatus.EXPIRED;
  const canAccept = !playerQuest || isFailed;

  // 목표 진행 상태 표시
  const renderObjectives = () => {
    return quest.objectives.map((objective, index) => {
      const isObjectiveCompleted = playerQuest?.objectives[index]?.completed || false;

      let objectiveText = "";
      switch (objective.type) {
        case "buy":
          const itemName = ITEMS[objective.target]?.name || objective.target;
          const qualityText = objective.quality
            ? objective.quality === ItemQuality.HIGH
              ? "고급 "
              : objective.quality === ItemQuality.LOW
              ? "저급 "
              : ""
            : "";
          objectiveText = `${qualityText}${itemName} ${objective.amount || 1}개 구매`;
          break;
        case "sell":
          objectiveText = `${ITEMS[objective.target]?.name || objective.target} ${objective.amount || 1}개 판매`;
          break;
        case "visit":
          objectiveText = `${objective.target} 방문`;
          break;
        case "reputation":
          objectiveText = `${objective.target} 평판 ${objective.level || 1} 이상 달성`;
          break;
        case "skill":
          objectiveText = `${objective.target} 스킬 ${objective.level || 1} 이상 달성`;
          break;
      }

      return (
        <View key={index} style={styles.objectiveItem}>
          <View
            style={[styles.checkmark, { backgroundColor: isObjectiveCompleted ? COLORS.success : COLORS.secondary }]}
          >
            <PixelText style={styles.checkmarkText}>{isObjectiveCompleted ? "✓" : "○"}</PixelText>
          </View>
          <PixelText style={[styles.objectiveText, isObjectiveCompleted && styles.completedText]}>
            {objectiveText}
          </PixelText>
        </View>
      );
    });
  };

  // 세력 ID에서 현지화된 이름 가져오기
  const getFactionName = (factionId: string): string => {
    // 지역 ID에서 문화 코드 추출 (예: berdan_empire -> berdan)
    const cultureParts = factionId.split("_");
    if (cultureParts.length > 0) {
      const cultureCode = cultureParts[0];
      const localizedName = getCultureName(cultureCode);

      // 문화 코드가 번역되었으면 해당 번역 사용
      if (localizedName !== cultureCode) {
        if (factionId.includes("empire")) {
          return `${localizedName} 제국`;
        } else if (factionId.includes("union")) {
          return `${localizedName} 연합`;
        } else if (factionId.includes("mountains")) {
          return `${localizedName} 산맥`;
        } else if (factionId.includes("desert")) {
          return `${localizedName} 사막`;
        } else if (factionId.includes("islands")) {
          return `${localizedName} 제도`;
        }
        return localizedName;
      }
    }

    // 도시/장소 이름은 그대로 반환
    return factionId;
  };

  // 보상 표시
  const renderRewards = () => {
    const { rewards } = quest;
    return (
      <View style={styles.rewardsContainer}>
        {rewards.gold ? (
          <PixelText style={styles.rewardItem}>
            <PixelText style={styles.goldText}>{rewards.gold} 골드</PixelText>
          </PixelText>
        ) : null}

        {rewards.items?.map((item, index) => (
          <PixelText key={`item-${index}`} style={styles.rewardItem}>
            {ITEMS[item.itemId]?.name || item.itemId} {item.quantity}개
          </PixelText>
        ))}

        {rewards.reputation?.map((rep, index) => {
          // 지역 ID에서 문화 코드 추출 (예: berdan_empire -> berdan)
          let factionName = rep.factionId;
          const parts = rep.factionId.split("_");
          if (parts.length > 0) {
            const cultureCode = parts[0];
            const localizedName = t(`cultures.${cultureCode}`);

            // t 함수가 키를 찾지 못하면 키 자체를 반환하므로 변환되었는지 확인
            if (localizedName !== `cultures.${cultureCode}`) {
              if (rep.factionId.includes("empire")) {
                factionName = `${localizedName} 제국`;
              } else if (rep.factionId.includes("union")) {
                factionName = `${localizedName} 연합`;
              } else if (rep.factionId.includes("mountains")) {
                factionName = `${localizedName} 산맥`;
              } else if (rep.factionId.includes("desert")) {
                factionName = `${localizedName} 사막`;
              } else if (rep.factionId.includes("islands")) {
                factionName = `${localizedName} 제도`;
              } else {
                factionName = localizedName;
              }
            }
          }

          return (
            <PixelText key={`rep-${index}`} style={styles.rewardItem}>
              {factionName} 평판 +{rep.amount}
            </PixelText>
          );
        })}

        {rewards.skillExp?.map((exp, index) => {
          // 스킬 이름 안전하게 가져오기
          let skillName = String(exp.skill || ""); // undefined 방지

          // 지역화 시스템으로 스킬 이름 가져오기
          const localizedSkill = t(`skills.${skillName.toLowerCase()}`);
          if (localizedSkill !== `skills.${skillName.toLowerCase()}`) {
            skillName = localizedSkill;
          }

          return (
            <PixelText key={`skill-${index}`} style={styles.rewardItem}>
              {skillName} 스킬 경험치 +{exp.amount}
            </PixelText>
          );
        })}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <PixelText variant="subtitle" style={styles.title}>
            {quest.title}
          </PixelText>

          <ScrollView style={styles.scrollView}>
            <View style={styles.section}>
              <PixelText style={styles.description}>{quest.description}</PixelText>
            </View>

            <View style={styles.section}>
              <PixelText style={styles.sectionTitle}>목표</PixelText>
              {renderObjectives()}
            </View>

            <View style={styles.section}>
              <PixelText style={styles.sectionTitle}>보상</PixelText>
              {renderRewards()}
            </View>

            {quest.timeLimit ? (
              <View style={styles.section}>
                <PixelText style={styles.timeLimitText}>제한 시간: {quest.timeLimit}일</PixelText>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.buttonContainer}>
            {canAccept ? (
              <Button
                title="수락"
                onPress={() => {
                  onAccept(quest.id);
                  onClose();
                }}
                size="medium"
                style={styles.button}
              />
            ) : isActive ? (
              <Button
                title="포기"
                onPress={() => {
                  onAbandon(quest.id);
                  onClose();
                }}
                type="danger"
                size="medium"
                style={styles.button}
              />
            ) : isCompleted ? (
              <Button
                title="보상 수령"
                onPress={() => {
                  onComplete(quest.id);
                  onClose();
                }}
                type="primary"
                size="medium"
                style={styles.button}
              />
            ) : null}

            <Button title="닫기" onPress={onClose} type="secondary" size="medium" style={styles.button} />
          </View>
        </View>
      </View>
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
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  scrollView: {
    maxHeight: 350,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  description: {
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.xs,
  },
  checkmarkText: {
    color: COLORS.text.light,
    fontSize: 12,
  },
  objectiveText: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: COLORS.success,
  },
  rewardsContainer: {
    backgroundColor: `${COLORS.secondary}80`,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.sm,
  },
  rewardItem: {
    marginBottom: SPACING.xs,
  },
  goldText: {
    color: COLORS.gold,
  },
  timeLimitText: {
    color: COLORS.info,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  button: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
});

export default QuestDetailsModal;
