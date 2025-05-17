import { SkillType, ReputationLevel } from "./player";
import { ItemQuality } from "./economy";
import { GameDate, Season } from "./world";

// NPC 유형
export enum NPCType {
  MERCHANT = "merchant", // 상인
  GUILD_MASTER = "guild_master", // 길드 마스터
  INFORMANT = "informant", // 정보원
  OFFICIAL = "official", // 관리자
  RIVAL = "rival", // 경쟁자
  LOCAL = "local", // 현지인
}

// NPC 데이터 모델
export interface NPC {
  id: string;
  name: string;
  type: NPCType;
  portraitId: string; // 초상화 이미지 식별자
  description: string;
  baseLocation: string; // 기본 도시 ID
  availableLocations: string[]; // 만날 수 있는 도시 ID 목록
  reputation: number; // 플레이어와의 관계 레벨 (-2 ~ 6)
  specialties: string[]; // 특별 거래 가능 아이템 ID 목록
  dialogues: NPCDialogue[]; // 대화 목록
  trades?: NPCTrade[]; // 거래 옵션
  quests?: string[]; // 제공 가능한 퀘스트 ID 목록
  schedule?: NPCSchedule[]; // 스케줄 (선택적)
}

// NPC 대화 모델
export interface NPCDialogue {
  id: string;
  text: string;
  choices: NPCDialogueChoice[];
  conditions?: DialogueCondition[]; // 대화 표시 조건
  onlyOnce?: boolean; // 한 번만 표시할지 여부
  shown?: boolean; // 이미 표시되었는지 여부
}

// 대화 선택지
export interface NPCDialogueChoice {
  id: string;
  text: string;
  nextDialogueId?: string; // 다음 대화 ID (없으면 대화 종료)
  reputation?: number; // 선택 시 평판 변동
  conditions?: DialogueCondition[]; // 선택지 표시 조건
  effects?: DialogueEffect[]; // 선택 시 효과
}

// 대화 조건
export interface DialogueCondition {
  type: "reputation" | "skill" | "item" | "gold" | "quest" | "date" | "location";
  target: string; // 대상 (평판 세력, 스킬, 아이템 ID 등)
  value: number | string; // 조건 값
  operator: "eq" | "neq" | "gt" | "lt" | "gte" | "lte"; // 비교 연산자
}

// 대화 효과
export interface DialogueEffect {
  type: "reputation" | "gold" | "item" | "skill" | "quest" | "flag";
  target: string; // 영향 대상
  value: number | string; // 변경 값
  operation: "add" | "remove" | "set"; // 작업 유형
}

// NPC 거래 옵션
export interface NPCTrade {
  id: string;
  itemId: string;
  quality: ItemQuality;
  quantityAvailable: number;
  priceMultiplier: number; // 기본 가격 대비 배수
  reputationRequired: number; // 필요 평판 레벨
  restockDays: number; // 재고 보충 주기 (일)
  lastRestock?: GameDate; // 마지막 재고 보충 날짜
  maxQuantity?: number; // 최대 구매 가능 수량
  conditions?: DialogueCondition[]; // 거래 조건
}

// NPC 스케줄 (선택적)
export interface NPCSchedule {
  locationId: string; // 도시 ID
  startTime?: {
    // 시작 시간
    hour: number;
    minute: number;
  };
  endTime?: {
    // 종료 시간
    hour: number;
    minute: number;
  };
  daysOfWeek?: number[]; // 요일 (1-7, 1은 월요일)
  seasons?: Season[]; // 계절
}

// NPC 상호작용 기록
export interface NPCInteractionHistory {
  npcId: string;
  dialoguesShown: string[]; // 이미 표시된 대화 ID 목록
  lastInteractionDate: GameDate; // 마지막 상호작용 날짜
  reputation: number; // 현재 평판 레벨
  flags: Record<string, boolean | string | number>; // 상호작용 플래그
}

// 게임 상태에 추가할 NPC 상태
export interface NPCState {
  npcs: Record<string, NPC>; // NPC ID: NPC 객체
  interactions: Record<string, NPCInteractionHistory>; // NPC ID: 상호작용 기록
  activeNPC: string | null; // 현재 상호작용 중인 NPC ID
  currentDialogueId: string | null; // 현재 대화 ID
}
