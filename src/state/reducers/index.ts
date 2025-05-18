import { GameState } from "../../models/index";
import { StorageService } from "../../storage/StorageService";
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
import { abandonQuestReducer, acceptQuestReducer, checkQuestsReducer, completeQuestReducer } from "./questReducers";
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
    processTravelEventReducer(state, action.payload.eventId, action.payload.choiceId),
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
  ACCEPT_QUEST: (state, action) => acceptQuestReducer(state, action.payload.questId),
  ABANDON_QUEST: (state, action) => abandonQuestReducer(state, action.payload.questId),
  COMPLETE_QUEST: (state, action) => completeQuestReducer(state, action.payload.questId),
  CHECK_QUESTS: (state) => checkQuestsReducer(state),
};

/**
 * 게임 상태를 자동 저장하는 함수
 */
const autoSaveGameState = async (state: GameState): Promise<void> => {
  try {
    // 일반 자동 저장 (현재 게임)
    await StorageService.saveCurrentGame(state);

    // 자동 저장 슬롯에도 저장
    await StorageService.saveGameToSlot(state, "auto");
  } catch (error) {
    console.error("Failed to auto-save game state:", error);
  }
};

/**
 * 메인 게임 리듀서
 * 각 액션 타입에 맞는 전용 리듀서 함수를 호출하고 모든 액션 후 자동 저장합니다.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  const reducer = reducerMap[action.type];
  if (!reducer) return state;

  // 리듀서 실행하여 새로운 상태 생성
  const newState = reducer(state, action);

  // LOAD_GAME 액션은 저장하지 않음 (불필요한 중복 저장 방지)
  if (action.type !== "LOAD_GAME") {
    autoSaveGameState(newState);
  }

  return newState;
}
