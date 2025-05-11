import { TransportType } from "../models/types";

// 문화 코드를 한국어 이름으로 변환
export function getCultureName(cultureCode: string): string {
  const cultureMap: Record<string, string> = {
    berdan: "베르단",
    riona: "리오나",
    kragmore: "크라그모어",
    sahel: "사헬",
    azure: "아주르",
  };

  return cultureMap[cultureCode] || cultureCode;
}

// 운송 수단을 한국어로 변환
export function getTransportName(transportType: TransportType): string {
  const transportMap: Record<TransportType, string> = {
    [TransportType.FOOT]: "도보",
    [TransportType.CART]: "마차",
    [TransportType.SHIP]: "배",
    [TransportType.SPECIAL]: "특수 운송",
  };

  return transportMap[transportType] || transportType;
}
