import { Quest, QuestDifficulty, QuestObjective, QuestType } from "../models/quests";
import { ItemQuality, SkillType } from "../models";

// JSON 파일에서 퀘스트 데이터 로드
import questsData from "../assets/data/quests.json";

// TypeScript 타입에 맞게 퀘스트 데이터 변환
const convertQuestsData = (data: any): Record<string, Quest> => {
  const typedQuests: Record<string, Quest> = {};

  Object.entries(data || {}).forEach(([key, quest]: [string, any]) => {
    if (!quest) return;

    // 목표 조건 변환
    const objectives: QuestObjective[] = Array.isArray(quest.objectives)
      ? quest.objectives.map((objective: any) => ({
          ...objective,
          quality: objective.quality
            ? ItemQuality[objective.quality.toUpperCase() as keyof typeof ItemQuality]
            : undefined,
          completed: false,
        }))
      : [];

    // 스킬 경험치 변환
    const skillExp = Array.isArray(quest.rewards?.skillExp)
      ? quest.rewards.skillExp.map((exp: any) => {
          // 스킬 타입 안전하게 변환
          let skillType = exp.skill;
          if (typeof exp.skill === "string") {
            // TRADE, trade, Trade 등 다양한 형태 처리
            const normalizedSkill = exp.skill.toUpperCase();
            if (normalizedSkill in SkillType) {
              skillType = SkillType[normalizedSkill as keyof typeof SkillType];
            }
          }

          return {
            skill: skillType,
            amount: exp.amount || 0,
          };
        })
      : [];

    // 아이템 보상 변환
    const items = Array.isArray(quest.rewards?.items)
      ? quest.rewards.items.map((item: any) => ({
          ...item,
          quality: item.quality ? ItemQuality[item.quality.toUpperCase() as keyof typeof ItemQuality] : undefined,
        }))
      : [];

    // 최종 퀘스트 객체 변환
    typedQuests[key] = {
      id: quest.id || key,
      title: quest.title || "",
      description: quest.description || "",
      type: QuestType[quest.type?.toUpperCase() as keyof typeof QuestType] || QuestType.TRADE,
      giver: quest.giver || "",
      giverCityId: quest.giverCityId || "",
      difficulty:
        QuestDifficulty[quest.difficulty?.toUpperCase() as keyof typeof QuestDifficulty] || QuestDifficulty.EASY,
      objectives,
      rewards: {
        ...quest.rewards,
        skillExp,
        items,
      },
      requirements: quest.requirements || undefined,
      timeLimit: quest.timeLimit || undefined,
      startDate: quest.startDate || undefined,
      endDate: quest.endDate || undefined,
    };
  });

  return typedQuests;
};

// 변환된 퀘스트 데이터
export const QUESTS: Record<string, Quest> = convertQuestsData(questsData);

// 모든 퀘스트 목록 가져오기
export function getAllQuests(): Quest[] {
  return Object.values(QUESTS);
}

// 퀘스트 ID로 퀘스트 찾기
export function getQuestById(id: string): Quest | undefined {
  return QUESTS[id];
}

// NPC가 제공하는 퀘스트 목록 가져오기
export function getQuestsByGiver(npcId: string): Quest[] {
  return Object.values(QUESTS).filter((quest) => quest.giver === npcId);
}

// 도시 ID로 해당 도시에서 제공하는 퀘스트 목록 가져오기
export function getQuestsByCity(cityId: string): Quest[] {
  return Object.values(QUESTS).filter((quest) => quest.giverCityId === cityId);
}

// 난이도별 퀘스트 목록 가져오기
export function getQuestsByDifficulty(difficulty: QuestDifficulty): Quest[] {
  return Object.values(QUESTS).filter((quest) => quest.difficulty === difficulty);
}
