import { ITEMS } from "../../data/items";
import { applyPlayerTradeImpact, calculatePlayerSellingPrice, updateCityMarket } from "../../logic/EconomySystem";
import { calculateInventoryWeight } from "../../logic/InventorySystem";
import { GameState, ItemQuality, QUALITY_FACTORS, SkillType } from "../../models/types";
import { addItemToInventory } from "../utils/inventoryUtils";

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
 * 아이템 구매 리듀서 - 품질별 재고 관리 반영
 */
export function buyItemReducer(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  quality: ItemQuality
): GameState {
  const city = state.world.cities[cityId];

  if (!city) return state;

  // 아이템 찾기
  const marketItem = city.market.items.find((item) => item.itemId === itemId);
  if (!marketItem) return state;

  // 선택한 품질의 재고 확인
  if (marketItem.qualityStock[quality] < quantity) return state;

  // 품질에 따른 가격 계산
  const qualityFactor = QUALITY_FACTORS[quality];
  const totalPrice = marketItem.currentPrice * quantity * qualityFactor;

  // 골드 확인
  if (state.player.gold < totalPrice) return state;

  // 무게 확인
  const itemInfo = ITEMS[itemId];
  if (!itemInfo) return state;

  const additionalWeight = itemInfo.weight * quantity;
  const currentWeight = calculateInventoryWeight(state.player.inventory, ITEMS);

  if (currentWeight + additionalWeight > state.player.maxWeight) {
    // 무게 초과 시 구매 불가
    return state;
  }

  // 시장 업데이트 - 선택한 품질의 재고만 감소
  const updatedMarket = applyPlayerTradeImpact(
    city.market,
    itemId,
    quality,
    -quantity // 구매는 수량 감소
  );

  // 도시 업데이트
  const updatedCity = {
    ...city,
    market: updatedMarket,
  };

  // 인벤토리에 아이템 추가 및 골드 감소
  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - totalPrice,
      inventory: addItemToInventory(state.player.inventory, itemId, quantity, marketItem.currentPrice, qualityFactor),
    },
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
 * 아이템 판매 리듀서 - 품질별 재고 관리 반영
 */
export function sellItemReducer(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  inventoryIndex: number // 인벤토리 내 특정 아이템 인덱스 (품질 구분용)
): GameState {
  const city = state.world.cities[cityId];

  if (!city) return state;

  // 인벤토리에서 아이템 찾기 (인덱스로 정확한 품질 아이템 참조)
  const inventoryItem = state.player.inventory[inventoryIndex];

  if (!inventoryItem || inventoryItem.itemId !== itemId || inventoryItem.quantity < quantity) {
    return state;
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

  // 시장 업데이트 - 해당 품질의 재고만 증가
  let updatedMarket = city.market;

  if (marketItem) {
    updatedMarket = applyPlayerTradeImpact(
      city.market,
      itemId,
      quality, // 품질 지정
      quantity // 판매는 수량 증가
    );
  }

  // 도시 업데이트
  const updatedCity = {
    ...city,
    market: updatedMarket,
  };

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

  // 스킬 경험치 획득 (거래 기술)
  let updatedSkills = { ...state.player.skills };
  const tradeSkillExp = Math.ceil(totalSellValue / 50); // 판매액 기준 경험치

  if (updatedSkills[SkillType.TRADE]) {
    updatedSkills[SkillType.TRADE] += Math.min(0.1, tradeSkillExp / 100); // 최대 0.1 레벨 상승
  }

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold + totalSellValue,
      inventory: updatedInventory,
      skills: updatedSkills,
      stats: updatedStats,
    },
    world: {
      ...state.world,
      cities: {
        ...state.world.cities,
        [cityId]: updatedCity,
      },
    },
  };
}
