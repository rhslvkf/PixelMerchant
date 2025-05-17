import { GameState } from "../../models/index";
import { GameAction } from "../types";
import { addEventReducer, processEventChoiceReducer, progressEventReducer, removeEventReducer } from "./eventReducers";
import { loadGameReducer, updateSettingsReducer } from "./gameReducers";
import { buyItemReducer, sellItemReducer, updateMarketReducer } from "./marketReducers";
import {
  endNPCInteractionReducer,
  restockNPCTradesReducer,
  selectDialogueChoiceReducer,
  startNPCInteractionReducer,
  tradeWithNPCReducer,
} from "./npcReducers";
import {
  addItemToInventoryReducer,
  addSkillExperienceReducer,
  removeItemFromInventoryReducer,
  startNewGameReducer,
  updateFactionReputationReducer,
  updateGoldReducer,
} from "./playerReducers";
import {
  completeTravelReducer,
  processTravelEventReducer,
  progressTravelReducer,
  startTravelReducer,
  travelToCityReducer,
} from "./travelReducers";

/**
 * 각 액션 타입에 맞는 리듀서 함수를 매핑한 객체
 */
const reducerMap = {
  START_NEW_GAME: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "START_NEW_GAME") return state;
    return startNewGameReducer(state, action.payload.playerName);
  },

  LOAD_GAME: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "LOAD_GAME") return state;
    return loadGameReducer(state, action.payload.gameState);
  },

  TRAVEL_TO_CITY: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "TRAVEL_TO_CITY") return state;
    return travelToCityReducer(state, action.payload.cityId, action.payload.travelDays);
  },

  UPDATE_GOLD: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "UPDATE_GOLD") return state;
    return updateGoldReducer(state, action.payload.amount);
  },

  UPDATE_SETTINGS: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "UPDATE_SETTINGS") return state;
    return updateSettingsReducer(state, action.payload.settings);
  },

  ADD_ITEM_TO_INVENTORY: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "ADD_ITEM_TO_INVENTORY") return state;
    return addItemToInventoryReducer(
      state,
      action.payload.itemId,
      action.payload.quantity,
      action.payload.price,
      action.payload.quality
    );
  },

  REMOVE_ITEM_FROM_INVENTORY: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "REMOVE_ITEM_FROM_INVENTORY") return state;
    return removeItemFromInventoryReducer(state, action.payload.itemId, action.payload.quantity);
  },

  UPDATE_MARKET: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "UPDATE_MARKET") return state;
    return updateMarketReducer(state, action.payload.cityId);
  },

  BUY_ITEM: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "BUY_ITEM") return state;
    return buyItemReducer(
      state,
      action.payload.itemId,
      action.payload.quantity,
      action.payload.cityId,
      action.payload.quality
    );
  },

  SELL_ITEM: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "SELL_ITEM") return state;
    return sellItemReducer(
      state,
      action.payload.itemId,
      action.payload.quantity,
      action.payload.cityId,
      action.payload.inventoryIndex
    );
  },

  START_TRAVEL: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "START_TRAVEL") return state;
    return startTravelReducer(state, action.payload.toCityId, action.payload.transportType);
  },

  PROGRESS_TRAVEL: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "PROGRESS_TRAVEL") return state;
    return progressTravelReducer(state);
  },

  COMPLETE_TRAVEL: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "COMPLETE_TRAVEL") return state;
    return completeTravelReducer(state);
  },

  PROCESS_TRAVEL_EVENT: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "PROCESS_TRAVEL_EVENT") return state;
    return processTravelEventReducer(state, action.payload.eventId, action.payload.outcome);
  },

  ADD_SKILL_EXPERIENCE: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "ADD_SKILL_EXPERIENCE") return state;
    return addSkillExperienceReducer(state, action.payload.skill, action.payload.amount);
  },

  UPDATE_FACTION_REPUTATION: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "UPDATE_FACTION_REPUTATION") return state;
    return updateFactionReputationReducer(state, action.payload.factionId, action.payload.points);
  },

  PROGRESS_EVENT: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "PROGRESS_EVENT") return state;
    return progressEventReducer(state, action.payload.eventId);
  },

  PROCESS_EVENT_CHOICE: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "PROCESS_EVENT_CHOICE") return state;
    return processEventChoiceReducer(state, action.payload.eventId, action.payload.choiceId, action.payload.eventData);
  },

  ADD_EVENT: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "ADD_EVENT") return state;
    return addEventReducer(state, action.payload.event);
  },

  REMOVE_EVENT: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "REMOVE_EVENT") return state;
    return removeEventReducer(state, action.payload.eventId);
  },

  START_NPC_INTERACTION: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "START_NPC_INTERACTION") return state;
    return startNPCInteractionReducer(state, action.payload.npcId);
  },

  SELECT_DIALOGUE_CHOICE: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "SELECT_DIALOGUE_CHOICE") return state;
    return selectDialogueChoiceReducer(state, action.payload.choiceId);
  },

  END_NPC_INTERACTION: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "END_NPC_INTERACTION") return state;
    return endNPCInteractionReducer(state);
  },

  TRADE_WITH_NPC: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "TRADE_WITH_NPC") return state;
    return tradeWithNPCReducer(state, action.payload.npcId, action.payload.tradeId, action.payload.quantity);
  },

  RESTOCK_NPC_TRADES: (state: GameState, action: GameAction): GameState => {
    if (action.type !== "RESTOCK_NPC_TRADES") return state;
    return restockNPCTradesReducer(state, action.payload.currentDate);
  },
};

/**
 * 메인 게임 리듀서
 * 각 액션 타입에 맞는 전용 리듀서 함수를 호출합니다.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const reducer = reducerMap[action.type];
  return reducer ? reducer(state, action) : state;
}
