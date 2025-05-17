import { ItemQuality } from "./economy";
import { ReputationLevel, SkillType } from "./player";

// 퀘스트 유형
export enum QuestType {
  TRADE = "trade", // 특정 아이템 구매/판매
  DELIVERY = "delivery", // 특정 아이템을 다른 도시로 배달
  DIPLOMACY = "diplomacy", // 세력 간 관계 개선
  COLLECTION = "collection", // 여러 특정 아이템 수집
  EXPLORATION = "exploration", // 특정 도시 방문
}

// 퀘스트 난이도
export enum QuestDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
  EXPERT = "expert",
}

// 퀘스트 상태
export enum QuestStatus {
  AVAILABLE = "available", // 수락 가능
  ACTIVE = "active", // 진행 중
  COMPLETED = "completed", // 완료됨
  FAILED = "failed", // 실패
  EXPIRED = "expired", // 기간 만료
}

// 퀘스트 목표 조건
export interface QuestObjective {
  type: "buy" | "sell" | "visit" | "reputation" | "skill";
  target: string; // 아이템 ID, 도시 ID, 세력 ID, 스킬 유형
  amount?: number; // 필요한 수량
  quality?: ItemQuality; // 필요한 품질 (아이템 퀘스트용)
  level?: number; // 필요한 레벨/평판 (스킬/평판 퀘스트용)
  completed: boolean; // 완료 여부
}

// 퀘스트 보상
export interface QuestReward {
  gold?: number; // 금화 보상
  reputation?: { factionId: string; amount: number }[]; // 세력 평판 보상
  items?: { itemId: string; quantity: number; quality?: ItemQuality }[]; // 아이템 보상
  skillExp?: { skill: SkillType; amount: number }[]; // 스킬 경험치 보상
  unlocks?: string[]; // 잠금 해제 (새 퀘스트, 특수 거래 등)
}

// 퀘스트 수락 조건
export interface QuestRequirement {
  playerLevel?: number; // 필요 플레이어 레벨
  minReputation?: { factionId: string; level: ReputationLevel }[]; // 필요 세력 평판
  skills?: { skill: SkillType; level: number }[]; // 필요 스킬 레벨
  completedQuests?: string[]; // 완료해야 하는 이전 퀘스트
  gold?: number; // 필요 소지금
}

// 퀘스트 정보
export interface Quest {
  id: string; // 고유 ID
  title: string; // 제목
  description: string; // 설명
  type: QuestType; // 유형
  giver: string; // 퀘스트 제공 NPC ID
  giverCityId: string; // NPC가 있는 도시 ID
  difficulty: QuestDifficulty; // 난이도
  objectives: QuestObjective[]; // 목표 조건 배열
  rewards: QuestReward; // 보상
  requirements?: QuestRequirement; // 수락 조건 (선택적)
  timeLimit?: number; // 제한 시간 (일 수)
  startDate?: {
    // 퀘스트 시작 가능 날짜 (선택적)
    year: number;
    month: number;
    day: number;
  };
  endDate?: {
    // 퀘스트 종료 날짜 (선택적)
    year: number;
    month: number;
    day: number;
  };
}

// 플레이어 퀘스트 상태
export interface PlayerQuest {
  questId: string; // 퀘스트 ID
  status: QuestStatus; // 상태
  objectives: QuestObjective[]; // 현재 목표 진행 상태
  startDate: {
    // 수락 날짜
    year: number;
    month: number;
    day: number;
  };
  expiryDate?: {
    // 만료 날짜 (제한 시간 있는 경우)
    year: number;
    month: number;
    day: number;
  };
}
