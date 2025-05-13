import { TransportType } from "../models/index";
import i18n from "./i18n";

/**
 * 지역화 맵핑 객체
 */
// 문화 코드 -> 한국어 이름 매핑
const CULTURE_MAP: Record<string, string> = {
  berdan: "베르단",
  riona: "리오나",
  kragmore: "크라그모어",
  sahel: "사헬",
  azure: "아주르",
};

// 운송 수단 타입 -> 한국어 이름 매핑
const TRANSPORT_MAP: Record<TransportType, string> = {
  [TransportType.FOOT]: "도보",
  [TransportType.CART]: "마차",
  [TransportType.SHIP]: "배",
  [TransportType.SPECIAL]: "특수 운송",
};

/**
 * 문화 코드를 현지화된 이름으로 변환
 *
 * @param cultureCode - 문화 코드
 * @returns - 현지화된 문화 이름
 */
export function getCultureName(cultureCode: string): string {
  if (!cultureCode) {
    console.warn("getCultureName: Empty culture code provided");
    return "";
  }

  const translation = i18n.t(`cultures.${cultureCode}`);
  // 번역이 존재하지 않으면 원본 코드 반환 (i18next가 키를 반환)
  return translation === `cultures.${cultureCode}` ? cultureCode : String(translation);
}

/**
 * 운송 수단을 현지화된 이름으로 변환
 *
 * @param transportType - 운송 수단 타입
 * @returns - 현지화된 운송 수단 이름
 */
export function getTransportName(transportType: TransportType): string {
  if (!Object.values(TransportType).includes(transportType)) {
    console.warn(`getTransportName: Invalid transport type '${transportType}'`);
    return String(transportType);
  }

  return String(i18n.t(`transport.${transportType}`));
}

/**
 * 일반 지역화 함수 (키를 통한 번역 검색)
 *
 * @param key - 번역 키
 * @param options - 추가 옵션 (변수 대체 등)
 * @returns - 번역된 문자열
 */
export function t(key: string, options?: any): string {
  return String(i18n.t(key, options));
}

/**
 * 지역화 함수 타입 (추후 확장용)
 */
export type LocalizationFunction = (key: string, options?: any) => string;

/**
 * 현재 언어 가져오기
 */
export const getCurrentLanguage = (): string => i18n.language;

/**
 * 언어 변경 함수
 *
 * @param lang - 변경할 언어 코드
 */
export const setLanguage = (lang: string): Promise<any> => {
  return i18n.changeLanguage(lang);
};
