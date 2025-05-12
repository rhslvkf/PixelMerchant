import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image, ImageBackground, Modal, ScrollView, StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { ITEMS } from "../data/items";
import { calculatePlayerSellingPrice } from "../logic/EconomySystem";
import { ItemQuality, MarketItem, QUALITY_FACTORS } from "../models/types";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";
import { formatGold } from "../utils/formatting";

const MarketScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { state, dispatch } = useGame();
  const [selectedTab, setSelectedTab] = useState<"buy" | "sell">("buy");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [quality, setQuality] = useState<ItemQuality>(ItemQuality.MEDIUM);
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
      if (item) {
        // 현재 선택된 품질의 재고만 고려
        const availableStock = getStockForQuality(item, quality);
        // 항상 재고 확인
        if (quantity < availableStock) {
          setQuantity(quantity + 1);
        }
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

    // 구매 액션 디스패치
    dispatch({
      type: "BUY_ITEM",
      payload: {
        itemId: selectedItem,
        quantity,
        cityId: state.currentCityId,
        quality, // ItemQuality 타입으로 전달
      },
    });

    showNotification("success", "구매 성공", `${ITEMS[selectedItem]?.name} ${quantity}개를 구매했습니다.`);
    setSelectedItem(null);
    setQuantity(1);
  };

  // 아이템 판매
  const handleSell = () => {
    if (!selectedItem) return;

    // 인벤토리에서 선택한 아이템 찾기
    const inventoryItemIndex = state.player.inventory.findIndex((item) => item.itemId === selectedItem);
    const inventoryItem = state.player.inventory[inventoryItemIndex];

    if (!inventoryItem) return;

    // 판매 액션 디스패치
    dispatch({
      type: "SELL_ITEM",
      payload: {
        itemId: selectedItem,
        quantity,
        cityId: state.currentCityId,
        inventoryIndex: inventoryItemIndex, // 정확한 인벤토리 아이템 인덱스 전달
      },
    });

    showNotification("success", "판매 성공", `${ITEMS[selectedItem]?.name} ${quantity}개를 판매했습니다.`);
    setSelectedItem(null);
    setQuantity(1);
  };

  // 거래 버튼 활성화 여부
  const canTrade = selectedItem !== null && quantity > 0;

  // 골드 부족 여부 확인
  const isGoldInsufficient = () => {
    if (selectedTab === "buy" && selectedItem) {
      const marketItem = marketItems.find((item) => item.itemId === selectedItem);
      if (marketItem) {
        const qualityFactor = QUALITY_FACTORS[quality];
        const totalCost = marketItem.currentPrice * quantity * qualityFactor;
        return state.player.gold < totalCost;
      }
    }
    return false;
  };

  // 선택된 아이템의 총 가치 계산
  const calculateTotalValue = () => {
    if (!selectedItem) return 0;

    if (selectedTab === "buy") {
      const marketItem = marketItems.find((item) => item.itemId === selectedItem);
      if (marketItem) {
        // 품질 계수 적용한 가격 계산
        const qualityFactor = QUALITY_FACTORS[quality];
        return marketItem.currentPrice * quantity * qualityFactor;
      }
      return 0;
    } else {
      // 판매 로직은 이전과 비슷하게 유지
      const marketItem = marketItems.find((item) => item.itemId === selectedItem);
      const inventoryItem = state.player.inventory.find((item) => item.itemId === selectedItem);

      if (marketItem && inventoryItem) {
        // 인벤토리 아이템의 품질은 이미 적용되어 있음
        return calculatePlayerSellingPrice(marketItem.currentPrice, state.player, currentCity) * quantity;
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
      // 시장에 있는 아이템은 스프레드 적용 가격
      sellPrice = calculatePlayerSellingPrice(marketItem.currentPrice, state.player, currentCity);
    } else {
      // 시장에 없는 아이템은 구매가의 70%로 판매
      sellPrice = inventoryItem.purchasePrice * 0.7;
    }

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
      </TouchableOpacity>
    );
  };

  // 현재 판매 수수료 비율 계산
  const calculateFeePercentage = () => {
    // 기본 수수료 20%에서 평판 및 거래 기술 효과 차감
    const reputationEffect = getReputationEffect();
    const tradeSkillEffect = getTradeSkillEffect();
    return Math.max(5, 20 - reputationEffect - tradeSkillEffect);
  };

  // 평판에 따른 수수료 감소 효과
  const getReputationEffect = () => {
    const reputationLevel = state.player.reputation[currentCity.id] || 0;
    return reputationLevel * 2;
  };

  // 거래 기술에 따른 수수료 감소 효과
  const getTradeSkillEffect = () => {
    const tradeSkillLevel = state.player.skills.trade || 0;
    return tradeSkillLevel * 1;
  };

  // 품질 변경 핸들러 - 품질 변경 시 수량 초기화
  const handleQualityChange = (newQuality: ItemQuality) => {
    // 다른 품질로 변경될 때만 수량 초기화
    if (quality !== newQuality) {
      setQuality(newQuality);
      setQuantity(1); // 수량 1로 초기화
    }
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
                          재고: {marketItems.find((i) => i.itemId === selectedItem)?.qualityStock[quality] || 0}개
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
                        {/* 저급 품질 옵션 */}
                        <TouchableOpacity
                          onPress={() => {
                            setQuality(ItemQuality.LOW);
                            setQuantity(1);
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
                            setQuality(ItemQuality.MEDIUM);
                            setQuantity(1);
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
                            setQuality(ItemQuality.HIGH);
                            setQuantity(1);
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
                          style={getReputationEffect() > 0 ? modalStyles.bonusText : modalStyles.normalText}
                        >
                          평판 보너스: -{getReputationEffect()}%
                        </PixelText>
                        <PixelText
                          variant="caption"
                          style={getTradeSkillEffect() > 0 ? modalStyles.bonusText : modalStyles.normalText}
                        >
                          거래 기술 보너스: -{getTradeSkillEffect()}%
                        </PixelText>
                        <PixelText
                          variant="caption"
                          style={{ ...modalStyles.priceInfoText, ...modalStyles.finalFeeText }}
                        >
                          최종 수수료: {calculateFeePercentage()}%
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
            <PixelText>재고 현황:</PixelText>
            <PixelText>
              저급({marketItem.qualityStock.low}) / 보통({marketItem.qualityStock.medium}) / 고급(
              {marketItem.qualityStock.high})
            </PixelText>
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
    flexDirection: "row",
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
  currencyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.sm,
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
