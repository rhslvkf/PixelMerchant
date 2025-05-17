import { Season } from "./world";
import { ItemQuality } from "./economy";

// 플레이어 모델
export interface Player {
  id: string;
  name: string;
  gold: number;
  inventory: InventoryItem[];
  maxWeight: number; // 최대 적재 용량 추가
  skills: Record<SkillType, number>;
  skillExperience: Record<SkillType, number>;
  reputation: Record<string, number>;
  stats: PlayerStats;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  purchasePrice: number;
  quality: ItemQuality;
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
  completedQuests: string[];
  discoveredItems: string[];
  travelDistance: number;
  successfulDeals: number;
}

// 스킬/능력치 관련 모델
export interface SkillExperience {
  level: number;
  currentExp: number;
  nextLevelExp: number;
}

export interface DetailedSkills {
  trade: SkillExperience;
  logistics: SkillExperience;
  insight: SkillExperience;
  diplomacy: SkillExperience;
  exploration: SkillExperience;
}

// 평판 레벨 정의
export enum ReputationLevel {
  HATED = -2,
  DISLIKED = -1,
  NEUTRAL = 0,
  LIKED = 1,
  TRUSTED = 2,
  ADMIRED = 3,
  REVERED = 4,
}

export interface FactionReputation {
  factionId: string;
  level: ReputationLevel;
  points: number;
  nextLevelPoints: number;
}

// 화폐 관련 타입
export interface Currency {
  gold: number;
  silver: number;
}

// 게임 설정
export interface GameSettings {
  sound: boolean;
  music: boolean;
  notifications: boolean;
  fontScale: number;
}
