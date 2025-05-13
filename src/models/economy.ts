import { GameDate, Season } from "./world";

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
  qualityStock: {
    low: number; // 저급 재고
    medium: number; // 보통 재고
    high: number; // 고급 재고
  };
  qualityRange: [number, number]; // 최소/최대 품질
  priceHistory: [GameDate, number][]; // 가격 이력
}

// 품질 타입 정의
export enum ItemQuality {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// 품질 계수 상수
export const QUALITY_FACTORS: Record<ItemQuality, number> = {
  [ItemQuality.LOW]: 0.8,
  [ItemQuality.MEDIUM]: 1.0,
  [ItemQuality.HIGH]: 1.3,
};

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  affectedItems: string[]; // 영향을 받는 아이템 ID들
  priceEffect: number; // 가격에 주는 영향 (퍼센트)
  duration: number; // 지속 기간(일)
  startDate: GameDate; // 시작 날짜
}
