import { GameState } from "../../models/index";
import { GameAction } from "../types";
import {
  startNewGameReducer,
  updateGoldReducer,
  addItemToInventoryReducer,
  removeItemFromInventoryReducer,
  addSkillExperienceReducer,
  updateFactionReputationReducer,
} from "./playerReducers";
import { updateMarketReducer, buyItemReducer, sellItemReducer } from "./marketReducers";
import {
  travelToCityReducer,
  startTravelReducer,
  progressTravelReducer,
  completeTravelReducer,
  processTravelEventReducer,
} from "./travelReducers";
import { updateSettingsReducer, loadGameReducer } from "./gameReducers";

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
};

/**
 * 메인 게임 리듀서
 * 각 액션 타입에 맞는 전용 리듀서 함수를 호출합니다.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const reducer = reducerMap[action.type];
  return reducer ? reducer(state, action) : state;
}
