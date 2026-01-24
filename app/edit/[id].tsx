import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCardStore } from "../../store/useCardStore";
import CardEditor from "../../components/CardEditor";

export default function EditCard() {
  const {
    id,
    value: paramValue,
    color: paramColor,
    format: paramFormat,
  } = useLocalSearchParams<{
    id: string;
    value?: string;
    color?: string;
    format?: "qrcode" | "barcode";
  }>();
  const router = useRouter();
  const { cards, updateCard, addCard } = useCardStore();

  const card = cards.find((c) => c.id === id) || {
    id: undefined,
    name: "",
    color: paramColor,
    value: paramValue,
    format: paramFormat,
  };

  const initialColor = card.color;
  const initialValue = card.value;
  const initialFormat = card.format;

  // If we are editing but card is not found, we handle it below
  if (!initialColor || !initialValue || !initialFormat) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carte non trouvée</Text>
      </View>
    );
  }

  const handleSave = (data: {
    name: string;
    color: string;
    value: string;
    format: "qrcode" | "barcode";
  }) => {
    if (card.id === undefined) {
      addCard({
        id: Date.now().toString(),
        ...data,
      });
    } else {
      updateCard(id, data);
    }
    router.back();
  };

  return (
    <CardEditor
      initialValues={{
        name: card.name,
        color: initialColor,
        value: initialValue,
        format: initialFormat,
      }}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
