import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { NPCTrade as NPCTradeType } from "../../models/npc";
import { ITEMS } from "../../data/items";
import PixelText from "../PixelText";
import Button from "../Button";
import { useGame } from "../../state/GameContext";
import { formatGold } from "../../utils/formatting";

interface NPCTradeProps {
  npcId: string;
  trades: NPCTradeType[];
  onPurchase: (tradeId: string, quantity: number) => void;
  onClose: () => void;
}

const NPCTrade: React.FC<NPCTradeProps> = ({ npcId, trades, onPurchase, onClose }) => {
  const { state } = useGame();
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // 선택한 거래 정보 가져오기
  const selectedTradeInfo = selectedTrade ? trades.find((t) => t.id === selectedTrade) : null;

  // 거래 가능 여부 확인
  const canPurchase = () => {
    if (!selectedTradeInfo) return false;

    // 재고 확인
    if (selectedTradeInfo.quantityAvailable < quantity) return false;

    // 가격 계산
    const itemInfo = state.world.cities[state.currentCityId].market.items.find(
      (i) => i.itemId === selectedTradeInfo.itemId
    );

    if (!itemInfo) return false;

    const totalPrice = itemInfo.currentPrice * selectedTradeInfo.priceMultiplier * quantity;

    // 골드 확인
    return state.player.gold >= totalPrice;
  };

  // 가격 계산
  const calculatePrice = () => {
    if (!selectedTradeInfo) return 0;

    const itemInfo = state.world.cities[state.currentCityId].market.items.find(
      (i) => i.itemId === selectedTradeInfo.itemId
    );

    if (!itemInfo) return 0;

    return itemInfo.currentPrice * selectedTradeInfo.priceMultiplier * quantity;
  };

  // 품질 텍스트
  const getQualityText = (quality: string) => {
    switch (quality) {
      case "LOW":
        return "저급";
      case "MEDIUM":
        return "보통";
      case "HIGH":
        return "고급";
      default:
        return "보통";
    }
  };

  // 수량 증가
  const increaseQuantity = () => {
    if (selectedTradeInfo && quantity < selectedTradeInfo.quantityAvailable) {
      setQuantity(quantity + 1);
    }
  };

  // 수량 감소
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // 구매 처리
  const handlePurchase = () => {
    if (selectedTradeInfo && canPurchase()) {
      onPurchase(selectedTradeInfo.id, quantity);
      setSelectedTrade(null);
      setQuantity(1);
    }
  };

  return (
    <View style={styles.container}>
      <PixelText variant="subtitle" style={styles.title}>
        특별 거래
      </PixelText>

      {trades.length === 0 ? (
        <View style={styles.emptyContainer}>
          <PixelText>현재 가능한 거래가 없습니다.</PixelText>
        </View>
      ) : (
        <View style={styles.tradeListContainer}>
          {trades.map((trade) => {
            const itemInfo = ITEMS[trade.itemId];
            const isDisabled = trade.quantityAvailable <= 0;
            const isSelected = selectedTrade === trade.id;

            return (
              <TouchableOpacity
                key={trade.id}
                style={[
                  styles.tradeItem,
                  isDisabled && styles.disabledTradeItem,
                  isSelected && styles.selectedTradeItem,
                ]}
                onPress={() => {
                  if (!isDisabled) {
                    setSelectedTrade(isSelected ? null : trade.id);
                    setQuantity(1);
                  }
                }}
                disabled={isDisabled}
              >
                <View style={styles.tradeItemInfo}>
                  <PixelText style={styles.itemName}>
                    {itemInfo?.name || trade.itemId} ({getQualityText(trade.quality)})
                  </PixelText>
                  <PixelText variant="caption">재고: {trade.quantityAvailable}개</PixelText>
                  <PixelText variant="caption" style={styles.priceText}>
                    가격: {formatGold(calculateTradeBasePrice(trade))}
                  </PixelText>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {selectedTradeInfo && (
        <View style={styles.purchaseContainer}>
          <View style={styles.quantityContainer}>
            <Button title="-" size="small" onPress={decreaseQuantity} style={styles.quantityButton} />
            <PixelText style={styles.quantityText}>{quantity}</PixelText>
            <Button title="+" size="small" onPress={increaseQuantity} style={styles.quantityButton} />
          </View>

          <PixelText style={styles.totalPrice}>총 가격: {formatGold(calculatePrice())}</PixelText>

          <View style={styles.purchaseButtons}>
            <Button title="구매" onPress={handlePurchase} disabled={!canPurchase()} style={styles.purchaseButton} />
            <Button
              title="취소"
              type="secondary"
              onPress={() => {
                setSelectedTrade(null);
                setQuantity(1);
              }}
              style={styles.cancelButton}
            />
          </View>
        </View>
      )}

      <Button title="돌아가기" onPress={onClose} type="secondary" style={styles.closeButton} />
    </View>
  );

  // 기본 가격 계산 함수
  function calculateTradeBasePrice(trade: NPCTradeType): number {
    const itemInfo = state.world.cities[state.currentCityId].market.items.find((i) => i.itemId === trade.itemId);

    if (!itemInfo) return 0;

    return Math.round(itemInfo.currentPrice * trade.priceMultiplier);
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.background.dark}E6`,
    borderRadius: BORDERS.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: "center",
    padding: SPACING.md,
  },
  tradeListContainer: {
    maxHeight: 250,
  },
  tradeItem: {
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.berdan,
  },
  disabledTradeItem: {
    opacity: 0.5,
    borderColor: COLORS.disabled,
  },
  selectedTradeItem: {
    backgroundColor: COLORS.berdan,
    borderColor: COLORS.primary,
  },
  tradeItemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
    color: COLORS.text.light,
  },
  priceText: {
    color: COLORS.gold,
  },
  purchaseContainer: {
    backgroundColor: `${COLORS.secondary}99`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: SPACING.md,
    fontSize: 18,
    width: 30,
    textAlign: "center",
  },
  totalPrice: {
    textAlign: "center",
    color: COLORS.gold,
    fontWeight: "bold",
    marginBottom: SPACING.md,
  },
  purchaseButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  purchaseButton: {
    flex: 1,
    marginRight: SPACING.xs,
  },
  cancelButton: {
    flex: 1,
    marginLeft: SPACING.xs,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
});

export default NPCTrade;
