import React, { useState, useEffect } from "react";
import { View, StyleSheet, ImageBackground, ScrollView, TouchableOpacity, Text, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING, BORDERS, SHADOWS, TYPOGRAPHY } from "../config/theme";
import PixelText from "../components/PixelText";
import Button from "../components/Button";
import { useGame } from "../state/GameContext";
import { ITEMS } from "../data/items";
import { MarketItem } from "../models/types";
import { formatGold } from "../utils/formatting";
import { AppNavigationProp } from "../navigation/types";

const MarketScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { state, dispatch } = useGame();
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quality, setQuality] = useState(1.0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState<string | null>(null);

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

  // 다이얼로그 표시 함수
  const showNotification = (type: "success" | "error", title: string, message: string) => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogMessage(message);
    setShowDialog(true);
  };

  // 수량 증가
  const increaseQuantity = () => {
    if (selectedTab === "buy") {
      const item = marketItems.find((item) => item.itemId === selectedItem);
      if (item && quantity < item.quantity) {
        setQuantity(quantity + 1);
      }
    } else {
      const inventoryItem = state.player.inventory.find((item) => item.itemId === selectedItem);
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

  // 아이템 구매
  const handleBuy = () => {
    if (!selectedItem) return;

    const marketItem = marketItems.find((item) => item.itemId === selectedItem);
    if (!marketItem) return;

    // 골드 확인
    const totalCost = marketItem.currentPrice * quantity;
    if (state.player.gold < totalCost) {
      showNotification("error", "구매 실패", "골드가 부족합니다.");
      return;
    }

    // 구매 액션 디스패치
    dispatch({
      type: "BUY_ITEM",
      payload: {
        itemId: selectedItem,
        quantity,
        cityId: state.currentCityId,
        quality, // 선택한 품질 사용
      },
    });

    showNotification("success", "구매 성공", `${ITEMS[selectedItem]?.name} ${quantity}개를 구매했습니다.`);
    setSelectedItem(null);
    setQuantity(1);
  };

  // 아이템 판매
  const handleSell = () => {
    if (!selectedItem) return;

    const inventoryItem = state.player.inventory.find((item) => item.itemId === selectedItem);
    if (!inventoryItem) return;

    // 판매 액션 디스패치
    dispatch({
      type: "SELL_ITEM",
      payload: {
        itemId: selectedItem,
        quantity,
        cityId: state.currentCityId,
      },
    });

    showNotification("success", "판매 성공", `${ITEMS[selectedItem]?.name} ${quantity}개를 판매했습니다.`);
    setSelectedItem(null);
    setQuantity(1);
  };

  // 거래 버튼 활성화 여부
  const canTrade = selectedItem !== null && quantity > 0;

  // 선택된 아이템의 총 가치 계산
  const calculateTotalValue = () => {
    if (!selectedItem) return 0;

    if (selectedTab === "buy") {
      const marketItem = marketItems.find((item) => item.itemId === selectedItem);
      // 품질에 따른 가격 계산
      return marketItem ? marketItem.currentPrice * quantity * quality : 0;
    } else {
      const marketItem = marketItems.find((item) => item.itemId === selectedItem);
      const inventoryItem = state.player.inventory.find((item) => item.itemId === selectedItem);

      if (marketItem) {
        return marketItem.currentPrice * quantity;
      } else if (inventoryItem) {
        return inventoryItem.purchasePrice * 0.7 * quantity;
      }
      return 0;
    }
  };

  // 아이템 렌더링
  const renderMarketItem = (item: MarketItem) => {
    const itemInfo = ITEMS[item.itemId];
    if (!itemInfo) return null;

    const isSelected = selectedItem === item.itemId;

    return (
      <TouchableOpacity
        key={item.itemId}
        style={[styles.itemContainer, isSelected && styles.selectedItem]}
        onPress={() => {
          setSelectedItem(item.itemId);
          setQuantity(1);
        }}
        onLongPress={() => {
          setDetailItem(item.itemId);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.itemInfo}>
          <PixelText style={styles.itemName}>{itemInfo.name}</PixelText>
          <PixelText variant="caption">{itemInfo.description}</PixelText>
          <View style={styles.itemStats}>
            <PixelText variant="caption">재고: {item.quantity}개</PixelText>
            <PixelText variant="caption">무게: {itemInfo.weight}/개</PixelText>
          </View>
        </View>
        <View style={styles.itemPriceContainer}>
          <PixelText style={styles.itemPrice}>{formatGold(item.currentPrice)}</PixelText>
          <PixelText variant="caption">골드</PixelText>
        </View>
      </TouchableOpacity>
    );
  };

  // 인벤토리 아이템 렌더링
  const renderInventoryItem = (inventoryItem: any) => {
    const itemInfo = ITEMS[inventoryItem.itemId];
    if (!itemInfo) return null;

    const isSelected = selectedItem === inventoryItem.itemId;

    // 현재 시장의 판매 가격 찾기
    const marketItem = marketItems.find((item) => item.itemId === inventoryItem.itemId);
    const sellPrice = marketItem ? marketItem.currentPrice : inventoryItem.purchasePrice * 0.7; // 시장에 없는 아이템은 70% 가격으로 판매

    return (
      <TouchableOpacity
        key={inventoryItem.itemId}
        style={[styles.itemContainer, isSelected && styles.selectedItem]}
        onPress={() => {
          setSelectedItem(inventoryItem.itemId);
          setQuantity(1);
        }}
        onLongPress={() => {
          setDetailItem(inventoryItem.itemId);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.itemInfo}>
          <PixelText style={styles.itemName}>{itemInfo.name}</PixelText>
          <PixelText variant="caption">{itemInfo.description}</PixelText>
          <View style={styles.itemStats}>
            <PixelText variant="caption">보유: {inventoryItem.quantity}개</PixelText>
            <PixelText variant="caption">무게: {itemInfo.weight}/개</PixelText>
          </View>
        </View>
        <View style={styles.itemPriceContainer}>
          <PixelText style={styles.itemPrice}>{formatGold(sellPrice)}</PixelText>
          <PixelText variant="caption">골드</PixelText>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/market_background.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <PixelText variant="subtitle">{currentCity.name} 시장</PixelText>
          <View style={styles.goldInfo}>
            <PixelText>
              <PixelText style={styles.goldText}>{formatGold(state.player.gold)}</PixelText> 골드
            </PixelText>
          </View>
        </View>

        {/* 탭 버튼 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "buy" && styles.activeTab]}
            onPress={() => setSelectedTab("buy")}
          >
            <PixelText style={selectedTab === "buy" ? styles.activeTabText : styles.tabText}>구매</PixelText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, selectedTab === "sell" && styles.activeTab]}
            onPress={() => setSelectedTab("sell")}
          >
            <PixelText style={selectedTab === "sell" ? styles.activeTabText : styles.tabText}>판매</PixelText>
          </TouchableOpacity>
        </View>

        {/* 아이템 목록 */}
        <ScrollView style={[styles.itemList, { marginBottom: selectedItem ? 150 : 80 }]}>
          {selectedTab === "buy" ? marketItems.map(renderMarketItem) : state.player.inventory.map(renderInventoryItem)}

          {selectedTab === "buy" && marketItems.length === 0 && (
            <PixelText style={styles.emptyText}>판매 중인 상품이 없습니다.</PixelText>
          )}

          {selectedTab === "sell" && state.player.inventory.length === 0 && (
            <PixelText style={styles.emptyText}>판매할 상품이 없습니다.</PixelText>
          )}
          {/* 스크롤 하단 여백 추가 */}
          <View style={{ height: selectedItem ? 220 : 80 }} />
        </ScrollView>

        {/* 푸터 */}
        <View style={styles.footer}>
          <Button title="뒤로 가기" onPress={() => navigation.goBack()} size="medium" type="secondary" />
        </View>
      </ImageBackground>

      {/* 아이템 상세 정보 모달 */}
      <ItemDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        itemId={detailItem || ""}
        cityId={state.currentCityId}
      />

      {/* 거래 모달 */}
      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.tradeModalContainer}>
            {selectedItem && (
              <>
                <PixelText variant="subtitle" style={modalStyles.title}>
                  {ITEMS[selectedItem]?.name} {selectedTab === "buy" ? "구매" : "판매"}
                </PixelText>

                <View style={modalStyles.itemInfoContainer}>
                  <View style={modalStyles.itemDetails}>
                    <PixelText variant="body">{ITEMS[selectedItem]?.description}</PixelText>
                    <View style={modalStyles.itemStatsRow}>
                      <PixelText variant="caption">무게: {ITEMS[selectedItem]?.weight}/개</PixelText>
                      {selectedTab === "buy" ? (
                        <PixelText variant="caption">
                          재고: {marketItems.find((i) => i.itemId === selectedItem)?.quantity || 0}개
                        </PixelText>
                      ) : (
                        <PixelText variant="caption">
                          보유: {state.player.inventory.find((i) => i.itemId === selectedItem)?.quantity || 0}개
                        </PixelText>
                      )}
                    </View>
                  </View>
                </View>

                <View style={modalStyles.tradeControls}>
                  <View style={modalStyles.quantityControl}>
                    <PixelText variant="caption">수량:</PixelText>
                    <View style={modalStyles.quantityButtons}>
                      <Button title="-" onPress={decreaseQuantity} size="small" style={modalStyles.quantityButton} />
                      <PixelText style={modalStyles.quantityText}>{quantity}</PixelText>
                      <Button title="+" onPress={increaseQuantity} size="small" style={modalStyles.quantityButton} />
                    </View>
                  </View>

                  {selectedTab === "buy" && (
                    <View style={modalStyles.qualityControl}>
                      <PixelText variant="caption">품질:</PixelText>
                      <View style={modalStyles.qualityOptions}>
                        <TouchableOpacity
                          onPress={() => setQuality(0.8)}
                          style={[modalStyles.qualityOption, quality === 0.8 && modalStyles.selectedQuality]}
                        >
                          <PixelText style={quality === 0.8 ? modalStyles.selectedQualityText : {}}>저급</PixelText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setQuality(1.0)}
                          style={[modalStyles.qualityOption, quality === 1.0 && modalStyles.selectedQuality]}
                        >
                          <PixelText style={quality === 1.0 ? modalStyles.selectedQualityText : {}}>보통</PixelText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setQuality(1.3)}
                          style={[modalStyles.qualityOption, quality === 1.3 && modalStyles.selectedQuality]}
                        >
                          <PixelText style={quality === 1.3 ? modalStyles.selectedQualityText : {}}>고급</PixelText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={modalStyles.tradeSummary}>
                    <PixelText variant="body" style={modalStyles.priceText}>
                      총 가치: {formatGold(calculateTotalValue())} 골드
                    </PixelText>
                  </View>

                  <View style={modalStyles.actionButtons}>
                    <Button
                      title="취소"
                      onPress={() => setSelectedItem(null)}
                      type="secondary"
                      style={modalStyles.cancelButton}
                    />
                    <Button
                      title={selectedTab === "buy" ? "구매" : "판매"}
                      onPress={selectedTab === "buy" ? handleBuy : handleSell}
                      disabled={!canTrade}
                      type={selectedTab === "buy" ? "primary" : "secondary"}
                      style={modalStyles.tradeButton}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 알림 다이얼로그 */}
      <NotificationDialog
        visible={showDialog}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={() => setShowDialog(false)}
      />
    </SafeAreaView>
  );
};

// 모달 스타일
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  tradeModalContainer: {
    width: "90%",
    backgroundColor: COLORS.background.dark,
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
  itemInfoContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
  },
  itemDetails: {
    marginBottom: SPACING.sm,
  },
  itemStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  tradeControls: {
    marginTop: SPACING.md,
  },
  quantityControl: {
    marginBottom: SPACING.md,
  },
  quantityButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  quantityButton: {
    width: 50,
  },
  quantityText: {
    marginHorizontal: SPACING.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "bold",
  },
  qualityControl: {
    marginBottom: SPACING.md,
  },
  qualityOptions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xs,
  },
  qualityOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: BORDERS.radius.sm,
  },
  selectedQuality: {
    backgroundColor: COLORS.berdan,
    borderColor: COLORS.primary,
  },
  selectedQualityText: {
    fontWeight: "bold",
  },
  tradeSummary: {
    alignItems: "center",
    marginVertical: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: `${COLORS.background.dark}80`,
    borderRadius: BORDERS.radius.sm,
  },
  priceText: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: SPACING.md,
  },
  tradeButton: {
    flex: 1,
  },
});

// MarketScreen.tsx 파일 내에 모달 컴포넌트 추가
const ItemDetailModal = ({
  visible,
  onClose,
  itemId,
  cityId,
}: {
  visible: boolean;
  onClose: () => void;
  itemId: string;
  cityId: string;
}) => {
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
  const graphData = priceHistory.map((entry) => ({
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
      <View style={itemModalStyles.overlay}>
        <View style={itemModalStyles.container}>
          <PixelText variant="subtitle" style={itemModalStyles.title}>
            {itemInfo.name} 시장 정보
          </PixelText>

          <View style={itemModalStyles.infoRow}>
            <PixelText>현재 가격:</PixelText>
            <PixelText style={itemModalStyles.priceText}>{formatGold(marketItem.currentPrice)} 골드</PixelText>
          </View>

          <View style={itemModalStyles.infoRow}>
            <PixelText>기본 가격:</PixelText>
            <PixelText>{formatGold(itemInfo.basePrice)} 골드</PixelText>
          </View>

          <View style={itemModalStyles.infoRow}>
            <PixelText>지역 영향:</PixelText>
            <PixelText>
              {(itemInfo.regionalFactors[city.regionId] || 0) >= 0 ? "+" : ""}
              {((itemInfo.regionalFactors[city.regionId] || 0) * 100).toFixed(0)}%
            </PixelText>
          </View>

          <PixelText style={itemModalStyles.graphTitle}>가격 변동 추이</PixelText>

          {/* 간단한 그래프 표현 */}
          <View style={itemModalStyles.graph}>
            {graphData.length > 0 ? (
              <View style={itemModalStyles.graphContent}>
                {graphData.map((point, index) => {
                  // 최대/최소 가격 찾기
                  const prices = graphData.map((p) => p.price);
                  const maxPrice = Math.max(...prices);
                  const minPrice = Math.min(...prices);
                  const range = maxPrice - minPrice || 1;

                  // 그래프 높이 계산 (60px를 최대 높이로 사용)
                  const height = 10 + ((point.price - minPrice) / range) * 60;

                  return (
                    <View key={index} style={itemModalStyles.graphColumn}>
                      <View
                        style={[
                          itemModalStyles.graphBar,
                          { height, backgroundColor: point.date === "현재" ? COLORS.primary : COLORS.info },
                        ]}
                      />
                      <PixelText variant="caption" style={itemModalStyles.graphLabel}>
                        {point.date}
                      </PixelText>
                    </View>
                  );
                })}
              </View>
            ) : (
              <PixelText style={itemModalStyles.noDataText}>가격 이력 데이터가 없습니다</PixelText>
            )}
          </View>

          <Button title="닫기" onPress={onClose} size="medium" style={itemModalStyles.closeButton} />
        </View>
      </View>
    </Modal>
  );
};

// 아이템 상세 모달 스타일
const itemModalStyles = StyleSheet.create({
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

// 알림 다이얼로그 컴포넌트
const NotificationDialog = ({
  visible,
  type,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={notificationStyles.overlay}>
        <View style={notificationStyles.container}>
          <View
            style={[
              notificationStyles.iconContainer,
              { backgroundColor: type === "success" ? COLORS.berdan : COLORS.danger },
            ]}
          >
            <PixelText variant="subtitle" style={notificationStyles.iconText}>
              {type === "success" ? "✓" : "✗"}
            </PixelText>
          </View>

          <PixelText
            variant="subtitle"
            style={{
              ...notificationStyles.title,
              color: type === "success" ? COLORS.berdan : COLORS.danger,
            }}
          >
            {title}
          </PixelText>

          <PixelText style={notificationStyles.message}>{message}</PixelText>

          <Button
            title="확인"
            onPress={onClose}
            type={type === "success" ? "primary" : "secondary"}
            style={notificationStyles.button}
          />
        </View>
      </View>
    </Modal>
  );
};

// 알림 다이얼로그 스타일
const notificationStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  iconText: {
    color: COLORS.text.light,
    fontSize: 30,
  },
  title: {
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  button: {
    minWidth: 120,
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    opacity: 0.7,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: `${COLORS.background.dark}CC`,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  goldInfo: {
    alignItems: "flex-end",
  },
  goldText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
  },
  tabButton: {
    flex: 1,
    padding: SPACING.md,
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  activeTab: {
    backgroundColor: COLORS.berdan,
  },
  tabText: {
    color: COLORS.text.light,
  },
  activeTabText: {
    color: COLORS.text.light,
    fontWeight: "bold",
  },
  itemList: {
    flex: 1,
    padding: SPACING.md,
    marginBottom: SPACING.lg, // 거래 패널 공간 확보
  },
  emptyText: {
    textAlign: "center",
    marginTop: SPACING.xl,
    color: COLORS.disabled,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: `${COLORS.secondary}CC`,
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.light,
  },
  selectedItem: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.berdan}99`,
  },
  itemInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemName: {
    fontWeight: "bold",
    color: COLORS.text.light,
    marginBottom: SPACING.xs,
  },
  itemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  itemPriceContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.sm,
    backgroundColor: `${COLORS.background.dark}99`,
    borderRadius: BORDERS.radius.sm,
  },
  itemPrice: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: `${COLORS.background.dark}CC`,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
  },
});

export default MarketScreen;
