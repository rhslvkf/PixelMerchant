import React from "react";
import { Modal, StyleSheet, View } from "react-native";
import { useGame } from "../../state/GameContext";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { ITEMS } from "../../data/items";
import PixelText from "../PixelText";
import Button from "../Button";
import { formatGold } from "../../utils/formatting";
import { GameDate } from "../../models";

interface ItemDetailModalProps {
  visible: boolean;
  onClose: () => void;
  itemId: string;
  cityId: string;
}

const ItemDetailModal = ({ visible, onClose, itemId, cityId }: ItemDetailModalProps) => {
  const { state } = useGame();
  const itemInfo = ITEMS[itemId];
  const city = state.world.cities[cityId];

  if (!visible || !itemInfo || !city) return null;

  // 시장에서 아이템 찾기
  const marketItem = city.market.items.find((item) => item.itemId === itemId);
  if (!marketItem) return null;

  // 가격 이력 가져오기
  const priceHistory = marketItem.priceHistory;

  // 그래프 데이터 생성
  const graphData = priceHistory.map((entry: [GameDate, number]) => ({
    date: `${entry[0].month}/${entry[0].day}`,
    price: entry[1],
  }));

  // 현재 가격 추가
  graphData.push({
    date: "현재",
    price: marketItem.currentPrice,
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <PixelText variant="subtitle" style={styles.title}>
            {itemInfo.name} 시장 정보
          </PixelText>
          <View style={styles.infoRow}>
            <PixelText>현재 가격:</PixelText>
            <PixelText style={styles.priceText}>{formatGold(marketItem.currentPrice)} 골드</PixelText>
          </View>
          <View style={styles.infoRow}>
            <PixelText>기본 가격:</PixelText>
            <PixelText>{formatGold(itemInfo.basePrice)} 골드</PixelText>
          </View>
          <View style={styles.infoRow}>
            <PixelText>재고 현황:</PixelText>
            <PixelText>
              저급({marketItem.qualityStock.low}) / 보통({marketItem.qualityStock.medium}) / 고급(
              {marketItem.qualityStock.high})
            </PixelText>
          </View>
          <View style={styles.infoRow}>
            <PixelText>지역 영향:</PixelText>
            <PixelText>
              {(itemInfo.regionalFactors[city.regionId] || 0) >= 0 ? "+" : ""}
              {((itemInfo.regionalFactors[city.regionId] || 0) * 100).toFixed(0)}%
            </PixelText>
          </View>
          <PixelText style={styles.graphTitle}>가격 변동 추이</PixelText>
          {/* 간단한 그래프 표현 */}
          <View style={styles.graph}>
            {graphData.length > 0 ? (
              <View style={styles.graphContent}>
                {graphData.map((point, index) => {
                  // 최대/최소 가격 찾기
                  const prices = graphData.map((p) => p.price);
                  const maxPrice = Math.max(...prices);
                  const minPrice = Math.min(...prices);
                  const range = maxPrice - minPrice || 1;

                  // 그래프 높이 계산 (60px를 최대 높이로 사용)
                  const height = 10 + ((point.price - minPrice) / range) * 60;

                  return (
                    <View key={index} style={styles.graphColumn}>
                      <View
                        style={[
                          styles.graphBar,
                          { height, backgroundColor: point.date === "현재" ? COLORS.primary : COLORS.info },
                        ]}
                      />
                      <PixelText variant="caption" style={styles.graphLabel}>
                        {point.date}
                      </PixelText>
                    </View>
                  );
                })}
              </View>
            ) : (
              <PixelText style={styles.noDataText}>가격 이력 데이터가 없습니다</PixelText>
            )}
          </View>
          <Button title="닫기" onPress={onClose} size="medium" style={styles.closeButton} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.lg,
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  priceText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  graphTitle: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    fontWeight: "bold",
  },
  graph: {
    height: 120,
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.disabled,
    padding: SPACING.sm,
  },
  graphContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  graphColumn: {
    alignItems: "center",
    width: 30,
  },
  graphBar: {
    width: 20,
    backgroundColor: COLORS.info,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  graphLabel: {
    marginTop: SPACING.xs,
    fontSize: 8,
    width: 30,
    textAlign: "center",
  },
  noDataText: {
    textAlign: "center",
    marginTop: SPACING.lg,
    color: COLORS.disabled,
  },
  closeButton: {
    marginTop: SPACING.md,
  },
});

export default ItemDetailModal;
