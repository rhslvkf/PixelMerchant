import { InventoryItem, Item } from "../models/types";

/**
 * 인벤토리 무게 계산 함수
 *
 * @param inventory - 인벤토리 아이템 배열
 * @param items - 아이템 정보 객체
 * @returns - 전체 무게
 */
export function calculateInventoryWeight(inventory: InventoryItem[], items: Record<string, Item>): number {
  return inventory.reduce((total, invItem) => {
    const item = items[invItem.itemId];
    if (!item) return total;

    return total + item.weight * invItem.quantity;
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
  return [...inventory].sort((a, b) => {
    const itemA = items[a.itemId];
    const itemB = items[b.itemId];

    if (!itemA || !itemB) return 0;

    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = itemA.name.localeCompare(itemB.name);
        break;
      case "quantity":
        comparison = a.quantity - b.quantity;
        break;
      case "price":
        comparison = a.purchasePrice - b.purchasePrice;
        break;
      case "weight":
        comparison = itemA.weight - itemB.weight;
        break;
      case "category":
        comparison = itemA.category.localeCompare(itemB.category);
        break;
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
  return inventory.reduce((groups, item) => {
    const itemInfo = items[item.itemId];
    if (!itemInfo) return groups;

    const category = itemInfo.category;

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
  return inventory.reduce((total, item) => {
    const currentPrice = currentPrices[item.itemId] || item.purchasePrice;
    return total + currentPrice * item.quantity;
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
  const weight = calculateInventoryWeight(inventory, items);
  return {
    weight,
    isOverCapacity: weight > maxWeight,
  };
}
