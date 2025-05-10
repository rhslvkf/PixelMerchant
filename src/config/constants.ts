// 게임 기본 상수 정의
export const GAME_VERSION = "0.1.0";
export const DEBUG_MODE = __DEV__; // 개발 모드 감지

// 게임 설정 기본값
export const DEFAULT_SETTINGS = {
  sound: true,
  music: true,
  notifications: true,
  fontScale: 1.0,
};

// 화면 식별자
export enum SCREENS {
  SPLASH = "Splash",
  HOME = "Home",
  CITY = "City",
  MARKET = "Market",
  TRAVEL = "Travel",
  INVENTORY = "Inventory",
  CHARACTER = "Character",
  SETTINGS = "Settings",
}
