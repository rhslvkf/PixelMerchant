import { GameEvent, EventTriggerCondition, EventChoice, EventOutcome, EventEffect, Season, SkillType } from "../models";

// 이벤트 키 상수
export const EVENT_KEYS = {
  BANDITS_AMBUSH: "bandits_ambush",
  STORM_WARNING: "storm_warning",
  MERCHANT_CARAVAN: "merchant_caravan",
} as const;

// JSON 파일에서 이벤트 데이터 로드
import eventsData from "../assets/data/travelEvents.json";

// TypeScript 타입에 맞게 이벤트 데이터 변환
const convertEventsData = (data: any): Record<string, GameEvent> => {
  const typedEvents: Record<string, GameEvent> = {};

  Object.entries(data || {}).forEach(([key, event]: [string, any]) => {
    if (!event) return;

    // 계절 요소 변환 (문자열 키를 Season enum으로 변환)
    const seasonalFactors: Season[] = [];
    if (event.triggerConditions && event.triggerConditions.seasonalFactors) {
      event.triggerConditions.seasonalFactors.forEach((season: string) => {
        if (season in Season) {
          seasonalFactors.push(Season[season as keyof typeof Season]);
        }
      });
    }

    // 이벤트 선택지와 결과 처리
    const choices: EventChoice[] = [];
    if (event.choices) {
      event.choices.forEach((choice: any) => {
        const processedChoice: EventChoice = {
          id: choice.id,
          text: choice.text,
          outcomes: [],
        };

        // 필요 스킬 처리
        if (choice.requiredSkill) {
          processedChoice.requiredSkill = {
            skill: SkillType[choice.requiredSkill.skill as keyof typeof SkillType],
            level: choice.requiredSkill.level,
          };
        }

        // 결과 처리
        if (choice.outcomes) {
          choice.outcomes.forEach((outcome: any) => {
            const processedOutcome: EventOutcome = {
              chance: outcome.chance,
              description: outcome.description,
              effects: {} as EventEffect,
            };

            // 효과 처리
            if (outcome.effects) {
              if ("gold" in outcome.effects) {
                processedOutcome.effects.gold = outcome.effects.gold;
              }

              // 기술 경험치 처리
              if (outcome.effects.skills) {
                processedOutcome.effects.skills = outcome.effects.skills.map((skillEffect: any) => ({
                  skill: SkillType[skillEffect.skill as keyof typeof SkillType],
                  exp: skillEffect.exp,
                }));
              }

              // 아이템 처리
              if (outcome.effects.items) {
                processedOutcome.effects.items = outcome.effects.items;
              }

              // 평판 처리
              if (outcome.effects.reputation) {
                processedOutcome.effects.reputation = outcome.effects.reputation;
              }

              // 특별 효과 처리
              if (outcome.effects.specialEffects) {
                processedOutcome.effects.specialEffects = outcome.effects.specialEffects;
              }
            }

            processedChoice.outcomes.push(processedOutcome);
          });
        }

        choices.push(processedChoice);
      });
    }

    // 최종 이벤트 객체 구성
    typedEvents[key] = {
      id: event.id,
      title: event.title,
      description: event.description,
      type: event.type,
      triggerConditions: {
        ...(event.triggerConditions || {}),
        seasonalFactors: seasonalFactors.length > 0 ? seasonalFactors : undefined,
      } as EventTriggerCondition,
      choices,
    } as GameEvent;
  });

  return typedEvents;
};

// 변환된 이벤트 데이터
export const TRAVEL_EVENTS: Record<string, GameEvent> = convertEventsData(eventsData);

// 이벤트 ID로 이벤트 찾기
export function getEventById(id: string): GameEvent | undefined {
  return TRAVEL_EVENTS[id] || undefined;
}

// 무작위 이벤트 선택 (위험도, 지역, 계절 등 고려)
export function getRandomEvent(
  locations: string[] = [],
  season: Season = Season.SPRING,
  dangerLevel: number = 3
): string {
  // 조건에 맞는 이벤트 필터링
  const eligibleEvents = Object.values(TRAVEL_EVENTS).filter((event) => {
    // 지역 조건 확인
    if (
      event.triggerConditions.locations &&
      event.triggerConditions.locations.length > 0 &&
      !event.triggerConditions.locations.some((loc) => locations.includes(loc))
    ) {
      return false;
    }

    // 계절 조건 확인
    if (event.triggerConditions.seasonalFactors && !event.triggerConditions.seasonalFactors.includes(season)) {
      return false;
    }

    // 기본적으로 확률 기반 선택
    return Math.random() * 100 <= (event.triggerConditions.chance || 30) * (dangerLevel / 3);
  });

  if (eligibleEvents.length === 0) {
    // 기본 이벤트들 중 하나를 선택
    const defaultEvents = [EVENT_KEYS.MERCHANT_CARAVAN, EVENT_KEYS.STORM_WARNING];
    return defaultEvents[Math.floor(Math.random() * defaultEvents.length)];
  }

  // 무작위로 하나 선택
  return eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)].id;
}
