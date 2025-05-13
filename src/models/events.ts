import { GameDate, Season } from "./world";
import { SkillType } from "./player";
import { PlayerStats } from "./player";

// 이벤트 관련 타입
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  type: "travel" | "city" | "story" | "trade";
  triggerConditions: EventTriggerCondition;
  choices: EventChoice[];
}

export interface EventTriggerCondition {
  locations?: string[];
  minReputation?: Record<string, number>;
  requiredItems?: string[];
  seasonalFactors?: Season[];
  chance: number; // 0-100
  playerProgressLevel?: number;
}

export interface EventChoice {
  id: string;
  text: string;
  requiredSkill?: { skill: SkillType; level: number };
  requiredItem?: string;
  outcomes: EventOutcome[];
}

export interface EventOutcome {
  chance: number; // 0-100
  description: string;
  effects: EventEffect;
  nextEventId?: string;
}

export interface EventEffect {
  gold?: number;
  items?: { id: string; quantity: number }[];
  reputation?: { factionId: string; change: number }[];
  skills?: { skill: SkillType; exp: number }[];
  stats?: Partial<PlayerStats>;
  specialEffects?: string[];
}

export interface ActiveEvent {
  id: string;
  eventId: string;
  type: "travel" | "city" | "story" | "trade";
  status: "active" | "pending_choice" | "resolved";
  choicesMade?: string[];
  expiresAt?: GameDate;
}
