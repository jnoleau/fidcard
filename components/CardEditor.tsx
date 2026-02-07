import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ColorPicker, { Panel1, HueSlider } from "reanimated-color-picker";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CodeDisplay from "./CodeDisplay";

interface CardEditorProps {
  initialValues: {
    name: string;
    color: string;
    value: string;
    format: "qrcode" | "barcode";
  };
  onSave: (data: {
    name: string;
    color: string;
    value: string;
    format: "qrcode" | "barcode";
  }) => void;
  onCancel: () => void;
}

export default function CardEditor({
  initialValues,
  onSave,
  onCancel,
}: CardEditorProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [name, setName] = useState(initialValues.name);
  const [color, setColor] = useState(initialValues.color);
  const [value, setValue] = useState(initialValues.value);
  const [format, setFormat] = useState<"qrcode" | "barcode">(
    initialValues.format,
  );

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [originalColor, setOriginalColor] = useState("");
  const pickerColor = useSharedValue(color || "#ffffff");

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
    onSave({ name, color, value, format });
  };

  const openColorPicker = () => {
    const currentColor = color || "#ffffff";
    setOriginalColor(currentColor);
    pickerColor.value = currentColor;
    setShowColorPicker(true);
  };

  const handleCancelColor = () => {
    setColor(originalColor);
    setShowColorPicker(false);
  };

  const handleConfirmColor = () => {
    setShowColorPicker(false);
  };

  const onColorChange = (hex: string) => {
    setColor(hex);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="px-4 py-4 flex-row items-center border-b border-gray-100">
        <TouchableOpacity onPress={onCancel} className="p-2 -ml-2 mr-2">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold text-gray-800 flex-1"
          numberOfLines={1}
        >
          {name ? name : "..."}
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
        <View className="mb-8 px-2">
          <View
            className="items-center justify-center bg-white rounded-2xl py-10 shadow-lg"
            style={{
              borderColor: color,
              borderWidth: 4,
              borderTopWidth: 40,
            }}
          >
            <CodeDisplay value={value || "123456"} format={format} />
          </View>
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
                selectTextOnFocus
                autoCorrect={false}
                spellCheck={false}
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
            <View
              className={`flex-row items-center rounded-lg border ${errors.value ? "border-red-500" : "border-gray-300"} pr-3`}
            >
              <TextInput
                className="flex-1 p-4"
                value={value}
                selectTextOnFocus
                autoCorrect={false}
                spellCheck={false}
                onChangeText={(text) => {
                  setValue(text);
                  if (errors.value) setErrors({ ...errors, value: undefined });
                }}
                placeholder={t("edit.value_placeholder")}
              />
              <TouchableOpacity
                onPress={() =>
                  setFormat((prev) =>
                    prev === "barcode" ? "qrcode" : "barcode",
                  )
                }
                className="p-2 bg-gray-100 rounded-md ml-2"
              >
                <Ionicons
                  name={
                    format === "barcode" ? "barcode-outline" : "qr-code-outline"
                  }
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
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
                  runOnJS(onColorChange)(hex);
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
