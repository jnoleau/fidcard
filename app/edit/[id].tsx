import { useLocalSearchParams, useRouter } from "expo-router";
import { useCardStore } from "../../store/useCardStore";
import CardEditor from "../../components/CardEditor";
import { View, Text } from "../../components/tw";

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

  if (
    initialColor === undefined ||
    initialValue === undefined ||
    initialFormat === undefined
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">Card not found</Text>
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
