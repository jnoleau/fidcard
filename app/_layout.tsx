import "../global.css";
import "../i18n";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "../components/ErrorBoundary";

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <ErrorBoundary>
        <KeyboardProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="scan" options={{ presentation: "modal" }} />
          </Stack>
        </KeyboardProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
