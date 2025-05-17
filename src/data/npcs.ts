import { NPC, NPCType, ItemQuality } from "../models";
import { ITEM_KEYS } from "./items";
import { Season } from "../models/world";

// JSON에서 데이터 로드
import npcsData from "../assets/data/npcs.json";

// JSON 데이터를 TypeScript 타입에 맞게 변환
const convertNPCData = (data: any): Record<string, NPC> => {
  const typedNPCs: Record<string, NPC> = {};

  Object.entries(data).forEach(([key, npc]: [string, any]) => {
    typedNPCs[key] = {
      ...npc,
      type: NPCType[npc.type as keyof typeof NPCType] || NPCType.MERCHANT,
      specialties: Array.isArray(npc.specialties)
        ? npc.specialties.map((specialty: string) => {
            // ITEM_KEYS에서 해당 키가 있는지 확인
            const itemKey = specialty.toUpperCase();
            return itemKey in ITEM_KEYS ? ITEM_KEYS[itemKey as keyof typeof ITEM_KEYS] : specialty;
          })
        : [],
      trades: Array.isArray(npc.trades)
        ? npc.trades.map((trade: any) => ({
            ...trade,
            itemId:
              trade.itemId && trade.itemId.toUpperCase() in ITEM_KEYS
                ? ITEM_KEYS[trade.itemId.toUpperCase() as keyof typeof ITEM_KEYS]
                : trade.itemId || "",
            quality: trade.quality ? ItemQuality[trade.quality as keyof typeof ItemQuality] : ItemQuality.MEDIUM,
          }))
        : [],
      schedule: Array.isArray(npc.schedule)
        ? npc.schedule.map((schedule: any) => ({
            ...schedule,
            seasons: Array.isArray(schedule.seasons)
              ? schedule.seasons.map(
                  (season: string) => Season[season.toUpperCase() as keyof typeof Season] || Season.SPRING
                )
              : [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER],
          }))
        : [],
    };
  });

  return typedNPCs;
};

// 변환된 NPC 데이터
export const NPCS: Record<string, NPC> = convertNPCData(npcsData);

export const NPC_PORTRAITS: Record<string, any> = {
  merchant_male_1: require("../assets/images/character_background.webp"),
  female_informant_1: require("../assets/images/character_background.webp"),
};

// NPC ID로 NPC 찾기
export function getNPCById(id: string): NPC | undefined {
  return NPCS[id];
}

// 모든 NPC 목록 가져오기
export function getAllNPCs(): NPC[] {
  return Object.values(NPCS);
}

// 도시에 있는 NPC 목록 가져오기
export function getNPCsByLocation(locationId: string): NPC[] {
  return Object.values(NPCS).filter(
    (npc) => npc.availableLocations.includes(locationId) || npc.baseLocation === locationId
  );
}
