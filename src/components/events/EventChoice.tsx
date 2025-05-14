import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { BORDERS, COLORS, SPACING, TYPOGRAPHY } from "../../config/theme";
import { EventChoice as EventChoiceType, SkillType } from "../../models";
import PixelText from "../PixelText";

interface EventChoiceProps {
  choice: EventChoiceType;
  isSelected: boolean;
  canSelect: boolean;
  onSelect: (choiceId: string) => void;
}

const EventChoice: React.FC<EventChoiceProps> = ({ choice, isSelected, canSelect, onSelect }) => {
  const getSkillName = (skill: SkillType): string => {
    const skillNames: Record<SkillType, string> = {
      [SkillType.TRADE]: "거래",
      [SkillType.LOGISTICS]: "물류",
      [SkillType.INSIGHT]: "통찰",
      [SkillType.DIPLOMACY]: "외교",
      [SkillType.EXPLORATION]: "탐험",
    };
    return skillNames[skill] || String(skill);
  };

  // 아이템 이름 가져오기 (기존 코드 유지)
  const getItemName = (itemId: string): string => {
    const itemNames: Record<string, string> = {
      wheat: "밀",
      cotton: "목화",
      iron_ore: "철광석",
      silk: "비단",
      spices: "향신료",
      wine: "포도주",
      gemstones: "보석",
      leather: "가죽",
      pottery: "도자기",
      herbs: "약초",
    };
    return itemNames[itemId] || itemId;
  };

  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer, !canSelect && styles.disabledContainer]}
      onPress={() => canSelect && onSelect(choice.id)}
      disabled={!canSelect}
    >
      {/* PixelText에 명시적으로 스타일을 주어 가시성을 확보합니다. */}
      <PixelText style={[styles.text, !canSelect && styles.disabledText]}>
        {choice.text || "선택지 텍스트 누락"} {/* choice.text가 없을 경우를 대비한 기본값 */}
      </PixelText>

      {/* 요구 사항 표시 */}
      {(choice.requiredSkill || choice.requiredItem) && ( // 조건부 렌더링 추가
        <View style={styles.requirementsContainer}>
          {choice.requiredSkill && (
            <PixelText
              variant="caption"
              style={[
                styles.requirementText,
                // canSelect는 이미 상위에서 스킬/아이템 조건을 만족했을 때 true가 됩니다.
                // 여기서는 스킬 자체의 충족 여부를 다시 한번 확인하는 것이 좋을 수 있지만,
                // useEvents의 canSelectChoice 로직에 의존한다면 canSelect로 통일해도 됩니다.
                // 편의상 canSelect를 그대로 사용합니다.
                canSelect ? styles.metRequirement : styles.unmetRequirement,
              ]}
            >
              {getSkillName(choice.requiredSkill.skill)} Lv.{choice.requiredSkill.level} 필요
            </PixelText>
          )}

          {choice.requiredItem && (
            <PixelText
              variant="caption"
              style={[styles.requirementText, canSelect ? styles.metRequirement : styles.unmetRequirement]}
            >
              {getItemName(choice.requiredItem)} 필요
            </PixelText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.secondary, // 배경색은 네이비 계열
    borderRadius: BORDERS.radius.md,
    borderWidth: 1,
    borderColor: COLORS.primary, // 테두리 색을 primary(골드)로 변경하여 구분
    padding: SPACING.md,
    marginBottom: SPACING.md,
    minHeight: 50, // 최소 높이를 지정하여 내용이 없어도 공간을 차지하도록 함
    justifyContent: "center", // 내부 텍스트 수직 중앙 정렬 (선택 사항)
  },
  selectedContainer: {
    backgroundColor: COLORS.berdan, // 선택 시 배경색 변경 (기존 유지)
    borderColor: COLORS.primary, // 선택 시 테두리 색 유지
  },
  disabledContainer: {
    opacity: 0.7,
    backgroundColor: `${COLORS.secondary}80`,
    borderColor: COLORS.disabled, // 비활성화 시 테두리 색 변경
  },
  text: {
    color: COLORS.text.light, // 텍스트 색상을 밝은 색으로 명시 (기존 유지)
    fontSize: TYPOGRAPHY.fontSize.md, // 폰트 크기 명시 (theme.ts 참조)
    textAlign: "center", // 텍스트 중앙 정렬 (선택 사항)
  },
  disabledText: {
    color: COLORS.disabled, // 비활성화 시 텍스트 색상 (기존 유지)
  },
  requirementsContainer: {
    marginTop: SPACING.xs,
    alignItems: "center", // 요구사항 텍스트 중앙 정렬
  },
  requirementText: {
    marginTop: SPACING.xs,
    fontSize: TYPOGRAPHY.fontSize.sm, // 요구사항 폰트 크기 명시
  },
  metRequirement: {
    color: COLORS.success, // 충족 시 색상 (기존 유지)
  },
  unmetRequirement: {
    color: COLORS.danger, // 미충족 시 색상 (기존 유지)
  },
});

export default EventChoice;
