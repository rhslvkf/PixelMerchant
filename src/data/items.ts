import { Item, ItemCategory, Season } from "../models/index";

// 아이템 키 상수
export const ITEM_KEYS = {
  WHEAT: "wheat",
  COTTON: "cotton",
  IRON_ORE: "iron_ore",
  SILK: "silk",
  SPICES: "spices",
  WINE: "wine",
  GEMSTONES: "gemstones",
  LEATHER: "leather",
  POTTERY: "pottery",
  HERBS: "herbs",
  INFORMATION: "information",
  MAP: "map",
  SECRET_RECIPE: "secret_recipe",
} as const;

// JSON 파일에서 아이템 데이터 로드
import itemsData from "../assets/data/items.json";

// TypeScript 타입에 맞게 아이템 데이터 변환
const convertItemsData = (data: any): Record<string, Item> => {
  const typedItems: Record<string, Item> = {};

  Object.entries(data || {}).forEach(([key, item]: [string, any]) => {
    if (!item) return;

    // 카테고리 문자열을 ItemCategory enum으로 변환
    const category =
      item.category && ItemCategory[item.category as keyof typeof ItemCategory]
        ? ItemCategory[item.category as keyof typeof ItemCategory]
        : ItemCategory.PROVISION;

    // 계절 요소 변환 (문자열 키를 Season enum으로 변환)
    const seasonalFactors: Record<Season, number> = {
      [Season.SPRING]: 0,
      [Season.SUMMER]: 0,
      [Season.FALL]: 0,
      [Season.WINTER]: 0,
    };

    if (item.seasonalFactors) {
      Object.entries(item.seasonalFactors).forEach(([season, factor]: [string, any]) => {
        if (typeof factor === "number" && season in Season) {
          seasonalFactors[Season[season as keyof typeof Season]] = factor;
        }
      });
    }

    typedItems[key] = {
      id: item.id || key,
      name: item.name || key,
      description: item.description || "",
      category,
      basePrice: item.basePrice || 10,
      weight: item.weight || 1,
      rarity: item.rarity || 1,
      regionalFactors: item.regionalFactors || {},
      seasonalFactors,
    } as Item;
  });

  return typedItems;
};

// 변환된 아이템 데이터
export const ITEMS: Record<string, Item> = convertItemsData(itemsData);

// 모든 아이템 목록 가져오기
export function getAllItems(): Item[] {
  return Object.values(ITEMS);
}

// 아이템 ID로 아이템 찾기
export function getItemById(id: string): Item | undefined {
  return ITEMS[id];
}

export const INFO_ITEMS: Record<string, Item> = {
  market_intelligence: {
    id: "market_intelligence",
    name: "시장 정보",
    description: "다양한 도시의 현재 시장 동향과 가격 정보.",
    category: ItemCategory.INFORMATION,
    basePrice: 100,
    weight: 0,
    rarity: 3,
    regionalFactors: {
      berdan_empire: 0,
      riona_union: 0,
      kragmore_mountains: 0,
      sahel_desert: 0,
      azure_islands: 0,
    },
    seasonalFactors: {
      [Season.SPRING]: 0,
      [Season.SUMMER]: 0,
      [Season.FALL]: 0,
      [Season.WINTER]: 0,
    },
  },

  // 추가 정보 아이템...
};
