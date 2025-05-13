import { useTranslation } from "react-i18next";
import { TransportType } from "../models";
import { changeLanguage, getCurrentLanguage } from "../utils/i18n";

/**
 * 지역화 훅 인터페이스
 */
interface UseLocalizationReturn {
  // 일반 번역 기능
  t: (key: string, options?: any) => string;

  // 문화 코드 번역
  getCultureName: (cultureCode: string) => string;

  // 운송 수단 번역
  getTransportName: (transportType: TransportType) => string;

  // 언어 변경 기능
  changeLanguage: (lang: string) => Promise<any>;

  // 현재 언어 확인
  currentLanguage: string;

  // 지원 언어 목록
  supportedLanguages: { code: string; name: string }[];
}

/**
 * 지역화 기능을 제공하는 커스텀 훅
 */
export const useLocalization = (): UseLocalizationReturn => {
  const { t, i18n } = useTranslation();

  // 지원 언어 목록
  const supportedLanguages = [
    { code: "ko", name: "한국어" },
    { code: "en", name: "English" },
  ];

  // 문화 코드 번역
  const getCultureName = (cultureCode: string): string => {
    if (!cultureCode) {
      console.warn("getCultureName: Empty culture code provided");
      return "";
    }

    const translation = t(`cultures.${cultureCode}`);
    // 번역이 존재하지 않으면 원본 코드 반환 (i18next가 키를 반환)
    return translation !== `cultures.${cultureCode}` ? translation : cultureCode;
  };

  // 운송 수단 번역
  const getTransportName = (transportType: TransportType): string => {
    if (!Object.values(TransportType).includes(transportType)) {
      console.warn(`getTransportName: Invalid transport type '${transportType}'`);
      return String(transportType);
    }

    return t(`transport.${transportType}`);
  };

  return {
    t,
    getCultureName,
    getTransportName,
    changeLanguage,
    currentLanguage: getCurrentLanguage(),
    supportedLanguages,
  };
};
