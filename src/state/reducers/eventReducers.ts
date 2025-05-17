import { applyEventEffects, selectEventOutcome } from "../../logic/EventSystem";
import { GameEvent, GameState } from "../../models";

/**
 * 이벤트 진행 리듀서 - 이벤트의 현재 상태를 업데이트합니다
 */
export function progressEventReducer(state: GameState, eventId: string): GameState {
  // 이벤트 찾기
  const activeEvent = state.world.events.find((e) => e.id === eventId);
  if (!activeEvent) return state;

  // 이벤트 상태 업데이트 (pending_choice로 변경)
  const updatedEvents = state.world.events.map((event) =>
    event.id === eventId ? { ...event, status: "pending_choice" as const } : event
  );

  return {
    ...state,
    world: {
      ...state.world,
      events: updatedEvents,
    },
  };
}

/**
 * 이벤트 선택 리듀서 - 플레이어의 선택에 따른 결과를 적용합니다
 */
export function processEventChoiceReducer(
  state: GameState,
  eventId: string,
  choiceId: string,
  eventData: GameEvent
): GameState {
  // 이벤트 찾기
  const activeEventIndex = state.world.events.findIndex((e) => e.id === eventId);
  if (activeEventIndex === -1) return state;

  // 선택한 선택지 찾기
  const choice = eventData.choices.find((c) => c.id === choiceId);
  if (!choice) return state;

  // 스킬 보너스 계산 (유효한 경우)
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
  const outcome = selectEventOutcome(choice.outcomes, skillBonus);

  // 결과 효과 적용
  const updatedPlayer = applyEventEffects(state.player, outcome.effects);

  // 선택 기록 업데이트
  const activeEvent = { ...state.world.events[activeEventIndex] };
  const choicesMade = activeEvent.choicesMade || [];
  activeEvent.choicesMade = [...choicesMade, choiceId];
  activeEvent.status = "resolved" as const;

  // 이벤트 목록 업데이트
  const updatedEvents = [...state.world.events];
  updatedEvents[activeEventIndex] = activeEvent;

  // 연결된 이벤트가 있으면 추가
  if (outcome.nextEventId) {
    // 다음 이벤트를 활성화하는 로직은 여기에 구현
    // (간단한 구현에서는 생략)
  }

  // 이벤트가 여행 관련인지 확인
  const isTravelEvent = activeEvent.type === "travel";

  // 여행 이벤트인 경우 travelState의 이벤트도 업데이트
  let updatedTravelState = state.travelState;
  if (isTravelEvent && updatedTravelState) {
    const updatedTravelEvents = updatedTravelState.events.map((event) =>
      event.id === eventId ? { ...event, processed: true } : event
    );

    updatedTravelState = {
      ...updatedTravelState,
      events: updatedTravelEvents,
    };
  }

  return {
    ...state,
    player: updatedPlayer,
    world: {
      ...state.world,
      events: updatedEvents,
    },
    travelState: updatedTravelState,
  };
}

/**
 * 이벤트 추가 리듀서 - 새 이벤트를 세계에 추가합니다
 */
export function addEventReducer(
  state: GameState,
  newEvent: {
    id: string;
    eventId: string;
    type: "travel" | "city" | "story" | "trade";
  }
): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      events: [
        ...state.world.events,
        {
          ...newEvent,
          status: "active" as const,
          choicesMade: [],
        },
      ],
    },
  };
}

/**
 * 이벤트 제거 리듀서 - 이벤트를 세계에서 제거합니다
 */
export function removeEventReducer(state: GameState, eventId: string): GameState {
  return {
    ...state,
    world: {
      ...state.world,
      events: state.world.events.filter((e) => e.id !== eventId),
    },
  };
}
