import { useState, useEffect, ReactNode } from "react";
import { useGame } from "../state/GameContext";
import { calculatePlayerSellingPrice } from "../logic/EconomySystem";
import { ITEMS } from "../data/items";
import { InventoryItem, ItemQuality, MarketItem, QUALITY_FACTORS } from "../models";
import { InteractionManager } from "react-native";

interface MarketLogic {
  // 상태
  selectedTab: "buy" | "sell";
  selectedItem: string | null;
  quantity: number;
  quality: ItemQuality;
  showDialog: boolean;
  dialogType: "success" | "error";
  dialogTitle: string;
  dialogMessage: string;

  // 도시/아이템 정보
  currentCity: any;
  marketItems: MarketItem[];

  // 품질 관련 함수
  getQualityText: (qualityValue: number) => string;
  getItemQualityEnum: (qualityValue: number) => ItemQuality;
  getQualityColor: (qualityValue: number) => { color: string };

  // 수량 관련 함수
  increaseQuantity: () => void;
  decreaseQuantity: () => void;

  // 거래 관련 함수
  handleBuy: () => void;
  handleSell: () => void;
  canTrade: boolean;
  isGoldInsufficient: () => boolean;
  calculateTotalValue: () => number;

  // 재고 관련 함수
  getStockForQuality: (item: MarketItem, qualityType: ItemQuality) => number;
  getCurrentQualityStock: (item: MarketItem) => number;

  // 아이템 렌더링 관련
  renderMarketItem: (item: MarketItem) => ReactNode | null;
  renderInventoryItem: (item: InventoryItem) => ReactNode | null;

  // 수수료 관련
  calculateFeePercentage: () => number;
  getReputationEffect: () => number;
  getTradeSkillEffect: () => number;

  // 상태 변경 함수
  setSelectedTab: (tab: "buy" | "sell") => void;
  setSelectedItem: (itemId: string | null) => void;
  setQuantity: (quantity: number) => void;
  setQuality: (quality: ItemQuality) => void;
  handleQualityChange: (newQuality: ItemQuality) => void;
  showNotification: (type: "success" | "error", title: string, message: string) => void;
  closeDialog: () => void;
}

export const useMarketLogic = (): MarketLogic => {
  const { state, dispatch } = useGame();
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quality, setQuality] = useState<ItemQuality>(ItemQuality.MEDIUM);

  // 알림 다이얼로그 상태
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"success" | "error">("success");
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // 현재 도시 및 시장 정보 가져오기
  const currentCity = state.world.cities[state.currentCityId];
  const marketItems = currentCity.market.items;

  // 탭 변경 시 선택 초기화
  useEffect(() => {
    setSelectedItem(null);
    setQuantity(1);
  }, [selectedTab]);

  // 다이얼로그 표시 함수 - 더 직접적인 방식으로 수정
  const showNotification = (type: "success" | "error", title: string, message: string) => {
    // 모든 애니메이션과 상호작용이 완료된 후 실행
    InteractionManager.runAfterInteractions(() => {
      setDialogType(type);
      setDialogTitle(title);
      setDialogMessage(message);
      setShowDialog(true);
    });
  };

  // 다이얼로그 닫기
  const closeDialog = () => setShowDialog(false);

  // 품질 텍스트 변환 함수
  const getQualityText = (qualityValue: number): string => {
    if (qualityValue <= QUALITY_FACTORS[ItemQuality.LOW]) return "저급";
    if (qualityValue >= QUALITY_FACTORS[ItemQuality.HIGH]) return "고급";
    return "보통";
  };

  // 품질 기반 ItemQuality 열거형 반환
  const getItemQualityEnum = (qualityValue: number): ItemQuality => {
    if (qualityValue <= QUALITY_FACTORS[ItemQuality.LOW]) return ItemQuality.LOW;
    if (qualityValue >= QUALITY_FACTORS[ItemQuality.HIGH]) return ItemQuality.HIGH;
    return ItemQuality.MEDIUM;
  };

  // 품질 기반 색상 스타일 반환
  const getQualityColor = (qualityValue: number) => {
    if (qualityValue <= QUALITY_FACTORS[ItemQuality.LOW]) return { color: "#CD7F32" }; // bronze
    if (qualityValue >= QUALITY_FACTORS[ItemQuality.HIGH]) return { color: "#FFD700" }; // gold
    return { color: "#C0C0C0" }; // silver
  };

  // 수량 증가
  const increaseQuantity = () => {
    if (selectedTab === "buy") {
      const item = marketItems.find((item: MarketItem) => item.itemId === selectedItem);
      if (item) {
        // 현재 선택된 품질의 재고만 고려
        const availableStock = getStockForQuality(item, quality);
        // 항상 재고 확인
        if (quantity < availableStock) {
          setQuantity(quantity + 1);
        }
      }
    } else {
      const inventoryItem = state.player.inventory.find(
        (item: InventoryItem) => item.itemId === selectedItem && item.quality === quality
      );
      if (inventoryItem && quantity < inventoryItem.quantity) {
        setQuantity(quantity + 1);
      }
    }
  };

  // 수량 감소
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // 아이템 구매 - 거래 완료와 알림 시점 최적화
  const handleBuy = () => {
    if (!selectedItem) return;

    const marketItem = marketItems.find((item: MarketItem) => item.itemId === selectedItem);
    if (!marketItem) return;

    // 선택한 품질의 재고 확인
    const availableStock = getStockForQuality(marketItem, quality);
    if (availableStock < quantity) {
      showNotification("error", "구매 실패", "선택한 품질의 재고가 부족합니다.");
      return;
    }

    // 품질 계수를 고려한 가격 계산
    const qualityFactor = QUALITY_FACTORS[quality];
    const totalCost = marketItem.currentPrice * quantity * qualityFactor;

    // 골드 확인
    if (state.player.gold < totalCost) {
      showNotification("error", "구매 실패", "골드가 부족합니다.");
      return;
    }

    // 구매를 위한 로컬 데이터 준비
    const itemId = selectedItem;
    const itemQuantity = quantity;
    const itemName = ITEMS[itemId]?.name;

    // 즉시 UI 상태 업데이트하여 사용자에게 피드백 제공
    const localSelectedItem = selectedItem; // 변수에 현재 상태 저장
    setSelectedItem(null); // 즉시 모달 닫기

    // 데이터 처리를 최적화된 시점에 수행
    requestAnimationFrame(() => {
      // 구매 액션 디스패치
      dispatch({
        type: "BUY_ITEM",
        payload: {
          itemId,
          quantity: itemQuantity,
          cityId: state.currentCityId,
          quality,
        },
      });

      // 중요: 구매 완료 후 상태 초기화
      setQuantity(1);

      // 즉시 알림 표시 (다른 UI 갱신 후)
      showNotification("success", "구매 성공", `${itemName} ${itemQuantity}개를 구매했습니다.`);
    });
  };

  // 아이템 판매 - 거래 완료와 알림 시점 최적화
  const handleSell = () => {
    if (!selectedItem) return;

    // 인벤토리에서 선택한 아이템 찾기
    const inventoryItemIndex = state.player.inventory.findIndex(
      (item: InventoryItem) => item.itemId === selectedItem && item.quality === quality
    );
    const inventoryItem = state.player.inventory[inventoryItemIndex];

    if (!inventoryItem) {
      showNotification("error", "판매 실패", "선택한 품질의 아이템이 없습니다.");
      return;
    }

    if (inventoryItem.quantity < quantity) {
      showNotification("error", "판매 실패", "보유한 수량이 부족합니다.");
      return;
    }

    // 판매를 위한 로컬 데이터 준비
    const itemId = selectedItem;
    const itemQuantity = quantity;
    const itemName = ITEMS[itemId]?.name;

    // 판매 금액 기록을 위한 데이터 캡처
    const sellAmount = calculateTotalValue();

    // 부분 수량이든 전체 수량이든 모달을 항상 닫음
    setSelectedItem(null);

    // 데이터 처리를 최적화된 시점에 수행
    requestAnimationFrame(() => {
      // 판매 액션 디스패치
      dispatch({
        type: "SELL_ITEM",
        payload: {
          itemId,
          quantity: itemQuantity,
          cityId: state.currentCityId,
          inventoryIndex: inventoryItemIndex,
        },
      });

      // 수량 초기화
      setQuantity(1);

      // 판매 알림 표시 - 금액 정보 추가
      const goldAmount = Math.round(sellAmount);
      const silverAmount = Math.round((sellAmount % 1) * 100);

      let amountText = "";
      if (goldAmount > 0) {
        amountText += `${goldAmount}골드`;
        if (silverAmount > 0) {
          amountText += ` ${silverAmount}실버`;
        }
      } else if (silverAmount > 0) {
        amountText = `${silverAmount}실버`;
      }

      showNotification(
        "success",
        "판매 성공",
        `${itemName} ${itemQuantity}개를 판매하여 ${amountText}를 획득했습니다.`
      );
    });
  };

  // 거래 버튼 활성화 여부
  const canTrade = selectedItem !== null && quantity > 0;

  // 골드 부족 여부 확인
  const isGoldInsufficient = (): boolean => {
    if (selectedTab === "buy" && selectedItem) {
      const marketItem = marketItems.find((item: MarketItem) => item.itemId === selectedItem);
      if (marketItem) {
        const qualityFactor = QUALITY_FACTORS[quality];
        const totalCost = marketItem.currentPrice * quantity * qualityFactor;
        return state.player.gold < totalCost;
      }
    }
    return false;
  };

  // 선택된 아이템의 총 가치 계산
  const calculateTotalValue = (): number => {
    if (!selectedItem) return 0;

    if (selectedTab === "buy") {
      const marketItem = marketItems.find((item: MarketItem) => item.itemId === selectedItem);
      if (marketItem) {
        // 품질 계수 적용한 가격 계산
        const qualityFactor = QUALITY_FACTORS[quality];
        return marketItem.currentPrice * quantity * qualityFactor;
      }
      return 0;
    } else {
      // 판매 로직 - 품질 고려하여 계산
      const marketItem = marketItems.find((item: MarketItem) => item.itemId === selectedItem);
      const inventoryItem = state.player.inventory.find(
        (item: InventoryItem) => item.itemId === selectedItem && item.quality === quality
      );

      if (marketItem && inventoryItem) {
        // 인벤토리 아이템의 품질을 고려하여 판매 가격 계산
        return (
          calculatePlayerSellingPrice(
            marketItem.currentPrice * QUALITY_FACTORS[inventoryItem.quality],
            state.player,
            currentCity
          ) * quantity
        );
      } else if (inventoryItem) {
        return inventoryItem.purchasePrice * 0.7 * quantity;
      }
      return 0;
    }
  };

  // 품질에 따른 재고 반환 헬퍼 함수
  const getStockForQuality = (item: MarketItem, qualityType: ItemQuality): number => {
    return item.qualityStock?.[qualityType] || 0;
  };

  // 현재 선택된 품질의 재고 확인
  const getCurrentQualityStock = (item: MarketItem): number => {
    return getStockForQuality(item, quality);
  };

  // 현재 판매 수수료 비율 계산
  const calculateFeePercentage = (): number => {
    // 기본 수수료 20%에서 평판 및 거래 기술 효과 차감
    const reputationEffect = getReputationEffect();
    const tradeSkillEffect = getTradeSkillEffect();
    return Math.max(5, 20 - reputationEffect - tradeSkillEffect);
  };

  // 평판에 따른 수수료 감소 효과
  const getReputationEffect = (): number => {
    const reputationLevel = state.player.reputation[currentCity.id] || 0;
    return reputationLevel * 2;
  };

  // 거래 기술에 따른 수수료 감소 효과
  const getTradeSkillEffect = (): number => {
    const tradeSkillLevel = state.player.skills.trade || 0;
    return tradeSkillLevel * 2;
  };

  // 품질 변경 핸들러 - 품질 변경 시 수량 초기화
  const handleQualityChange = (newQuality: ItemQuality): void => {
    // 다른 품질로 변경될 때만 수량 초기화
    if (quality !== newQuality) {
      setQuality(newQuality);
      setQuantity(1); // 수량 1로 초기화
    }
  };

  // 아이템 렌더링 함수 (마켓 스크린에서 구현)
  const renderMarketItem = (item: MarketItem): ReactNode | null => {
    // 이 함수는 UI 컴포넌트에서 구현
    return null;
  };

  // 인벤토리 아이템 렌더링 함수 (마켓 스크린에서 구현)
  const renderInventoryItem = (item: InventoryItem): ReactNode | null => {
    // 이 함수는 UI 컴포넌트에서 구현
    return null;
  };

  return {
    // 상태
    selectedTab,
    selectedItem,
    quantity,
    quality,
    showDialog,
    dialogType,
    dialogTitle,
    dialogMessage,

    // 도시/아이템 정보
    currentCity,
    marketItems,

    // 품질 관련 함수
    getQualityText,
    getItemQualityEnum,
    getQualityColor,

    // 수량 관련 함수
    increaseQuantity,
    decreaseQuantity,

    // 거래 관련 함수
    handleBuy,
    handleSell,
    canTrade,
    isGoldInsufficient,
    calculateTotalValue,

    // 재고 관련 함수
    getStockForQuality,
    getCurrentQualityStock,

    // 아이템 렌더링 관련
    renderMarketItem,
    renderInventoryItem,

    // 수수료 관련
    calculateFeePercentage,
    getReputationEffect,
    getTradeSkillEffect,

    // 상태 변경 함수
    setSelectedTab,
    setSelectedItem,
    setQuantity,
    setQuality,
    handleQualityChange,
    showNotification,
    closeDialog,
  };
};
