import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import ItemDetailModal from "../components/market/ItemDetailModal";
import NotificationDialog from "../components/market/NotificationDialog";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { ITEMS } from "../data/items";
import { useMarketLogic } from "../hooks/useMarketLogic";
import { ItemQuality, MarketItem, QUALITY_FACTORS } from "../models";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";
import { calculatePlayerSellingPrice } from "../logic/EconomySystem";

const MarketScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { state } = useGame();

  // 리팩토링: 커스텀 훅으로 로직 분리
  const marketLogic = useMarketLogic();

  // 상세 정보 모달 관련 상태
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailItem, setDetailItem] = useState<string | null>(null);

  const {
    selectedTab,
    selectedItem,
    quantity,
    quality,
    currentCity,
    marketItems,
    showDialog,
    dialogType,
    dialogTitle,
    dialogMessage,
    getQualityColor,
    getQualityText,
    getItemQualityEnum,
    increaseQuantity,
    decreaseQuantity,
    handleBuy,
    handleSell,
    canTrade,
    isGoldInsufficient,
    calculateTotalValue,
    getStockForQuality,
    setSelectedTab,
    setSelectedItem,
    closeDialog,
  } = marketLogic;

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
            <PixelText variant="caption">
              재고: 저급({item.qualityStock.low}) / 보통({item.qualityStock.medium}) / 고급({item.qualityStock.high})
            </PixelText>
            <PixelText variant="caption">무게: {itemInfo.weight}/개</PixelText>
          </View>
        </View>
        <View style={styles.itemPriceContainer}>
          <Image source={require("../assets/images/gold_coin.webp")} style={styles.coinIcon} />
          <PixelText style={styles.itemPrice}>{item.currentPrice}</PixelText>
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
    let sellPrice;

    if (marketItem) {
      const itemQuality = getItemQualityEnum(inventoryItem.quality);
      sellPrice = calculatePlayerSellingPrice(
        marketItem.currentPrice * QUALITY_FACTORS[itemQuality],
        state.player,
        currentCity
      );
    } else {
      // 시장에 없는 아이템은 구매가의 70%로 판매
      sellPrice = inventoryItem.purchasePrice * 0.7;
    }

    return (
      <TouchableOpacity
        key={inventoryItem.itemId + inventoryItem.quality}
        style={[styles.itemContainer, isSelected && styles.selectedItem]}
        onPress={() => {
          setSelectedItem(inventoryItem.itemId);
          marketLogic.setQuantity(1);
          marketLogic.setQuality(getItemQualityEnum(inventoryItem.quality));
        }}
        onLongPress={() => {
          setDetailItem(inventoryItem.itemId);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.itemInfo}>
          <View style={styles.itemNameContainer}>
            <PixelText style={styles.itemName}>{itemInfo.name}</PixelText>
          </View>
          <PixelText variant="caption">{itemInfo.description}</PixelText>
          <View style={styles.itemStats}>
            <PixelText variant="caption">보유: {inventoryItem.quantity}개</PixelText>
            <PixelText variant="caption">무게: {itemInfo.weight}/개</PixelText>
            <PixelText variant="caption" style={getQualityColor(inventoryItem.quality)}>
              품질: {getQualityText(inventoryItem.quality)}
            </PixelText>
          </View>
        </View>
        <View style={styles.itemPriceContainer}>
          <View style={styles.verticalCurrencyContainer}>
            {Math.floor(sellPrice) > 0 && (
              <View style={styles.currencyItem}>
                <Image source={require("../assets/images/gold_coin.webp")} style={styles.coinIcon} />
                <PixelText style={styles.goldText}>{Math.floor(sellPrice)}</PixelText>
              </View>
            )}
            {Math.floor((sellPrice % 1) * 100) > 0 && (
              <View style={styles.currencyItem}>
                <Image source={require("../assets/images/silver_coin.webp")} style={styles.coinIcon} />
                <PixelText style={styles.silverText}>{Math.floor((sellPrice % 1) * 100)}</PixelText>
              </View>
            )}
          </View>
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
          <View style={styles.currencyContainer}>
            <View style={styles.currencyItem}>
              <Image source={require("../assets/images/gold_coin.webp")} style={styles.coinIcon} />
              <PixelText style={styles.goldText}>{Math.floor(state.player.gold)}</PixelText>
            </View>
            <View style={styles.currencyItem}>
              <Image source={require("../assets/images/silver_coin.webp")} style={styles.coinIcon} />
              <PixelText style={styles.silverText}>{Math.floor((state.player.gold % 1) * 100)}</PixelText>
            </View>
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

      {/* 아이템 상세 정보 모달 - 리팩토링: 컴포넌트 분리 */}
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
                      {/* 판매 시 품질 정보를 별도 row로 표시 */}
                      {selectedTab === "sell" && state.player.inventory.find((i) => i.itemId === selectedItem) && (
                        <PixelText variant="caption" style={getQualityColor(QUALITY_FACTORS[quality])}>
                          품질: {getQualityText(QUALITY_FACTORS[quality])}
                        </PixelText>
                      )}
                      {selectedTab === "buy" ? (
                        <PixelText variant="caption">
                          재고: {marketItems.find((i) => i.itemId === selectedItem)?.qualityStock[quality] || 0}개
                        </PixelText>
                      ) : (
                        <PixelText variant="caption">
                          보유:{" "}
                          {state.player.inventory.find(
                            (i) => i.itemId === selectedItem && i.quality === QUALITY_FACTORS[quality]
                          )?.quantity || 0}
                          개
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
                        {/* 저급 품질 옵션 */}
                        <TouchableOpacity
                          onPress={() => {
                            marketLogic.handleQualityChange(ItemQuality.LOW);
                          }}
                          style={[
                            modalStyles.qualityOption,
                            quality === ItemQuality.LOW && modalStyles.selectedQuality,
                            getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.LOW
                            ) < 1 && modalStyles.disabledQuality,
                          ]}
                          disabled={
                            getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.LOW
                            ) < 1
                          }
                        >
                          {/* 조건부 스타일을 분리하여 적용 */}
                          {quality === ItemQuality.LOW ? (
                            <PixelText style={modalStyles.selectedQualityText}>
                              저급 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.LOW
                              )}
                              )
                            </PixelText>
                          ) : getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.LOW
                            ) < 1 ? (
                            <PixelText style={modalStyles.disabledText}>
                              저급 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.LOW
                              )}
                              )
                            </PixelText>
                          ) : (
                            <PixelText>
                              저급 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.LOW
                              )}
                              )
                            </PixelText>
                          )}
                        </TouchableOpacity>

                        {/* 보통 품질 옵션 */}
                        <TouchableOpacity
                          onPress={() => {
                            marketLogic.handleQualityChange(ItemQuality.MEDIUM);
                          }}
                          style={[
                            modalStyles.qualityOption,
                            quality === ItemQuality.MEDIUM && modalStyles.selectedQuality,
                            getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.MEDIUM
                            ) < 1 && modalStyles.disabledQuality,
                          ]}
                          disabled={
                            getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.MEDIUM
                            ) < 1
                          }
                        >
                          {/* 조건부 스타일을 분리하여 적용 */}
                          {quality === ItemQuality.MEDIUM ? (
                            <PixelText style={modalStyles.selectedQualityText}>
                              보통 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.MEDIUM
                              )}
                              )
                            </PixelText>
                          ) : getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.MEDIUM
                            ) < 1 ? (
                            <PixelText style={modalStyles.disabledText}>
                              보통 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.MEDIUM
                              )}
                              )
                            </PixelText>
                          ) : (
                            <PixelText>
                              보통 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.MEDIUM
                              )}
                              )
                            </PixelText>
                          )}
                        </TouchableOpacity>

                        {/* 고급 품질 옵션 */}
                        <TouchableOpacity
                          onPress={() => {
                            marketLogic.handleQualityChange(ItemQuality.HIGH);
                          }}
                          style={[
                            modalStyles.qualityOption,
                            quality === ItemQuality.HIGH && modalStyles.selectedQuality,
                            getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.HIGH
                            ) < 1 && modalStyles.disabledQuality,
                          ]}
                          disabled={
                            getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.HIGH
                            ) < 1
                          }
                        >
                          {/* 조건부 스타일을 분리하여 적용 */}
                          {quality === ItemQuality.HIGH ? (
                            <PixelText style={modalStyles.selectedQualityText}>
                              고급 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.HIGH
                              )}
                              )
                            </PixelText>
                          ) : getStockForQuality(
                              marketItems.find((i) => i.itemId === selectedItem) ||
                                ({ qualityStock: {} } as MarketItem),
                              ItemQuality.HIGH
                            ) < 1 ? (
                            <PixelText style={modalStyles.disabledText}>
                              고급 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.HIGH
                              )}
                              )
                            </PixelText>
                          ) : (
                            <PixelText>
                              고급 (
                              {getStockForQuality(
                                marketItems.find((i) => i.itemId === selectedItem) ||
                                  ({ qualityStock: {} } as MarketItem),
                                ItemQuality.HIGH
                              )}
                              )
                            </PixelText>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  <View style={modalStyles.tradeSummary}>
                    <View style={modalStyles.priceContainer}>
                      <PixelText variant="body" style={modalStyles.priceText}>
                        총 가치:
                      </PixelText>
                      <View style={modalStyles.coinValueContainer}>
                        {Math.floor(calculateTotalValue()) > 0 && (
                          <View style={styles.currencyItem}>
                            <Image source={require("../assets/images/gold_coin.webp")} style={styles.coinIcon} />
                            <PixelText style={styles.goldText}>{Math.floor(calculateTotalValue())}</PixelText>
                          </View>
                        )}
                        {Math.floor((calculateTotalValue() % 1) * 100) > 0 && (
                          <View style={styles.currencyItem}>
                            <Image source={require("../assets/images/silver_coin.webp")} style={styles.coinIcon} />
                            <PixelText style={styles.silverText}>
                              {Math.floor((calculateTotalValue() % 1) * 100)}
                            </PixelText>
                          </View>
                        )}
                      </View>
                    </View>
                    {selectedTab === "sell" && marketItems.find((item) => item.itemId === selectedItem) && (
                      <View style={modalStyles.priceInfoContainer}>
                        <PixelText variant="caption" style={modalStyles.priceInfoText}>
                          기본 판매수수료: 20%
                        </PixelText>
                        <PixelText
                          variant="caption"
                          style={marketLogic.getReputationEffect() > 0 ? modalStyles.bonusText : modalStyles.normalText}
                        >
                          평판 보너스: {marketLogic.getReputationEffect() > 0 ? "-" : ""}
                          {marketLogic.getReputationEffect()}%
                        </PixelText>
                        <PixelText
                          variant="caption"
                          style={marketLogic.getTradeSkillEffect() > 0 ? modalStyles.bonusText : modalStyles.normalText}
                        >
                          거래 기술 보너스: {marketLogic.getTradeSkillEffect() > 0 ? "-" : ""}
                          {marketLogic.getTradeSkillEffect()}%
                        </PixelText>
                        <PixelText
                          variant="caption"
                          style={{ ...modalStyles.priceInfoText, ...modalStyles.finalFeeText }}
                        >
                          최종 수수료: {marketLogic.calculateFeePercentage()}%
                        </PixelText>
                      </View>
                    )}
                  </View>

                  <View style={modalStyles.actionButtons}>
                    <Button
                      title="취소"
                      onPress={() => setSelectedItem(null)}
                      type="secondary"
                      style={modalStyles.cancelButton}
                    />
                    <Button
                      title={selectedTab === "buy" ? (isGoldInsufficient() ? "재화 부족" : "구매") : "판매"}
                      onPress={selectedTab === "buy" ? handleBuy : handleSell}
                      disabled={!canTrade || (selectedTab === "buy" && isGoldInsufficient())}
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

      {/* 알림 다이얼로그 - 리팩토링: 컴포넌트 분리 */}
      <NotificationDialog
        visible={showDialog}
        type={dialogType}
        title={dialogTitle}
        message={dialogMessage}
        onClose={closeDialog}
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
    flexWrap: "wrap",
  },
  qualityInfoRow: {
    marginTop: SPACING.xs,
    alignItems: "center",
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
  priceInfoContainer: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    padding: SPACING.xs,
    backgroundColor: `${COLORS.background.dark}80`,
    borderRadius: BORDERS.radius.sm,
  },
  priceInfoText: {
    textAlign: "center",
    marginVertical: 2,
  },
  bonusText: {
    color: COLORS.success,
    textAlign: "center",
    marginVertical: 2,
  },
  normalText: {
    textAlign: "center",
    marginVertical: 2,
    color: COLORS.text.light,
  },
  finalFeeText: {
    fontWeight: "bold",
    marginTop: SPACING.xs,
    color: COLORS.info,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  coinValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.xs,
  },
  disabledQuality: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.text.dark,
    opacity: 0.7,
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
  itemNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  itemName: {
    fontWeight: "bold",
    color: COLORS.text.light,
    marginRight: SPACING.xs,
  },
  itemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  itemPriceContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: SPACING.sm,
    backgroundColor: `${COLORS.background.dark}99`,
    borderRadius: BORDERS.radius.sm,
  },
  verticalCurrencyContainer: {
    flexDirection: "column",
    alignItems: "center",
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
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  goldText: {
    color: COLORS.gold,
    fontWeight: "bold",
  },
  silverText: {
    color: COLORS.silver,
    fontWeight: "bold",
  },
});

export default MarketScreen;
