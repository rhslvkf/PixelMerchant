import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { GameState, Player, Season, GameSettings } from "../models/types";
import { DEFAULT_SETTINGS } from "../config/constants";

// 초기 상태 정의
const initialPlayer: Player = {
  id: "",
  name: "",
  gold: 500,
  inventory: [],
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
  },
};

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
};

// 액션 타입 정의
type GameAction =
  | { type: "START_NEW_GAME"; payload: { playerName: string } }
  | { type: "TRAVEL_TO_CITY"; payload: { cityId: string; travelDays: number } }
  | { type: "UPDATE_GOLD"; payload: { amount: number } }
  | { type: "UPDATE_SETTINGS"; payload: { settings: Partial<GameSettings> } }
  | { type: "ADD_ITEM_TO_INVENTORY"; payload: { itemId: string; quantity: number; price: number; quality: number } }
  | { type: "REMOVE_ITEM_FROM_INVENTORY"; payload: { itemId: string; quantity: number } };

// 리듀서 함수
const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_NEW_GAME":
      return {
        ...initialGameState,
        player: {
          ...initialGameState.player,
          id: Date.now().toString(),
          name: action.payload.playerName,
        },
      };

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

    default:
      return state;
  }
};

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
