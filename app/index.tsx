import { Alert } from "react-native";
import { View, Text, TouchableOpacity, Link, useCSSVariable, Pressable } from "../components/tw";
import { Animated } from "../components/tw/animated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCardStore, Card } from "../store/useCardStore";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useCallback, useRef } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useAnimatedStyle, useSharedValue, withSpring, runOnJS } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SortableCard } from "../components/SortableCard";
import {
  CARD_WIDTH,
  CONTAINER_WIDTH,
  COLUMNS,
  LONG_PRESS_DURATION,
  ROW_HEIGHT,
} from "../constants";

const CARD_HEIGHT = ROW_HEIGHT - 16;

const getPosition = (idx: number) => {
  "worklet";
  const row = Math.floor(idx / COLUMNS);
  const col = idx % COLUMNS;
  const x = col === 0 ? 0 : CONTAINER_WIDTH - CARD_WIDTH;
  const y = row * ROW_HEIGHT;
  return { x, y };
};

const getIndexFromPoint = (x: number, y: number, maxIndex: number) => {
  "worklet";
  const clampedX = Math.max(0, Math.min(x, CONTAINER_WIDTH));
  const col = clampedX > CONTAINER_WIDTH / 2 ? 1 : 0;
  const row = Math.floor(Math.max(0, y) / ROW_HEIGHT);
  const idx = row * COLUMNS + col;
  return Math.max(0, Math.min(idx, maxIndex));
};

const getCardIndexAtPoint = (x: number, y: number, cardsCount: number) => {
  "worklet";
  if (cardsCount <= 0) return -1;

  const candidateIndex = getIndexFromPoint(x, y, cardsCount - 1);
  const position = getPosition(candidateIndex);
  const isInsideX = x >= position.x && x <= position.x + CARD_WIDTH;
  const isInsideY = y >= position.y && y <= position.y + CARD_HEIGHT;

  return isInsideX && isInsideY ? candidateIndex : -1;
};

function triggerHaptic() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

function CardFace({ card, onPress, disabled }: { card: Card; onPress: () => void; disabled: boolean }) {
  return (
    <TouchableOpacity
      className="w-full h-32 rounded-xl p-4 justify-between shadow-sm"
      style={{ backgroundColor: card.color }}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={disabled}
    >
      <View className="self-end bg-white/20 p-1 rounded">
        <Ionicons name="qr-code" size={20} color="white" />
      </View>
      <Text className="text-white font-bold text-lg">{card.name}</Text>
    </TouchableOpacity>
  );
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const { cards, setCards } = useCardStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [activeId, setActiveId] = useState<string | null>(null);
  const suppressedOpenIdRef = useRef<string | null>(null);

  const foreground = useCSSVariable("--color-foreground");
  const success = useCSSVariable("--color-success");
  const muted = useCSSVariable("--color-muted-foreground");

  const dragSlotIndex = useSharedValue(-1);
  const dragTranslateX = useSharedValue(0);
  const dragTranslateY = useSharedValue(0);
  const dragCorrectionX = useSharedValue(0);
  const dragCorrectionY = useSharedValue(0);
  const dragScale = useSharedValue(1);
  const cardsCount = useSharedValue(localCards.length);

  useEffect(() => {
    cardsCount.value = localCards.length;
  }, [cardsCount, localCards.length]);

  useEffect(() => {
    if (!isEditing) {
      setLocalCards(cards);
    }
  }, [cards, isEditing]);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setLocalCards((prev) => {
      if (fromIndex === toIndex) return prev;
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      const nextCards = [...prev];
      const [movedCard] = nextCards.splice(fromIndex, 1);
      if (!movedCard) return prev;
      const safeIndex = Math.max(0, Math.min(toIndex, nextCards.length));
      nextCards.splice(safeIndex, 0, movedCard);
      return nextCards;
    });
  }, []);

  const startDragAtIndex = useCallback(
    (index: number) => {
      const card = localCards[index];
      if (!card) return;
      suppressedOpenIdRef.current = card.id;
      setIsEditing(true);
      setActiveId(card.id);
    },
    [localCards],
  );

  const finishDrag = useCallback(() => {
    setActiveId(null);
    requestAnimationFrame(() => {
      suppressedOpenIdRef.current = null;
    });
  }, []);

  const saveOrder = useCallback(() => {
    setCards(localCards);
    setIsEditing(false);
    setActiveId(null);
  }, [localCards, setCards]);

  const handleDelete = useCallback(
    (card: Card) => {
      Alert.alert(
        t("home.delete_card_title", "Supprimer la carte"),
        t("home.delete_card_message", "Supprimer la carte {{name}} ?", {
          name: card.name,
        }),
        [
          { text: t("common.cancel", "Annuler"), style: "cancel" },
          {
            text: t("common.delete", "Supprimer"),
            style: "destructive",
            onPress: () => {
              useCardStore.getState().removeCard(card.id);
              setLocalCards((prev) => prev.filter((c) => c.id !== card.id));
              if (activeId === card.id) {
                setActiveId(null);
              }
            },
          },
        ],
      );
    },
    [activeId, t],
  );

  const activeCard = activeId
    ? localCards.find((card) => card.id === activeId) ?? null
    : null;

  const pan = Gesture.Pan()
    .minDistance(1)
    .shouldCancelWhenOutside(false)
    .onStart((event) => {
      const touchedIndex = getCardIndexAtPoint(event.x, event.y, cardsCount.value);
      if (touchedIndex === -1) {
        dragSlotIndex.value = -1;
        return;
      }

      dragSlotIndex.value = touchedIndex;
      dragTranslateX.value = 0;
      dragTranslateY.value = 0;
      dragCorrectionX.value = 0;
      dragCorrectionY.value = 0;
      dragScale.value = withSpring(1.05);
      runOnJS(triggerHaptic)();
      runOnJS(startDragAtIndex)(touchedIndex);
    })
    .onUpdate((event) => {
      if (dragSlotIndex.value < 0) return;

      dragTranslateX.value = event.translationX + dragCorrectionX.value;
      dragTranslateY.value = event.translationY + dragCorrectionY.value;

      const currentPosition = getPosition(dragSlotIndex.value);
      const targetIndex = getIndexFromPoint(
        currentPosition.x + CARD_WIDTH / 2 + dragTranslateX.value,
        currentPosition.y + ROW_HEIGHT / 2 + dragTranslateY.value,
        cardsCount.value - 1,
      );

      if (targetIndex !== dragSlotIndex.value) {
        const nextPosition = getPosition(targetIndex);
        dragCorrectionX.value += currentPosition.x - nextPosition.x;
        dragCorrectionY.value += currentPosition.y - nextPosition.y;
        dragTranslateX.value = event.translationX + dragCorrectionX.value;
        dragTranslateY.value = event.translationY + dragCorrectionY.value;

        const fromIndex = dragSlotIndex.value;
        dragSlotIndex.value = targetIndex;
        runOnJS(handleReorder)(fromIndex, targetIndex);
      }
    })
    .onFinalize(() => {
      if (dragSlotIndex.value < 0) return;

      dragTranslateX.value = withSpring(0);
      dragTranslateY.value = withSpring(0);
      dragScale.value = withSpring(1);
      dragSlotIndex.value = -1;
      runOnJS(triggerHaptic)();
      runOnJS(finishDrag)();
    });

  if (!isEditing) {
    pan.activateAfterLongPress(LONG_PRESS_DURATION);
  }

  const overlayStyle = useAnimatedStyle(() => {
    if (dragSlotIndex.value < 0) {
      return { opacity: 0 };
    }

    const position = getPosition(dragSlotIndex.value);
    return {
      opacity: 1,
      left: position.x,
      top: position.y,
      transform: [
        { translateX: dragTranslateX.value },
        { translateY: dragTranslateY.value },
        { scale: dragScale.value },
      ],
    };
  });

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="flex-row items-center justify-between mb-6 mt-2 px-4">
        <View className="flex-row items-center">
          <Ionicons name="card" size={32} color={foreground} />
          <Text className="text-3xl font-bold ml-3 text-foreground">
            {t("home.title")}
          </Text>
        </View>
        {isEditing && (
          <TouchableOpacity
            onPress={saveOrder}
            accessibilityLabel={t("common.save")}
            accessibilityRole="button"
          >
            <Ionicons name="checkmark-circle" size={32} color={success} />
          </TouchableOpacity>
        )}
      </View>

      <Animated.ScrollView
        contentContainerClassName="flex-grow pb-24 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isEditing}
      >
        <Pressable
          className="flex-1"
          onPress={isEditing && !activeId ? saveOrder : undefined}
          disabled={!isEditing || !!activeId}
        >
          <GestureDetector gesture={pan}>
            <View className="relative flex-row flex-wrap justify-between">
              {localCards.map((card) => (
                <View key={card.id} className="w-[48%]">
                  <SortableCard
                    isEditing={isEditing}
                    isActive={activeId === card.id}
                    onDelete={() => handleDelete(card)}
                  >
                    <CardFace
                      card={card}
                      onPress={() => {
                        if (suppressedOpenIdRef.current === card.id) {
                          suppressedOpenIdRef.current = null;
                          return;
                        }
                        router.push(`/edit/${card.id}`);
                      }}
                      disabled={isEditing}
                    />
                  </SortableCard>
                </View>
              ))}

              <Link href="/scan" asChild disabled={isEditing}>
                <TouchableOpacity
                  className={`w-[48%] h-32 rounded-xl p-4 justify-center items-center mb-4 border-2 border-dashed border-border bg-background ${isEditing ? "opacity-50" : ""}`}
                  disabled={isEditing}
                  accessibilityLabel={t("home.scan_card")}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={40}
                    color={muted}
                  />
                  <Text className="text-muted-foreground font-medium mt-2">
                    {t("home.scan_card")}
                  </Text>
                </TouchableOpacity>
              </Link>

              {activeCard && (
                <Animated.View
                  pointerEvents="none"
                  className="absolute z-[9999]"
                  style={[{ width: CARD_WIDTH }, overlayStyle]}
                >
                  <CardFace card={activeCard} onPress={() => {}} disabled />
                </Animated.View>
              )}
            </View>
          </GestureDetector>
        </Pressable>
      </Animated.ScrollView>
    </View>
  );
}
