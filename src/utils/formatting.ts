/**
 * 상수 정의
 */
const MIN_RATING = 1;
const MAX_RATING = 5;
const RATING_STAR = "★";

/**
 * 1-5 등급을 "★ N" 형식으로 변환하는 함수
 *
 * @param rating - 1-5 범위의 등급
 * @returns - "★ N" 형식의 문자열
 */
export function formatRating(rating: number): string {
  // 입력값 검증
  if (isNaN(rating)) {
    console.warn(`formatRating: Invalid rating value '${rating}'`);
    return `${RATING_STAR} ${MIN_RATING}`;
  }

  // 유효 범위로 정규화
  const normalizedRating = Math.min(Math.max(MIN_RATING, rating), MAX_RATING);
  return `${RATING_STAR} ${normalizedRating}`;
}

/**
 * 골드 금액 형식화 함수
 *
 * @param amount - 골드 금액
 * @returns - 형식화된 골드 금액 문자열 (예: "1,234")
 */
export function formatGold(amount: number): string {
  // 입력값 검증
  if (isNaN(amount)) {
    console.warn(`formatGold: Invalid amount value '${amount}'`);
    return "0";
  }

  return amount.toLocaleString();
}
