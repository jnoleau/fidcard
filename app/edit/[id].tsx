import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCardStore } from "../../store/useCardStore";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ColorPicker, { Panel1, HueSlider } from "reanimated-color-picker";
import { useSharedValue } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import CodeDisplay from "../../components/CodeDisplay";

export default function EditCard() {
  const {
    id,
    value: initialValue,
    color: initialColor,
  } = useLocalSearchParams<{ id: string; value?: string; color?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, updateCard, addCard } = useCardStore();
  const { t } = useTranslation();

  const isNew = id === "new";
  const card = isNew ? null : cards.find((c) => c.id === id);

  const [name, setName] = useState(card?.name || "");
  const [color, setColor] = useState(
    card?.color || (initialColor as string) || "#ffffff"
  );
  const [value, setValue] = useState(
    card?.value || (initialValue as string) || ""
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  const pickerColor = useSharedValue(color || "#ffffff");

  const openColorPicker = () => {
    pickerColor.value = color || "#ffffff";
    setShowColorPicker(true);
  };

  const handleCancelColor = () => {
    pickerColor.value = color || "#ffffff"; // Reset preview to original color
    setShowColorPicker(false);
  };

  const handleConfirmColor = () => {
    setColor(pickerColor.value);
    setShowColorPicker(false);
  };

  useEffect(() => {
    if (card) {
      setName(card.name);
      setColor(card.color);
      setValue(card.value);
    }
  }, [card]);

  // Removed the "Carte non trouvée" check for 'new' case
  if (!isNew && !card) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carte non trouvée</Text>
      </View>
    );
  }

  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; value?: string } = {};
    if (!name.trim()) newErrors.name = t("edit.error_name");
    if (!value.trim()) newErrors.value = t("edit.error_value");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (isNew) {
      addCard({
        id: Date.now().toString(),
        name,
        color,
        value,
      });
    } else {
      updateCard(id, { name, color, value });
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="px-4 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 -ml-2 mr-2"
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold text-gray-800 flex-1"
          numberOfLines={1}
        >
          {name}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          className={`bg-blue-600 px-4 py-2 rounded-lg ${errors.name || errors.value ? "opacity-50" : ""}`}
        >
          <Text className="text-white font-bold">{t("common.save")}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 24,
          paddingBottom: 40,
        }}
        bottomOffset={20}
      >
        <View className="mb-8 items-center w-full px-4">
          <CodeDisplay value={value} color={color} />
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">
              {t("edit.brand_label")}
            </Text>
            <View
              className={`flex-row items-center rounded-lg border ${errors.name ? "border-red-500" : "border-gray-300"} pr-3`}
            >
              <TextInput
                className="flex-1 p-4"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={t("edit.brand_placeholder")}
              />
              <TouchableOpacity
                onPress={openColorPicker}
                className="w-8 h-8 rounded border border-gray-200 shadow-sm ml-2"
                style={{ backgroundColor: color || "#ffffff" }}
              />
            </View>
            {errors.name && (
              <Text className="text-red-500 text-sm ml-1 mt-1">
                {errors.name}
              </Text>
            )}
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">
              {t("edit.value_label")}
            </Text>
            <TextInput
              className={`p-4 rounded-lg border ${errors.value ? "border-red-500" : "border-gray-300"}`}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                if (errors.value) setErrors({ ...errors, value: undefined });
              }}
              placeholder={t("edit.value_placeholder")}
            />
            {errors.value && (
              <Text className="text-red-500 text-sm ml-1 mt-1">
                {errors.value}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Modal visible={showColorPicker} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end">
          <View className="bg-white p-6 rounded-t-3xl shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={handleCancelColor}
                className="px-4 py-2"
              >
                <Text className="text-red-500 font-medium text-lg">
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <Text className="text-xl font-bold text-gray-800">
                {t("edit.color_title")}
              </Text>

              <TouchableOpacity
                onPress={handleConfirmColor}
                className="bg-blue-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-bold">
                  {t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 400 }}>
              <ColorPicker
                style={{ width: "100%", flex: 1, gap: 20 }}
                value={color || "#ffffff"}
                onChange={({ hex }) => {
                  "worklet";
                  pickerColor.value = hex;
                }}
              >
                <Panel1 style={{ borderRadius: 16 }} />
                <HueSlider style={{ borderRadius: 16, height: 40 }} />
              </ColorPicker>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
