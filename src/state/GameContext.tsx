import React, { createContext, useContext, useReducer, ReactNode } from "react";
import {
  GameState,
  Player,
  Season,
  GameSettings,
  InventoryItem,
  TransportType,
  SkillType,
  ReputationLevel,
  SkillExperience,
  FactionReputation,
} from "../models/types";
import { DEFAULT_SETTINGS } from "../config/constants";
import { applyPlayerTradeImpact, updateCityMarket } from "../logic/EconomySystem";
import { CITIES } from "../data/cities";
import { REGIONS } from "../data/cities";
import { advanceDate } from "../logic/DateSystem";
import { createTravelRoute, generateTravelEvents, calculateArrivalDate } from "../logic/TravelSystem";
import { ITEMS } from "../data/items";
import { calculateInventoryWeight } from "../logic/InventorySystem";
import { updateReputation } from "../logic/ReputationSystem";
import { calculatePointsForNextLevel } from "../logic/ReputationSystem";
import { addSkillExp } from "../logic/SkillSystem";
import { calculateExpForNextLevel } from "../logic/SkillSystem";
// 초기 상태 정의
const initialPlayer: Player = {
  id: "",
  name: "",
  gold: 500,
  inventory: [],
  maxWeight: 50,
  skills: {
    trade: 1,
    logistics: 1,
    insight: 1,
    diplomacy: 1,
    exploration: 1,
  },
  reputation: {},
  stats: {
    daysPlayed: 0,
    citiesVisited: [],
    totalProfit: 0,
    completedQuests: [],
    discoveredItems: [],
    travelDistance: 0,
    successfulDeals: 0,
  },
};

// 초기 상태 정의
const initialGameState: GameState = {
  player: initialPlayer,
  currentDate: {
    day: 1,
    month: 1,
    year: 1,
    season: Season.SPRING,
  },
  currentCityId: "golden_harbor", // 시작 도시
  gameSettings: DEFAULT_SETTINGS,
  world: {
    cities: CITIES,
    regions: REGIONS,
    events: [],
    globalMarketFactors: {
      events: [],
      seasonalFactors: {
        [Season.SPRING]: {},
        [Season.SUMMER]: {},
        [Season.FALL]: {},
        [Season.WINTER]: {},
      },
    },
  },
};

// 액션 타입 정의
type GameAction =
  | { type: "START_NEW_GAME"; payload: { playerName: string } }
  | { type: "LOAD_GAME"; payload: { gameState: GameState } }
  | { type: "TRAVEL_TO_CITY"; payload: { cityId: string; travelDays: number } }
  | { type: "UPDATE_GOLD"; payload: { amount: number } }
  | { type: "UPDATE_SETTINGS"; payload: { settings: Partial<GameSettings> } }
  | { type: "ADD_ITEM_TO_INVENTORY"; payload: { itemId: string; quantity: number; price: number; quality: number } }
  | { type: "REMOVE_ITEM_FROM_INVENTORY"; payload: { itemId: string; quantity: number } }
  | { type: "UPDATE_MARKET"; payload: { cityId: string } }
  | { type: "BUY_ITEM"; payload: { itemId: string; quantity: number; cityId: string; quality: number } }
  | { type: "SELL_ITEM"; payload: { itemId: string; quantity: number; cityId: string } }
  | { type: "START_TRAVEL"; payload: { toCityId: string; transportType: TransportType } }
  | { type: "PROGRESS_TRAVEL" }
  | { type: "COMPLETE_TRAVEL" }
  | { type: "PROCESS_TRAVEL_EVENT"; payload: { eventId: string; outcome: any } }
  | { type: "ADD_SKILL_EXPERIENCE"; payload: { skill: SkillType; amount: number } }
  | { type: "UPDATE_FACTION_REPUTATION"; payload: { factionId: string; points: number } };

// 리듀서 함수
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_NEW_GAME": {
      const { playerName } = action.payload;

      return {
        ...initialGameState,
        player: {
          ...initialGameState.player,
          id: Date.now().toString(),
          name: playerName,
          gold: 500,
          inventory: [], // 기본 인벤토리는 비어있음
          skills: {
            [SkillType.TRADE]: 1,
            [SkillType.LOGISTICS]: 1,
            [SkillType.INSIGHT]: 1,
            [SkillType.DIPLOMACY]: 1,
            [SkillType.EXPLORATION]: 1,
          },
        },
      };
    }

    case "LOAD_GAME": {
      return action.payload.gameState;
    }

    case "TRAVEL_TO_CITY":
      // 도시 이동 및 날짜 진행 로직
      const newDate = { ...state.currentDate };
      newDate.day += action.payload.travelDays;
      // 날짜 정규화 로직 (월/년 변경 등) 추가 필요

      return {
        ...state,
        currentCityId: action.payload.cityId,
        currentDate: newDate,
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            daysPlayed: state.player.stats.daysPlayed + action.payload.travelDays,
            citiesVisited: state.player.stats.citiesVisited.includes(action.payload.cityId)
              ? state.player.stats.citiesVisited
              : [...state.player.stats.citiesVisited, action.payload.cityId],
          },
        },
      };

    case "UPDATE_GOLD":
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + action.payload.amount,
        },
      };

    case "UPDATE_SETTINGS":
      return {
        ...state,
        gameSettings: {
          ...state.gameSettings,
          ...action.payload.settings,
        },
      };

    case "ADD_ITEM_TO_INVENTORY": {
      const { itemId, quantity, price, quality } = action.payload;
      const existingItemIndex = state.player.inventory.findIndex(
        (item) => item.itemId === itemId && Math.abs(item.quality - quality) < 0.01
      );

      const updatedInventory = [...state.player.inventory];

      if (existingItemIndex >= 0) {
        // 기존 아이템 수량 업데이트
        updatedInventory[existingItemIndex] = {
          ...updatedInventory[existingItemIndex],
          quantity: updatedInventory[existingItemIndex].quantity + quantity,
          // 평균 구매 가격 계산
          purchasePrice:
            (updatedInventory[existingItemIndex].purchasePrice * updatedInventory[existingItemIndex].quantity +
              price * quantity) /
            (updatedInventory[existingItemIndex].quantity + quantity),
        };
      } else {
        // 새 아이템 추가
        updatedInventory.push({
          itemId,
          quantity,
          purchasePrice: price,
          quality,
        });
      }

      return {
        ...state,
        player: {
          ...state.player,
          inventory: updatedInventory,
        },
      };
    }

    case "REMOVE_ITEM_FROM_INVENTORY": {
      const { itemId, quantity } = action.payload;
      const existingItemIndex = state.player.inventory.findIndex((item) => item.itemId === itemId);

      if (existingItemIndex < 0) return state;

      const updatedInventory = [...state.player.inventory];
      const existingItem = updatedInventory[existingItemIndex];

      if (existingItem.quantity <= quantity) {
        // 아이템 제거
        updatedInventory.splice(existingItemIndex, 1);
      } else {
        // 수량 감소
        updatedInventory[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity - quantity,
        };
      }

      return {
        ...state,
        player: {
          ...state.player,
          inventory: updatedInventory,
        },
      };
    }

    case "UPDATE_MARKET": {
      const { cityId } = action.payload;
      const city = state.world.cities[cityId];

      if (!city) return state;

      const updatedCity = {
        ...city,
        market: updateCityMarket(city.market, city, state.currentDate, {}),
      };

      return {
        ...state,
        world: {
          ...state.world,
          cities: {
            ...state.world.cities,
            [cityId]: updatedCity,
          },
        },
      };
    }

    case "BUY_ITEM": {
      const { itemId, quantity, cityId, quality } = action.payload;
      const city = state.world.cities[cityId];

      if (!city) return state;

      // 아이템 찾기
      const marketItem = city.market.items.find((item) => item.itemId === itemId);
      if (!marketItem) return state;

      // 재고 확인
      if (marketItem.quantity < quantity) return state;

      // 가격 계산
      const totalPrice = marketItem.currentPrice * quantity;

      // 골드 확인
      if (state.player.gold < totalPrice) return state;

      // 무게 확인
      const itemInfo = ITEMS[itemId];
      if (!itemInfo) return state;

      const additionalWeight = itemInfo.weight * quantity;
      const currentWeight = calculateInventoryWeight(state.player.inventory, ITEMS);

      if (currentWeight + additionalWeight > state.player.maxWeight) {
        // 무게 초과 시 구매 불가
        return state;
      }

      // 시장 업데이트
      const updatedMarket = applyPlayerTradeImpact(
        city.market,
        itemId,
        -quantity // 구매는 수량 감소
      );

      // 도시 업데이트
      const updatedCity = {
        ...city,
        market: updatedMarket,
      };

      // 인벤토리에 아이템 추가
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - totalPrice,
          inventory: addItemToInventory(state.player.inventory, itemId, quantity, marketItem.currentPrice, quality),
        },
        world: {
          ...state.world,
          cities: {
            ...state.world.cities,
            [cityId]: updatedCity,
          },
        },
      };
    }

    case "SELL_ITEM": {
      const { itemId, quantity, cityId } = action.payload;
      const city = state.world.cities[cityId];

      if (!city) return state;

      // 인벤토리에서 아이템 찾기
      const inventoryItem = state.player.inventory.find((item) => item.itemId === itemId);
      if (!inventoryItem || inventoryItem.quantity < quantity) return state;

      // 아이템의 현재 가격 찾기
      const marketItem = city.market.items.find((item) => item.itemId === itemId);
      const sellPrice = marketItem ? marketItem.currentPrice : inventoryItem.purchasePrice * 0.7; // 해당 도시에 없는 상품은 할인 판매

      const totalSellValue = sellPrice * quantity;

      // 시장 업데이트
      const updatedMarket = marketItem
        ? applyPlayerTradeImpact(city.market, itemId, quantity) // 판매는 수량 증가
        : city.market;

      // 도시 업데이트
      const updatedCity = {
        ...city,
        market: updatedMarket,
      };

      // 인벤토리에서 아이템 제거
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + totalSellValue,
          inventory: removeItemFromInventory(state.player.inventory, itemId, quantity),
        },
        world: {
          ...state.world,
          cities: {
            ...state.world.cities,
            [cityId]: updatedCity,
          },
        },
      };
    }

    case "START_TRAVEL": {
      const { toCityId, transportType } = action.payload;
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
        Math.max(1, Math.floor(Object.values(state.player.skills).reduce((sum, val) => sum + val, 0) / 5))
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

    case "PROGRESS_TRAVEL": {
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

    case "COMPLETE_TRAVEL": {
      if (!state.travelState) return state;

      // 도시 도착
      return {
        ...state,
        currentCityId: state.travelState.route.toCityId,
        currentDate: state.travelState.arrivalDate, // 날짜를 도착일로 설정
        travelState: undefined, // 여행 상태 제거
      };
    }

    case "PROCESS_TRAVEL_EVENT": {
      if (!state.travelState) return state;

      const { eventId, outcome } = action.payload;

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

    case "ADD_SKILL_EXPERIENCE": {
      const { skill, amount } = action.payload;

      // 기존 스킬 레벨
      const currentLevel = state.player.skills[skill] || 1;

      // 임시 스킬 경험치 객체 생성
      const skillExp: SkillExperience = {
        level: currentLevel,
        currentExp: 0, // 현재는 경험치를 저장하지 않으므로 0에서 시작
        nextLevelExp: calculateExpForNextLevel(currentLevel),
      };

      // 경험치 추가 및 레벨업 처리
      const updatedSkillExp = addSkillExp(skillExp, amount);

      // 스킬 레벨 업데이트
      const updatedSkills = {
        ...state.player.skills,
        [skill]: updatedSkillExp.level,
      };

      return {
        ...state,
        player: {
          ...state.player,
          skills: updatedSkills,
        },
      };
    }

    case "UPDATE_FACTION_REPUTATION": {
      const { factionId, points } = action.payload;

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

    default:
      return state;
  }
};

// 인벤토리 헬퍼 함수
function addItemToInventory(
  inventory: InventoryItem[],
  itemId: string,
  quantity: number,
  price: number,
  quality: number
): InventoryItem[] {
  const existingItemIndex = inventory.findIndex(
    (item) => item.itemId === itemId && Math.abs(item.quality - quality) < 0.01
  );

  const updatedInventory = [...inventory];

  if (existingItemIndex >= 0) {
    // 기존 아이템 수량 업데이트
    const existingItem = inventory[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    const weightedPrice = (existingItem.purchasePrice * existingItem.quantity + price * quantity) / newQuantity;

    updatedInventory[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      purchasePrice: weightedPrice,
    };
  } else {
    // 새 아이템 추가
    updatedInventory.push({
      itemId,
      quantity,
      purchasePrice: price,
      quality,
    });
  }

  return updatedInventory;
}

function removeItemFromInventory(inventory: InventoryItem[], itemId: string, quantity: number): InventoryItem[] {
  const existingItemIndex = inventory.findIndex((item) => item.itemId === itemId);

  if (existingItemIndex < 0) return inventory;

  const updatedInventory = [...inventory];
  const existingItem = updatedInventory[existingItemIndex];

  if (existingItem.quantity <= quantity) {
    // 아이템 제거
    updatedInventory.splice(existingItemIndex, 1);
  } else {
    // 수량 감소
    updatedInventory[existingItemIndex] = {
      ...existingItem,
      quantity: existingItem.quantity - quantity,
    };
  }

  return updatedInventory;
}

// Context 생성
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Context Provider 컴포넌트
interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

// Custom Hook
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
