import { StackNavigationProp } from "@react-navigation/stack";

// 네비게이션 파라미터 타입 정의
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  CharacterCreation: undefined;
  City: undefined;
  Market: undefined;
  Inventory: undefined;
  Character: undefined;
  Travel: { destination: string };
  Event: { eventId: string; eventType: "travel" | "city" | "story" | "trade" };
};

// 네비게이션 타입
export type AppNavigationProp = StackNavigationProp<RootStackParamList>;
