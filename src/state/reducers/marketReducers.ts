import { GameState } from "../../models/types";
import { updateCityMarket, applyPlayerTradeImpact } from "../../logic/EconomySystem";
import { calculateInventoryWeight } from "../../logic/InventorySystem";
import { ITEMS } from "../../data/items";
import { addItemToInventory, removeItemFromInventory } from "../utils/inventoryUtils";

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
 * 아이템 구매 리듀서
 */
export function buyItemReducer(
  state: GameState,
  itemId: string,
  quantity: number,
  cityId: string,
  quality: number
): GameState {
  const city = state.world.cities[cityId];

  if (!city) return state;

  // 아이템 찾기
  const marketItem = city.market.items.find((item) => item.itemId === itemId);
  if (!marketItem) return state;

  // 재고 확인
  if (marketItem.quantity < quantity) return state;

  // 가격 계산
  const totalPrice = marketItem.currentPrice * quantity;

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

  // 시장 업데이트
  const updatedMarket = applyPlayerTradeImpact(
    city.market,
    itemId,
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
      inventory: addItemToInventory(state.player.inventory, itemId, quantity, marketItem.currentPrice, quality),
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
 * 아이템 판매 리듀서
 */
export function sellItemReducer(state: GameState, itemId: string, quantity: number, cityId: string): GameState {
  const city = state.world.cities[cityId];

  if (!city) return state;

  // 인벤토리에서 아이템 찾기
  const inventoryItem = state.player.inventory.find((item) => item.itemId === itemId);
  if (!inventoryItem || inventoryItem.quantity < quantity) return state;

  // 아이템의 현재 가격 찾기
  const marketItem = city.market.items.find((item) => item.itemId === itemId);
  const sellPrice = marketItem ? marketItem.currentPrice : inventoryItem.purchasePrice * 0.7; // 해당 도시에 없는 상품은 할인 판매

  const totalSellValue = sellPrice * quantity;

  // 시장 업데이트
  const updatedMarket = marketItem
    ? applyPlayerTradeImpact(city.market, itemId, quantity) // 판매는 수량 증가
    : city.market;

  // 도시 업데이트
  const updatedCity = {
    ...city,
    market: updatedMarket,
  };

  // 인벤토리에서 아이템 제거 및 골드 증가
  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold + totalSellValue,
      inventory: removeItemFromInventory(state.player.inventory, itemId, quantity),
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
