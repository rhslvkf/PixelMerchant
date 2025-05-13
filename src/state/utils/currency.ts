import { Currency } from "../../models/index";

/**
 * 소수점 골드 값을 골드와 실버로 변환
 *
 * @param amount - 골드 금액 (소수점 포함 가능)
 * @returns - 골드와 실버로 구성된 Currency 객체
 */
export function goldToGoldSilver(amount: number): Currency {
  if (isNaN(amount)) {
    console.warn(`goldToGoldSilver: Invalid amount value '${amount}'`);
    return { gold: 0, silver: 0 };
  }

  // 골드와 실버 분리 (1G = 100S)
  const gold = Math.floor(amount);
  const silver = Math.round((amount - gold) * 100);

  // 실버가 100이면 골드로 변환
  if (silver >= 100) {
    return { gold: gold + 1, silver: 0 };
  }

  return { gold, silver };
}

/**
 * 골드와 실버 값을 소수점 골드로 변환
 *
 * @param currency - 골드와 실버로 구성된 Currency 객체
 * @returns - 골드 금액 (소수점 포함)
 */
export function goldSilverToGold(currency: Currency): number {
  return currency.gold + currency.silver / 100;
}

/**
 * 골드와 실버 값을 문자열로 포맷팅
 *
 * @param currency - 골드와 실버로 구성된 Currency 객체
 * @returns - "G골드 S실버" 형식의 문자열
 */
export function formatCurrency(currency: Currency): string {
  if (currency.silver > 0) {
    return `${currency.gold}골드 ${currency.silver}실버`;
  }
  return `${currency.gold}골드`;
}

/**
 * 소수점 골드 값을 포맷팅된 문자열로 변환
 *
 * @param amount - 골드 금액 (소수점 포함 가능)
 * @returns - "G골드 S실버" 형식의 문자열
 */
export function formatGoldWithSilver(amount: number): string {
  return formatCurrency(goldToGoldSilver(amount));
}
