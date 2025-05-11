import { TransportType } from "../models/types";

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
  return CULTURE_MAP[cultureCode] || cultureCode;
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
  return TRANSPORT_MAP[transportType];
}

/**
 * 지역화 함수 타입 (추후 확장용)
 */
export type LocalizationFunction = (key: string) => string;
