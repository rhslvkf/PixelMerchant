import { getEventById } from "../../data/travelEvents";
import { advanceDate } from "../../logic/DateSystem";
import { applyEventEffects, selectEventOutcome } from "../../logic/EventSystem";
import { calculateArrivalDate, createTravelRoute, generateTravelEvents } from "../../logic/TravelSystem";
import { GameDate, GameState, TransportType } from "../../models/index";
import { checkQuestsReducer } from "./questReducers";

/**
 * 도시 이동 리듀서
 */
export function travelToCityReducer(state: GameState, cityId: string, travelDays: number): GameState {
  // 날짜 진행
  let newDate = { ...state.currentDate };
  for (let i = 0; i < travelDays; i++) {
    newDate = advanceDate(newDate);
  }

  // NPC 재고 업데이트
  const updatedState = {
    ...state,
    currentCityId: cityId,
    currentDate: newDate,
    player: {
      ...state.player,
      stats: {
        ...state.player.stats,
        daysPlayed: state.player.stats.daysPlayed + travelDays,
        citiesVisited: state.player.stats.citiesVisited.includes(cityId)
          ? state.player.stats.citiesVisited
          : [...state.player.stats.citiesVisited, cityId],
      },
    },
  };

  const questsUpdated = checkQuestsReducer(updatedState);

  return restockNPCTradesReducer(questsUpdated, newDate);
}

/**
 * NPC 재고 보충 리듀서 - 상태 업데이트만 담당
 */
function restockNPCTradesReducer(state: GameState, currentDate: GameDate): GameState {
  const updatedNPCs = { ...state.npcState.npcs };

  Object.keys(updatedNPCs).forEach((npcId) => {
    const npc = updatedNPCs[npcId];

    if (!npc.trades) return;

    const updatedTrades = npc.trades.map((trade) => {
      // 마지막 재고 보충 날짜 확인
      if (!trade.lastRestock) {
        return {
          ...trade,
          lastRestock: currentDate,
        };
      }

      // 재고 보충 주기 계산
      const daysSinceRestock = calculateDaysDifference(trade.lastRestock, currentDate);

      if (daysSinceRestock >= trade.restockDays) {
        // 재고 보충
        return {
          ...trade,
          quantityAvailable: trade.maxQuantity || Math.floor(Math.random() * 5) + 1, // 기본 1-5개
          lastRestock: currentDate,
        };
      }

      return trade;
    });

    updatedNPCs[npcId] = {
      ...npc,
      trades: updatedTrades,
    };
  });

  return {
    ...state,
    npcState: {
      ...state.npcState,
      npcs: updatedNPCs,
    },
  };
}

// 날짜 차이 계산 헬퍼 함수
function calculateDaysDifference(date1: GameDate, date2: GameDate): number {
  const day1 = date1.day + (date1.month - 1) * 30 + (date1.year - 1) * 360;
  const day2 = date2.day + (date2.month - 1) * 30 + (date2.year - 1) * 360;
  return Math.abs(day2 - day1);
}

/**
 * 여행 시작 리듀서
 */
export function startTravelReducer(state: GameState, toCityId: string, transportType: TransportType): GameState {
  const fromCity = state.world.cities[state.currentCityId];
  const toCity = state.world.cities[toCityId];

  if (!fromCity || !toCity) return state;

  // 여행 경로 생성
  const route = createTravelRoute(fromCity, toCity, transportType);
  if (!route) return state;

  // 이벤트 생성
  const routeWithEvents = generateTravelEvents(
    route,
    state.currentDate,
    Math.max(1, Math.round(Object.values(state.player.skills).reduce((sum, val) => sum + val, 0) / 5))
  );

  // 도착 날짜 계산
  const arrivalDate = calculateArrivalDate(state.currentDate, routeWithEvents.estimatedDays);

  // 여행 상태 설정
  return {
    ...state,
    travelState: {
      route: routeWithEvents,
      currentDay: 0, // 아직 여행 시작 전
      events: routeWithEvents.events || [],
      arrivalDate,
    },
  };
}

/**
 * 여행 진행 리듀서
 */
export function progressTravelReducer(state: GameState): GameState {
  if (!state.travelState) return state;

  const { route, currentDay, events } = state.travelState;

  // 날짜 진행
  const newCurrentDay = currentDay + 1;
  const newDate = advanceDate(state.currentDate);

  // 이미 마지막 날이면 여행 완료
  if (newCurrentDay > route.estimatedDays) {
    return {
      ...state,
      currentCityId: route.toCityId,
      travelState: undefined,
    };
  }

  // 해당 날짜의 이벤트 확인
  const todayEvents = events.filter((e) => e.day === newCurrentDay && !e.processed);

  // 오늘 이벤트가 있으면 글로벌 이벤트로 등록
  if (todayEvents.length > 0) {
    // 첫 번째 이벤트만 처리
    const firstEvent = todayEvents[0];

    // 글로벌 이벤트 배열에 추가
    const globalEvents = [...state.world.events];
    const exists = globalEvents.some((e) => e.id === firstEvent.id);

    if (!exists) {
      globalEvents.push({
        id: firstEvent.id,
        eventId: firstEvent.eventId,
        type: "travel",
        status: "active",
      });
    }

    return {
      ...state,
      currentDate: newDate,
      travelState: {
        ...state.travelState,
        currentDay: newCurrentDay,
      },
      world: {
        ...state.world,
        events: globalEvents,
      },
    };
  }

  // 이벤트 없으면 그냥 진행
  return {
    ...state,
    currentDate: newDate,
    travelState: {
      ...state.travelState,
      currentDay: newCurrentDay,
    },
  };
}

/**
 * 여행 완료 리듀서
 */
export function completeTravelReducer(state: GameState): GameState {
  if (!state.travelState) return state;

  // 도시 도착
  return {
    ...state,
    currentCityId: state.travelState.route.toCityId,
    currentDate: state.travelState.arrivalDate, // 날짜를 도착일로 설정
    travelState: undefined, // 여행 상태 제거
  };
}

/**
 * 여행 이벤트 처리 리듀서
 */
export function processTravelEventReducer(state: GameState, eventId: string, choiceId: string): GameState {
  if (!state.travelState) return state;

  // 이벤트 찾기
  const travelEvent = state.travelState.events.find((e) => e.id === eventId);
  if (!travelEvent) return state;

  // 이벤트 데이터 가져오기
  const eventData = getEventById(travelEvent.eventId);
  if (!eventData) {
    // 이벤트 데이터가 없으면 처리됨으로만 표시
    const updatedEvents = state.travelState.events.map((event) =>
      event.id === eventId ? { ...event, processed: true } : event
    );
    return {
      ...state,
      travelState: {
        ...state.travelState,
        events: updatedEvents,
      },
    };
  }

  // 선택한 선택지 찾기
  const choice = eventData.choices.find((c) => c.id === choiceId);
  if (!choice) {
    // 선택지가 없으면 그냥 처리됨으로 표시
    const updatedEvents = state.travelState.events.map((event) =>
      event.id === eventId ? { ...event, processed: true } : event
    );
    return {
      ...state,
      travelState: {
        ...state.travelState,
        events: updatedEvents,
      },
    };
  }

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

  // 결과 선택 및 효과 적용
  const outcome = choice.outcomes.length === 1 ? choice.outcomes[0] : selectEventOutcome(choice.outcomes, skillBonus);

  // 효과 적용
  const updatedPlayer = applyEventEffects(state.player, outcome.effects);

  // 이벤트 처리됨으로 표시
  const updatedEvents = state.travelState.events.map((event) =>
    event.id === eventId ? { ...event, processed: true } : event
  );

  return {
    ...state,
    player: updatedPlayer,
    travelState: {
      ...state.travelState,
      events: updatedEvents,
    },
  };
}
