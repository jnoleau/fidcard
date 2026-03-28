import "../global.css";
import "../i18n";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../components/ErrorBoundary";
import { Appearance } from "react-native";
import { useSettingsStore } from "../store/useSettingsStore";
import { useEffect, useCallback } from "react";
import { useCSSVariable } from "../components/tw";
import { useFonts } from "@expo-google-fonts/quicksand";
import * as SplashScreen from "expo-splash-screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useSettingsStore();
  const background = useCSSVariable("--color-background");
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    Quicksand_300Light: require("@expo-google-fonts/quicksand/300Light/Quicksand_300Light.ttf"),
    Quicksand_400Regular: require("@expo-google-fonts/quicksand/400Regular/Quicksand_400Regular.ttf"),
    Quicksand_500Medium: require("@expo-google-fonts/quicksand/500Medium/Quicksand_500Medium.ttf"),
    Quicksand_600SemiBold: require("@expo-google-fonts/quicksand/600SemiBold/Quicksand_600SemiBold.ttf"),
    Quicksand_700Bold: require("@expo-google-fonts/quicksand/700Bold/Quicksand_700Bold.ttf"),
  });

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (theme === "system") {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(theme);
    }
  }, [theme]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1" onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <KeyboardProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: background, paddingTop: insets.top },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="scan" options={{ presentation: "modal" }} />
            <Stack.Screen name="settings" />
          </Stack>
        </KeyboardProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
