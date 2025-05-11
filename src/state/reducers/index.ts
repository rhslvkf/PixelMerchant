import { GameState } from "../../models/types";
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
 * 메인 게임 리듀서
 * 각 액션 타입에 맞는 전용 리듀서 함수를 호출합니다.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_NEW_GAME":
      return startNewGameReducer(state, action.payload.playerName);

    case "LOAD_GAME":
      return loadGameReducer(state, action.payload.gameState);

    case "TRAVEL_TO_CITY":
      return travelToCityReducer(state, action.payload.cityId, action.payload.travelDays);

    case "UPDATE_GOLD":
      return updateGoldReducer(state, action.payload.amount);

    case "UPDATE_SETTINGS":
      return updateSettingsReducer(state, action.payload.settings);

    case "ADD_ITEM_TO_INVENTORY":
      return addItemToInventoryReducer(
        state,
        action.payload.itemId,
        action.payload.quantity,
        action.payload.price,
        action.payload.quality
      );

    case "REMOVE_ITEM_FROM_INVENTORY":
      return removeItemFromInventoryReducer(state, action.payload.itemId, action.payload.quantity);

    case "UPDATE_MARKET":
      return updateMarketReducer(state, action.payload.cityId);

    case "BUY_ITEM":
      return buyItemReducer(
        state,
        action.payload.itemId,
        action.payload.quantity,
        action.payload.cityId,
        action.payload.quality
      );

    case "SELL_ITEM":
      return sellItemReducer(state, action.payload.itemId, action.payload.quantity, action.payload.cityId);

    case "START_TRAVEL":
      return startTravelReducer(state, action.payload.toCityId, action.payload.transportType);

    case "PROGRESS_TRAVEL":
      return progressTravelReducer(state);

    case "COMPLETE_TRAVEL":
      return completeTravelReducer(state);

    case "PROCESS_TRAVEL_EVENT":
      return processTravelEventReducer(state, action.payload.eventId, action.payload.outcome);

    case "ADD_SKILL_EXPERIENCE":
      return addSkillExperienceReducer(state, action.payload.skill, action.payload.amount);

    case "UPDATE_FACTION_REPUTATION":
      return updateFactionReputationReducer(state, action.payload.factionId, action.payload.points);

    default:
      return state;
  }
}
