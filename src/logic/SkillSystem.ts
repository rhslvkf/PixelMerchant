import { DetailedSkills, SkillExperience, SkillType } from "../models/index";

/**
 * 스킬 경험치를 기반으로 상세 스킬 정보 생성
 *
 * @param skills - 스킬 레벨 맵
 * @returns - 상세 스킬 정보
 */
export function createDetailedSkills(skills: Record<SkillType, number>): DetailedSkills {
  const detailed: Partial<DetailedSkills> = {};

  Object.entries(skills).forEach(([skill, level]) => {
    detailed[skill as SkillType] = {
      level,
      currentExp: 0,
      nextLevelExp: calculateExpForNextLevel(level),
    };
  });

  return detailed as DetailedSkills;
}

/**
 * 다음 레벨에 필요한 경험치 계산
 *
 * @param currentLevel - 현재 레벨
 * @returns - 다음 레벨에 필요한 경험치
 */
export function calculateExpForNextLevel(currentLevel: number): number {
  // 간단한 레벨업 공식: 100 * 현재레벨^1.5
  return Math.round(100 * Math.pow(currentLevel, 1.5));
}

/**
 * 스킬 경험치 추가 및 레벨업 처리
 *
 * @param skillExp - 현재 스킬 경험치 정보
 * @param expToAdd - 추가할 경험치
 * @returns - 업데이트된 스킬 경험치 정보
 */
export function addSkillExp(skillExp: SkillExperience, expToAdd: number): SkillExperience {
  let { level, currentExp, nextLevelExp } = skillExp;

  // 경험치 추가
  currentExp += expToAdd;

  // 레벨업 확인
  while (currentExp >= nextLevelExp) {
    currentExp -= nextLevelExp;
    level += 1;
    nextLevelExp = calculateExpForNextLevel(level);
  }

  return {
    level,
    currentExp,
    nextLevelExp,
  };
}

/**
 * 스킬 레벨에 따른 효과 계산
 *
 * @param skillType - 스킬 유형
 * @param level - 스킬 레벨
 * @returns - 효과 값(퍼센트 또는 직접 값)
 */
export function calculateSkillEffect(skillType: SkillType, level: number): number {
  switch (skillType) {
    case SkillType.TRADE:
      // 거래 이익 증가 (레벨 * 2%)
      return level * 0.02;
    case SkillType.LOGISTICS:
      // 이동 속도 증가 (레벨 * 5%)
      return level * 0.05;
    case SkillType.INSIGHT:
      // 시장 정보 정확도 (레벨 * 3%)
      return level * 0.03;
    case SkillType.DIPLOMACY:
      // 평판 획득 증가 (레벨 * 4%)
      return level * 0.04;
    case SkillType.EXPLORATION:
      // 여행 이벤트 조정 (레벨 * 3%)
      return level * 0.03;
    default:
      return 0;
  }
}
