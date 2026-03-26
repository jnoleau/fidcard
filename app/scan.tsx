import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { useState, useRef } from "react";
import { StatusBar } from "react-native";
import { View, Text, TouchableOpacity } from "../components/tw";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [scanned, setScanned] = useState(false);
  const isProcessing = useRef(false);
  const { t } = useTranslation();

  if (!permission) {
    return <View className="flex-1" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" />
        <View className="flex-1 justify-center items-center bg-background p-5">
          <Text className="text-center mb-5 text-lg text-card-foreground">
            {t("scan.permission_request")}
          </Text>
          <TouchableOpacity
            className="bg-primary px-5 py-3 rounded-lg mb-3"
            onPress={requestPermission}
            accessibilityLabel={t("scan.grant_permission")}
            accessibilityRole="button"
          >
            <Text className="text-primary-foreground font-bold text-base">
              {t("scan.grant_permission")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-3"
            onPress={() => router.back()}
            accessibilityLabel={t("common.cancel")}
            accessibilityRole="button"
          >
            <Text className="text-muted text-base">{t("common.cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned || isProcessing.current) return;

    isProcessing.current = true;
    setScanned(true);

    const randomColor =
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0");

    const format = type === "qr" ? "qrcode" : "barcode";

    router.dismiss();
    router.push({
      pathname: "/edit/[id]",
      params: { id: "new", value: data, color: randomColor, format },
    });
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity
          className="p-2"
          onPress={() => router.back()}
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-card-foreground">
          {t("scan.title")}
        </Text>
        <TouchableOpacity
          className="p-2"
          onPress={() => router.back()}
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-around py-5">
        <Text className="text-lg font-medium text-card-foreground text-center mb-5 px-8">
          {t("scan.instruction")}
        </Text>

        <View className="w-full px-8 items-center">
          <View className="w-full h-80 rounded-3xl overflow-hidden relative bg-black">
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: [
                  "qr",
                  "ean13",
                  "ean8",
                  "pdf417",
                  "aztec",
                  "datamatrix",
                  "code39",
                  "code93",
                  "itf14",
                  "codabar",
                  "code128",
                  "upc_a",
                  "upc_e",
                ],
              }}
            />
            {/* Corner markers */}
            <View className="absolute top-2.5 left-2.5 w-5 h-5 border-t-[3px] border-l-[3px] border-white rounded-tl-[10px]" />
            <View className="absolute top-2.5 right-2.5 w-5 h-5 border-t-[3px] border-r-[3px] border-white rounded-tr-[10px]" />
            <View className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-[3px] border-l-[3px] border-white rounded-bl-[10px]" />
            <View className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-[3px] border-r-[3px] border-white rounded-br-[10px]" />
          </View>
        </View>

        <View className="items-center w-full px-8">
          <TouchableOpacity
            className="bg-white border border-border py-4 px-6 rounded-full w-full items-center shadow-sm"
            onPress={() => {
              const randomColor =
                "#" +
                Math.floor(Math.random() * 16777215)
                  .toString(16)
                  .padStart(6, "0");

              router.dismiss();
              router.push({
                pathname: "/edit/[id]",
                params: {
                  id: "new",
                  value: "",
                  color: randomColor,
                  format: "qrcode",
                },
              });
            }}
            accessibilityLabel={t("scan.manual_button")}
            accessibilityRole="button"
          >
            <Text className="text-card-foreground font-semibold text-base">
              {t("scan.manual_button")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
