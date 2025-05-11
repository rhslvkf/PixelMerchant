import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { GameContextType } from "./types";
import { initialGameState } from "./initialState";
import { gameReducer } from "./reducers";

// Context 생성
const GameContext = createContext<GameContextType | undefined>(undefined);

// Context Provider 컴포넌트
interface GameProviderProps {
  children: ReactNode;
}

/**
 * 게임 상태를 관리하는 Provider 컴포넌트
 */
export const GameProvider = ({ children }: GameProviderProps) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
};

/**
 * 게임 상태와 액션 디스패치 기능을 제공하는 훅
 */
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
