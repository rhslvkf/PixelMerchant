import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState } from "../models/index";

const STORAGE_KEYS = {
  CURRENT_GAME: "@PixelMerchant:currentGame",
  SAVE_SLOTS: "@PixelMerchant:saveSlots",
  SETTINGS: "@PixelMerchant:settings",
};

/**
 * 스토리지 작업 관련 에러를 표현하는 전용 에러 클래스
 */
export class StorageError extends Error {
  cause: any;

  constructor(operation: string, originalError: any) {
    super(`Storage operation '${operation}' failed: ${originalError.message}`);
    this.name = "StorageError";
    this.cause = originalError;
  }
}

export class StorageService {
  // 현재 게임 저장
  static async saveCurrentGame(gameState: GameState): Promise<boolean> {
    try {
      const serializedState = JSON.stringify(gameState);
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_GAME, serializedState);
      return true;
    } catch (error) {
      console.error(new StorageError("saveCurrentGame", error));
      return false;
    }
  }

  // 현재 게임 불러오기
  static async loadCurrentGame(): Promise<GameState | null> {
    try {
      const serializedState = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
      return serializedState ? JSON.parse(serializedState) : null;
    } catch (error) {
      console.error(new StorageError("loadCurrentGame", error));
      return null;
    }
  }

  // 특정 슬롯에 게임 저장
  static async saveGameToSlot(gameState: GameState, slotId: string): Promise<boolean> {
    try {
      const key = `${STORAGE_KEYS.SAVE_SLOTS}:${slotId}`;
      const saveData = {
        gameState,
        savedAt: new Date().toISOString(),
        screenshot: "placeholder", // 스크린샷 기능 추후 구현
      };

      await AsyncStorage.setItem(key, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error(new StorageError(`saveGameToSlot(${slotId})`, error));
      return false;
    }
  }

  // 특정 슬롯에서 게임 불러오기
  static async loadGameFromSlot(slotId: string): Promise<GameState | null> {
    try {
      const key = `${STORAGE_KEYS.SAVE_SLOTS}:${slotId}`;
      const serializedData = await AsyncStorage.getItem(key);
      if (!serializedData) return null;

      const saveData = JSON.parse(serializedData);
      return saveData.gameState;
    } catch (error) {
      console.error(new StorageError(`loadGameFromSlot(${slotId})`, error));
      return null;
    }
  }

  // 모든 저장 슬롯 목록 가져오기
  static async getAllSaveSlots(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter((key) => key.startsWith(STORAGE_KEYS.SAVE_SLOTS));
    } catch (error) {
      console.error(new StorageError("getAllSaveSlots", error));
      return [];
    }
  }

  // 설정 저장
  static async saveSettings(settings: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error(new StorageError("saveSettings", error));
      return false;
    }
  }

  // 설정 불러오기
  static async loadSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error(new StorageError("loadSettings", error));
      return null;
    }
  }
}
