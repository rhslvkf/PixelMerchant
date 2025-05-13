import { City, GameDate, Season, TransportType, TravelEvent, TravelRoute } from "../models/index";
import { advanceDate } from "./DateSystem";

/**
 * 도시 간 이동 경로 생성
 *
 * @param fromCity - 출발 도시
 * @param toCity - 도착 도시
 * @param transportType - 이동 수단
 * @returns - 여행 경로 정보
 */
export function createTravelRoute(fromCity: City, toCity: City, transportType: TransportType): TravelRoute | null {
  // 연결 확인
  const connection = fromCity.travelConnections.find((conn) => conn.destinationId === toCity.id);

  if (!connection) return null;

  // 선택한 이동 수단 가능한지 확인
  if (!connection.transportOptions.includes(transportType)) return null;

  // 거리와 위험도 가져오기
  const { distance, dangerLevel } = connection;

  // 이동 수단별 소요 일수 계산
  const speedFactor = getTransportSpeedFactor(transportType);
  const estimatedDays = Math.max(1, Math.ceil(distance / speedFactor));

  return {
    fromCityId: fromCity.id,
    toCityId: toCity.id,
    distance,
    transportType,
    dangerLevel,
    estimatedDays,
    events: [], // 초기에는 이벤트 없음
  };
}

/**
 * 이동 수단별 속도 계수
 */
function getTransportSpeedFactor(type: TransportType): number {
  switch (type) {
    case TransportType.FOOT:
      return 1;
    case TransportType.CART:
      return 1.5;
    case TransportType.SHIP:
      return 2;
    case TransportType.SPECIAL:
      return 3;
    default:
      return 1;
  }
}

/**
 * 여행 이벤트 생성
 *
 * @param route - 여행 경로
 * @param currentDate - 현재 날짜
 * @param playerLevel - 플레이어 레벨/경험
 * @returns - 여행 경로에 이벤트 추가된 버전
 */
export function generateTravelEvents(route: TravelRoute, currentDate: GameDate, playerLevel: number = 1): TravelRoute {
  const { estimatedDays, dangerLevel } = route;
  const updatedRoute = { ...route, events: [] as TravelEvent[] };
  const events: TravelEvent[] = [];

  // 하루 단위로 이벤트 발생 확인
  for (let day = 1; day <= estimatedDays; day++) {
    // 기본 이벤트 발생 확률 (여행일당 40%)
    let eventChance = 0.4;

    // 경로 위험도에 따른 확률 조정
    eventChance *= 1 + (dangerLevel - 3) * 0.1;

    // 플레이어 레벨에 따른 감소
    eventChance *= 1 - (playerLevel - 1) * 0.05;

    // 계절 영향 (겨울은 위험 증가)
    if (currentDate.season === Season.WINTER) {
      eventChance += 0.1;
    }

    // 이벤트 발생 여부 결정
    if (Math.random() < eventChance) {
      // 실제 게임에서는 이벤트 ID 선택 로직 구현 필요
      const eventId = `travel_event_${day}`;

      events.push({
        id: eventId,
        day,
        processed: false,
      });
    }
  }

  updatedRoute.events = events;
  return updatedRoute;
}

/**
 * 여행 도착 날짜 계산
 *
 * @param currentDate - 현재 날짜
 * @param days - 소요 일수
 * @returns - 도착 예정 날짜
 */
export function calculateArrivalDate(currentDate: GameDate, days: number): GameDate {
  let arrivalDate = { ...currentDate };

  for (let i = 0; i < days; i++) {
    arrivalDate = advanceDate(arrivalDate);
  }

  return arrivalDate;
}

/**
 * 여행 경로에서 이동 비용 계산
 *
 * @param route - 여행 경로
 * @returns - 이동 비용 (골드)
 */
export function calculateTravelCost(route: TravelRoute): number {
  const { distance, transportType } = route;

  // 기본 비용: 거리당 10 골드
  let baseCost = distance * 10;

  // 이동 수단별 비용 조정
  switch (transportType) {
    case TransportType.FOOT:
      // 도보는 기본 비용의 절반
      baseCost *= 0.5;
      break;
    case TransportType.CART:
      // 마차는 기본 비용
      break;
    case TransportType.SHIP:
      // 배는 2배
      baseCost *= 2;
      break;
    case TransportType.SPECIAL:
      // 특수 이동 수단은 3배
      baseCost *= 3;
      break;
  }

  return Math.round(baseCost);
}
