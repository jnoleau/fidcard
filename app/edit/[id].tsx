import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCardStore } from "../../store/useCardStore";
import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
  Panel2,
} from "reanimated-color-picker";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

export default function EditCard() {
  const {
    id,
    value: initialValue,
    color: initialColor,
  } = useLocalSearchParams<{ id: string; value?: string; color?: string }>();
  // ... (imports remain)
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards, updateCard, addCard } = useCardStore();

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

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: pickerColor.value,
    };
  });

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

  // ... inside EditCard component ...
  const [errors, setErrors] = useState<{ name?: string; value?: string }>({});

  // ... (useEffect remains)

  const validate = () => {
    const newErrors: { name?: string; value?: string } = {};
    if (!name.trim()) newErrors.name = "Le nom est obligatoire";
    if (!value.trim()) newErrors.value = "La valeur est obligatoire";
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
      <View className="px-4 py-4 flex-row items-center justify-between border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">
          Modifier la carte
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          className={`bg-blue-600 px-4 py-2 rounded-lg ${errors.name || errors.value ? "opacity-50" : ""}`}
        >
          <Text className="text-white font-bold">Enregistrer</Text>
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
        <View className="mb-8 items-center">
          <Animated.View
            className="w-64 h-40 rounded-2xl p-6 justify-between shadow-lg relative"
            style={[animatedCardStyle]}
          >
            <TouchableOpacity
              onPress={openColorPicker}
              className="absolute top-4 left-4 w-8 h-8 rounded border-2 border-white shadow-sm z-10"
              style={{ backgroundColor: color || "#ccc" }}
            />
            <View className="self-end bg-white/20 p-2 rounded-lg">
              <Ionicons name="qr-code" size={32} color="white" />
            </View>
            <Text className="text-white font-bold text-2xl">
              {name || "..."}
            </Text>
          </Animated.View>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">
              Nom de l'enseigne
            </Text>
            <TextInput
              className={`bg-gray-50 p-4 rounded-lg border ${errors.name ? "border-red-500" : "border-gray-100"}`}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              placeholder="Ex: Auchan, Fnac..."
            />
            {errors.name && (
              <Text className="text-red-500 text-sm ml-1 mt-1">
                {errors.name}
              </Text>
            )}
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">
              Valeur (Code barre / QR Code)
            </Text>
            <TextInput
              className={`bg-gray-50 p-4 rounded-lg border ${errors.value ? "border-red-500" : "border-gray-100"}`}
              value={value}
              onChangeText={(text) => {
                setValue(text);
                if (errors.value) setErrors({ ...errors, value: undefined });
              }}
              placeholder="Numéro de la carte..."
            />
            {errors.value && (
              <Text className="text-red-500 text-sm ml-1 mt-1">
                {errors.value}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* ... (ColorPicker Modal remains) ... */}
      <Modal visible={showColorPicker} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end">
          <View className="bg-white p-6 rounded-t-3xl shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={handleCancelColor}
                className="px-4 py-2"
              >
                <Text className="text-red-500 font-medium text-lg">
                  Annuler
                </Text>
              </TouchableOpacity>

              <Text className="text-xl font-bold text-gray-800">Couleur</Text>

              <TouchableOpacity
                onPress={handleConfirmColor}
                className="bg-blue-600 px-4 py-2 rounded-full"
              >
                <Text className="text-white font-bold">Valider</Text>
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
