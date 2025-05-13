import { FactionReputation, ReputationLevel } from "../models/index";

/**
 * 다음 평판 레벨에 필요한 포인트 계산
 *
 * @param currentLevel - 현재 평판 레벨
 * @returns - 다음 레벨에 필요한 포인트
 */
export function calculatePointsForNextLevel(currentLevel: ReputationLevel): number {
  // 기본값: 레벨이 높을수록 더 많은 포인트 필요
  switch (currentLevel) {
    case ReputationLevel.HATED:
      return 100; // 미움에서 싫음으로 올라가는데 필요한 포인트
    case ReputationLevel.DISLIKED:
      return 200; // 싫음에서 중립으로 올라가는데 필요한 포인트
    case ReputationLevel.NEUTRAL:
      return 300; // 중립에서 호감으로 올라가는데 필요한 포인트
    case ReputationLevel.LIKED:
      return 500; // 호감에서 신뢰로 올라가는데 필요한 포인트
    case ReputationLevel.TRUSTED:
      return 800; // 신뢰에서 숭배로 올라가는데 필요한 포인트
    case ReputationLevel.ADMIRED:
      return 1200; // 숭배에서 존경으로 올라가는데 필요한 포인트
    case ReputationLevel.REVERED:
      return Infinity; // 존경은 최고 레벨
    default:
      return 300;
  }
}

/**
 * 평판 포인트 추가 및 레벨 업데이트
 *
 * @param reputation - 현재 평판 정보
 * @param pointsToAdd - 추가할 포인트
 * @returns - 업데이트된 평판 정보
 */
export function updateReputation(reputation: FactionReputation, pointsToAdd: number): FactionReputation {
  let { level, points, nextLevelPoints } = reputation;

  // 포인트 추가
  points += pointsToAdd;

  // 포인트가 음수가 되면 레벨 하락 가능
  while (points < 0 && level > ReputationLevel.HATED) {
    level = (level - 1) as ReputationLevel;
    nextLevelPoints = calculatePointsForNextLevel(level);
    points += nextLevelPoints; // 이전 레벨의 포인트 한도 추가
  }

  // 포인트가 음수면 최소 0으로 설정 (HATED 레벨에서)
  if (points < 0 && level === ReputationLevel.HATED) {
    points = 0;
  }

  // 레벨업 확인
  while (points >= nextLevelPoints && level < ReputationLevel.REVERED) {
    points -= nextLevelPoints;
    level = (level + 1) as ReputationLevel;
    nextLevelPoints = calculatePointsForNextLevel(level);
  }

  return {
    factionId: reputation.factionId,
    level,
    points,
    nextLevelPoints,
  };
}

/**
 * 평판 레벨에 따른 상점 할인율 계산
 *
 * @param level - 평판 레벨
 * @returns - 할인율 (0-0.2)
 */
export function calculateReputationDiscount(level: ReputationLevel): number {
  switch (level) {
    case ReputationLevel.HATED:
      return -0.2; // 20% 할증
    case ReputationLevel.DISLIKED:
      return -0.1; // 10% 할증
    case ReputationLevel.NEUTRAL:
      return 0; // 기본 가격
    case ReputationLevel.LIKED:
      return 0.05; // 5% 할인
    case ReputationLevel.TRUSTED:
      return 0.1; // 10% 할인
    case ReputationLevel.ADMIRED:
      return 0.15; // 15% 할인
    case ReputationLevel.REVERED:
      return 0.2; // 20% 할인
    default:
      return 0;
  }
}

/**
 * 새로운 세력과의 평판 초기화
 *
 * @param factionId - 세력 ID
 * @returns - 기본 평판 상태
 */
export function initializeFactionReputation(factionId: string): FactionReputation {
  return {
    factionId,
    level: ReputationLevel.NEUTRAL,
    points: 0,
    nextLevelPoints: calculatePointsForNextLevel(ReputationLevel.NEUTRAL),
  };
}
