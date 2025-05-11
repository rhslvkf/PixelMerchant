import { InventoryItem } from "../../models/types";

/**
 * 인벤토리에 아이템 추가 함수
 *
 * @param inventory 현재 인벤토리
 * @param itemId 추가할 아이템 ID
 * @param quantity 추가할 수량
 * @param price 구매 가격
 * @param quality 품질
 * @returns 업데이트된 인벤토리
 */
export function addItemToInventory(
  inventory: InventoryItem[],
  itemId: string,
  quantity: number,
  price: number,
  quality: number
): InventoryItem[] {
  const existingItemIndex = inventory.findIndex(
    (item) => item.itemId === itemId && Math.abs(item.quality - quality) < 0.01
  );

  const updatedInventory = [...inventory];

  if (existingItemIndex >= 0) {
    // 기존 아이템 수량 업데이트
    const existingItem = inventory[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;
    const weightedPrice = (existingItem.purchasePrice * existingItem.quantity + price * quantity) / newQuantity;

    updatedInventory[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      purchasePrice: weightedPrice,
    };
  } else {
    // 새 아이템 추가
    updatedInventory.push({
      itemId,
      quantity,
      purchasePrice: price,
      quality,
    });
  }

  return updatedInventory;
}

/**
 * 인벤토리에서 아이템 제거 함수
 *
 * @param inventory 현재 인벤토리
 * @param itemId 제거할 아이템 ID
 * @param quantity 제거할 수량
 * @returns 업데이트된 인벤토리
 */
export function removeItemFromInventory(inventory: InventoryItem[], itemId: string, quantity: number): InventoryItem[] {
  const existingItemIndex = inventory.findIndex((item) => item.itemId === itemId);

  if (existingItemIndex < 0) return inventory;

  const updatedInventory = [...inventory];
  const existingItem = updatedInventory[existingItemIndex];

  if (existingItem.quantity <= quantity) {
    // 아이템 제거
    updatedInventory.splice(existingItemIndex, 1);
  } else {
    // 수량 감소
    updatedInventory[existingItemIndex] = {
      ...existingItem,
      quantity: existingItem.quantity - quantity,
    };
  }

  return updatedInventory;
}
