import { ITEMS } from "../../data/items";
import { applyPlayerTradeImpact, calculatePlayerSellingPrice, updateCityMarket } from "../../logic/EconomySystem";
import { calculateInventoryWeight } from "../../logic/InventorySystem";
import { GameState, ItemQuality, QUALITY_FACTORS, InventoryItem, SkillType } from "../../models/index";
import { addItemToInventory } from "../utils/inventoryUtils";
import { addSkillExperienceReducer } from "./playerReducers";

/**
 * 도시 시장 업데이트 리듀서
 */
export function updateMarketReducer(state: GameState, cityId: string): GameState {
  const city = state.world.cities[cityId];

  if (!city) return state;

  const updatedCity = {
    ...city,
    market: updateCityMarket(city.market, city, state.currentDate, {}),
  };

  return {
    ...state,
    world: {
      ...state.world,
      cities: {
        ...state.world.cities,
        [cityId]: updatedCity,
      },
    },
  };
}

/**
 * 거래 유효성 검사 함수
 */
function validateBuyTransaction(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  quality: ItemQuality
): { isValid: boolean; marketItem?: any; totalPrice?: number } {
  const city = state.world.cities[cityId];
  if (!city) return { isValid: false };

  // 아이템 찾기
  const marketItem = city.market.items.find((item) => item.itemId === itemId);
  if (!marketItem) return { isValid: false };

  // 선택한 품질의 재고 확인
  if (marketItem.qualityStock[quality] < quantity) return { isValid: false };

  // 품질에 따른 가격 계산
  const qualityFactor = QUALITY_FACTORS[quality];
  const totalPrice = marketItem.currentPrice * quantity * qualityFactor;

  // 골드 확인
  if (state.player.gold < totalPrice) return { isValid: false };

  // 무게 확인
  const itemInfo = ITEMS[itemId];
  if (!itemInfo) return { isValid: false };

  const additionalWeight = itemInfo.weight * quantity;
  const currentWeight = calculateInventoryWeight(state.player.inventory, ITEMS);

  if (currentWeight + additionalWeight > state.player.maxWeight) {
    return { isValid: false };
  }

  return { isValid: true, marketItem, totalPrice };
}

function validateSellTransaction(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  inventoryIndex: number
): {
  isValid: boolean;
  inventoryItem?: InventoryItem;
  quality?: ItemQuality;
  marketItem?: any;
  totalSellValue?: number;
} {
  const city = state.world.cities[cityId];
  if (!city) return { isValid: false };

  // 인벤토리에서 아이템 찾기
  const inventoryItem = state.player.inventory[inventoryIndex];
  if (!inventoryItem || inventoryItem.itemId !== itemId || inventoryItem.quantity < quantity) {
    return { isValid: false };
  }

  // 아이템의 품질 파악
  const quality =
    inventoryItem.quality >= 1.2
      ? ItemQuality.HIGH
      : inventoryItem.quality <= 0.9
      ? ItemQuality.LOW
      : ItemQuality.MEDIUM;

  // 아이템의 현재 시장 가격 찾기
  const marketItem = city.market.items.find((item) => item.itemId === itemId);

  // 판매 가격 계산
  let sellPrice;

  if (marketItem) {
    // 시장에 있는 아이템은 시장 가격에 품질 계수와 스프레드 적용
    const baseMarketPrice = marketItem.currentPrice;
    const qualityFactor = QUALITY_FACTORS[quality];
    const qualityAdjustedPrice = baseMarketPrice * qualityFactor;

    // 스프레드 계산 (평판 및 거래 기술 고려)
    sellPrice = calculatePlayerSellingPrice(qualityAdjustedPrice, state.player, city);
  } else {
    // 시장에 없는 아이템은 구매가의 70%로 판매 (품질 이미 적용됨)
    sellPrice = inventoryItem.purchasePrice * 0.7;
  }

  const totalSellValue = sellPrice * quantity;

  return { isValid: true, inventoryItem, quality, marketItem, totalSellValue };
}

/**
 * 시장 재고 업데이트 함수
 */
function updateMarketStock(
  state: GameState,
  cityId: string,
  itemId: string,
  quality: ItemQuality,
  quantityChange: number
): GameState {
  const city = state.world.cities[cityId];

  // 시장 업데이트
  const updatedMarket = applyPlayerTradeImpact(
    city.market,
    itemId,
    quality,
    quantityChange // 구매는 음수, 판매는 양수
  );

  // 도시 업데이트
  const updatedCity = {
    ...city,
    market: updatedMarket,
  };

  return {
    ...state,
    world: {
      ...state.world,
      cities: {
        ...state.world.cities,
        [cityId]: updatedCity,
      },
    },
  };
}

/**
 * 플레이어 인벤토리 업데이트 함수 (구매)
 */
function updatePlayerInventoryForBuying(
  state: GameState,
  itemId: string,
  quantity: number,
  price: number,
  quality: ItemQuality,
  totalPrice: number
): GameState {
  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - totalPrice,
      inventory: addItemToInventory(state.player.inventory, itemId, quantity, price, quality),
    },
  };
}

/**
 * 플레이어 인벤토리 업데이트 함수 (판매)
 */
function updatePlayerInventoryForSelling(
  state: GameState,
  inventoryIndex: number,
  quantity: number,
  totalSellValue: number,
  inventoryItem: InventoryItem
): GameState {
  // 인벤토리에서 아이템 제거
  let updatedInventory = [...state.player.inventory];

  if (inventoryItem.quantity === quantity) {
    // 수량이 정확히 일치하면 아이템 완전 제거
    updatedInventory.splice(inventoryIndex, 1);
  } else {
    // 일부만 판매하는 경우 수량 감소
    updatedInventory[inventoryIndex] = {
      ...inventoryItem,
      quantity: inventoryItem.quantity - quantity,
    };
  }

  // 거래 통계 업데이트
  const updatedStats = {
    ...state.player.stats,
    successfulDeals: state.player.stats.successfulDeals + 1,
    totalProfit: state.player.stats.totalProfit + (totalSellValue - inventoryItem.purchasePrice * quantity),
  };

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold + totalSellValue,
      inventory: updatedInventory,
      stats: updatedStats,
    },
  };
}

/**
 * 아이템 구매 리듀서 - 품질별 재고 관리 반영
 */
export function buyItemReducer(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  quality: ItemQuality
): GameState {
  // 거래 유효성 검사
  const validation = validateBuyTransaction(state, itemId, quantity, cityId, quality);
  if (!validation.isValid) return state;

  // 시장 재고 업데이트 (구매는 수량 감소 = 음수)
  let updatedState = updateMarketStock(state, cityId, itemId, quality, -quantity);

  // 플레이어 인벤토리와 골드 업데이트
  updatedState = updatePlayerInventoryForBuying(
    updatedState,
    itemId,
    quantity,
    validation.marketItem!.currentPrice,
    quality,
    validation.totalPrice!
  );

  return updatedState;
}

/**
 * 아이템 판매 리듀서 - 품질별 재고 관리 반영
 */
export function sellItemReducer(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  inventoryIndex: number // 인벤토리 내 특정 아이템 인덱스 (품질 구분용)
): GameState {
  // 거래 유효성 검사
  const validation = validateSellTransaction(state, itemId, quantity, cityId, inventoryIndex);
  if (!validation.isValid) return state;

  // 시장 재고 업데이트 (판매는 수량 증가 = 양수)
  let updatedState = state;
  if (validation.marketItem) {
    updatedState = updateMarketStock(state, cityId, itemId, validation.quality!, quantity);
  }

  // 플레이어 인벤토리와 골드 업데이트
  updatedState = updatePlayerInventoryForSelling(
    updatedState,
    inventoryIndex,
    quantity,
    validation.totalSellValue!,
    validation.inventoryItem!
  );

  // 스킬 경험치 추가 - 리듀서 체인 방식으로 변경
  const tradeSkillExp = Math.ceil(validation.totalSellValue! / 50); // 판매액 기준 경험치
  return addSkillExperienceReducer(updatedState, SkillType.TRADE, tradeSkillExp);
}
