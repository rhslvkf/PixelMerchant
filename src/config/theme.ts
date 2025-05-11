// 색상 팔레트
export const COLORS = {
  // 주요 색상
  primary: "#E6B422", // 골드 (강조)
  secondary: "#1A3A5A", // 네이비 (기본)
  tertiary: "#8B4513", // 브라운 (보조)
  gold: "#E6B422", // 골드 (강조)
  silver: "#C0C0C0", // 은 (보조)

  // 테마별 색상
  berdan: "#34623F", // 베르단 제국
  riona: "#3F88C5", // 리오나 연합
  kragmore: "#8B4513", // 크라그모어
  sahel: "#E1C16E", // 사헬 사막
  azure: "#3A7D7D", // 아주르 제도

  // 기능적 색상
  success: "#4CAF50", // 성공/이익
  danger: "#F44336", // 위험/손실
  info: "#2196F3", // 정보/중립
  rare: "#9C27B0", // 희귀/특별

  // 인터페이스 색상
  background: {
    dark: "#121212",
    light: "#F5F5DC",
  },
  text: {
    dark: "#212121",
    light: "#F5F5F5",
  },
  disabled: "#9E9E9E",
};

// 타이포그래피
export const TYPOGRAPHY = {
  fontFamily: {
    base: undefined, // 기본 시스템 폰트 (추후 사용자 정의 폰트로 변경 가능)
    pixel: undefined, // 픽셀 폰트 (추후 추가)
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  fontWeight: {
    regular: "normal" as const,
    medium: "500" as const,
    bold: "bold" as const,
  },
};

// 여백 및 크기
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// 테두리
export const BORDERS = {
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 20,
    round: 9999,
  },
  width: {
    thin: 1,
    regular: 2,
    thick: 3,
  },
};

// 그림자
export const SHADOWS = {
  light: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dark: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};
