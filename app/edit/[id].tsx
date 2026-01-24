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

  const isNew = id === "new";
  const existingCard = !isNew ? cards.find((c) => c.id === id) : null;

  // Default format heuristic: QR if > 20 chars, else Barcode
  const getFormat = (val?: string) =>
    val && val.length > 20 ? "qrcode" : "barcode";

  // Determine initial values based on mode (new vs edit)
  const initialCardValues = isNew
    ? {
        name: "",
        color: paramColor || "#ffffff",
        value: paramValue || "",
        format: (paramFormat as "qrcode" | "barcode") || getFormat(paramValue),
      }
    : existingCard
      ? {
          name: existingCard.name,
          color: existingCard.color,
          value: existingCard.value,
          format: existingCard.format,
        }
      : null;

  // If we are editing but card is not found, we handle it below
  if (!isNew && !existingCard) {
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
    if (isNew) {
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
      initialValues={initialCardValues!}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
