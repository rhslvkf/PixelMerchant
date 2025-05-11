import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import { SCREENS } from "../config/constants";
import { COLORS, SPACING, TYPOGRAPHY } from "../config/theme";
import { SkillType } from "../models/types";
import { AppNavigationProp } from "../navigation/types";
import { useGame } from "../state/GameContext";

// 스킬 타입을 한글로 매핑하는 객체
const skillTypeToKorean = {
  [SkillType.TRADE]: "거래",
  [SkillType.LOGISTICS]: "물류",
  [SkillType.INSIGHT]: "통찰",
  [SkillType.DIPLOMACY]: "외교",
  [SkillType.EXPLORATION]: "탐험",
};

const CharacterCreationScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const { dispatch } = useGame();
  const [playerName, setPlayerName] = useState("");
  const [selectedBackground, setSelectedBackground] = useState<string>("merchant");

  const backgrounds = [
    {
      id: "merchant",
      name: "상인 가문",
      description: "명망 있는 상인 가문에서 태어나 무역의 기초를 배웠습니다.",
      bonusSkill: SkillType.TRADE,
    },
    {
      id: "explorer",
      name: "탐험가",
      description: "다양한 지역을 여행하며 경험을 쌓아왔습니다.",
      bonusSkill: SkillType.EXPLORATION,
    },
    {
      id: "diplomat",
      name: "외교관",
      description: "다양한 문화와 사람들과 소통하는 능력이 뛰어납니다.",
      bonusSkill: SkillType.DIPLOMACY,
    },
    {
      id: "caravan",
      name: "대상단",
      description: "대규모 상단에서 물류 관리를 담당했습니다.",
      bonusSkill: SkillType.LOGISTICS,
    },
    {
      id: "scholar",
      name: "학자",
      description: "시장과 경제 원리에 대한 이론적 지식이 풍부합니다.",
      bonusSkill: SkillType.INSIGHT,
    },
  ];

  const handleStartGame = () => {
    if (!playerName.trim()) {
      Alert.alert("이름을 입력하세요", "캐릭터 이름은 필수입니다.");
      return;
    }

    // 새 게임 시작 액션 디스패치
    dispatch({
      type: "START_NEW_GAME",
      payload: {
        playerName: playerName.trim(),
      },
    });

    // 시작 도시로 이동 - 타입 캐스팅 제거하고 문자열 직접 사용
    navigation.navigate("City");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PixelText variant="title" style={styles.title}>
          캐릭터 생성
        </PixelText>

        <View style={styles.nameInputContainer}>
          <PixelText>이름</PixelText>
          <TextInput
            style={styles.nameInput}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="상인의 이름을 입력하세요"
            placeholderTextColor={COLORS.disabled}
            maxLength={16}
          />
        </View>

        <PixelText style={styles.sectionTitle}>배경 선택</PixelText>
        <PixelText variant="caption" style={styles.description}>
          당신의 과거가 무역 여정의 시작점을 결정합니다.
        </PixelText>

        <ScrollView style={styles.backgroundList}>
          {backgrounds.map((bg) => (
            <TouchableOpacity
              key={bg.id}
              style={[styles.backgroundItem, selectedBackground === bg.id && styles.selectedBackground]}
              onPress={() => setSelectedBackground(bg.id)}
            >
              <View style={styles.backgroundHeader}>
                <PixelText style={styles.backgroundName}>{bg.name}</PixelText>
                <PixelText variant="caption" style={styles.bonusText}>
                  +{skillTypeToKorean[bg.bonusSkill]} 보너스
                </PixelText>
              </View>
              <PixelText variant="caption" style={styles.backgroundDescription}>
                {bg.description}
              </PixelText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button title="게임 시작" onPress={handleStartGame} size="large" disabled={!playerName.trim()} />
          <Button
            title="뒤로 가기"
            onPress={() => navigation.goBack()}
            size="medium"
            type="secondary"
            style={styles.backButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  nameInputContainer: {
    marginBottom: SPACING.lg,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    padding: SPACING.md,
    color: COLORS.text.light,
    marginTop: SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.base,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  description: {
    marginBottom: SPACING.md,
  },
  backgroundList: {
    marginBottom: SPACING.lg,
  },
  backgroundItem: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 4,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  selectedBackground: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.secondary}40`,
  },
  backgroundHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  backgroundName: {
    fontWeight: "bold",
  },
  bonusText: {
    color: COLORS.success,
  },
  backgroundDescription: {
    color: COLORS.text.light,
  },
  buttonContainer: {
    marginTop: SPACING.md,
  },
  backButton: {
    marginTop: SPACING.md,
  },
});

export default CharacterCreationScreen;
