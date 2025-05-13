import { useMemo, useState } from "react";
import { ITEMS } from "../data/items";
import { calculateInventoryWeight, groupInventoryByCategory, sortInventory } from "../logic/InventorySystem";
import { InventoryItem, ItemCategory } from "../models";
import { useGame } from "../state/GameContext";

type SortOption = "name" | "quantity" | "price" | "weight" | "category";

export const useInventory = () => {
  const { state, dispatch } = useGame();
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortAscending, setSortAscending] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // 인벤토리 아이템 정렬
  const sortedInventory = useMemo(() => {
    return sortInventory(state.player.inventory, sortBy, sortAscending, ITEMS);
  }, [state.player.inventory, sortBy, sortAscending]);

  // 카테고리별 그룹화
  const groupedInventory = useMemo(() => {
    return groupInventoryByCategory(sortedInventory, ITEMS);
  }, [sortedInventory]);

  // 필터링된 인벤토리
  const filteredInventory = useMemo(() => {
    if (!categoryFilter) return sortedInventory;

    return sortedInventory.filter((item) => {
      const itemInfo = ITEMS[item.itemId];
      return itemInfo && itemInfo.category === categoryFilter;
    });
  }, [sortedInventory, categoryFilter]);

  // 현재 무게와 최대 무게
  const weight = useMemo(() => {
    return calculateInventoryWeight(state.player.inventory, ITEMS);
  }, [state.player.inventory]);

  const maxWeight = state.player.maxWeight;
  const weightPercentage = (weight / maxWeight) * 100;

  // 정렬 변경 핸들러
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(option);
      setSortAscending(true);
    }
  };

  // 카테고리 필터 핸들러
  const handleCategoryFilter = (category: string | null) => {
    setCategoryFilter(category);
  };

  // 아이템 사용 핸들러 (나중에 구현)
  const handleUseItem = (item: InventoryItem) => {
    // 아이템 사용 로직 (현재는 placeholder)
    console.log(`Using item: ${item.itemId}`);
  };

  // 아이템 버리기 핸들러
  const handleDropItem = (item: InventoryItem, quantity: number = 1) => {
    dispatch({
      type: "REMOVE_ITEM_FROM_INVENTORY",
      payload: {
        itemId: item.itemId,
        quantity: Math.min(quantity, item.quantity),
      },
    });
  };

  // 카테고리 이름 가져오기
  const getCategoryName = (category: ItemCategory): string => {
    const categoryNames: Record<ItemCategory, string> = {
      [ItemCategory.AGRICULTURAL]: "농산물",
      [ItemCategory.TEXTILE]: "직물",
      [ItemCategory.SPICE]: "향신료",
      [ItemCategory.MINERAL]: "광물",
      [ItemCategory.WOOD]: "목재",
      [ItemCategory.JEWELRY]: "보석",
      [ItemCategory.BEVERAGE]: "음료",
      [ItemCategory.ART]: "예술품",
      [ItemCategory.MEDICINE]: "약재",
      [ItemCategory.MAGICAL]: "마법 물품",
      [ItemCategory.ARTIFACT]: "유물",
      [ItemCategory.EXOTIC]: "이국적 물품",
      [ItemCategory.MAP]: "지도",
      [ItemCategory.PROVISION]: "식량",
      [ItemCategory.TOOL]: "도구",
      [ItemCategory.LUXURY]: "사치품",
      [ItemCategory.INFORMATION]: "정보",
    };

    return categoryNames[category] || String(category);
  };

  // 품질 텍스트 가져오기
  const getQualityText = (quality: number): string => {
    if (quality <= 0.9) return "저급";
    if (quality >= 1.2) return "고급";
    return "보통";
  };

  // 품질 색상 가져오기
  const getQualityColor = (quality: number): string => {
    if (quality <= 0.9) return "#CD7F32"; // 브론즈
    if (quality >= 1.2) return "#FFD700"; // 골드
    return "#C0C0C0"; // 실버
  };

  return {
    inventory: filteredInventory,
    groupedInventory,
    sortBy,
    sortAscending,
    categoryFilter,
    selectedItem,
    weight,
    maxWeight,
    weightPercentage,
    setSelectedItem,
    handleSort,
    handleCategoryFilter,
    handleUseItem,
    handleDropItem,
    getCategoryName,
    getQualityText,
    getQualityColor,
  };
};
