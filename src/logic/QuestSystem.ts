import { GameDate, GameState, ItemQuality, PlayerQuest, Quest, QuestObjective, QuestStatus } from "../models";
import { getQuestById, QUESTS } from "../data/quests";
import { advanceDate } from "./DateSystem";

/**
 * 플레이어가 퀘스트 요구사항을 충족하는지 확인
 *
 * @param quest - 퀘스트 정보
 * @param state - 게임 상태
 * @returns - 충족 여부
 */
export function checkQuestRequirements(quest: Quest, state: GameState): boolean {
  if (!quest.requirements) return true;

  const { player } = state;
  const { requirements } = quest;

  // 플레이어 레벨 확인 (스킬 평균으로 계산)
  if (requirements.playerLevel) {
    const skillValues = Object.values(player.skills);
    const playerLevel =
      skillValues.length > 0 ? Math.floor(skillValues.reduce((sum, val) => sum + val, 0) / skillValues.length) : 0;

    if (playerLevel < requirements.playerLevel) return false;
  }

  // 최소 평판 확인
  if (requirements.minReputation) {
    for (const rep of requirements.minReputation) {
      const playerRep = player.reputation[rep.factionId];
      if (playerRep === undefined || playerRep < rep.level) return false;
    }
  }

  // 스킬 요구사항 확인
  if (requirements.skills) {
    for (const skillReq of requirements.skills) {
      const playerSkill = player.skills[skillReq.skill] || 0;
      if (playerSkill < skillReq.level) return false;
    }
  }

  // 완료해야 하는 퀘스트 확인
  if (requirements.completedQuests) {
    for (const questId of requirements.completedQuests) {
      const completed = player.quests.some((q) => q.questId === questId && q.status === QuestStatus.COMPLETED);
      if (!completed) return false;
    }
  }

  // 소지금 확인
  if (requirements.gold && player.gold < requirements.gold) return false;

  return true;
}

/**
 * 퀘스트 기간이 만료되었는지 확인
 *
 * @param playerQuest - 플레이어 퀘스트 정보
 * @param currentDate - 현재 게임 날짜
 * @returns - 만료 여부
 */
export function isQuestExpired(playerQuest: PlayerQuest, currentDate: GameDate): boolean {
  if (!playerQuest.expiryDate) return false;

  const expiry = playerQuest.expiryDate;

  // 연도 비교
  if (expiry.year < currentDate.year) return true;
  if (expiry.year > currentDate.year) return false;

  // 월 비교
  if (expiry.month < currentDate.month) return true;
  if (expiry.month > currentDate.month) return false;

  // 일 비교
  return expiry.day < currentDate.day;
}

/**
 * 현재 날짜에 기반한 퀘스트 만료일 계산
 *
 * @param currentDate - 현재 게임 날짜
 * @param timeLimit - 제한 시간 (일 수)
 * @returns - 만료 날짜
 */
export function calculateExpiryDate(currentDate: GameDate, timeLimit: number): GameDate {
  let expiryDate = { ...currentDate };

  // 제한 시간만큼 날짜 진행
  for (let i = 0; i < timeLimit; i++) {
    expiryDate = advanceDate(expiryDate);
  }

  return expiryDate;
}

/**
 * 퀘스트 목표 진행 상태 업데이트
 *
 * @param playerQuest - 플레이어 퀘스트 상태
 * @param state - 게임 상태
 * @returns - 업데이트된 퀘스트 상태
 */
export function updateQuestObjectives(playerQuest: PlayerQuest, state: GameState): PlayerQuest {
  const quest = getQuestById(playerQuest.questId);
  if (!quest) return playerQuest;

  const updatedObjectives = [...playerQuest.objectives];

  for (let i = 0; i < updatedObjectives.length; i++) {
    const objective = updatedObjectives[i];

    // 이미 완료된 목표는 건너뜀
    if (objective.completed) continue;

    switch (objective.type) {
      case "buy":
        // 구매 목표 확인
        for (const item of state.player.inventory) {
          if (item.itemId === objective.target) {
            if (objective.quality && item.quality !== QUALITY_FACTORS[objective.quality]) {
              continue; // 품질 불일치
            }

            if (item.quantity >= (objective.amount || 1)) {
              updatedObjectives[i] = { ...objective, completed: true };
            }
          }
        }
        break;

      case "sell":
        // 판매 목표는 별도 로직 필요 (거래 내역 추적)
        break;

      case "visit":
        // 방문 목표 확인
        if (state.currentCityId === objective.target) {
          updatedObjectives[i] = { ...objective, completed: true };
        }
        break;

      case "reputation":
        // 평판 목표 확인
        const rep = state.player.reputation[objective.target];
        if (rep !== undefined && rep >= (objective.level || 0)) {
          updatedObjectives[i] = { ...objective, completed: true };
        }
        break;

      case "skill":
        // 스킬 목표 확인
        const skill = state.player.skills[objective.target as keyof typeof state.player.skills];
        if (skill !== undefined && skill >= (objective.level || 0)) {
          updatedObjectives[i] = { ...objective, completed: true };
        }
        break;
    }
  }

  return {
    ...playerQuest,
    objectives: updatedObjectives,
  };
}

/**
 * 품질 계수 상수
 */
const QUALITY_FACTORS: Record<ItemQuality, number> = {
  [ItemQuality.LOW]: 0.8,
  [ItemQuality.MEDIUM]: 1.0,
  [ItemQuality.HIGH]: 1.3,
};

/**
 * 퀘스트가 모두 완료되었는지 확인
 *
 * @param playerQuest - 플레이어 퀘스트 상태
 * @returns - 완료 여부
 */
export function isQuestCompleted(playerQuest: PlayerQuest): boolean {
  return playerQuest.objectives.every((obj) => obj.completed);
}

/**
 * 퀘스트 진행 상태 체크 및 업데이트
 *
 * @param state - 게임 상태
 * @returns - 업데이트된 퀘스트 목록
 */
export function checkQuestProgress(state: GameState): PlayerQuest[] {
  const { player, currentDate } = state;

  return player.quests.map((playerQuest) => {
    // 완료 또는 실패한 퀘스트는 건너뜀
    if (
      playerQuest.status === QuestStatus.COMPLETED ||
      playerQuest.status === QuestStatus.FAILED ||
      playerQuest.status === QuestStatus.EXPIRED
    ) {
      return playerQuest;
    }

    // 기간 만료 확인
    if (isQuestExpired(playerQuest, currentDate)) {
      return { ...playerQuest, status: QuestStatus.EXPIRED };
    }

    // 목표 진행 상태 업데이트
    const updatedQuest = updateQuestObjectives(playerQuest, state);

    // 모든 목표 완료 확인
    if (isQuestCompleted(updatedQuest)) {
      return { ...updatedQuest, status: QuestStatus.COMPLETED };
    }

    return updatedQuest;
  });
}

/**
 * 도시에서 제공 가능한 퀘스트 목록 가져오기
 *
 * @param state - 게임 상태
 * @param cityId - 도시 ID
 * @returns - 제공 가능한 퀘스트 ID 목록
 */
export function getAvailableQuestsInCity(state: GameState, cityId: string): string[] {
  const { currentDate, player } = state;
  const allQuests = Object.values(QUESTS);

  return allQuests
    .filter((quest) => {
      // 도시 확인
      if (quest.giverCityId !== cityId) return false;

      // 이미 완료 또는 진행 중인 퀘스트 제외
      const existingQuest = player.quests.find((q) => q.questId === quest.id);
      if (
        existingQuest &&
        (existingQuest.status === QuestStatus.ACTIVE || existingQuest.status === QuestStatus.COMPLETED)
      ) {
        return false;
      }

      // 요구사항 확인
      if (!checkQuestRequirements(quest, state)) return false;

      // 제공 기간 확인
      if (quest.startDate) {
        const start = quest.startDate;
        if (currentDate.year < start.year) return false;
        if (currentDate.year === start.year && currentDate.month < start.month) return false;
        if (currentDate.year === start.year && currentDate.month === start.month && currentDate.day < start.day)
          return false;
      }

      if (quest.endDate) {
        const end = quest.endDate;
        if (currentDate.year > end.year) return false;
        if (currentDate.year === end.year && currentDate.month > end.month) return false;
        if (currentDate.year === end.year && currentDate.month === end.month && currentDate.day > end.day) return false;
      }

      return true;
    })
    .map((quest) => quest.id);
}
