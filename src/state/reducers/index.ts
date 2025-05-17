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
const reducerMap: Record<GameAction["type"], (state: GameState, action: any) => GameState> = {
  START_NEW_GAME: (state, action) => startNewGameReducer(state, action.payload.playerName),
  LOAD_GAME: (state, action) => loadGameReducer(state, action.payload.gameState),
  TRAVEL_TO_CITY: (state, action) => travelToCityReducer(state, action.payload.cityId, action.payload.travelDays),
  UPDATE_GOLD: (state, action) => updateGoldReducer(state, action.payload.amount),
  UPDATE_SETTINGS: (state, action) => updateSettingsReducer(state, action.payload.settings),
  ADD_ITEM_TO_INVENTORY: (state, action) =>
    addItemToInventoryReducer(
      state,
      action.payload.itemId,
      action.payload.quantity,
      action.payload.price,
      action.payload.quality
    ),
  REMOVE_ITEM_FROM_INVENTORY: (state, action) =>
    removeItemFromInventoryReducer(state, action.payload.itemId, action.payload.quantity),
  UPDATE_MARKET: (state, action) => updateMarketReducer(state, action.payload.cityId),
  BUY_ITEM: (state, action) =>
    buyItemReducer(
      state,
      action.payload.itemId,
      action.payload.quantity,
      action.payload.cityId,
      action.payload.quality
    ),
  SELL_ITEM: (state, action) =>
    sellItemReducer(
      state,
      action.payload.itemId,
      action.payload.quantity,
      action.payload.cityId,
      action.payload.inventoryIndex
    ),
  START_TRAVEL: (state, action) => startTravelReducer(state, action.payload.toCityId, action.payload.transportType),
  PROGRESS_TRAVEL: (state) => progressTravelReducer(state),
  COMPLETE_TRAVEL: (state) => completeTravelReducer(state),
  PROCESS_TRAVEL_EVENT: (state, action) =>
    processTravelEventReducer(state, action.payload.eventId, action.payload.outcome),
  ADD_SKILL_EXPERIENCE: (state, action) =>
    addSkillExperienceReducer(state, action.payload.skill, action.payload.amount),
  UPDATE_FACTION_REPUTATION: (state, action) =>
    updateFactionReputationReducer(state, action.payload.factionId, action.payload.points),
  PROGRESS_EVENT: (state, action) => progressEventReducer(state, action.payload.eventId),
  PROCESS_EVENT_CHOICE: (state, action) =>
    processEventChoiceReducer(state, action.payload.eventId, action.payload.choiceId, action.payload.eventData),
  ADD_EVENT: (state, action) => addEventReducer(state, action.payload.event),
  REMOVE_EVENT: (state, action) => removeEventReducer(state, action.payload.eventId),
  START_NPC_INTERACTION: (state, action) => startNPCInteractionReducer(state, action.payload.npcId),
  SELECT_DIALOGUE_CHOICE: (state, action) => selectDialogueChoiceReducer(state, action.payload.choiceId),
  END_NPC_INTERACTION: (state) => endNPCInteractionReducer(state),
  TRADE_WITH_NPC: (state, action) =>
    tradeWithNPCReducer(state, action.payload.npcId, action.payload.tradeId, action.payload.quantity),
  RESTOCK_NPC_TRADES: (state, action) => restockNPCTradesReducer(state, action.payload.currentDate),
};

/**
 * 메인 게임 리듀서
 * 각 액션 타입에 맞는 전용 리듀서 함수를 호출합니다.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const reducer = reducerMap[action.type];
  return reducer ? reducer(state, action) : state;
}
