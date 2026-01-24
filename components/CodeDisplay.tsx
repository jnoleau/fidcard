import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Barcode } from "expo-barcode-generator";

interface CodeDisplayProps {
  value: string;
  format: "qrcode" | "barcode";
}

export default function CodeDisplay({ value, format }: CodeDisplayProps) {
  if (!value) return null;

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
