import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Barcode } from "expo-barcode-generator";

interface CodeDisplayProps {
  value: string;
  color: string;
}

export default function CodeDisplay({ value, color }: CodeDisplayProps) {
  if (!value) return null;

  // Simple heuristic:
  // If it's short and alphanumeric (and not a URL), prefer Barcode (Code128).
  // If it's long (> 20 chars) or looks like a URL, use QR Code.
  // Code128 supports ASCII 0-127.

  const isLong = value.length > 20;
  // Check if contains characters not supported by standard barcodes easily or if user prefers QR for complex data
  // For this app, let's assume if it fits in valid Code128, we try barcode, else QR.
  // However, Code128 can get very wide.

  const shouldUseQRCode = isLong;

  return (
    <View
      className="items-center justify-center bg-white rounded-2xl p-4 shadow-lg w-full aspect-[4/3]"
      style={{
        borderColor: color,
        borderWidth: 4,
      }}
    >
      {shouldUseQRCode ? (
        <QRCode value={value} size={200} />
      ) : (
        <View className="items-center w-full h-full justify-center px-4">
          <Barcode
            value={value}
            options={{ format: "CODE128", width: 2, height: 100 }}
          />
          <Text className="mt-2 text-gray-600 font-medium tracking-widest">
            {value}
          </Text>
        </View>
      )}
    </View>
  );
}
