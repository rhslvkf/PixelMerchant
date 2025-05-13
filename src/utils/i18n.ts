import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 언어 리소스 파일 임포트
import ko from "../assets/i18n/ko.json";
import en from "../assets/i18n/en.json";

/**
 * i18next 초기화 및 설정
 */
i18n.use(initReactI18next).init({
  resources: {
    ko: {
      translation: ko,
    },
    en: {
      translation: en,
    },
  },
  lng: "ko", // 기본 언어
  fallbackLng: "en", // 번역이 없을 경우 영어로 대체
  interpolation: {
    escapeValue: false, // 리액트는 이미 XSS를 방지하므로 false로 설정
  },
  react: {
    useSuspense: false, // 서스펜스 사용 안함
  },
});

/**
 * 현재 설정된 언어 가져오기
 */
export const getCurrentLanguage = () => i18n.language;

/**
 * 언어 변경 함수
 */
export const changeLanguage = (lang: string) => {
  return i18n.changeLanguage(lang);
};

export default i18n;
