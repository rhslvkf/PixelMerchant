import { City, Region, Market, TransportType, Season } from "../models/types";
import { ITEMS } from "./items";

// 지역 데이터
export const REGIONS: Record<string, Region> = {
  berdan_empire: {
    id: "berdan_empire",
    name: "베르단 제국",
    description: "중앙 대륙의 강력한 제국, 법과 질서 중시",
    culture: "berdan",
    climate: "temperate",
    dangerLevel: 1,
  },
  riona_union: {
    id: "riona_union",
    name: "리오나 연합",
    description: "동부 자유 도시들의 느슨한 연합",
    culture: "riona",
    climate: "temperate_coastal",
    dangerLevel: 2,
  },
  kragmore_mountains: {
    id: "kragmore_mountains",
    name: "크라그모어 산맥",
    description: "북부의 거친 산악 지대",
    culture: "kragmore",
    climate: "mountainous",
    dangerLevel: 3,
  },
  sahel_desert: {
    id: "sahel_desert",
    name: "사헬 사막",
    description: "남부의 광활한 사막 지역",
    culture: "sahel",
    climate: "desert",
    dangerLevel: 4,
  },
  azure_islands: {
    id: "azure_islands",
    name: "아주르 제도",
    description: "서쪽 바다의 섬 군락",
    culture: "azure",
    climate: "tropical",
    dangerLevel: 3,
  },
};

// 초기 날짜 생성 헬퍼 함수
const createInitialDate = () => ({
  day: 1,
  month: 1,
  year: 1,
  season: Season.SPRING,
});

// 초기 시장 생성 함수
const createInitialMarket = (cityId: string, specialties: string[] = []): Market => {
  // 도시에서 거래되는 아이템 선택 (기본 + 특산품)
  const cityItems = Object.values(ITEMS)
    .filter((item) => item.rarity <= 3) // 초기에는 희귀도 3 이하만 취급
    .map((item) => {
      const isSpecialty = specialties.includes(item.id);
      const baseQuantity = isSpecialty ? 30 : 10;
      const qualityRange: [number, number] = isSpecialty
        ? [0.9, 1.3] // 특산품은 품질 좋음
        : [0.8, 1.1]; // 일반 상품

      return {
        itemId: item.id,
        basePrice: item.basePrice,
        currentPrice: item.basePrice, // 초기에는 기본가
        quantity: Math.floor(baseQuantity * (0.7 + Math.random() * 0.6)), // 약간의 랜덤성
        qualityRange,
        priceHistory: [], // 초기에는 가격 이력 없음
      };
    });

  return {
    items: cityItems,
    lastUpdated: createInitialDate(),
    demandFactors: {}, // 초기에는 수요 계수 없음
    volatility: 0.2 + Math.random() * 0.3, // 0.2-0.5 사이 변동성
  };
};

// 도시 데이터
export const CITIES: Record<string, City> = {
  golden_harbor: {
    id: "golden_harbor",
    name: "황금항",
    regionId: "berdan_empire",
    description: "베르단 제국의 주요 무역항입니다. 황금빛 항구와 웅장한 상선들이 특징입니다.",
    size: 4,
    wealthLevel: 5,
    specialties: ["silk", "wine"],
    market: createInitialMarket("golden_harbor", ["silk", "wine"]),
    travelConnections: [
      {
        destinationId: "royal_market",
        distance: 4,
        dangerLevel: 1,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "silver_tide",
        distance: 6,
        dangerLevel: 3,
        transportOptions: [TransportType.SHIP],
      },
    ],
  },
  royal_market: {
    id: "royal_market",
    name: "로열마켓",
    regionId: "berdan_empire",
    description: "제국 수도의 중심지로, 사치품과 예술품이 거래됩니다.",
    size: 5,
    wealthLevel: 5,
    specialties: ["gemstones", "pottery"],
    market: createInitialMarket("royal_market", ["gemstones", "pottery"]),
    travelConnections: [
      {
        destinationId: "golden_harbor",
        distance: 4,
        dangerLevel: 1,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "iron_peak",
        distance: 7,
        dangerLevel: 2,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
  silver_tide: {
    id: "silver_tide",
    name: "실버타이드",
    regionId: "riona_union",
    description: "은광으로 유명한 항구 도시입니다. 상인들의 천국이라 불립니다.",
    size: 3,
    wealthLevel: 4,
    specialties: ["iron_ore", "cotton"],
    market: createInitialMarket("silver_tide", ["iron_ore", "cotton"]),
    travelConnections: [
      {
        destinationId: "golden_harbor",
        distance: 6,
        dangerLevel: 3,
        transportOptions: [TransportType.SHIP],
      },
      {
        destinationId: "mistwood",
        distance: 3,
        dangerLevel: 2,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "iron_peak",
        distance: 5,
        dangerLevel: 2,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
  mistwood: {
    id: "mistwood",
    name: "미스트우드",
    regionId: "riona_union",
    description: "안개가 자욱한 숲 속의 도시로, 희귀한 약초와 목재가 특산품입니다.",
    size: 2,
    wealthLevel: 3,
    specialties: ["herbs", "leather"],
    market: createInitialMarket("mistwood", ["herbs", "leather"]),
    travelConnections: [
      {
        destinationId: "silver_tide",
        distance: 3,
        dangerLevel: 2,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "stone_gate",
        distance: 4,
        dangerLevel: 3,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
  iron_peak: {
    id: "iron_peak",
    name: "아이언피크",
    regionId: "kragmore_mountains",
    description: "산맥 깊은 곳의 광산 도시로, 고품질 금속과 보석이 생산됩니다.",
    size: 3,
    wealthLevel: 3,
    specialties: ["iron_ore", "gemstones"],
    market: createInitialMarket("iron_peak", ["iron_ore", "gemstones"]),
    travelConnections: [
      {
        destinationId: "royal_market",
        distance: 7,
        dangerLevel: 2,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "silver_tide",
        distance: 5,
        dangerLevel: 2,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "stone_gate",
        distance: 4,
        dangerLevel: 3,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
  stone_gate: {
    id: "stone_gate",
    name: "스톤게이트",
    regionId: "kragmore_mountains",
    description: "산맥을 지키는 요새 도시로, 뛰어난 무기와 방어구가 생산됩니다.",
    size: 2,
    wealthLevel: 2,
    specialties: ["iron_ore", "leather"],
    market: createInitialMarket("stone_gate", ["iron_ore", "leather"]),
    travelConnections: [
      {
        destinationId: "iron_peak",
        distance: 4,
        dangerLevel: 3,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "mistwood",
        distance: 4,
        dangerLevel: 3,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "sunset_oasis",
        distance: 8,
        dangerLevel: 4,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
  sunset_oasis: {
    id: "sunset_oasis",
    name: "선셋오아시스",
    regionId: "sahel_desert",
    description: "사막 중앙의 오아시스 도시로, 희귀한 향신료와 염료가 거래됩니다.",
    size: 3,
    wealthLevel: 4,
    specialties: ["spices", "herbs"],
    market: createInitialMarket("sunset_oasis", ["spices", "herbs"]),
    travelConnections: [
      {
        destinationId: "stone_gate",
        distance: 8,
        dangerLevel: 4,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
      {
        destinationId: "red_dune",
        distance: 5,
        dangerLevel: 5,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
  red_dune: {
    id: "red_dune",
    name: "레드듄",
    regionId: "sahel_desert",
    description: "사막 깊숙한 곳의 비밀 도시로, 신비한 아이템과 지식이 숨겨져 있습니다.",
    size: 2,
    wealthLevel: 3,
    specialties: ["spices", "gemstones"],
    market: createInitialMarket("red_dune", ["spices", "gemstones"]),
    travelConnections: [
      {
        destinationId: "sunset_oasis",
        distance: 5,
        dangerLevel: 5,
        transportOptions: [TransportType.FOOT, TransportType.CART],
      },
    ],
  },
};

// 전체 도시 목록 반환
export function getAllCities(): City[] {
  return Object.values(CITIES);
}

// 특정 도시 반환
export function getCityById(id: string): City | undefined {
  return CITIES[id];
}

// 전체 지역 목록 반환
export function getAllRegions(): Region[] {
  return Object.values(REGIONS);
}

// 특정 지역 반환
export function getRegionById(id: string): Region | undefined {
  return REGIONS[id];
}
