import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { InventoryItem as InventoryItemType, Item } from "../../models";
import PixelText from "../PixelText";

interface InventoryItemProps {
  item: InventoryItemType;
  itemInfo: Item;
  onPress: (item: InventoryItemType) => void;
  onLongPress?: (item: InventoryItemType) => void;
  isSelected?: boolean;
  getQualityText: (quality: number) => string;
  getQualityColor: (quality: number) => string;
}

const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  itemInfo,
  onPress,
  onLongPress,
  isSelected = false,
  getQualityText,
  getQualityColor,
}) => {
  // 품질 텍스트 및 색상
  const qualityText = getQualityText(item.quality);
  const qualityColor = getQualityColor(item.quality);

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={() => onPress(item)}
      onLongPress={() => onLongPress && onLongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        <PixelText style={styles.itemName}>{itemInfo.name}</PixelText>
        <PixelText variant="caption" style={styles.itemDescription}>
          {itemInfo.description}
        </PixelText>

        <View style={styles.itemDetails}>
          <View style={styles.detailItem}>
            <PixelText variant="caption">수량:</PixelText>
            <PixelText>{item.quantity}</PixelText>
          </View>

          <View style={styles.detailItem}>
            <PixelText variant="caption">무게:</PixelText>
            <PixelText>{(itemInfo.weight * item.quantity).toFixed(1)}</PixelText>
          </View>

          <View style={styles.detailItem}>
            <PixelText variant="caption">품질:</PixelText>
            <PixelText style={{ color: qualityColor }}>{qualityText}</PixelText>
          </View>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <PixelText variant="caption">구매가:</PixelText>
        <PixelText style={styles.priceText}>{item.purchasePrice}</PixelText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: `${COLORS.secondary}CC`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    ...SHADOWS.light,
  },
  selectedContainer: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.berdan}99`,
  },
  mainContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  itemName: {
    fontWeight: "bold",
    color: COLORS.text.light,
  },
  itemDescription: {
    marginVertical: SPACING.xs,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  detailItem: {
    alignItems: "center",
  },
  priceContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.sm,
    backgroundColor: `${COLORS.background.dark}99`,
    borderRadius: BORDERS.radius.sm,
  },
  priceText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default InventoryItem;
