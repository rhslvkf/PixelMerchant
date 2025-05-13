import { MarketEvent, Market } from "./economy";
import { Player, GameSettings } from "./player";

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

// 이벤트 참조 타입(순환 참조 방지)
export interface ActiveEventRef {
  id: string;
  eventId: string;
  type: "travel" | "city" | "story" | "trade";
  status: "active" | "pending_choice" | "resolved";
  choicesMade?: string[];
  expiresAt?: GameDate;
}

// 전체 게임 세계
export interface World {
  cities: Record<string, City>;
  regions: Record<string, Region>;
  events: ActiveEventRef[];
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

export interface TravelState {
  route: TravelRoute;
  currentDay: number;
  events: TravelEvent[];
  arrivalDate: GameDate;
}

// 게임 상태 모델
export interface GameState {
  player: Player;
  currentDate: GameDate;
  currentCityId: string;
  gameSettings: GameSettings;
  world: World;
  travelState?: TravelState; // 여행 중일 때만 존재
}
