import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, ImageBackground, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import ConfirmationModal from "../components/ConfirmationModal";
import PixelText from "../components/PixelText";
import InventoryItemComponent from "../components/inventory/InventoryItem";
import { BORDERS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from "../config/theme";
import { ITEMS } from "../data/items";
import { useInventory } from "../hooks/useInventory";
import { InventoryItem, ItemCategory, QUALITY_FACTORS } from "../models";
import { AppNavigationProp } from "../navigation/types";

const InventoryScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const {
    inventory,
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
  } = useInventory();

  const [showDetails, setShowDetails] = useState(false);
  const [dropQuantity, setDropQuantity] = useState(1);
  const [showDropConfirmation, setShowDropConfirmation] = useState(false);
  const [itemToDrop, setItemToDrop] = useState<{ item: InventoryItem | null; quantity: number }>({
    item: null,
    quantity: 1,
  });

  // 카테고리 목록 생성
  const categories = Object.values(ItemCategory).filter((category) =>
    Object.values(groupedInventory).some((items) => items.some((item) => ITEMS[item.itemId]?.category === category))
  );

  // 아이템 상세 모달
  const renderItemDetailModal = () => {
    if (!selectedItem) return null;

    const itemInfo = ITEMS[selectedItem.itemId];
    if (!itemInfo) return null;

    return (
      <Modal visible={showDetails} transparent animationType="fade" onRequestClose={() => setShowDetails(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <PixelText variant="subtitle" style={styles.modalTitle}>
              {itemInfo.name} 상세 정보
            </PixelText>

            <View style={styles.modalContent}>
              <PixelText style={styles.itemDescription}>{itemInfo.description}</PixelText>

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <PixelText variant="caption">카테고리:</PixelText>
                  <PixelText>{getCategoryName(itemInfo.category)}</PixelText>
                </View>

                <View style={styles.detailItem}>
                  <PixelText variant="caption">개당 무게:</PixelText>
                  <PixelText>{itemInfo.weight}</PixelText>
                </View>

                <View style={styles.detailItem}>
                  <PixelText variant="caption">희귀도:</PixelText>
                  <PixelText>{"★".repeat(itemInfo.rarity)}</PixelText>
                </View>

                <View style={styles.detailItem}>
                  <PixelText variant="caption">품질:</PixelText>
                  <PixelText style={{ color: getQualityColor(selectedItem.quality) }}>
                    {getQualityText(selectedItem.quality)}
                  </PixelText>
                </View>

                <View style={styles.detailItem}>
                  <PixelText variant="caption">소지량:</PixelText>
                  <PixelText>{selectedItem.quantity}개</PixelText>
                </View>

                <View style={styles.detailItem}>
                  <PixelText variant="caption">구매가:</PixelText>
                  <PixelText style={{ color: COLORS.primary }}>{selectedItem.purchasePrice}</PixelText>
                </View>
              </View>

              <View style={styles.quantityControl}>
                <PixelText variant="caption">버릴 수량:</PixelText>
                <View style={styles.quantityButtons}>
                  <Button
                    title="-"
                    onPress={() => setDropQuantity(Math.max(1, dropQuantity - 1))}
                    size="small"
                    style={styles.quantityButton}
                  />
                  <PixelText style={styles.quantityText}>{dropQuantity}</PixelText>
                  <Button
                    title="+"
                    onPress={() => setDropQuantity(Math.min(selectedItem.quantity, dropQuantity + 1))}
                    size="small"
                    style={styles.quantityButton}
                  />
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Button
                  title="사용"
                  onPress={() => {
                    handleUseItem(selectedItem);
                    setShowDetails(false);
                  }}
                  size="medium"
                  disabled={!itemInfo.category.includes("PROVISION") && !itemInfo.category.includes("TOOL")}
                  style={styles.actionButton}
                />

                <Button
                  title="버리기"
                  onPress={() => {
                    setItemToDrop({
                      item: selectedItem,
                      quantity: dropQuantity,
                    });
                    setShowDropConfirmation(true);
                    setShowDetails(false);
                  }}
                  type="danger"
                  size="medium"
                  style={styles.actionButton}
                />
              </View>
            </View>

            <Button title="닫기" onPress={() => setShowDetails(false)} type="secondary" />
          </View>
        </View>
      </Modal>
    );
  };

  const renderDropConfirmationModal = () => {
    if (!itemToDrop.item) return null;

    const itemInfo = ITEMS[itemToDrop.item.itemId];
    if (!itemInfo) return null;

    return (
      <ConfirmationModal
        visible={showDropConfirmation}
        title="아이템 버리기"
        message={`${itemInfo.name} ${itemToDrop.quantity}개를 버리시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="버리기"
        cancelText="취소"
        onConfirm={() => {
          if (itemToDrop.item) {
            handleDropItem(itemToDrop.item, itemToDrop.quantity);
            setSelectedItem(null);
          }
          setShowDropConfirmation(false);
        }}
        onCancel={() => {
          setShowDropConfirmation(false);
        }}
      />
    );
  };

  // 정렬 버튼
  const renderSortButtons = () => {
    const sortOptions = [
      { key: "name" as const, label: "이름" },
      { key: "category" as const, label: "종류" },
      { key: "quantity" as const, label: "수량" },
      { key: "weight" as const, label: "무게" },
      { key: "price" as const, label: "가격" },
    ];

    return (
      <ScrollView horizontal style={styles.sortButtonsContainer} showsHorizontalScrollIndicator={false}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.sortButton, sortBy === option.key && styles.activeSortButton]}
            onPress={() => handleSort(option.key)}
          >
            <PixelText style={sortBy === option.key ? styles.activeSortText : styles.sortText}>
              {option.label}
              {sortBy === option.key && (sortAscending ? " ↑" : " ↓")}
            </PixelText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // 카테고리 필터 버튼
  const renderCategoryFilters = () => {
    return (
      <ScrollView horizontal style={styles.categoryFiltersContainer} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.categoryButton, categoryFilter === null && styles.activeCategoryButton]}
          onPress={() => handleCategoryFilter(null)}
        >
          <PixelText style={categoryFilter === null ? styles.activeCategoryText : styles.categoryText}>전체</PixelText>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, categoryFilter === category && styles.activeCategoryButton]}
            onPress={() => handleCategoryFilter(category)}
          >
            <PixelText style={categoryFilter === category ? styles.activeCategoryText : styles.categoryText}>
              {getCategoryName(category)}
            </PixelText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/inventory_background.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <PixelText variant="subtitle">인벤토리</PixelText>
            <View style={styles.weightInfo}>
              <PixelText>
                무게: {weight.toFixed(1)} / {maxWeight}
              </PixelText>
              <View style={styles.weightBarContainer}>
                <View
                  style={[
                    styles.weightBar,
                    { width: `${Math.min(100, weightPercentage)}%` },
                    weightPercentage > 80 && styles.heavyWeightBar,
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.filtersContainer}>
            {renderSortButtons()}
            {renderCategoryFilters()}
          </View>

          {inventory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <PixelText>인벤토리가 비어있습니다.</PixelText>
            </View>
          ) : (
            <FlatList
              data={inventory}
              keyExtractor={(item, index) => `${item.itemId}-${item.quality}-${index}`}
              renderItem={({ item }) => (
                <InventoryItemComponent
                  item={item}
                  itemInfo={ITEMS[item.itemId]}
                  onPress={() => {
                    setSelectedItem(item);
                    setShowDetails(true);
                    setDropQuantity(1);
                  }}
                  isSelected={selectedItem?.itemId === item.itemId && selectedItem?.quality === item.quality}
                  getQualityText={getQualityText}
                  getQualityColor={getQualityColor}
                />
              )}
              style={styles.inventoryList}
              contentContainerStyle={styles.listContent}
            />
          )}

          <View style={styles.footer}>
            <Button title="뒤로가기" onPress={() => navigation.goBack()} size="medium" type="secondary" />
          </View>
        </View>

        {renderItemDetailModal()}
        {renderDropConfirmationModal()}
      </ImageBackground>
    </SafeAreaView>
  );
};

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
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${COLORS.background.dark}CC`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  weightInfo: {
    alignItems: "flex-end",
  },
  weightBarContainer: {
    width: 100,
    height: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: 4,
    marginTop: SPACING.xs,
    overflow: "hidden",
  },
  weightBar: {
    height: "100%",
    backgroundColor: COLORS.berdan,
    borderRadius: 4,
  },
  heavyWeightBar: {
    backgroundColor: COLORS.danger,
  },
  filtersContainer: {
    marginBottom: SPACING.md,
  },
  sortButtonsContainer: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  sortButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.sm,
    marginRight: SPACING.xs,
  },
  activeSortButton: {
    backgroundColor: COLORS.berdan,
  },
  sortText: {
    color: COLORS.text.light,
  },
  activeSortText: {
    color: COLORS.text.light,
    fontWeight: "bold",
  },
  categoryFiltersContainer: {
    flexDirection: "row",
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDERS.radius.sm,
    marginRight: SPACING.xs,
  },
  activeCategoryButton: {
    backgroundColor: COLORS.berdan,
  },
  categoryText: {
    color: COLORS.text.light,
  },
  activeCategoryText: {
    color: COLORS.text.light,
    fontWeight: "bold",
  },
  inventoryList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginTop: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: COLORS.background.dark,
    borderRadius: BORDERS.radius.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    ...SHADOWS.medium,
  },
  modalTitle: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  modalContent: {
    marginBottom: SPACING.lg,
  },
  itemDescription: {
    marginBottom: SPACING.md,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  detailItem: {
    width: "48%",
    backgroundColor: `${COLORS.secondary}80`,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: SPACING.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  quantityControl: {
    alignItems: "center",
    marginVertical: SPACING.md,
    backgroundColor: `${COLORS.secondary}50`,
    padding: SPACING.sm,
    borderRadius: BORDERS.radius.sm,
  },
  quantityButtons: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  quantityButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    marginHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: "bold",
    minWidth: 30,
    textAlign: "center",
  },
});

export default InventoryScreen;
