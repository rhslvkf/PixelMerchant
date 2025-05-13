import { GameSettings, GameState } from "../../models/index";

/**
 * 게임 설정 업데이트 리듀서
 */
export function updateSettingsReducer(state: GameState, settings: Partial<GameSettings>): GameState {
  return {
    ...state,
    gameSettings: {
      ...state.gameSettings,
      ...settings,
    },
  };
}

/**
 * 게임 로드 리듀서
 */
export function loadGameReducer(state: GameState, gameState: GameState): GameState {
  return gameState;
}
