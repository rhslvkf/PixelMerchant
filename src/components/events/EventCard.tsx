import React from "react";
import { StyleSheet, View } from "react-native";
import { BORDERS, COLORS, SHADOWS, SPACING } from "../../config/theme";
import { EventChoice as EventChoiceType, GameEvent } from "../../models";
import PixelText from "../PixelText";
import EventChoice from "./EventChoice";
import EventOutcome from "./EventOutcome";

interface EventCardProps {
  event: GameEvent;
  selectedChoice: string | null;
  selectedOutcome: any | null;
  onSelectChoice: (choiceId: string) => void;
  onConfirmChoice: () => void;
  canSelectChoice: (choice: EventChoiceType) => boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  selectedChoice,
  selectedOutcome,
  onSelectChoice,
  onConfirmChoice,
  canSelectChoice,
}) => {
  // 결과 선택됨 - 결과 컴포넌트 표시
  if (selectedChoice && selectedOutcome) {
    return (
      <View style={styles.container}>
        <PixelText variant="subtitle" style={styles.title}>
          {event.title}
        </PixelText>
        <EventOutcome outcome={selectedOutcome} onContinue={onConfirmChoice} />
      </View>
    );
  }

  // 선택지 선택 대기 중 - 선택지 표시
  return (
    <View style={styles.container}>
      <PixelText variant="subtitle" style={styles.title}>
        {event.title}
      </PixelText>

      <View style={styles.descriptionContainer}>
        <PixelText style={styles.description}>{event.description}</PixelText>
      </View>

      <View style={styles.choicesContainer}>
        <PixelText style={styles.choiceHeader}>어떻게 하시겠습니까?</PixelText>

        {event.choices.map((choice) => (
          <EventChoice
            key={choice.id}
            choice={choice}
            isSelected={selectedChoice === choice.id}
            canSelect={canSelectChoice(choice)}
            onSelect={onSelectChoice}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: `${COLORS.background.dark}B3`,
    borderRadius: BORDERS.radius.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  title: {
    textAlign: "center",
    marginBottom: SPACING.md,
    color: COLORS.primary,
  },
  descriptionContainer: {
    backgroundColor: `${COLORS.secondary}80`,
    padding: SPACING.md,
    borderRadius: BORDERS.radius.sm,
    marginBottom: SPACING.lg,
  },
  description: {
    lineHeight: 22,
  },
  choicesContainer: {
    flex: 1,
  },
  choiceHeader: {
    fontWeight: "bold",
    marginBottom: SPACING.md,
    textAlign: "center",
  },
});

export default EventCard;
