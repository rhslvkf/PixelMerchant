import { GameState, Player, Season, SkillType } from "../models/types";
import { DEFAULT_SETTINGS } from "../config/constants";
import { CITIES, REGIONS } from "../data/cities";

// 초기 플레이어 상태 정의
export const initialPlayer: Player = {
  id: "",
  name: "",
  gold: 500,
  inventory: [],
  maxWeight: 50,
  skills: {
    [SkillType.TRADE]: 1,
    [SkillType.LOGISTICS]: 1,
    [SkillType.INSIGHT]: 1,
    [SkillType.DIPLOMACY]: 1,
    [SkillType.EXPLORATION]: 1,
  },
  reputation: {},
  stats: {
    daysPlayed: 0,
    citiesVisited: [],
    totalProfit: 0,
    completedQuests: [],
    discoveredItems: [],
    travelDistance: 0,
    successfulDeals: 0,
  },
};

// 게임 초기 상태 정의
export const initialGameState: GameState = {
  player: initialPlayer,
  currentDate: {
    day: 1,
    month: 1,
    year: 1,
    season: Season.SPRING,
  },
  currentCityId: "golden_harbor", // 시작 도시
  gameSettings: DEFAULT_SETTINGS,
  world: {
    cities: CITIES,
    regions: REGIONS,
    events: [],
    globalMarketFactors: {
      events: [],
      seasonalFactors: {
        [Season.SPRING]: {},
        [Season.SUMMER]: {},
        [Season.FALL]: {},
        [Season.WINTER]: {},
      },
    },
  },
};
