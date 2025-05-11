/**
 * 1-5 등급을 "★ N" 형식으로 변환하는 함수
 *
 * @param rating - 1-5 범위의 등급
 * @returns - "★ N" 형식의 문자열
 */
export function formatRating(rating: number): string {
  // 1-5 범위로 제한
  const normalizedRating = Math.min(Math.max(1, rating), 5);
  return `★ ${normalizedRating}`;
}
