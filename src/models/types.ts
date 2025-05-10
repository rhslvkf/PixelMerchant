// 플레이어 모델
export interface Player {
  id: string;
  name: string;
  gold: number;
  inventory: InventoryItem[];
  skills: Record<SkillType, number>;
  reputation: Record<string, number>;
  stats: PlayerStats;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  purchasePrice: number;
  quality: number;
}

export enum SkillType {
  TRADE = "trade",
  LOGISTICS = "logistics",
  INSIGHT = "insight",
  DIPLOMACY = "diplomacy",
  EXPLORATION = "exploration",
}

export interface PlayerStats {
  daysPlayed: number;
  citiesVisited: string[];
  totalProfit: number;
}

// 게임 상태 모델
export interface GameState {
  player: Player;
  currentDate: GameDate;
  currentCityId: string;
  gameSettings: GameSettings;
}

export interface GameDate {
  day: number;
  month: number;
  year: number;
  season: Season;
}

export enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
}

export interface GameSettings {
  sound: boolean;
  music: boolean;
  notifications: boolean;
  fontScale: number;
}
