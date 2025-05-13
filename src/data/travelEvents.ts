import { GameEvent, Season, SkillType } from "../models";

export const TRAVEL_EVENTS: Record<string, GameEvent> = {
  bandits_ambush: {
    id: "bandits_ambush",
    title: "산길 매복",
    description:
      '좁은 산길을 지나는 도중, 갑자기 바위 뒤에서 무장한 도적들이 나타납니다. 그들의 지도자로 보이는 남자가 앞으로 나서며 말합니다: "통행세를 내거나, 화물을 포기하시지. 선택은 당신 몫이오."',
    type: "travel",
    triggerConditions: {
      locations: ["kragmore_mountains"],
      chance: 30,
      seasonalFactors: [Season.SUMMER, Season.FALL],
    },
    choices: [
      {
        id: "pay_toll",
        text: "통행세를 지불한다 (50 골드)",
        outcomes: [
          {
            chance: 100,
            description:
              '마지못해 50 골드를 건네자, 도적 두목이 만족스럽게 웃으며 길을 비켜줍니다. "현명한 선택이오. 좋은 여행 되시길."',
            effects: {
              gold: -50,
              skills: [{ skill: SkillType.DIPLOMACY, exp: 5 }],
            },
          },
        ],
      },
      {
        id: "negotiate",
        text: "협상을 시도한다",
        requiredSkill: { skill: SkillType.DIPLOMACY, level: 2 },
        outcomes: [
          {
            chance: 75,
            description:
              '당신은 침착하게 자신이 정기적으로 이 길을 이용하는 상인임을 설명하고, 장기적 관계를 제안합니다. 도적 두목은 잠시 고민하더니 고개를 끄덕입니다. "좋소. 이번엔 25 골드만 내시오. 다음부턴 얼굴을 기억해 두겠소."',
            effects: {
              gold: -25,
              reputation: [{ factionId: "mountain_bandits", change: 1 }],
              skills: [{ skill: SkillType.DIPLOMACY, exp: 15 }],
            },
          },
          {
            chance: 25,
            description:
              '당신의 협상 시도가 실패합니다. 도적 두목이 얼굴을 찌푸리며 말합니다. "말장난은 그만두시지. 75 골드를 내던가, 아니면..."',
            effects: {
              gold: -75,
              skills: [{ skill: SkillType.DIPLOMACY, exp: 5 }],
            },
          },
        ],
      },
      {
        id: "flee",
        text: "도망친다",
        requiredSkill: { skill: SkillType.EXPLORATION, level: 3 },
        outcomes: [
          {
            chance: 60,
            description:
              "당신은 재빠르게 방향을 틀어 좁은 산길로 도망칩니다. 도적들이 뒤쫓지만, 지형에 익숙한 당신은 그들을 따돌리는데 성공합니다.",
            effects: {
              skills: [{ skill: SkillType.EXPLORATION, exp: 20 }],
            },
          },
          {
            chance: 40,
            description:
              "당신이 도망치려 하자 도적들이 화살을 쏩니다. 불행히도 한 발이 당신의 다리를 스쳐 지나가고, 도적들에게 붙잡히고 맙니다. 그들은 당신의 소지품을 모두 빼앗고 떠납니다.",
            effects: {
              gold: -100,
              items: [
                { id: "herbs", quantity: -1 },
                { id: "cotton", quantity: -2 },
              ],
              skills: [{ skill: SkillType.EXPLORATION, exp: 10 }],
            },
          },
        ],
      },
    ],
  },

  storm_warning: {
    id: "storm_warning",
    title: "폭풍 경고",
    description:
      "여행 중에 하늘이 급격히 어두워지고 먹구름이 몰려옵니다. 곧 폭풍이 올 것 같은 징후가 보입니다. 안전한 대피소를 찾거나 폭풍을 무릅쓰고 계속 갈지 결정해야 합니다.",
    type: "travel",
    triggerConditions: {
      chance: 40,
      seasonalFactors: [Season.FALL, Season.WINTER],
    },
    choices: [
      {
        id: "find_shelter",
        text: "대피소를 찾는다",
        outcomes: [
          {
            chance: 80,
            description:
              "근처에서 작은 동굴을 발견하여 폭풍이 지나갈 때까지 대피합니다. 하루를 낭비했지만, 안전하게 여행을 계속할 수 있게 되었습니다.",
            effects: {
              // 하루 지연 효과는 게임 로직에서 처리
            },
          },
          {
            chance: 20,
            description:
              "대피소를 찾아 헤매던 중, 한 상인 가족이 임시 캠프를 마련한 것을 발견합니다. 그들은 당신을 환영하며 거래를 제안합니다.",
            effects: {
              items: [{ id: "herbs", quantity: 2 }],
              skills: [{ skill: SkillType.TRADE, exp: 10 }],
            },
          },
        ],
      },
      {
        id: "continue",
        text: "계속 진행한다",
        outcomes: [
          {
            chance: 30,
            description: "놀랍게도 폭풍은 당신을 피해갑니다. 운이 좋았군요. 지체 없이 여행을 계속할 수 있습니다.",
            effects: {
              gold: 0,
            },
          },
          {
            chance: 70,
            description:
              "폭풍이 당신을 덮치고, 도로는 진흙탕이 됩니다. 짐의 일부가 손상되었고, 하루 동안 거의 진전을 이루지 못했습니다.",
            effects: {
              gold: -30,
              items: [{ id: "wheat", quantity: -1 }],
            },
          },
        ],
      },
    ],
  },

  merchant_caravan: {
    id: "merchant_caravan",
    title: "상인 대상",
    description:
      "길에서 같은 방향으로 이동 중인 상인 대상을 만났습니다. 다양한 상품을 실은 마차들이 길게 늘어서 있고, 여러 상인들이 함께 모여 안전하게 여행하고 있습니다.",
    type: "travel",
    triggerConditions: {
      chance: 35,
    },
    choices: [
      {
        id: "join_caravan",
        text: "대상에 합류한다",
        outcomes: [
          {
            chance: 100,
            description:
              "상인들은 기꺼이 당신을 대상에 받아들입니다. 무리를 이루어 여행하니 도적들의 위협이 줄어들고, 다른 상인들과 정보를 교환할 수 있습니다.",
            effects: {
              skills: [
                { skill: SkillType.TRADE, exp: 15 },
                { skill: SkillType.DIPLOMACY, exp: 10 },
              ],
            },
          },
        ],
      },
      {
        id: "trade_with_caravan",
        text: "대상과 거래한다",
        outcomes: [
          {
            chance: 100,
            description:
              "잠시 시간을 내어 상인들과 거래합니다. 그들은 다른 지역에서 온 특산품을 가지고 있어 좋은 거래를 성사시킬 수 있었습니다.",
            effects: {
              items: [
                { id: "spices", quantity: 1 },
                { id: "silk", quantity: 1 },
              ],
              gold: -80,
              skills: [{ skill: SkillType.TRADE, exp: 20 }],
            },
          },
        ],
      },
      {
        id: "continue_alone",
        text: "혼자 계속 간다",
        outcomes: [
          {
            chance: 100,
            description:
              "대상과 함께 여행하는 것이 안전하겠지만, 혼자 가는 것이 더 빠를 것입니다. 당신은 인사를 나누고 자신의 길을 계속 갑니다.",
            effects: {
              // 특별한 효과 없음, 더 빠른 여행은 게임 로직에서 처리
            },
          },
        ],
      },
    ],
  },

  // 추가 이벤트들...
};

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
    const defaultEvents = ["merchant_caravan", "storm_warning"];
    return defaultEvents[Math.floor(Math.random() * defaultEvents.length)];
  }

  // 무작위로 하나 선택
  return eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)].id;
}
