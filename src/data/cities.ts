import { City, Market, MarketItem, Region, Season, TransportType } from "../models/index";
import { ITEMS, ITEM_KEYS } from "./items";

// JSON에서 데이터 로드
import regionsData from "../assets/data/regions.json";
import citiesData from "../assets/data/cities.json";

// 초기 날짜 생성 헬퍼 함수
const createInitialDate = () => ({
  day: 1,
  month: 1,
  year: 1,
  season: Season.SPRING,
});

// 초기 시장 생성 함수
const createInitialMarket = (cityId: string, specialties: string[] = []): Market => {
  // specialties 배열이 없는 경우 빈 배열로 처리
  const safeSpecialties = Array.isArray(specialties) ? specialties : [];

  // 도시에서 거래되는 아이템 선택 (기본 + 특산품)
  const cityItems = Object.values(ITEMS)
    .filter((item) => item && item.rarity && item.rarity <= 3) // 초기에는 희귀도 3 이하만 취급
    .map((item) => {
      if (!item || !item.id) return null;

      const isSpecialty = safeSpecialties.includes(item.id);
      const baseQuantity = isSpecialty ? 30 : 10;

      // 품질별 재고 계산
      const lowStock = Math.round(baseQuantity * 0.3); // 30%
      const highStock = Math.round(baseQuantity * 0.2); // 20%
      const mediumStock = baseQuantity - lowStock - highStock; // 나머지

      return {
        itemId: item.id,
        basePrice: item.basePrice || 10, // 기본 가격이 없으면 10으로 설정
        currentPrice: item.basePrice || 10, // 초기에는 기본가
        qualityStock: {
          low: lowStock,
          medium: mediumStock,
          high: highStock,
        },
        qualityRange: isSpecialty ? ([0.9, 1.3] as [number, number]) : ([0.8, 1.1] as [number, number]), // 특산품은 품질 좋음
        priceHistory: [], // 초기에는 가격 이력 없음
      };
    })
    .filter(Boolean) as MarketItem[]; // null 항목 제거 및 타입 지정

  return {
    items: cityItems,
    lastUpdated: createInitialDate(),
    demandFactors: {}, // 초기에는 수요 계수 없음
    volatility: 0.2 + Math.random() * 0.3, // 0.2-0.5 사이 변동성
  };
};

// TypeScript 타입에 맞게 지역 데이터 변환
const convertRegionsData = (data: any): Record<string, Region> => {
  const typedRegions: Record<string, Region> = {};

  Object.entries(data || {}).forEach(([key, region]: [string, any]) => {
    if (region) {
      typedRegions[key] = region as Region;
    }
  });

  return typedRegions;
};

// TypeScript 타입에 맞게 도시 데이터 변환
const convertCitiesData = (data: any): Record<string, City> => {
  const typedCities: Record<string, City> = {};

  Object.entries(data || {}).forEach(([key, city]: [string, any]) => {
    if (!city) return;

    // 문자열 배열을 ItemKey 배열로 변환
    const specialties = Array.isArray(city.specialties)
      ? city.specialties
          .map((specialty: string) => {
            if (typeof specialty !== "string") return "";
            const itemKey = specialty.toUpperCase();
            return itemKey in ITEM_KEYS ? ITEM_KEYS[itemKey as keyof typeof ITEM_KEYS] : specialty;
          })
          .filter(Boolean)
      : [];

    // transportOptions 문자열을 TransportType enum으로 변환
    const travelConnections = Array.isArray(city.travelConnections)
      ? city.travelConnections
          .map((conn: any) => {
            if (!conn) return null;
            return {
              ...conn,
              transportOptions: Array.isArray(conn.transportOptions)
                ? conn.transportOptions.map((type: string) => {
                    if (typeof type !== "string") return TransportType.FOOT;
                    return TransportType[type as keyof typeof TransportType] || TransportType.FOOT;
                  })
                : [TransportType.FOOT], // 기본값 설정
            };
          })
          .filter(Boolean)
      : [];

    // 시장 데이터 생성 - specialties를 문자열 배열로 변환
    const market = createInitialMarket(city.id || key, Array.isArray(city.specialties) ? city.specialties : []);

    typedCities[key] = {
      id: city.id || key,
      name: city.name || key,
      regionId: city.regionId || "berdan_empire",
      description: city.description || "",
      size: city.size || 1,
      wealthLevel: city.wealthLevel || 1,
      backgroundImage: city.backgroundImage || "default_bg",
      ...city,
      specialties,
      travelConnections,
      market,
    } as City;
  });

  return typedCities;
};

// 변환된 지역 데이터
export const REGIONS: Record<string, Region> = convertRegionsData(regionsData);

// 변환된 도시 데이터
export const CITIES: Record<string, City> = convertCitiesData(citiesData);

// 모든 도시 목록 가져오기
export function getAllCities(): City[] {
  return Object.values(CITIES);
}

// 도시 ID로 도시 찾기
export function getCityById(id: string): City | undefined {
  return CITIES[id];
}

// 모든 지역 목록 가져오기
export function getAllRegions(): Region[] {
  return Object.values(REGIONS);
}

// 지역 ID로 지역 찾기
export function getRegionById(id: string): Region | undefined {
  return REGIONS[id];
}
