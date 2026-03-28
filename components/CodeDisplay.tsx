import React from "react";
import { View, Text, useCSSVariable } from "./tw";
import QRCode from "react-native-qrcode-svg";
import { Barcode } from "expo-barcode-generator";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface CodeDisplayProps {
  value: string;
  format: "qrcode" | "barcode";
}

const isCode128Compatible = (value: string) => {
  return /^[\x00-\x7F]*$/.test(value);
};

function CodeDisplay({ value, format }: CodeDisplayProps) {
  const { t } = useTranslation();
  const destructive = useCSSVariable("--color-destructive");
  const muted = useCSSVariable("--color-muted");

  if (!value) {
    return (
      <View className="items-center justify-center p-4">
        <Ionicons name="qr-code-outline" size={48} color={muted} />
        <Text className="text-muted text-center mt-2 font-medium">
          {t("edit.value_placeholder")}
        </Text>
      </View>
    );
  }

  if (format === "barcode" && !isCode128Compatible(value)) {
    return (
      <View className="items-center justify-center p-4">
        <Ionicons name="warning-outline" size={48} color={destructive} />
        <Text className="text-destructive text-center mt-2 font-medium">
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
            style={{ color: "white" }}
          />
          <Text className="mt-2 text-muted font-medium tracking-widest">
            {value}
          </Text>
        </View>
      )}
    </>
  );
}

export default React.memo(CodeDisplay);
