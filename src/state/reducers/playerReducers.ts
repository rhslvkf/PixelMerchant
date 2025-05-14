import { GameState, SkillType, ReputationLevel, SkillExperience, FactionReputation } from "../../models/index";
import { GameAction } from "../types";
import { addItemToInventory, removeItemFromInventory } from "../utils/inventoryUtils";
import { calculateExpForNextLevel } from "../../logic/SkillSystem";
import { updateReputation, calculatePointsForNextLevel } from "../../logic/ReputationSystem";
import { initialPlayer } from "../initialState";
import { ItemQuality } from "../../models";

/**
 * 새 게임 시작 리듀서
 */
export function startNewGameReducer(state: GameState, playerName: string): GameState {
  return {
    ...state,
    player: {
      ...initialPlayer,
      id: Date.now().toString(),
      name: playerName,
      gold: 500,
    },
  };
}

/**
 * 골드 업데이트 리듀서
 */
export function updateGoldReducer(state: GameState, amount: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold + amount,
    },
  };
}

/**
 * 인벤토리에 아이템 추가 리듀서
 */
export function addItemToInventoryReducer(
  state: GameState,
  itemId: string,
  quantity: number,
  price: number,
  quality: ItemQuality
): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      inventory: addItemToInventory(state.player.inventory, itemId, quantity, price, quality),
    },
  };
}

/**
 * 인벤토리에서 아이템 제거 리듀서
 */
export function removeItemFromInventoryReducer(state: GameState, itemId: string, quantity: number): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      inventory: removeItemFromInventory(state.player.inventory, itemId, quantity),
    },
  };
}

/**
 * 스킬 경험치 추가 리듀서
 */
export function addSkillExperienceReducer(state: GameState, skill: SkillType, amount: number): GameState {
  // 기존 스킬 레벨
  const currentLevel = state.player.skills[skill] || 1;

  // 현재 누적 경험치 (player.skillExperience 필드가 없으면 생성)
  const skillExperience = state.player.skillExperience || {};
  const currentExp = skillExperience[skill] || 0;

  // 다음 레벨에 필요한 경험치
  const nextLevelExp = calculateExpForNextLevel(currentLevel);

  // 새 경험치 계산
  const newExp = currentExp + amount;

  // 레벨업 여부 확인
  let newLevel = currentLevel;
  let remainingExp = newExp;

  // 경험치가 다음 레벨에 필요한 양을 넘으면 레벨업
  if (remainingExp >= nextLevelExp) {
    remainingExp -= nextLevelExp;
    newLevel = currentLevel + 1;
  }

  // 업데이트된 스킬 레벨
  const updatedSkills = {
    ...state.player.skills,
    [skill]: newLevel,
  };

  // 업데이트된 경험치
  const updatedSkillExperience = {
    ...skillExperience,
    [skill]: remainingExp,
  };

  return {
    ...state,
    player: {
      ...state.player,
      skills: updatedSkills,
      skillExperience: updatedSkillExperience,
    },
  };
}

/**
 * 진영 평판 업데이트 리듀서
 */
export function updateFactionReputationReducer(state: GameState, factionId: string, points: number): GameState {
  // 기존 평판 확인
  const currentReputation = state.player.reputation[factionId] || 0;

  // 임시 평판 객체 생성 (기본 중립)
  const repObj: FactionReputation = {
    factionId,
    level: currentReputation as ReputationLevel,
    points: 0, // 현재는 포인트를 저장하지 않으므로 0에서 시작
    nextLevelPoints: calculatePointsForNextLevel(currentReputation as ReputationLevel),
  };

  // 평판 업데이트
  const updatedRepObj = updateReputation(repObj, points);

  // 평판 레벨 업데이트
  const updatedReputation = {
    ...state.player.reputation,
    [factionId]: updatedRepObj.level,
  };

  return {
    ...state,
    player: {
      ...state.player,
      reputation: updatedReputation,
    },
  };
}
