import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { getEventById } from "../data/travelEvents";
import { selectEventOutcome } from "../logic/EventSystem";
import { EventChoice, EventOutcome, GameEvent } from "../models";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";

interface UseEventsReturn {
  currentEvent: GameEvent | null;
  isLoading: boolean;
  hasChoicePending: boolean;
  selectedChoice: string | null;
  selectedOutcome: EventOutcome | null;
  selectChoice: (choiceId: string) => void;
  confirmChoice: () => void;
  canSelectChoice: (choice: EventChoice) => boolean;
  dismissEvent: () => void;
}

export const useEvents = (eventId?: string): UseEventsReturn => {
  const { state, dispatch } = useGame();
  const navigation = useNavigation<AppNavigationProp>();

  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<EventOutcome | null>(null);

  // 액티브 이벤트 찾기
  const activeEventRef = eventId
    ? state.world.events.find((e) => e.id === eventId)
    : state.world.events.find((e) => e.status === "active" || e.status === "pending_choice");

  // 선택 대기 중인지 확인
  const hasChoicePending = activeEventRef?.status === "pending_choice";

  // 이벤트 정보 가져오기
  useEffect(() => {
    if (!activeEventRef) {
      setIsLoading(false);
      setCurrentEvent(null);
      return;
    }

    setIsLoading(true);

    // 이벤트 데이터 가져오기
    const eventData = getEventById(activeEventRef.eventId);

    if (eventData) {
      setCurrentEvent(eventData);
    } else {
      console.warn(`Event data not found for id: ${activeEventRef.eventId}`);
    }

    setIsLoading(false);
  }, [activeEventRef]);

  // 선택지 선택 가능 여부 검사
  const canSelectChoice = (choice: EventChoice): boolean => {
    // 기본적으로 선택 가능
    if (!choice.requiredSkill && !choice.requiredItem) return true;

    // 스킬 요구사항 확인
    if (choice.requiredSkill) {
      const playerSkillLevel = state.player.skills[choice.requiredSkill.skill] || 0;
      if (playerSkillLevel < choice.requiredSkill.level) {
        return false;
      }
    }

    // 아이템 요구사항 확인
    if (choice.requiredItem) {
      const hasItem = state.player.inventory.some((item) => item.itemId === choice.requiredItem && item.quantity > 0);
      if (!hasItem) {
        return false;
      }
    }

    return true;
  };

  // 선택지 선택 처리
  const selectChoice = (choiceId: string) => {
    if (!currentEvent) return;

    // 선택한 선택지 찾기
    const choice = currentEvent.choices.find((c) => c.id === choiceId);
    if (!choice) return;

    // 선택 가능 확인
    if (!canSelectChoice(choice)) return;

    setSelectedChoice(choiceId);

    // 스킬 보너스 계산
    let skillBonus = 0;
    if (choice.requiredSkill) {
      const playerSkillLevel = state.player.skills[choice.requiredSkill.skill] || 0;
      const requiredLevel = choice.requiredSkill.level;

      if (playerSkillLevel >= requiredLevel) {
        // 초과 레벨당 보너스 증가 (10%씩)
        skillBonus = (playerSkillLevel - requiredLevel + 1) * 0.1;
      }
    }

    // 결과 선택
    const outcome = choice.outcomes.length === 1 ? choice.outcomes[0] : selectEventOutcome(choice.outcomes, skillBonus);

    setSelectedOutcome(outcome);
  };

  // 선택 확정 처리
  const confirmChoice = () => {
    if (!currentEvent || !activeEventRef || !selectedChoice) return;

    // 이벤트 선택 처리 액션 디스패치
    dispatch({
      type: "PROCESS_EVENT_CHOICE",
      payload: {
        eventId: activeEventRef.id,
        choiceId: selectedChoice,
        eventData: currentEvent,
      },
    });

    // 선택 상태 초기화
    setSelectedChoice(null);
    setSelectedOutcome(null);

    // 이벤트 타입이 여행인 경우 추가 처리
    if (activeEventRef.type === "travel") {
      // 트래블 이벤트 처리 액션 디스패치
      dispatch({
        type: "PROCESS_TRAVEL_EVENT",
        payload: {
          eventId: activeEventRef.id,
          choiceId: selectedChoice,
        },
      });
    }

    // 이벤트 화면에서 나가기
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // 이벤트 무시 처리
  const dismissEvent = () => {
    if (!activeEventRef) return;

    // 이벤트 제거 액션 디스패치
    dispatch({
      type: "REMOVE_EVENT",
      payload: {
        eventId: activeEventRef.id,
      },
    });

    // 이벤트 화면에서 나가기
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return {
    currentEvent,
    isLoading,
    hasChoicePending,
    selectedChoice,
    selectedOutcome,
    selectChoice,
    confirmChoice,
    canSelectChoice,
    dismissEvent,
  };
};
