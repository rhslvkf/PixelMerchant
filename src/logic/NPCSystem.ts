import { GameDate, NPC, NPCSchedule, Season } from "../models";

/**
 * 현재 도시 및 날짜에 따라 해당 NPC가 도시에 있는지 확인
 *
 * @param npc - NPC 객체
 * @param cityId - 도시 ID
 * @param date - 게임 날짜
 * @returns - NPC가 해당 도시에 있는지 여부
 */
export function isNPCInCity(npc: NPC, cityId: string, date: GameDate): boolean {
  // 기본 위치 검사
  if (npc.baseLocation === cityId) return true;

  // 활동 가능 지역 검사
  if (!npc.availableLocations.includes(cityId)) return false;

  // 스케줄이 없으면 활동 가능 지역에 있다고 가정
  if (!npc.schedule) return true;

  // 스케줄 기반 위치 확인
  return npc.schedule.some((schedule) => isNPCAtLocation(schedule, cityId, date));
}

/**
 * 스케줄에 따라 NPC가 특정 위치에 있는지 확인
 */
function isNPCAtLocation(schedule: NPCSchedule, locationId: string, date: GameDate): boolean {
  // 위치 확인
  if (schedule.locationId !== locationId) return false;

  // 계절 확인
  if (schedule.seasons && !schedule.seasons.includes(date.season)) return false;

  // 요일 확인 (1-7, 1은 월요일로 가정)
  if (schedule.daysOfWeek) {
    // 요일 계산: (총 일수) % 7 + 1
    const totalDays = date.day + (date.month - 1) * 30 + (date.year - 1) * 360;
    const dayOfWeek = (totalDays % 7) + 1;

    if (!schedule.daysOfWeek.includes(dayOfWeek)) return false;
  }

  // 시간대 확인 (optional, 향후 시간 시스템 구현시 활용)

  return true;
}

/**
 * 도시에 있는 NPC 목록 가져오기
 *
 * @param npcs - 모든 NPC 객체 맵
 * @param cityId - 도시 ID
 * @param date - 게임 날짜
 * @returns - 해당 도시에 있는 NPC 목록
 */
export function getNPCsInCity(npcs: Record<string, NPC>, cityId: string, date: GameDate): NPC[] {
  return Object.values(npcs).filter((npc) => isNPCInCity(npc, cityId, date));
}

/**
 * NPC 재고 보충 처리
 *
 * @param npc - NPC 객체
 * @param currentDate - 현재 게임 날짜
 * @returns - 재고 보충된 NPC 객체
 */
export function restockNPCTrades(npc: NPC, currentDate: GameDate): NPC {
  if (!npc.trades || npc.trades.length === 0) return npc;

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

  return { ...npc, trades: updatedTrades };
}

/**
 * 두 날짜 사이의 일수 차이 계산
 */
function calculateDaysDifference(date1: GameDate, date2: GameDate): number {
  const day1 = date1.day + (date1.month - 1) * 30 + (date1.year - 1) * 360;
  const day2 = date2.day + (date2.month - 1) * 30 + (date2.year - 1) * 360;
  return Math.abs(day2 - day1);
}

/**
 * 대화 조건 검사
 *
 * @param condition - 대화 조건
 * @param playerState - 플레이어 상태
 * @param worldState - 게임 세계 상태
 * @returns - 조건 만족 여부
 */
export function checkDialogueCondition(
  condition: any,
  playerState: any,
  currentCityId: string,
  currentDate: GameDate
): boolean {
  const { type, target, value, operator } = condition;

  switch (type) {
    case "reputation":
      const factionRep = playerState.reputation[target] || 0;
      return compareValues(factionRep, Number(value), operator);

    case "skill":
      const skillLevel = playerState.skills[target] || 0;
      return compareValues(skillLevel, Number(value), operator);

    case "item":
      const hasItem = playerState.inventory.some(
        (i: { itemId: string; quantity: number }) => i.itemId === target && i.quantity > 0
      );
      return value === "true" ? hasItem : !hasItem;

    case "gold":
      return compareValues(playerState.gold, Number(value), operator);

    case "quest":
      // 퀘스트 시스템 구현 시 추가 예정
      return true;

    case "date":
      // 날짜 비교 (간소화)
      if (operator === "season") {
        return currentDate.season === value;
      }
      return true;

    case "location":
      return currentCityId === target;

    default:
      return true;
  }
}

/**
 * 값 비교 헬퍼 함수
 */
function compareValues(a: number, b: number, operator: string): boolean {
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
}
