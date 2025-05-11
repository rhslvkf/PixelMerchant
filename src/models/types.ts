// 플레이어 모델
export interface Player {
  id: string;
  name: string;
  gold: number;
  inventory: InventoryItem[];
  maxWeight: number; // 최대 적재 용량 추가
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
  completedQuests: string[];
  discoveredItems: string[];
  travelDistance: number;
  successfulDeals: number;
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

// 상품 관련 타입
export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  basePrice: number;
  weight: number;
  rarity: number; // 1-5
  regionalFactors: Record<string, number>; // 지역별 가격 변동 계수
  seasonalFactors: Record<Season, number>; // 계절별 가격 변동 계수
  imageIcon?: string; // 아이콘 경로
}

export enum ItemCategory {
  AGRICULTURAL = "agricultural",
  TEXTILE = "textile",
  SPICE = "spice",
  MINERAL = "mineral",
  WOOD = "wood",
  JEWELRY = "jewelry",
  BEVERAGE = "beverage",
  ART = "art",
  MEDICINE = "medicine",
  MAGICAL = "magical",
  ARTIFACT = "artifact",
  EXOTIC = "exotic",
  MAP = "map",
  PROVISION = "provision",
  TOOL = "tool",
  LUXURY = "luxury",
  INFORMATION = "information",
}

// 시장 관련 타입
export interface Market {
  items: MarketItem[];
  lastUpdated: GameDate;
  demandFactors: Record<string, number>; // 아이템별 수요 계수
  volatility: number; // 시장 변동성 (0-1)
}

export interface MarketItem {
  itemId: string;
  basePrice: number;
  currentPrice: number;
  quantity: number;
  qualityRange: [number, number]; // 최소/최대 품질
  priceHistory: [GameDate, number][]; // 가격 이력
}

// 도시 관련 타입
export interface City {
  id: string;
  name: string;
  regionId: string;
  description: string;
  size: number; // 1-5
  wealthLevel: number; // 1-5
  specialties: string[]; // 특산품 ID 목록
  market: Market;
  travelConnections: TravelConnection[];
  backgroundImage?: string; // 배경 이미지 경로 (옵션)
}

export interface TravelConnection {
  destinationId: string;
  distance: number;
  dangerLevel: number; // 1-5
  transportOptions: TransportType[];
  description?: string;
}

export enum TransportType {
  FOOT = "foot",
  CART = "cart",
  SHIP = "ship",
  SPECIAL = "special",
}

// 전체 게임 세계
export interface World {
  cities: Record<string, City>;
  regions: Record<string, Region>;
  events: ActiveEvent[];
  globalMarketFactors: {
    events: MarketEvent[];
    seasonalFactors: Record<Season, Record<string, number>>;
  };
}

export interface Region {
  id: string;
  name: string;
  description: string;
  culture: string;
  climate: string;
  dangerLevel: number; // 1-5
}

// GameState에 World 필드 추가
export interface GameState {
  player: Player;
  currentDate: GameDate;
  currentCityId: string;
  gameSettings: GameSettings;
  world: World; // 추가된 부분
}

// 여행 관련 타입
export interface TravelRoute {
  fromCityId: string;
  toCityId: string;
  distance: number;
  transportType: TransportType;
  dangerLevel: number; // 1-5
  estimatedDays: number;
  events?: TravelEvent[];
}

export interface TravelEvent {
  id: string;
  day: number; // 여행 몇 일차에 발생하는지
  processed: boolean;
}

export interface ActiveEvent {
  id: string;
  eventId: string;
  type: "travel" | "city" | "story" | "trade";
  status: "active" | "pending_choice" | "resolved";
  choicesMade?: string[];
  expiresAt?: GameDate;
}

// 여행 상태를 GameState에 추가
export interface GameState {
  player: Player;
  currentDate: GameDate;
  currentCityId: string;
  gameSettings: GameSettings;
  world: World;
  travelState?: TravelState; // 여행 중일 때만 존재
}

export interface TravelState {
  route: TravelRoute;
  currentDay: number;
  events: TravelEvent[];
  arrivalDate: GameDate;
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

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  affectedItems: string[]; // 영향을 받는 아이템 ID들
  priceEffect: number; // 가격에 주는 영향 (퍼센트)
  duration: number; // 지속 기간(일)
  startDate: GameDate; // 시작 날짜
}

// 화폐 관련 타입
export interface Currency {
  gold: number;
  silver: number;
}
