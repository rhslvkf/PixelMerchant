import { GameState, NPC, DialogueEffect, NPCInteractionHistory, GameDate, SkillType, ItemQuality } from "../../models";

/**
 * NPC 상호작용 시작 리듀서
 */
export function startNPCInteractionReducer(state: GameState, npcId: string): GameState {
  const npc = state.npcState.npcs[npcId];

  if (!npc) return state;

  // 첫 번째 대화 ID 찾기
  const firstDialogue = npc.dialogues.find((d) => !d.onlyOnce || !d.shown);

  if (!firstDialogue) return state;

  // 기존 상호작용 기록 확인
  const existingInteraction = state.npcState.interactions[npcId];

  // 새 상호작용 또는 기존 상호작용 업데이트
  const interaction: NPCInteractionHistory = existingInteraction
    ? { ...existingInteraction, lastInteractionDate: state.currentDate }
    : {
        npcId,
        dialoguesShown: [],
        lastInteractionDate: state.currentDate,
        reputation: npc.reputation,
        flags: {},
      };

  return {
    ...state,
    npcState: {
      ...state.npcState,
      activeNPC: npcId,
      currentDialogueId: firstDialogue.id,
      interactions: {
        ...state.npcState.interactions,
        [npcId]: interaction,
      },
    },
  };
}

/**
 * NPC 대화 선택 리듀서
 */
export function selectDialogueChoiceReducer(state: GameState, choiceId: string): GameState {
  const { activeNPC, currentDialogueId } = state.npcState;

  if (!activeNPC || !currentDialogueId) return state;

  const npc = state.npcState.npcs[activeNPC];
  const currentDialogue = npc.dialogues.find((d) => d.id === currentDialogueId);

  if (!currentDialogue) return state;

  // 선택한 옵션 찾기
  const selectedChoice = currentDialogue.choices.find((c) => c.id === choiceId);

  if (!selectedChoice) return state;

  // 대화 보임 표시
  const updatedNPC = {
    ...npc,
    dialogues: npc.dialogues.map((d) => (d.id === currentDialogueId ? { ...d, shown: true } : d)),
  };

  // 상호작용 업데이트
  const interaction = state.npcState.interactions[activeNPC] || {
    npcId: activeNPC,
    dialoguesShown: [],
    lastInteractionDate: state.currentDate,
    reputation: npc.reputation,
    flags: {},
  };

  const updatedInteraction = {
    ...interaction,
    dialoguesShown: [...interaction.dialoguesShown, currentDialogueId],
    lastInteractionDate: state.currentDate,
  };

  // 평판 변경 적용
  if (selectedChoice.reputation) {
    updatedInteraction.reputation += selectedChoice.reputation;
    updatedNPC.reputation += selectedChoice.reputation;
  }

  // 선택지 효과 적용
  let updatedState = {
    ...state,
    npcState: {
      ...state.npcState,
      npcs: {
        ...state.npcState.npcs,
        [activeNPC]: updatedNPC,
      },
      interactions: {
        ...state.npcState.interactions,
        [activeNPC]: updatedInteraction,
      },
      currentDialogueId: selectedChoice.nextDialogueId || null,
    },
  };

  // 효과 처리
  if (selectedChoice.effects) {
    updatedState = applyDialogueEffects(updatedState, selectedChoice.effects, activeNPC);
  }

  // 대화 종료 처리
  if (!selectedChoice.nextDialogueId) {
    updatedState = {
      ...updatedState,
      npcState: {
        ...updatedState.npcState,
        activeNPC: null,
      },
    };
  }

  return updatedState;
}

/**
 * 대화 효과 적용 함수
 */
function applyDialogueEffects(state: GameState, effects: DialogueEffect[], npcId: string): GameState {
  let updatedState = { ...state };

  effects.forEach((effect) => {
    switch (effect.type) {
      case "reputation":
        // 평판 변경
        const targetFaction = effect.target;
        const repChange = Number(effect.value);
        const currentRep = updatedState.player.reputation[targetFaction] || 0;

        updatedState = {
          ...updatedState,
          player: {
            ...updatedState.player,
            reputation: {
              ...updatedState.player.reputation,
              [targetFaction]: currentRep + repChange,
            },
          },
        };
        break;

      case "gold":
        // 골드 변경
        const goldChange = Number(effect.value);
        updatedState = {
          ...updatedState,
          player: {
            ...updatedState.player,
            gold: Math.max(0, updatedState.player.gold + goldChange),
          },
        };
        break;

      case "item":
        // 아이템 변경
        const itemId = effect.target;
        const quantity = Number(effect.value);

        if (quantity > 0) {
          // 아이템 추가 로직 (간소화됨)
          // 실제 구현에서는 quality 등 고려 필요
          const updatedInventory = [...updatedState.player.inventory];
          const existingItem = updatedInventory.find((i) => i.itemId === itemId);

          if (existingItem) {
            existingItem.quantity += quantity;
          } else {
            updatedInventory.push({
              itemId,
              quantity,
              purchasePrice: 0, // 대화로 얻은 아이템은 구매가 0
              quality: ItemQuality.MEDIUM, // 기본 품질
            });
          }

          updatedState = {
            ...updatedState,
            player: {
              ...updatedState.player,
              inventory: updatedInventory,
            },
          };
        } else if (quantity < 0) {
          // 아이템 제거 로직 (간소화됨)
          // 실제 구현에서는 removeItemFromInventory 함수 사용 권장
          const absQuantity = Math.abs(quantity);
          const updatedInventory = updatedState.player.inventory.reduce((acc, item) => {
            if (item.itemId !== itemId) return [...acc, item];

            const newQuantity = item.quantity - absQuantity;
            if (newQuantity <= 0) return acc;

            return [...acc, { ...item, quantity: newQuantity }];
          }, [] as typeof updatedState.player.inventory);

          updatedState = {
            ...updatedState,
            player: {
              ...updatedState.player,
              inventory: updatedInventory,
            },
          };
        }
        break;

      case "skill":
        // 스킬 경험치 변경
        // 간소화됨 - 실제 구현에서는 addSkillExperienceReducer 사용 권장
        const skillId = effect.target;
        const expChange = Number(effect.value);
        const currentLevel = updatedState.player.skills[skillId as SkillType] || 1;

        updatedState = {
          ...updatedState,
          player: {
            ...updatedState.player,
            skills: {
              ...updatedState.player.skills,
              [skillId]: currentLevel + expChange / 100, // 간소화된 레벨업 계산
            },
          },
        };
        break;

      case "flag":
        // 상호작용 플래그 설정
        const flagKey = effect.target;
        const flagValue = effect.value;
        const interaction = updatedState.npcState.interactions[npcId];

        if (interaction) {
          // remove 작업의 경우 해당 키를 삭제
          if (effect.operation === "remove") {
            const updatedFlags = { ...interaction.flags };
            delete updatedFlags[flagKey];

            updatedState = {
              ...updatedState,
              npcState: {
                ...updatedState.npcState,
                interactions: {
                  ...updatedState.npcState.interactions,
                  [npcId]: {
                    ...interaction,
                    flags: updatedFlags,
                  },
                },
              },
            };
          } else {
            // set 또는 add 작업의 경우 값 설정
            updatedState = {
              ...updatedState,
              npcState: {
                ...updatedState.npcState,
                interactions: {
                  ...updatedState.npcState.interactions,
                  [npcId]: {
                    ...interaction,
                    flags: {
                      ...interaction.flags,
                      [flagKey]: flagValue,
                    },
                  },
                },
              },
            };
          }
        }
        break;

      case "quest":
        // 퀘스트 관련 효과
        // 퀘스트 시스템 구현 시 추가 예정
        break;
    }
  });

  return updatedState;
}

/**
 * NPC 상호작용 종료 리듀서
 */
export function endNPCInteractionReducer(state: GameState): GameState {
  return {
    ...state,
    npcState: {
      ...state.npcState,
      activeNPC: null,
      currentDialogueId: null,
    },
  };
}

/**
 * NPC 거래 리듀서
 */
export function tradeWithNPCReducer(state: GameState, npcId: string, tradeId: string, quantity: number): GameState {
  const npc = state.npcState.npcs[npcId];

  if (!npc || !npc.trades) return state;

  const trade = npc.trades.find((t) => t.id === tradeId);

  if (!trade) return state;

  // 거래 조건 검사
  const interaction = state.npcState.interactions[npcId];
  const npcReputation = interaction ? interaction.reputation : npc.reputation;

  if (npcReputation < trade.reputationRequired) return state;
  if (trade.quantityAvailable < quantity) return state;

  // 가격 계산
  const itemInfo = state.world.cities[state.currentCityId].market.items.find((i) => i.itemId === trade.itemId);
  if (!itemInfo) return state;

  const basePrice = itemInfo.currentPrice;
  const totalPrice = basePrice * trade.priceMultiplier * quantity;

  // 플레이어 골드 검사
  if (state.player.gold < totalPrice) return state;

  // 거래 수행
  const updatedTrade = {
    ...trade,
    quantityAvailable: trade.quantityAvailable - quantity,
    lastRestock: state.currentDate,
  };

  const updatedNPC = {
    ...npc,
    trades: npc.trades.map((t) => (t.id === tradeId ? updatedTrade : t)),
  };

  // 아이템 추가와 골드 차감은 별도 리듀서 활용
  // 이 예시에서는 간소화
  const updatedInventory = [...state.player.inventory];
  const existingItem = updatedInventory.find((i) => i.itemId === trade.itemId && i.quality === trade.quality);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    updatedInventory.push({
      itemId: trade.itemId,
      quantity,
      purchasePrice: basePrice * trade.priceMultiplier,
      quality: trade.quality,
    });
  }

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - totalPrice,
      inventory: updatedInventory,
    },
    npcState: {
      ...state.npcState,
      npcs: {
        ...state.npcState.npcs,
        [npcId]: updatedNPC,
      },
    },
  };
}

/**
 * NPC 재고 보충 리듀서
 */
export function restockNPCTradesReducer(state: GameState, currentDate: GameDate): GameState {
  const updatedNPCs = { ...state.npcState.npcs };

  Object.keys(updatedNPCs).forEach((npcId) => {
    const npc = updatedNPCs[npcId];

    if (!npc.trades) return;

    const updatedTrades = npc.trades.map((trade) => {
      // 마지막 재고 보충 날짜 확인
      if (!trade.lastRestock) {
        return {
          ...trade,
          lastRestock: currentDate,
        };
      }

      // 재고 보충 주기 계산
      const daysSinceRestock = calculateDaysDifference(trade.lastRestock, currentDate);

      if (daysSinceRestock >= trade.restockDays) {
        // 재고 보충
        return {
          ...trade,
          quantityAvailable: trade.maxQuantity || Math.floor(Math.random() * 5) + 1, // 기본 1-5개
          lastRestock: currentDate,
        };
      }

      return trade;
    });

    updatedNPCs[npcId] = {
      ...npc,
      trades: updatedTrades,
    };
  });

  return {
    ...state,
    npcState: {
      ...state.npcState,
      npcs: updatedNPCs,
    },
  };
}

/**
 * 두 날짜 사이의 일수 차이 계산
 */
function calculateDaysDifference(date1: GameDate, date2: GameDate): number {
  const day1 = date1.day + date1.month * 30 + date1.year * 360;
  const day2 = date2.day + date2.month * 30 + date2.year * 360;
  return Math.abs(day2 - day1);
}
