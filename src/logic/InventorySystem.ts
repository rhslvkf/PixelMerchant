import { InventoryItem, Item } from "../models/index";

/**
 * 인벤토리 무게 계산 함수
 *
 * @param inventory - 인벤토리 아이템 배열
 * @param items - 아이템 정보 객체
 * @returns - 전체 무게
 */
export function calculateInventoryWeight(inventory: InventoryItem[], items: Record<string, Item>): number {
  if (!inventory || !items) return 0;

  return inventory.reduce((total, invItem) => {
    if (!invItem) return total;

    const item = items[invItem.itemId];
    if (!item) return total;

    return total + (item.weight || 0) * (invItem.quantity || 0);
  }, 0);
}

/**
 * 인벤토리 정렬 함수
 *
 * @param inventory - 인벤토리 아이템 배열
 * @param sortBy - 정렬 기준
 * @param ascending - 오름차순 여부
 * @param items - 아이템 정보 객체
 * @returns - 정렬된 인벤토리
 */
export function sortInventory(
  inventory: InventoryItem[],
  sortBy: "name" | "quantity" | "price" | "weight" | "category",
  ascending: boolean = true,
  items: Record<string, Item>
): InventoryItem[] {
  if (!inventory || !items) return [];

  return [...inventory].sort((a, b) => {
    if (!a || !b) return 0;

    const itemA = items[a.itemId];
    const itemB = items[b.itemId];

    if (!itemA || !itemB) return 0;

    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = itemA.name?.localeCompare(itemB.name || "") || 0;
        break;
      case "quantity":
        comparison = (a.quantity || 0) - (b.quantity || 0);
        break;
      case "price":
        comparison = (a.purchasePrice || 0) - (b.purchasePrice || 0);
        break;
      case "weight":
        comparison = (itemA.weight || 0) - (itemB.weight || 0);
        break;
      case "category":
        comparison = itemA.category?.localeCompare(itemB.category || "") || 0;
        break;
      default:
        comparison = 0;
    }

    return ascending ? comparison : -comparison;
  });
}

/**
 * 인벤토리 그룹화 함수 (카테고리별 그룹화)
 *
 * @param inventory - 인벤토리 아이템 배열
 * @param items - 아이템 정보 객체
 * @returns - 카테고리별로 그룹화된 인벤토리
 */
export function groupInventoryByCategory(
  inventory: InventoryItem[],
  items: Record<string, Item>
): Record<string, InventoryItem[]> {
  if (!inventory || !items) return {};

  return inventory.reduce((groups, item) => {
    if (!item) return groups;

    const itemInfo = items[item.itemId];
    if (!itemInfo) return groups;

    const category = itemInfo.category || "unknown";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(item);
    return groups;
  }, {} as Record<string, InventoryItem[]>);
}

/**
 * 인벤토리 가치 계산 함수
 *
 * @param inventory - 인벤토리 아이템 배열
 * @param currentPrices - 현재 아이템 시장 가격 객체
 * @returns - 전체 인벤토리 가치
 */
export function calculateInventoryValue(inventory: InventoryItem[], currentPrices: Record<string, number>): number {
  if (!inventory || !currentPrices) return 0;

  return inventory.reduce((total, item) => {
    if (!item) return total;

    const currentPrice = currentPrices[item.itemId] || item.purchasePrice || 0;
    return total + currentPrice * (item.quantity || 0);
  }, 0);
}

/**
 * 인벤토리 용량 확인 함수
 *
 * @param inventory - 인벤토리 아이템 배열
 * @param items - 아이템 정보 객체
 * @param maxWeight - 최대 무게 용량
 * @returns - {현재 무게, 용량 초과 여부}
 */
export function checkInventoryCapacity(
  inventory: InventoryItem[],
  items: Record<string, Item>,
  maxWeight: number
): { weight: number; isOverCapacity: boolean } {
  if (!inventory || !items || maxWeight === undefined) {
    return {
      weight: 0,
      isOverCapacity: false,
    };
  }

  const weight = calculateInventoryWeight(inventory, items);
  return {
    weight,
    isOverCapacity: weight > maxWeight,
  };
}
