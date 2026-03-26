import { Alert } from "react-native";
import { View, Text, TouchableOpacity, Link } from "../components/tw";
import { Animated } from "../components/tw/animated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCardStore, Card } from "../store/useCardStore";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { SortableCard } from "../components/SortableCard";
import { useCSSVariable } from "../components/tw";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { cards, setCards } = useCardStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [activeId, setActiveId] = useState<string | null>(null);

  const foreground = useCSSVariable("--color-foreground");
  const destructive = useCSSVariable("--color-destructive");
  const success = useCSSVariable("--color-success");
  const muted = useCSSVariable("--color-muted-foreground");

  useEffect(() => {
    if (!isEditing) {
      setLocalCards(cards);
    }
  }, [cards, isEditing]);

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newCards = [...localCards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    const secureToIndex = Math.max(0, Math.min(toIndex, newCards.length));
    newCards.splice(secureToIndex, 0, movedCard);
    setLocalCards(newCards);
  };

  const saveOrder = () => {
    setCards(localCards);
    setIsEditing(false);
  };

  const cancelOrder = () => {
    setLocalCards(cards);
    setIsEditing(false);
  };

  const handleDelete = (card: Card) => {
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
          },
        },
      ],
    );
  };

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
          <View className="flex-row">
            <TouchableOpacity
              onPress={cancelOrder}
              className="mr-4"
              accessibilityLabel={t("common.cancel")}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={32} color={destructive} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveOrder}
              accessibilityLabel={t("common.save")}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={32} color={success} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Animated.ScrollView
        contentContainerClassName="pb-24 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          {localCards.map((card, index) => (
            <SortableCard
              key={card.id}
              id={card.id}
              index={index}
              isEditing={isEditing}
              onReorder={handleReorder}
              onDelete={() => handleDelete(card)}
              onLongPress={() => setIsEditing(true)}
              cardsCount={localCards.length}
              isActive={activeId === card.id}
              onDragStart={() => setActiveId(card.id)}
              onDragEnd={() => setActiveId(null)}
              onTap={() => router.push(`/edit/${card.id}`)}
            >
              <TouchableOpacity
                className="w-full h-32 rounded-xl p-4 justify-between shadow-sm"
                style={{ backgroundColor: card.color }}
                activeOpacity={0.9}
              >
                <View className="self-end bg-white/20 p-1 rounded">
                  <Ionicons name="qr-code" size={20} color="white" />
                </View>
                <Text className="text-white font-bold text-lg">
                  {card.name}
                </Text>
              </TouchableOpacity>
            </SortableCard>
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
        </View>
      </Animated.ScrollView>
    </View>
  );
}
