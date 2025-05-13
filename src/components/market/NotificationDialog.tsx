import React, { memo } from "react";
import { Modal, StyleSheet, View, Animated, Easing } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import PixelText from "../PixelText";
import Button from "../Button";

interface NotificationDialogProps {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

// React.memo로 컴포넌트를 감싸서 불필요한 리렌더링 방지
const NotificationDialog = memo(({ visible, type, title, message, onClose }: NotificationDialogProps) => {
  // 애니메이션 값
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));

  // 모달이 보이면 애니메이션 시작
  React.useEffect(() => {
    if (visible) {
      // 애니메이션 값 초기화
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);

      // 애니메이션 실행
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  // 성능 최적화를 위해 상수 값을 미리 계산
  const backgroundColor = type === "success" ? COLORS.berdan : COLORS.danger;
  const textColor = type === "success" ? COLORS.berdan : COLORS.danger;
  const buttonType = type === "success" ? "primary" : "secondary";
  const iconText = type === "success" ? "✓" : "✗";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <PixelText variant="subtitle" style={styles.iconText}>
              {iconText}
            </PixelText>
          </View>

          <PixelText
            variant="subtitle"
            style={{
              ...styles.title,
              color: textColor,
            }}
          >
            {title}
          </PixelText>

          <PixelText style={styles.message}>{message}</PixelText>

          <Button title="확인" onPress={onClose} type={buttonType} style={styles.button} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

const styles = StyleSheet.create({
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

export default NotificationDialog;
