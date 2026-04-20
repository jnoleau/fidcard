import React, { useCallback, useRef, useState } from "react";
import { useColorScheme } from "react-native";
import { View, Text, TextInput, TouchableOpacity, useCSSVariable } from "./tw";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ColorPicker, { Panel1, HueSlider } from "reanimated-color-picker";
import { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Animated } from "./tw/animated";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";

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
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted");
  const cardBg = useCSSVariable("--color-card");

  const [name, setName] = useState(initialValues.name);
  const [color, setColor] = useState(initialValues.color);
  const [value, setValue] = useState(initialValues.value);
  const [format, setFormat] = useState<"qrcode" | "barcode">(
    initialValues.format,
  );

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [pickerInitialColor, setPickerInitialColor] = useState(
    color || "#ffffff",
  );
  const pickerColor = useSharedValue(color || "#ffffff");

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.02}
        style={[props.style, { top: insets.top + headerHeight }]}
      />
    ),
    [headerHeight, insets.top],
  );

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
    setPickerInitialColor(currentColor);
    pickerColor.value = currentColor;
    bottomSheetRef.current?.present();
  };

  const cardBorderStyle = useAnimatedStyle(() => ({
    borderColor: pickerColor.value,
  }));

  return (
    <View className="flex-1 bg-background">
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <View
        className="px-4 py-4 flex-row items-center border-b border-border"
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
      >
        <TouchableOpacity
          onPress={onCancel}
          className="p-2 -ml-2 mr-2"
          accessibilityLabel={t("common.cancel")}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={foreground} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold text-foreground flex-1"
          numberOfLines={1}
        >
          {name ? name : "..."}
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          className={`bg-primary px-4 py-2 rounded-lg ${errors.name || errors.value ? "opacity-50" : ""}`}
          accessibilityLabel={t("common.save")}
          accessibilityRole="button"
        >
          <Text className="text-primary-foreground font-bold">
            {t("common.save")}
          </Text>
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
          <Animated.View
            className="items-center justify-center bg-white rounded-2xl py-10 shadow-lg"
            style={[
              { borderWidth: 4, borderTopWidth: 40 },
              cardBorderStyle,
            ]}
          >
            <CodeDisplay value={value || "123456"} format={format} />
          </Animated.View>
        </View>

        <View className="gap-6">
          <View>
            <Text className="text-sm font-medium text-muted mb-2 ml-1">
              {t("edit.brand_label")}
            </Text>
            <View
              className={`flex-row items-center rounded-lg border ${errors.name ? "border-destructive" : "border-border"} pr-3`}
            >
              <TextInput
                className="flex-1 p-4 text-foreground"
                value={name}
                selectTextOnFocus
                autoCorrect={false}
                spellCheck={false}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={t("edit.brand_placeholder")}
                placeholderTextColor={muted}
                accessibilityLabel={t("edit.brand_label")}
              />
              <TouchableOpacity
                onPress={openColorPicker}
                className="w-8 h-8 rounded border border-border shadow-sm ml-2"
                style={{ backgroundColor: color || "#ffffff" }}
                accessibilityLabel={t("edit.color_title")}
                accessibilityRole="button"
              />
            </View>
            {errors.name && (
              <Text className="text-destructive text-sm ml-1 mt-1">
                {errors.name}
              </Text>
            )}
          </View>

          <View>
            <Text className="text-sm font-medium text-muted mb-2 ml-1">
              {t("edit.value_label")}
            </Text>
            <View
              className={`flex-row items-center rounded-lg border ${errors.value ? "border-destructive" : "border-border"} pr-3`}
            >
              <TextInput
                className="flex-1 p-4 text-foreground"
                value={value}
                selectTextOnFocus
                autoCorrect={false}
                spellCheck={false}
                onChangeText={(text) => {
                  setValue(text);
                  if (errors.value) setErrors({ ...errors, value: undefined });
                }}
                placeholder={t("edit.value_placeholder")}
                placeholderTextColor={muted}
                accessibilityLabel={t("edit.value_label")}
              />
              <TouchableOpacity
                onPress={() =>
                  setFormat((prev) =>
                    prev === "barcode" ? "qrcode" : "barcode",
                  )
                }
                className="w-8 h-8 items-center justify-center bg-background rounded-md ml-2"
                accessibilityLabel={t("edit.toggle_format")}
                accessibilityRole="button"
              >
                <Ionicons
                  name={
                    format === "barcode" ? "barcode-outline" : "qr-code-outline"
                  }
                  size={24}
                  color={muted}
                />
              </TouchableOpacity>
            </View>
            {errors.value && (
              <Text className="text-destructive text-sm ml-1 mt-1">
                {errors.value}
              </Text>
            )}
          </View>
        </View>
      </KeyboardAwareScrollView>

      <BottomSheetModal
        ref={bottomSheetRef}
        enablePanDownToClose
        enableDynamicSizing
        backgroundStyle={{ backgroundColor: cardBg }}
        handleIndicatorStyle={{ backgroundColor: muted }}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView
          style={{ paddingHorizontal: 24, paddingBottom: 24 }}
        >
          <View className="items-center mb-6">
            <Text className="text-xl font-bold text-foreground">
              {t("edit.color_title")}
            </Text>
          </View>

          <View style={{ height: 320 }}>
            <ColorPicker
              style={{ width: "100%", flex: 1, gap: 20 }}
              value={pickerInitialColor}
              onChange={({ hex }) => {
                "worklet";
                pickerColor.value = hex;
              }}
              onCompleteJS={({ hex }) => {
                setColor(hex);
              }}
            >
              <Panel1 style={{ borderRadius: 16 }} />
              <HueSlider style={{ borderRadius: 16, height: 40 }} />
            </ColorPicker>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}
