import { DEFAULT_SETTINGS } from "../config/constants";
import { CITIES, REGIONS } from "../data/cities";
import { NPCS } from "../data/npcs";
import { GameState, NPCState, Player, Season, SkillType } from "../models/index";

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
  skillExperience: {
    [SkillType.TRADE]: 0,
    [SkillType.LOGISTICS]: 0,
    [SkillType.INSIGHT]: 0,
    [SkillType.DIPLOMACY]: 0,
    [SkillType.EXPLORATION]: 0,
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
  quests: [],
};

// NPC 초기 상태 정의
export const initialNPCState: NPCState = {
  npcs: NPCS,
  interactions: {},
  activeNPC: null,
  currentDialogueId: null,
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
  npcState: initialNPCState,
};
