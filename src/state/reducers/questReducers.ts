import { getQuestById } from "../../data/quests";
import { calculateExpiryDate, checkQuestProgress } from "../../logic/QuestSystem";
import { GameState, PlayerQuest, QuestStatus } from "../../models";

/**
 * 퀘스트 수락 리듀서
 */
export function acceptQuestReducer(state: GameState, questId: string): GameState {
  const quest = getQuestById(questId);
  if (!quest) return state;

  // 이미 수락했거나 완료한 퀘스트 체크
  const existingIndex = state.player.quests.findIndex((q) => q.questId === questId);
  if (existingIndex >= 0) {
    const existing = state.player.quests[existingIndex];
    if (existing.status === QuestStatus.ACTIVE || existing.status === QuestStatus.COMPLETED) {
      return state; // 이미 진행 중이거나 완료된 퀘스트
    }
  }

  // 퀘스트 만료일 계산
  const expiryDate = quest.timeLimit ? calculateExpiryDate(state.currentDate, quest.timeLimit) : undefined;

  // 새 플레이어 퀘스트 객체 생성
  const newPlayerQuest: PlayerQuest = {
    questId,
    status: QuestStatus.ACTIVE,
    objectives: quest.objectives.map((obj) => ({ ...obj, completed: false })),
    startDate: { ...state.currentDate },
    expiryDate,
  };

  // 기존에 실패 또는 만료된 동일 퀘스트가 있으면 교체, 없으면 추가
  const updatedQuests = [...state.player.quests];
  if (existingIndex >= 0) {
    updatedQuests[existingIndex] = newPlayerQuest;
  } else {
    updatedQuests.push(newPlayerQuest);
  }

  return {
    ...state,
    player: {
      ...state.player,
      quests: updatedQuests,
    },
  };
}

/**
 * 퀘스트 포기 리듀서
 */
export function abandonQuestReducer(state: GameState, questId: string): GameState {
  const index = state.player.quests.findIndex((q) => q.questId === questId);
  if (index < 0) return state;

  const quest = state.player.quests[index];
  if (quest.status !== QuestStatus.ACTIVE) return state;

  // 퀘스트를 failed 상태로 변경
  const updatedQuests = [...state.player.quests];
  updatedQuests[index] = {
    ...quest,
    status: QuestStatus.FAILED,
  };

  return {
    ...state,
    player: {
      ...state.player,
      quests: updatedQuests,
    },
  };
}

/**
 * 퀘스트 보상 수령 리듀서
 */
export function completeQuestReducer(state: GameState, questId: string): GameState {
  const questIndex = state.player.quests.findIndex((q) => q.questId === questId && q.status === QuestStatus.COMPLETED);
  if (questIndex < 0) return state;

  const quest = getQuestById(questId);
  if (!quest) return state;

  let updatedState = { ...state };
  const { rewards } = quest;

  // 골드 보상
  if (rewards.gold) {
    updatedState = {
      ...updatedState,
      player: {
        ...updatedState.player,
        gold: updatedState.player.gold + rewards.gold,
      },
    };
  }

  // 평판 보상
  if (rewards.reputation && rewards.reputation.length > 0) {
    const updatedReputation = { ...updatedState.player.reputation };
    for (const rep of rewards.reputation) {
      const currentRep = updatedReputation[rep.factionId] || 0;
      updatedReputation[rep.factionId] = currentRep + rep.amount;
    }

    updatedState = {
      ...updatedState,
      player: {
        ...updatedState.player,
        reputation: updatedReputation,
      },
    };
  }

  // 아이템 보상
  if (rewards.items && rewards.items.length > 0) {
    const updatedInventory = [...updatedState.player.inventory];
    for (const item of rewards.items) {
      // 실제 구현에서는 addItemToInventory 등 기존 함수 활용
      const existingIndex = updatedInventory.findIndex(
        (i) => i.itemId === item.itemId && i.quality === (item.quality ? QUALITY_FACTORS[item.quality] : 1.0)
      );

      if (existingIndex >= 0) {
        // 기존 아이템 수량 증가
        updatedInventory[existingIndex] = {
          ...updatedInventory[existingIndex],
          quantity: updatedInventory[existingIndex].quantity + item.quantity,
        };
      } else {
        // 새 아이템 추가
        updatedInventory.push({
          itemId: item.itemId,
          quantity: item.quantity,
          purchasePrice: 0, // 보상 아이템은 구매가 0
          quality: item.quality ? QUALITY_FACTORS[item.quality] : 1.0,
        });
      }
    }

    updatedState = {
      ...updatedState,
      player: {
        ...updatedState.player,
        inventory: updatedInventory,
      },
    };
  }

  // 스킬 경험치 보상
  if (rewards.skillExp && rewards.skillExp.length > 0) {
    for (const exp of rewards.skillExp) {
      // 여기서 importLater error 발생 방지를 위해 addSkillExperienceReducer의 로직을 직접 구현하거나
      // 아래 updatedState를 반환하기 전에 실제 addSkillExperienceReducer 호출로 대체
      const skillExperience = updatedState.player.skillExperience || {};
      const currentExp = skillExperience[exp.skill] || 0;
      const skillLevel = updatedState.player.skills[exp.skill] || 1;

      // 간단한 경험치 적용 (실제로는 더 복잡한 계산이 필요)
      const updatedSkillExp = {
        ...skillExperience,
        [exp.skill]: currentExp + exp.amount,
      };

      updatedState = {
        ...updatedState,
        player: {
          ...updatedState.player,
          skillExperience: updatedSkillExp,
        },
      };
    }
  }

  // 퀘스트 상태 업데이트 (보상 수령 후에는 상태 유지만 함)
  return updatedState;
}

/**
 * 퀘스트 진행 상태 체크 리듀서
 */
export function checkQuestsReducer(state: GameState): GameState {
  const updatedQuests = checkQuestProgress(state);

  return {
    ...state,
    player: {
      ...state.player,
      quests: updatedQuests,
    },
  };
}

/**
 * 품질 계수 상수
 */
const QUALITY_FACTORS: Record<string, number> = {
  LOW: 0.8,
  MEDIUM: 1.0,
  HIGH: 1.3,
};
