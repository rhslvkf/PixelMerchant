import {
  GameEvent,
  EventTriggerCondition,
  Player,
  GameDate,
  EventOutcome,
  EventEffect,
  SkillType,
  City,
} from "../models/types";

/**
 * 이벤트 발생 조건 확인
 *
 * @param event - 이벤트 정보
 * @param player - 플레이어 정보
 * @param currentDate - 현재 게임 날짜
 * @param currentCity - 현재 도시
 * @returns - 이벤트 발생 가능 여부
 */
export function checkEventTriggerConditions(
  event: GameEvent,
  player: Player,
  currentDate: GameDate,
  currentCity: City
): boolean {
  const { triggerConditions } = event;

  // 위치 조건 확인
  if (
    triggerConditions.locations &&
    !triggerConditions.locations.includes(currentCity.id) &&
    !triggerConditions.locations.includes(currentCity.regionId)
  ) {
    return false;
  }

  // 평판 조건 확인
  if (triggerConditions.minReputation) {
    for (const [factionId, minLevel] of Object.entries(triggerConditions.minReputation)) {
      const playerRep = player.reputation[factionId] || 0;
      if (playerRep < minLevel) {
        return false;
      }
    }
  }

  // 아이템 조건 확인
  if (triggerConditions.requiredItems) {
    for (const itemId of triggerConditions.requiredItems) {
      const hasItem = player.inventory.some((invItem) => invItem.itemId === itemId);
      if (!hasItem) {
        return false;
      }
    }
  }

  // 계절 조건 확인
  if (triggerConditions.seasonalFactors && !triggerConditions.seasonalFactors.includes(currentDate.season)) {
    return false;
  }

  // 플레이어 진행도 조건 확인
  if (triggerConditions.playerProgressLevel !== undefined) {
    const playerProgress = calculatePlayerProgress(player);
    if (playerProgress < triggerConditions.playerProgressLevel) {
      return false;
    }
  }

  // 최종 확률 체크
  return Math.random() * 100 <= triggerConditions.chance;
}

/**
 * 플레이어 진행도 계산 (간단한 구현)
 */
function calculatePlayerProgress(player: Player): number {
  // 플레이어 레벨 계산 (0-10)
  const wealthFactor = Math.min(10, player.gold / 10000);
  const skillFactor = Math.min(10, Object.values(player.skills).reduce((sum, level) => sum + level, 0) / 10);
  const citiesFactor = Math.min(10, (player.stats.citiesVisited.length / 8) * 10);

  // 가중 평균 (0-10 범위)
  return wealthFactor * 0.4 + skillFactor * 0.4 + citiesFactor * 0.2;
}

/**
 * 이벤트 결과 선택 및 확률 계산
 *
 * @param outcomes - 가능한 결과 배열
 * @param skillBonus - 스킬 체크 성공/실패에 따른 보너스
 * @returns - 선택된 결과
 */
export function selectEventOutcome(outcomes: EventOutcome[], skillBonus: number = 0): EventOutcome {
  // 총 확률 합계
  const totalChance = outcomes.reduce((sum, outcome) => sum + outcome.chance, 0);

  // 스킬 보너스 적용 (최대 50% 확률 조정)
  const adjustedOutcomes = outcomes.map((outcome) => {
    // 긍정적 결과는 확률 증가, 부정적 결과는 확률 감소 (가정)
    const isPositive = outcome.effects.gold ? outcome.effects.gold > 0 : true;
    const adjustment = isPositive ? skillBonus : -skillBonus;

    return {
      ...outcome,
      chance: Math.max(5, Math.min(95, outcome.chance + adjustment * 50)),
    };
  });

  // 무작위 숫자 생성
  const random = Math.random() * totalChance;

  // 누적 확률로 결과 선택
  let cumulativeChance = 0;
  for (const outcome of adjustedOutcomes) {
    cumulativeChance += outcome.chance;
    if (random <= cumulativeChance) {
      return outcome;
    }
  }

  // 기본 반환 (첫 번째 결과)
  return outcomes[0];
}

/**
 * 이벤트 효과 적용하기
 *
 * @param player - 플레이어 정보
 * @param effects - 이벤트 효과
 * @returns - 업데이트된 플레이어
 */
export function applyEventEffects(player: Player, effects: EventEffect): Player {
  const updatedPlayer = { ...player };

  // 골드 효과
  if (effects.gold) {
    updatedPlayer.gold = Math.max(0, player.gold + effects.gold);
  }

  // 아이템 효과
  if (effects.items) {
    let updatedInventory = [...player.inventory];

    for (const item of effects.items) {
      if (item.quantity > 0) {
        // 아이템 추가
        const existingItemIndex = updatedInventory.findIndex((i) => i.itemId === item.id);

        if (existingItemIndex >= 0) {
          // 기존 아이템 수량 증가
          updatedInventory[existingItemIndex] = {
            ...updatedInventory[existingItemIndex],
            quantity: updatedInventory[existingItemIndex].quantity + item.quantity,
          };
        } else {
          // 새 아이템 추가
          updatedInventory.push({
            itemId: item.id,
            quantity: item.quantity,
            purchasePrice: 0, // 이벤트로 얻은 아이템은 구매 가격 0
            quality: 1.0, // 기본 품질
          });
        }
      } else if (item.quantity < 0) {
        // 아이템 제거
        const existingItemIndex = updatedInventory.findIndex((i) => i.itemId === item.id);

        if (existingItemIndex >= 0) {
          const existingItem = updatedInventory[existingItemIndex];
          const newQuantity = existingItem.quantity + item.quantity; // item.quantity는 음수

          if (newQuantity <= 0) {
            // 아이템 완전히 제거
            updatedInventory = updatedInventory.filter((_, index) => index !== existingItemIndex);
          } else {
            // 수량 감소
            updatedInventory[existingItemIndex] = {
              ...existingItem,
              quantity: newQuantity,
            };
          }
        }
      }
    }

    updatedPlayer.inventory = updatedInventory;
  }

  // 평판 효과
  if (effects.reputation) {
    const updatedReputation = { ...player.reputation };

    for (const repChange of effects.reputation) {
      const currentRep = updatedReputation[repChange.factionId] || 0;
      updatedReputation[repChange.factionId] = currentRep + repChange.change;
    }

    updatedPlayer.reputation = updatedReputation;
  }

  // 스킬 경험치 효과
  if (effects.skills) {
    const updatedSkills = { ...player.skills };

    for (const skillExp of effects.skills) {
      // 간단한 구현: 10 경험치당 스킬 레벨 1 상승
      const expGain = skillExp.exp / 10;
      const currentLevel = updatedSkills[skillExp.skill] || 1;
      updatedSkills[skillExp.skill] = Math.max(1, currentLevel + expGain);
    }

    updatedPlayer.skills = updatedSkills;
  }

  // 통계 효과
  if (effects.stats) {
    updatedPlayer.stats = {
      ...player.stats,
      ...effects.stats,
    };
  }

  return updatedPlayer;
}
