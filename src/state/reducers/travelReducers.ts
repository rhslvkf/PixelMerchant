import { advanceDate } from "../../logic/DateSystem";
import { calculateArrivalDate, createTravelRoute, generateTravelEvents } from "../../logic/TravelSystem";
import { GameState, TransportType } from "../../models/index";

/**
 * 도시 이동 리듀서
 */
export function travelToCityReducer(state: GameState, cityId: string, travelDays: number): GameState {
  // 날짜 진행
  let newDate = { ...state.currentDate };
  for (let i = 0; i < travelDays; i++) {
    newDate = advanceDate(newDate);
  }

  return {
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

  // 이미 마지막 날이면 여행 완료
  if (currentDay >= route.estimatedDays) {
    return {
      ...state,
      currentCityId: route.toCityId,
      travelState: undefined, // 여행 상태 제거
    };
  }

  // 날짜 진행
  const newCurrentDay = currentDay + 1;
  const newDate = advanceDate(state.currentDate);

  // 해당 날짜의 이벤트 확인
  const todayEvents = events.filter((e) => e.day === newCurrentDay && !e.processed);

  // 오늘 이벤트가 있으면 처리 필요, 없으면 계속 진행
  if (todayEvents.length > 0) {
    const updatedEvents = events.map((event) =>
      event.day === newCurrentDay
        ? { ...event, processed: true } // 이벤트 처리됨으로 표시
        : event
    );

    return {
      ...state,
      currentDate: newDate,
      travelState: {
        ...state.travelState,
        currentDay: newCurrentDay,
        events: updatedEvents,
      },
    };
  } else {
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
export function processTravelEventReducer(state: GameState, eventId: string, outcome: any): GameState {
  if (!state.travelState) return state;

  // 이벤트 결과 처리 (실제 구현에서는 outcome에 따라 다양한 효과 적용)
  // 예시: 골드 변경, 아이템 획득/손실, 상태 변경 등

  // 이 예제에서는 이벤트를 처리됨으로 표시만 함
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
