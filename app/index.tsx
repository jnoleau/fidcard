import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCardStore, Card } from "../store/useCardStore";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SortableCard } from "../components/SortableCard";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { cards, setCards } = useCardStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setLocalCards(cards);
    }
  }, [cards, isEditing]);

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newCards = [...localCards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    // Ensure toIndex is within bounds
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
      t(
        "home.delete_card_message",
        "Êtes-vous sûr de vouloir supprimer la carte {{name}} ?",
        { name: card.name }
      ),
      [
        {
          text: t("common.cancel", "Annuler"),
          style: "cancel",
        },
        {
          text: t("common.delete", "Supprimer"),
          style: "destructive",
          onPress: () => {
            useCardStore.getState().removeCard(card.id);
            // Since localCards is derived from cards in useEffect when not editing,
            // but we are editing, we must also update localCards to reflect deletion immediately
            setLocalCards((prev) => prev.filter((c) => c.id !== card.id));
          },
        },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
        <StatusBar style="dark" />
        <View className="flex-row items-center justify-between mb-6 mt-2 px-4">
          <View className="flex-row items-center">
            <Ionicons name="card" size={32} color="#333" />
            <Text className="text-3xl font-bold ml-3 text-gray-800">
              {t("home.title")}
            </Text>
          </View>
          {isEditing && (
            <View className="flex-row">
              <TouchableOpacity onPress={cancelOrder} className="mr-4">
                <Ionicons name="close-circle" size={32} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={saveOrder}>
                <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Animated.ScrollView
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View className="flex-row flex-wrap justify-between">
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

            <Link href={"/scan" as any} asChild disabled={isEditing}>
              <TouchableOpacity
                className={`w-[48%] h-32 rounded-xl p-4 justify-center items-center mb-4 border-2 border-dashed border-gray-300 bg-gray-50 ${isEditing ? "opacity-50" : ""}`}
                disabled={isEditing}
              >
                <Ionicons name="add-circle-outline" size={40} color="#9ca3af" />
                <Text className="text-gray-400 font-medium mt-2">
                  {t("home.scan_card")}
                </Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
        </Animated.ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}
