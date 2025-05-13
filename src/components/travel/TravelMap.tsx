import React from "react";
import { Image, StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { City } from "../../models";

interface TravelMapProps {
  fromCity: City;
  toCity: City;
  progress: number; // 0~1 사이의 진행률
}

const TravelMap: React.FC<TravelMapProps> = ({ fromCity, toCity, progress }) => {
  // SVG 맵 크기
  const width = 300;
  const height = 200;

  // 도시 위치 설정 (실제로는 좌표 계산 로직이 필요)
  // 간단한 예시로 출발 도시는 왼쪽, 도착 도시는 오른쪽에 배치
  const startX = 50;
  const startY = 100;
  const endX = 250;
  const endY = 100;

  // 진행 위치 계산
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress;

  return (
    <View style={styles.container}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 경로 그리기 */}
        <Path
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          stroke={COLORS.secondary}
          strokeWidth="3"
          strokeDasharray="5,5"
        />

        {/* 진행된 경로 그리기 */}
        <Path d={`M ${startX} ${startY} L ${currentX} ${currentY}`} stroke={COLORS.primary} strokeWidth="3" />

        {/* 출발 도시 */}
        <Circle cx={startX} cy={startY} r="10" fill={COLORS.secondary} stroke={COLORS.primary} strokeWidth="2" />

        {/* 도착 도시 */}
        <Circle cx={endX} cy={endY} r="10" fill={COLORS.secondary} stroke={COLORS.primary} strokeWidth="2" />

        {/* 현재 위치 */}
        <Circle cx={currentX} cy={currentY} r="7" fill={COLORS.berdan} />

        {/* 도시 이름 */}
        <SvgText x={startX} y={startY - 15} fontSize="12" fill={COLORS.text.light} textAnchor="middle">
          {fromCity.name}
        </SvgText>

        <SvgText x={endX} y={endY - 15} fontSize="12" fill={COLORS.text.light} textAnchor="middle">
          {toCity.name}
        </SvgText>
      </Svg>

      {/* 대체 이미지 (SVG가 지원되지 않을 경우) */}
      <Image source={require("../../assets/images/map_fallback.webp")} style={styles.fallbackImage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.background.dark}B3`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },
  fallbackImage: {
    width: 300,
    height: 200,
    position: "absolute",
    opacity: 0, // SVG가 작동하지 않을 때만 보이도록 설정
  },
});

export default TravelMap;
