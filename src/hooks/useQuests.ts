import { useState, useEffect } from "react";
import { useGame } from "../state/GameContext";
import { getAvailableQuestsInCity } from "../logic/QuestSystem";
import { getQuestById, QUESTS } from "../data/quests";
import { Quest, QuestStatus } from "../models";

export const useQuests = () => {
  const { state, dispatch } = useGame();
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);

  // 현재 도시에서 제공 가능한 퀘스트 가져오기
  useEffect(() => {
    const availableQuestIds = getAvailableQuestsInCity(state, state.currentCityId);
    const quests = availableQuestIds.map((id) => getQuestById(id)).filter((quest) => quest !== undefined) as Quest[];

    setAvailableQuests(quests);
  }, [state.currentCityId, state.player.quests]);

  // 진행 중인 퀘스트와 완료된 퀘스트 분류
  useEffect(() => {
    const active: Quest[] = [];
    const completed: Quest[] = [];

    state.player.quests.forEach((playerQuest) => {
      const quest = getQuestById(playerQuest.questId);
      if (quest) {
        if (playerQuest.status === QuestStatus.ACTIVE) {
          active.push(quest);
        } else if (playerQuest.status === QuestStatus.COMPLETED) {
          completed.push(quest);
        }
      }
    });

    setActiveQuests(active);
    setCompletedQuests(completed);
  }, [state.player.quests]);

  // 퀘스트 진행 상태 체크 (매 도시 방문 및 날짜 변경 시)
  const checkQuestProgress = () => {
    dispatch({ type: "CHECK_QUESTS" });
  };

  // 퀘스트 수락
  const acceptQuest = (questId: string) => {
    dispatch({
      type: "ACCEPT_QUEST",
      payload: { questId },
    });
  };

  // 퀘스트 포기
  const abandonQuest = (questId: string) => {
    dispatch({
      type: "ABANDON_QUEST",
      payload: { questId },
    });
  };

  // 퀘스트 보상 수령
  const completeQuest = (questId: string) => {
    dispatch({
      type: "COMPLETE_QUEST",
      payload: { questId },
    });
  };

  // 플레이어 퀘스트 상태 가져오기
  const getPlayerQuestStatus = (questId: string) => {
    return state.player.quests.find((q) => q.questId === questId);
  };

  return {
    availableQuests,
    activeQuests,
    completedQuests,
    checkQuestProgress,
    acceptQuest,
    abandonQuest,
    completeQuest,
    getPlayerQuestStatus,
  };
};
