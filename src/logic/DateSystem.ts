import { GameDate, Season } from "../models/types";

/**
 * 게임 날짜를 하루 진행시키는 함수
 *
 * @param date - 현재 게임 날짜
 * @returns - 하루 진행된 게임 날짜
 */
export function advanceDate(date: GameDate): GameDate {
  const newDate = { ...date };

  // 일 증가
  newDate.day += 1;

  // 월 정규화
  if (newDate.day > 30) {
    // 한 달은 30일로 고정
    newDate.day = 1;
    newDate.month += 1;

    // 계절 변경 체크
    if ((newDate.month - 1) % 3 === 0) {
      // 3개월마다 계절 변경
      newDate.season = getNextSeason(newDate.season);
    }

    // 년 정규화
    if (newDate.month > 12) {
      newDate.month = 1;
      newDate.year += 1;
    }
  }

  return newDate;
}

/**
 * 다음 계절 계산
 */
function getNextSeason(currentSeason: Season): Season {
  switch (currentSeason) {
    case Season.SPRING:
      return Season.SUMMER;
    case Season.SUMMER:
      return Season.FALL;
    case Season.FALL:
      return Season.WINTER;
    case Season.WINTER:
      return Season.SPRING;
    default:
      return currentSeason;
  }
}

/**
 * 날짜 형식 지정
 *
 * @param date - 게임 날짜
 * @returns - 형식화된 날짜 문자열
 */
export function formatDate(date: GameDate): string {
  return `${date.year}년 ${date.month}월 ${date.day}일`;
}

/**
 * 계절 이름 반환
 *
 * @param season - 계절 열거형
 * @returns - 계절 이름
 */
export function getSeasonName(season: Season): string {
  switch (season) {
    case Season.SPRING:
      return "봄";
    case Season.SUMMER:
      return "여름";
    case Season.FALL:
      return "가을";
    case Season.WINTER:
      return "겨울";
    default:
      return "알 수 없음";
  }
}
