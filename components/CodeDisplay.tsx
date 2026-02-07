import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Barcode } from "expo-barcode-generator";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface CodeDisplayProps {
  value: string;
  format: "qrcode" | "barcode";
}

// Helper to check if string contains only ASCII characters supported by CODE128
const isCode128Compatible = (value: string) => {
  return /^[\x00-\x7F]*$/.test(value);
};

export default function CodeDisplay({ value, format }: CodeDisplayProps) {
  const { t } = useTranslation();

  if (!value) return null;

  // Check compatibility for Barcode (CODE128)
  // If incompatible, display an error message instead of crashing or auto-fallback
  if (format === "barcode" && !isCode128Compatible(value)) {
    return (
      <View className="items-center justify-center p-4">
        <Ionicons name="warning-outline" size={48} color="#ef4444" />
        <Text className="text-red-500 text-center mt-2 font-medium">
          {t("edit.error_invalid_format")}
        </Text>
      </View>
    );
  }

  return (
    <>
      {format === "qrcode" ? (
        <QRCode value={value} size={200} />
      ) : (
        <View className="items-center justify-center">
          <Barcode
            value={value}
            options={{
              format: "CODE128",
              width: 2,
              height: 100,
              displayValue: false,
            }}
          />
          <Text className="mt-2 text-gray-600 font-medium tracking-widest">
            {value}
          </Text>
        </View>
      )}
    </>
  );
}
