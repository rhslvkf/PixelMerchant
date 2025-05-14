import { GameEvent, GameSettings, GameState, ItemQuality, SkillType, TransportType } from "../models/index";

// 액션 타입 정의
export type GameAction =
  | { type: "START_NEW_GAME"; payload: { playerName: string } }
  | { type: "LOAD_GAME"; payload: { gameState: GameState } }
  | { type: "TRAVEL_TO_CITY"; payload: { cityId: string; travelDays: number } }
  | { type: "UPDATE_GOLD"; payload: { amount: number } }
  | { type: "UPDATE_SETTINGS"; payload: { settings: Partial<GameSettings> } }
  | {
      type: "ADD_ITEM_TO_INVENTORY";
      payload: { itemId: string; quantity: number; price: number; quality: ItemQuality };
    }
  | { type: "REMOVE_ITEM_FROM_INVENTORY"; payload: { itemId: string; quantity: number } }
  | { type: "UPDATE_MARKET"; payload: { cityId: string } }
  | { type: "BUY_ITEM"; payload: { itemId: string; quantity: number; cityId: string; quality: ItemQuality } }
  | { type: "SELL_ITEM"; payload: { itemId: string; quantity: number; cityId: string; inventoryIndex: number } }
  | { type: "START_TRAVEL"; payload: { toCityId: string; transportType: TransportType } }
  | { type: "PROGRESS_TRAVEL" }
  | { type: "COMPLETE_TRAVEL" }
  | { type: "PROCESS_TRAVEL_EVENT"; payload: { eventId: string; outcome: any } }
  | { type: "ADD_SKILL_EXPERIENCE"; payload: { skill: SkillType; amount: number } }
  | { type: "UPDATE_FACTION_REPUTATION"; payload: { factionId: string; points: number } }
  | { type: "PROGRESS_EVENT"; payload: { eventId: string } }
  | {
      type: "PROCESS_EVENT_CHOICE";
      payload: {
        eventId: string;
        choiceId: string;
        eventData: GameEvent;
      };
    }
  | {
      type: "ADD_EVENT";
      payload: {
        event: {
          id: string;
          eventId: string;
          type: "travel" | "city" | "story" | "trade";
        };
      };
    }
  | { type: "REMOVE_EVENT"; payload: { eventId: string } };

// Context 타입 정의
export interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}
