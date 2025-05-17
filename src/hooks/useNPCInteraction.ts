import { useState } from "react";
import { useGame } from "../state/GameContext";
import { DialogueCondition, NPC } from "../models/npc";
import { SkillType } from "../models";

export const useNPCInteraction = () => {
  const { state, dispatch } = useGame();
  const [npcModalVisible, setNPCModalVisible] = useState(false);

  // 현재 도시의 NPC 목록 가져오기
  const getNPCsInCurrentCity = () => {
    const { currentCityId, npcState } = state;

    return Object.values(npcState.npcs).filter(
      (npc) => npc.availableLocations.includes(currentCityId) || npc.baseLocation === currentCityId
    );
  };

  // NPC와 대화 시작
  const startInteraction = (npcId: string) => {
    dispatch({
      type: "START_NPC_INTERACTION",
      payload: { npcId },
    });

    setNPCModalVisible(true);
  };

  // 대화 종료
  const endInteraction = () => {
    dispatch({ type: "END_NPC_INTERACTION" });
    setNPCModalVisible(false);
  };

  // 대화 조건 확인
  const checkDialogueCondition = (condition: DialogueCondition): boolean => {
    const { type, target, value, operator } = condition;

    switch (type) {
      case "reputation":
        const factionRep = state.player.reputation[target] || 0;
        return compareValues(factionRep, Number(value), operator);

      case "skill":
        const skillLevel = state.player.skills[target as SkillType] || 0;
        return compareValues(skillLevel, Number(value), operator);

      case "item":
        const hasItem = state.player.inventory.some((i) => i.itemId === target && i.quantity > 0);
        return hasItem === (value === "true");

      case "gold":
        return compareValues(state.player.gold, Number(value), operator);

      case "quest":
        // 퀘스트 시스템 구현 시 추가 예정
        return true;

      case "date":
        // 날짜 비교 로직 구현 필요
        return true;

      case "location":
        return state.currentCityId === target;

      default:
        return true;
    }
  };

  // 대화 조건에 따른 선택지 필터링
  const filterChoicesByConditions = (npc: NPC) => {
    const { currentDialogueId } = state.npcState;

    if (!currentDialogueId) return [];

    const dialogue = npc.dialogues.find((d) => d.id === currentDialogueId);

    if (!dialogue) return [];

    return dialogue.choices.filter((choice) => {
      if (!choice.conditions) return true;

      return choice.conditions.every(checkDialogueCondition);
    });
  };

  // 값 비교 헬퍼 함수
  const compareValues = (a: number, b: number, operator: string): boolean => {
    switch (operator) {
      case "eq":
        return a === b;
      case "neq":
        return a !== b;
      case "gt":
        return a > b;
      case "lt":
        return a < b;
      case "gte":
        return a >= b;
      case "lte":
        return a <= b;
      default:
        return false;
    }
  };

  return {
    npcsInCurrentCity: getNPCsInCurrentCity(),
    npcModalVisible,
    activeNPC: state.npcState.activeNPC ? state.npcState.npcs[state.npcState.activeNPC] : null,
    currentDialogueId: state.npcState.currentDialogueId,
    startInteraction,
    endInteraction,
    filterChoicesByConditions,
  };
};
