import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { FlatList, ImageBackground, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import PixelText from "../components/PixelText";
import QuestDetailsModal from "../components/quest/QuestDetailsModal";
import QuestListItem from "../components/quest/QuestListItem";
import { COLORS, SPACING } from "../config/theme";
import { useQuests } from "../hooks/useQuests";
import { Quest } from "../models";
import { AppNavigationProp } from "../navigation/types";

const QuestScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const {
    availableQuests,
    activeQuests,
    completedQuests,
    acceptQuest,
    abandonQuest,
    completeQuest,
    getPlayerQuestStatus,
  } = useQuests();

  // 상태 관리
  const [activeTab, setActiveTab] = useState<"available" | "active" | "completed">("active");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 탭에 따른 퀘스트 목록
  const questsToShow = () => {
    switch (activeTab) {
      case "available":
        return availableQuests;
      case "active":
        return activeQuests;
      case "completed":
        return completedQuests;
      default:
        return [];
    }
  };

  // 퀘스트 선택 처리
  const handleSelectQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setModalVisible(true);
  };

  // 탭 버튼 렌더링
  const renderTabButton = (title: string, tabName: "available" | "active" | "completed", count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabName && styles.activeTabButton]}
      onPress={() => setActiveTab(tabName)}
    >
      <PixelText style={[styles.tabText, activeTab === tabName && styles.activeTabText]}>
        {title} ({count})
      </PixelText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require("../assets/images/quest_background.webp")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <PixelText variant="subtitle">퀘스트</PixelText>
          </View>

          <View style={styles.tabContainer}>
            {renderTabButton("진행 중", "active", activeQuests.length)}
            {renderTabButton("수락 가능", "available", availableQuests.length)}
            {renderTabButton("완료됨", "completed", completedQuests.length)}
          </View>

          <FlatList
            data={questsToShow()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <QuestListItem quest={item} playerQuest={getPlayerQuestStatus(item.id)} onPress={handleSelectQuest} />
            )}
            contentContainerStyle={styles.questList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <PixelText>{getEmptyMessage()}</PixelText>
              </View>
            }
          />

          <View style={styles.footer}>
            <Button title="뒤로가기" onPress={() => navigation.goBack()} size="medium" type="secondary" />
          </View>
        </View>

        <QuestDetailsModal
          visible={modalVisible}
          quest={selectedQuest}
          playerQuest={selectedQuest ? getPlayerQuestStatus(selectedQuest.id) : undefined}
          onClose={() => setModalVisible(false)}
          onAccept={acceptQuest}
          onAbandon={abandonQuest}
          onComplete={completeQuest}
        />
      </ImageBackground>
    </SafeAreaView>
  );

  // 빈 목록일 때 메시지
  function getEmptyMessage() {
    switch (activeTab) {
      case "available":
        return "현재 도시에서 수락 가능한 퀘스트가 없습니다.";
      case "active":
        return "진행 중인 퀘스트가 없습니다.";
      case "completed":
        return "완료한 퀘스트가 없습니다.";
      default:
        return "표시할 퀘스트가 없습니다.";
    }
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SPACING.xs,
  },
  activeTabButton: {
    backgroundColor: COLORS.berdan,
  },
  tabText: {
    color: COLORS.text.light,
  },
  activeTabText: {
    fontWeight: "bold",
  },
  questList: {
    flexGrow: 1,
    paddingBottom: SPACING.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  footer: {
    marginTop: SPACING.md,
  },
});

export default QuestScreen;
