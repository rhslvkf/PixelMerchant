import { Item, MarketItem, City, GameDate, Season, Market, Player, ItemQuality } from "../models";

/**
 * 상품 가격 계산 함수
 *
 * @param item - 상품 기본 정보
 * @param city - 도시 정보
 * @param date - 현재 게임 날짜
 * @param eventFactors - 현재 활성화된 이벤트 효과
 * @param quality - 상품 품질 (0.8-1.5)
 * @returns - 최종 계산된 가격
 */
export function calculateItemPrice(
  item: Item,
  city: City,
  date: GameDate,
  eventFactors: Record<string, number> = {},
  quality: number = 1.0
): number {
  // 기본 가격
  const basePrice = item.basePrice;

  // 지역 변동 계수 (-0.5 ~ 1.0)
  const regionalVariation = item.regionalFactors[city.regionId] || 0;

  // 시장 상황 계수 (-0.2 ~ 0.2)
  const marketSituation = city.market.demandFactors[item.id] || 0;

  // 계절 변동 계수 (-0.3 ~ 0.3)
  const seasonFactor = item.seasonalFactors[date.season] || 0;

  // 이벤트 영향 계수 (-0.4 ~ 0.4)
  const eventImpact = eventFactors[item.id] || 0;

  // 품질 계수 (0.8 ~ 1.5)
  const qualityFactor = quality;

  // 최종 가격 계산 공식
  const finalPrice =
    basePrice *
    (1 + regionalVariation) *
    (1 + marketSituation) *
    (1 + seasonFactor) *
    (1 + eventImpact) *
    qualityFactor;

  // 1골드 미만으로 떨어지지 않도록
  return Math.max(1, Math.round(finalPrice));
}

/**
 * 도시 부유함과 특산품 여부에 따른 품질 분포 계산
 */
function calculateQualityDistribution(
  wealthLevel: number,
  isSpecialty: boolean
): { low: number; medium: number; high: number } {
  // 기본 품질 분포
  let lowRatio = 0.3;
  let mediumRatio = 0.5;
  let highRatio = 0.2;

  // 도시 부유함에 따른 조정
  lowRatio -= (wealthLevel - 1) * 0.05; // 부유할수록 저급 품질 감소
  highRatio += (wealthLevel - 1) * 0.05; // 부유할수록 고급 품질 증가

  // 특산품 여부에 따른 조정
  if (isSpecialty) {
    lowRatio -= 0.1;
    highRatio += 0.1;
  }

  // 범위 제한
  lowRatio = Math.max(0.1, Math.min(0.4, lowRatio));
  highRatio = Math.max(0.1, Math.min(0.5, highRatio));
  mediumRatio = 1 - lowRatio - highRatio;

  return {
    low: lowRatio,
    medium: mediumRatio,
    high: highRatio,
  };
}

/**
 * 시장 가격 업데이트 함수
 */
function updateMarketPrices(
  item: MarketItem,
  city: City,
  currentDate: GameDate,
  volatility: number,
  globalEvents: Record<string, number> = {}
): { updatedItem: MarketItem; newDemandFactor: number } {
  // 현재 가격 기록
  const priceHistory = [...item.priceHistory, [currentDate, item.currentPrice] as [GameDate, number]];

  // 가격 트렌드 계산
  const trend = generateMarketTrend(item.itemId, city, currentDate, globalEvents);

  // 시장 변동성에 따른 랜덤 요소
  const randomFactor = (Math.random() - 0.5) * volatility * 0.1;

  // 수요 계수 업데이트
  const newDemandFactor = Math.max(-0.2, Math.min(0.2, trend + randomFactor));

  // 아이템 정보 업데이트
  const updatedItem = {
    ...item,
    priceHistory: priceHistory.slice(-10), // 최근 10개 가격만 유지
  };

  return { updatedItem, newDemandFactor };
}

/**
 * 재고 수준 업데이트 함수
 */
function updateStockLevels(
  item: MarketItem,
  city: City,
  wealthLevel: number
): { low: number; medium: number; high: number } {
  const isSpecialty = city.specialties.includes(item.itemId);
  const baseQuantity = 10 + Math.floor(city.size * 5 * (1 + (isSpecialty ? 0.5 : 0)));

  // 품질 분포 계산
  const qualityDistribution = calculateQualityDistribution(wealthLevel, isSpecialty);

  // 품질별 재고 계산
  const lowStock = Math.max(2, Math.floor(baseQuantity * qualityDistribution.low));
  const mediumStock = Math.max(3, Math.floor(baseQuantity * qualityDistribution.medium));
  const highStock = Math.max(1, Math.floor(baseQuantity * qualityDistribution.high));

  return {
    low: lowStock,
    medium: mediumStock,
    high: highStock,
  };
}

/**
 * 도시 시장 업데이트 함수 - 품질별 재고 관리 반영
 */
export function updateCityMarket(
  market: Market,
  city: City,
  currentDate: GameDate,
  globalEvents: Record<string, number> = {}
): Market {
  // 마지막 업데이트 이후 경과 일수
  const daysSinceUpdate = calculateDaysDifference(market.lastUpdated, currentDate);

  // 3일마다 시장 변동 적용
  if (daysSinceUpdate >= 3) {
    const updatedMarket = { ...market };

    updatedMarket.items = market.items.map((item) => {
      // 가격 업데이트
      const { updatedItem, newDemandFactor } = updateMarketPrices(
        item,
        city,
        currentDate,
        market.volatility,
        globalEvents
      );

      // 수요 계수 업데이트
      updatedMarket.demandFactors[item.itemId] = newDemandFactor;

      // 재고 업데이트
      const newStockLevels = updateStockLevels(item, city, city.wealthLevel);

      return {
        ...updatedItem,
        qualityStock: newStockLevels,
      };
    });

    // 마지막 업데이트 시간 갱신
    updatedMarket.lastUpdated = { ...currentDate };

    return updatedMarket;
  }

  return market;
}

/**
 * 날짜 차이 계산 함수
 */
function calculateDaysDifference(date1: GameDate, date2: GameDate): number {
  // 간단한 구현: 일 단위로만 계산 (월/년 고려 필요)
  const day1 = date1.day + date1.month * 30 + date1.year * 360;
  const day2 = date2.day + date2.month * 30 + date2.year * 360;
  return Math.abs(day2 - day1);
}

/**
 * 시장 트렌드 생성 함수
 */
function generateMarketTrend(
  itemId: string,
  city: City,
  currentDate: GameDate,
  globalEvents: Record<string, number>
): number {
  // 계절 영향 (단순화된 구현)
  const seasonalTrend = 0.05 * Math.sin((currentDate.day / 30) * Math.PI * 2);

  // 글로벌 이벤트 영향
  const eventTrend = globalEvents[itemId] || 0;

  // 지역 특산품 영향
  const specialtyFactor = city.specialties.includes(itemId) ? -0.1 : 0;

  // 사이클 패턴 (사인 웨이브 형태의 주기적 변동)
  const cyclicPattern = Math.sin((currentDate.day / 15) * Math.PI) * 0.05;

  return seasonalTrend + eventTrend + specialtyFactor + cyclicPattern;
}

/**
 * 플레이어 거래 후 시장 영향 적용 - 품질별 재고 관리 반영
 *
 * @param market - 시장 정보
 * @param itemId - 거래한 아이템 ID
 * @param quality - 아이템 품질 (low, medium, high)
 * @param quantity - 거래 수량 (구매 -, 판매 +)
 * @returns - 업데이트된 시장 정보
 */
export function applyPlayerTradeImpact(market: Market, itemId: string, quality: ItemQuality, quantity: number): Market {
  const updatedMarket = {
    ...market,
    items: [...market.items],
    demandFactors: { ...market.demandFactors },
  };

  const itemIndex = updatedMarket.items.findIndex((item) => item.itemId === itemId);

  if (itemIndex < 0) return market;

  // 재고 업데이트 - 품질별로 수정
  const updatedItem = { ...updatedMarket.items[itemIndex] };
  updatedItem.qualityStock = {
    ...updatedItem.qualityStock,
    [quality]: Math.max(0, updatedItem.qualityStock[quality] + quantity),
  };

  // 총 재고 계산
  const totalStock = Object.values(updatedItem.qualityStock).reduce((sum, val) => sum + val, 0);

  // 시장 영향력 계산 (재고의 20% 이상 거래시 영향)
  const impactThreshold = Math.max(1, Math.floor(totalStock * 0.2));
  const hasSignificantImpact = Math.abs(quantity) >= impactThreshold;

  if (hasSignificantImpact) {
    // 수요 계수 조정 (구매 시 증가, 판매 시 감소)
    const impactFactor = quantity > 0 ? -0.05 : 0.05; // 판매는 가격 하락, 구매는 가격 상승

    updatedMarket.demandFactors[itemId] = Math.max(
      -0.2,
      Math.min(0.2, (updatedMarket.demandFactors[itemId] || 0) + impactFactor)
    );
  }

  updatedMarket.items[itemIndex] = updatedItem;

  return updatedMarket;
}

/**
 * 플레이어 판매 가격 계산 함수
 *
 * @param marketPrice - 아이템의 현재 시장 가격
 * @param player - 플레이어 정보
 * @param city - 도시 정보
 * @returns - 플레이어가 받을 판매 가격 (소수점 포함)
 */
export function calculatePlayerSellingPrice(marketPrice: number, player: Player, city: City): number {
  // 기본 스프레드 비율 (기본 20%)
  let spreadPercentage = 20;

  // 평판에 따른 스프레드 감소
  const reputationLevel = player.reputation[city.id] || 0;
  spreadPercentage -= reputationLevel * 2;

  // 거래 기술에 따른 스프레드 감소
  const tradeSkillLevel = player.skills.trade || 0;
  spreadPercentage -= tradeSkillLevel * 1;

  // 최소 스프레드 적용 (최소 5%)
  spreadPercentage = Math.max(5, spreadPercentage);

  // 최종 판매 가격 계산 (시장가의 [100-스프레드]%) - 소수점 유지
  return (marketPrice * (100 - spreadPercentage)) / 100;
}
