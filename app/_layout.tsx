import "../global.css";
import "../i18n";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../components/ErrorBoundary";
import { Appearance } from "react-native";
import { useSettingsStore } from "../store/useSettingsStore";
import { useEffect } from "react";

export default function RootLayout() {
  const { theme } = useSettingsStore();

  useEffect(() => {
    if (theme === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  return (
    <GestureHandlerRootView className="flex-1">
      <ErrorBoundary>
        <KeyboardProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="scan" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings" />
          </Stack>
        </KeyboardProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
