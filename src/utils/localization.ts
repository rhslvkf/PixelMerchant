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
