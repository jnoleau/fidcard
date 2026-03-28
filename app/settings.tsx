import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "react-native";
import { View, Text, TouchableOpacity, useCSSVariable } from "../components/tw";
import { useSettingsStore } from "../store/useSettingsStore";
import Constants from "expo-constants";

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme } = useSettingsStore();
  const systemScheme = useColorScheme();

  const foreground = useCSSVariable("--color-foreground");
  const primary = useCSSVariable("--color-primary");
  const muted = useCSSVariable("--color-muted-foreground");

  const isDark = theme === "dark" || (theme === "system" && systemScheme === "dark");

  const version = Constants.expoConfig?.version ?? "1.0.0";

  const themeOptions: { key: "light" | "dark" | "system"; label: string; icon: "sunny" | "moon" | "phone-portrait" }[] = [
    { key: "light", label: t("settings.theme_light"), icon: "sunny" },
    { key: "dark", label: t("settings.theme_dark"), icon: "moon" },
    { key: "system", label: t("settings.theme_system"), icon: "phone-portrait" },
  ];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View className="flex-row items-center mb-6 mt-2 px-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
          accessibilityLabel={t("common.close")}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={foreground} />
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-foreground">
          {t("settings.title")}
        </Text>
      </View>

      <View className="px-4 flex-1">
        <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {t("settings.theme")}
        </Text>
        <View className="bg-card rounded-2xl overflow-hidden">
          {themeOptions.map((option, index) => (
            <TouchableOpacity
              key={option.key}
              className={`flex-row items-center justify-between px-4 py-4 ${index < themeOptions.length - 1 ? "border-b border-border" : ""}`}
              onPress={() => setTheme(option.key)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name={option.icon} size={20} color={muted} />
                <Text className="text-base text-card-foreground ml-3">
                  {option.label}
                </Text>
              </View>
              {theme === option.key && (
                <Ionicons name="checkmark" size={22} color={primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-auto mb-8 items-center">
          <Text className="text-muted-foreground text-sm">
            {t("settings.version")} {version}
          </Text>
        </View>
      </View>
    </View>
  );
}
