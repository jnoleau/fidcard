# Fidcard NativeWind v5 + Tailwind 4 Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Fidcard from NativeWind v4 + Tailwind 3 to NativeWind v5 + Tailwind 4, convert all styling to Tailwind classes, and improve code quality (type safety, persistence, error handling, accessibility, performance).

**Architecture:** Migration-first approach. Phase 1 sets up NativeWind v5 infrastructure (deps, config, CSS wrappers). Phase 2 converts each screen/component to pure Tailwind className. Phase 3 adds quality improvements (persistence, error boundaries, accessibility, performance, type safety).

**Tech Stack:** Expo 54, React Native 0.81, React 19, NativeWind v5 (preview), Tailwind CSS v4, Zustand with persist middleware, expo-crypto, AsyncStorage.

---

## File Structure

### New files to create:
- `components/tw/index.tsx` — CSS-wrapped React Native primitives (View, Text, Pressable, ScrollView, TextInput, TouchableHighlight, Link, useCSSVariable)
- `components/tw/image.tsx` — CSS-wrapped expo-image Image component
- `components/tw/animated.tsx` — CSS-wrapped Animated components
- `lib/utils.ts` — `cn()` utility for className merging (clsx + tailwind-merge)
- `postcss.config.mjs` — PostCSS config for Tailwind v4
- `constants.ts` — Shared layout constants extracted from SortableCard
- `components/ErrorBoundary.tsx` — Error boundary component

### Files to modify:
- `package.json` — Update deps, add overrides
- `metro.config.js` — Simplify for NativeWind v5
- `babel.config.js` — Remove NativeWind presets
- `global.css` — Tailwind v4 imports + semantic color tokens
- `nativewind-env.d.ts` — Update type reference
- `app/_layout.tsx` — Add ErrorBoundary, convert styles
- `app/index.tsx` — Remove duplicate GestureHandlerRootView, convert to tw imports, add accessibility
- `app/scan.tsx` — Full rewrite from StyleSheet to className
- `app/edit/[id].tsx` — Fix type safety, use expo-crypto
- `components/CardEditor.tsx` — Convert remaining inline styles, add accessibility
- `components/SortableCard.tsx` — Use constants, convert styles, add React.memo
- `components/CodeDisplay.tsx` — Add placeholder, add React.memo
- `store/useCardStore.ts` — Add persist middleware
- `i18n.ts` — Add accessibility i18n keys

### Files to delete:
- `tailwind.config.js` — Replaced by @theme in CSS

---

## Phase 1: Migration NativeWind v5 + Tailwind 4

### Task 1: Update dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install NativeWind v5 and Tailwind 4 dependencies**

```bash
cd /home/jnoleau/repo/basic/fidcard
npx expo install nativewind@preview react-native-css tailwindcss@^4 @tailwindcss/postcss tailwind-merge clsx
```

- [ ] **Step 2: Remove incompatible prettier plugin**

```bash
cd /home/jnoleau/repo/basic/fidcard
yarn remove prettier-plugin-tailwindcss
```

- [ ] **Step 3: Add lightningcss override to package.json**

In `package.json`, add inside the `"overrides"` object:

```json
"overrides": {
  "react-native-svg": "15.12.1",
  "lightningcss": "1.30.1"
}
```

- [ ] **Step 4: Install dependencies and verify**

```bash
cd /home/jnoleau/repo/basic/fidcard
yarn install
```

Expected: No errors. All deps resolve.

- [ ] **Step 5: Commit**

```bash
git add package.json yarn.lock
git commit -m "chore: migrate dependencies to NativeWind v5 + Tailwind CSS v4"
```

---

### Task 2: Update config files

**Files:**
- Modify: `metro.config.js`
- Modify: `babel.config.js`
- Create: `postcss.config.mjs`
- Modify: `global.css`
- Modify: `nativewind-env.d.ts`
- Delete: `tailwind.config.js`

- [ ] **Step 1: Rewrite metro.config.js**

Replace the entire content of `metro.config.js` with:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});
```

- [ ] **Step 2: Simplify babel.config.js**

Replace the entire content of `babel.config.js` with:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

- [ ] **Step 3: Create postcss.config.mjs**

Create new file `postcss.config.mjs`:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 4: Rewrite global.css**

Replace the entire content of `global.css` with:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

@media android {
  :root {
    --font-mono: monospace;
    --font-sans: normal;
  }
}

@media ios {
  :root {
    --font-mono: ui-monospace;
    --font-sans: system-ui;
  }
}
```

- [ ] **Step 5: Update nativewind-env.d.ts**

Replace the entire content of `nativewind-env.d.ts` with:

```ts
/// <reference types="react-native-css/types" />
```

- [ ] **Step 6: Delete tailwind.config.js**

```bash
rm /home/jnoleau/repo/basic/fidcard/tailwind.config.js
```

- [ ] **Step 7: Commit**

```bash
git add metro.config.js babel.config.js postcss.config.mjs global.css nativewind-env.d.ts
git rm tailwind.config.js
git commit -m "chore: update config files for NativeWind v5 + Tailwind CSS v4"
```

---

### Task 3: Create CSS component wrappers

**Files:**
- Create: `components/tw/index.tsx`
- Create: `components/tw/image.tsx`
- Create: `components/tw/animated.tsx`

- [ ] **Step 1: Create components/tw/index.tsx**

```tsx
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";
import { Link as RouterLink } from "expo-router";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableOpacity as RNTouchableOpacity,
  TextInput as RNTextInput,
  Modal as RNModal,
} from "react-native";

export const Link = (
  props: React.ComponentProps<typeof RouterLink> & { className?: string },
) => {
  return useCssElement(RouterLink, props, { className: "style" });
};

export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

export type ViewProps = React.ComponentProps<typeof RNView> & {
  className?: string;
};

export const View = (props: ViewProps) => {
  return useCssElement(RNView, props, { className: "style" });
};
View.displayName = "CSS(View)";

export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string },
) => {
  return useCssElement(RNText, props, { className: "style" });
};
Text.displayName = "CSS(Text)";

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => {
  return useCssElement(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });
};
ScrollView.displayName = "CSS(ScrollView)";

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => {
  return useCssElement(RNPressable, props, { className: "style" });
};
Pressable.displayName = "CSS(Pressable)";

export const TouchableOpacity = (
  props: React.ComponentProps<typeof RNTouchableOpacity> & {
    className?: string;
  },
) => {
  return useCssElement(RNTouchableOpacity, props, { className: "style" });
};
TouchableOpacity.displayName = "CSS(TouchableOpacity)";

export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => {
  return useCssElement(RNTextInput, props, { className: "style" });
};
TextInput.displayName = "CSS(TextInput)";

export const Modal = (
  props: React.ComponentProps<typeof RNModal> & { className?: string },
) => {
  return useCssElement(RNModal, props, { className: "style" });
};
Modal.displayName = "CSS(Modal)";
```

- [ ] **Step 2: Create components/tw/image.tsx**

```tsx
import { useCssElement } from "react-native-css";
import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Image as RNImage } from "expo-image";

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

function CSSImage(props: React.ComponentProps<typeof AnimatedExpoImage>) {
  // @ts-expect-error: Remap objectFit style to contentFit property
  const { objectFit, objectPosition, ...style } =
    StyleSheet.flatten(props.style) || {};

  return (
    <AnimatedExpoImage
      contentFit={objectFit}
      contentPosition={objectPosition}
      {...props}
      source={
        typeof props.source === "string" ? { uri: props.source } : props.source
      }
      // @ts-expect-error: Style is remapped above
      style={style}
    />
  );
}

export const Image = (
  props: React.ComponentProps<typeof CSSImage> & { className?: string },
) => {
  return useCssElement(CSSImage, props, { className: "style" });
};

Image.displayName = "CSS(Image)";
```

- [ ] **Step 3: Create components/tw/animated.tsx**

```tsx
import * as TW from "./index";
import RNAnimated from "react-native-reanimated";

export const Animated = {
  ...RNAnimated,
  View: RNAnimated.createAnimatedComponent(TW.View),
  ScrollView: RNAnimated.createAnimatedComponent(TW.ScrollView),
};
```

- [ ] **Step 4: Commit**

```bash
git add components/tw/
git commit -m "feat: add CSS component wrappers for NativeWind v5"
```

---

### Task 4: Create utility functions

**Files:**
- Create: `lib/utils.ts`

- [ ] **Step 1: Create lib/utils.ts**

```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/utils.ts
git commit -m "feat: add cn() utility for className merging"
```

---

### Task 5: Verify migration builds

- [ ] **Step 1: Clear cache and start**

```bash
cd /home/jnoleau/repo/basic/fidcard
npx expo start --clear
```

Expected: Metro bundler starts without errors. The app may not render correctly yet (existing components still use old imports), but the bundler should not crash.

- [ ] **Step 2: Fix any build errors before proceeding**

If there are errors, fix them. Common issues:
- Missing peer dependencies: install them with `npx expo install`
- Import resolution: check metro.config.js paths

---

## Phase 2: Styling Conversion

### Task 6: Add semantic color tokens to global.css

**Files:**
- Modify: `global.css`

- [ ] **Step 1: Add @theme block with semantic colors**

Append the following at the end of `global.css`:

```css

@layer theme {
  @theme {
    --color-background: #f9fafb;
    --color-foreground: #111827;
    --color-card: #ffffff;
    --color-card-foreground: #1f2937;
    --color-destructive: #ef4444;
    --color-success: #22c55e;
    --color-muted: #6b7280;
    --color-muted-foreground: #9ca3af;
    --color-border: #e5e7eb;
    --color-primary: #2563eb;
    --color-primary-foreground: #ffffff;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add global.css
git commit -m "feat: add semantic color tokens to Tailwind theme"
```

---

### Task 7: Convert _layout.tsx

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Rewrite _layout.tsx**

Replace the entire content of `app/_layout.tsx` with:

```tsx
import "../global.css";
import "../i18n";
import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView className="flex-1">
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="scan" options={{ presentation: "modal" }} />
        </Stack>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/_layout.tsx
git commit -m "refactor: convert _layout.tsx to Tailwind className"
```

---

### Task 8: Convert index.tsx

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Rewrite index.tsx**

Replace the entire content of `app/index.tsx` with:

```tsx
import { Alert } from "react-native";
import { View, Text, TouchableOpacity, Link } from "../components/tw";
import { Animated } from "../components/tw/animated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCardStore, Card } from "../store/useCardStore";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { SortableCard } from "../components/SortableCard";
import { useCSSVariable } from "../components/tw";

export default function Index() {
  const insets = useSafeAreaInsets();
  const { cards, setCards } = useCardStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(cards);
  const [activeId, setActiveId] = useState<string | null>(null);

  const foreground = useCSSVariable("--color-foreground");
  const destructive = useCSSVariable("--color-destructive");
  const success = useCSSVariable("--color-success");
  const muted = useCSSVariable("--color-muted-foreground");

  useEffect(() => {
    if (!isEditing) {
      setLocalCards(cards);
    }
  }, [cards, isEditing]);

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newCards = [...localCards];
    const [movedCard] = newCards.splice(fromIndex, 1);
    const secureToIndex = Math.max(0, Math.min(toIndex, newCards.length));
    newCards.splice(secureToIndex, 0, movedCard);
    setLocalCards(newCards);
  };

  const saveOrder = () => {
    setCards(localCards);
    setIsEditing(false);
  };

  const cancelOrder = () => {
    setLocalCards(cards);
    setIsEditing(false);
  };

  const handleDelete = (card: Card) => {
    Alert.alert(
      t("home.delete_card_title", "Supprimer la carte"),
      t("home.delete_card_message", "Supprimer la carte {{name}} ?", {
        name: card.name,
      }),
      [
        { text: t("common.cancel", "Annuler"), style: "cancel" },
        {
          text: t("common.delete", "Supprimer"),
          style: "destructive",
          onPress: () => {
            useCardStore.getState().removeCard(card.id);
            setLocalCards((prev) => prev.filter((c) => c.id !== card.id));
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="flex-row items-center justify-between mb-6 mt-2 px-4">
        <View className="flex-row items-center">
          <Ionicons name="card" size={32} color={foreground} />
          <Text className="text-3xl font-bold ml-3 text-foreground">
            {t("home.title")}
          </Text>
        </View>
        {isEditing && (
          <View className="flex-row">
            <TouchableOpacity
              onPress={cancelOrder}
              className="mr-4"
              accessibilityLabel={t("common.cancel")}
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={32} color={destructive} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveOrder}
              accessibilityLabel={t("common.save")}
              accessibilityRole="button"
            >
              <Ionicons name="checkmark-circle" size={32} color={success} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Animated.ScrollView
        contentContainerClassName="pb-24 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-between">
          {localCards.map((card, index) => (
            <SortableCard
              key={card.id}
              id={card.id}
              index={index}
              isEditing={isEditing}
              onReorder={handleReorder}
              onDelete={() => handleDelete(card)}
              onLongPress={() => setIsEditing(true)}
              cardsCount={localCards.length}
              isActive={activeId === card.id}
              onDragStart={() => setActiveId(card.id)}
              onDragEnd={() => setActiveId(null)}
              onTap={() => router.push(`/edit/${card.id}`)}
            >
              <TouchableOpacity
                className="w-full h-32 rounded-xl p-4 justify-between shadow-sm"
                style={{ backgroundColor: card.color }}
                activeOpacity={0.9}
              >
                <View className="self-end bg-white/20 p-1 rounded">
                  <Ionicons name="qr-code" size={20} color="white" />
                </View>
                <Text className="text-white font-bold text-lg">
                  {card.name}
                </Text>
              </TouchableOpacity>
            </SortableCard>
          ))}

          <Link href="/scan" asChild disabled={isEditing}>
            <TouchableOpacity
              className={`w-[48%] h-32 rounded-xl p-4 justify-center items-center mb-4 border-2 border-dashed border-border bg-background ${isEditing ? "opacity-50" : ""}`}
              disabled={isEditing}
              accessibilityLabel={t("home.scan_card")}
              accessibilityRole="button"
            >
              <Ionicons
                name="add-circle-outline"
                size={40}
                color={muted}
              />
              <Text className="text-muted-foreground font-medium mt-2">
                {t("home.scan_card")}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
```

Key changes:
- Removed duplicate `GestureHandlerRootView` (already in `_layout.tsx`)
- Replaced `react-native` imports with `components/tw` imports
- Replaced hardcoded colors (`#333`, `#ef4444`, `#22c55e`, `#9ca3af`) with CSS variables via `useCSSVariable`
- Replaced `contentContainerStyle` with `contentContainerClassName`
- Removed `as any` from `href="/scan"`
- Added `accessibilityLabel` and `accessibilityRole` on icon buttons

- [ ] **Step 2: Commit**

```bash
git add app/index.tsx
git commit -m "refactor: convert index.tsx to Tailwind className with CSS wrappers"
```

---

### Task 9: Convert scan.tsx

**Files:**
- Modify: `app/scan.tsx`

- [ ] **Step 1: Rewrite scan.tsx — remove all StyleSheet**

Replace the entire content of `app/scan.tsx` with:

```tsx
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
      pathname: "/edit/new",
      params: { value: data, color: randomColor, format },
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
              className="flex-1"
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
                pathname: "/edit/new",
                params: {
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
```

Key changes:
- Removed entire `StyleSheet.create()` (70+ rules)
- All styling via className
- Replaced `react-native` View/Text/TouchableOpacity with `components/tw` imports
- Corner markers done with border utilities
- Removed `as any` from router.push
- Added accessibility labels on all buttons

- [ ] **Step 2: Commit**

```bash
git add app/scan.tsx
git commit -m "refactor: convert scan.tsx from StyleSheet to Tailwind className"
```

---

### Task 10: Convert CodeDisplay.tsx

**Files:**
- Modify: `components/CodeDisplay.tsx`

- [ ] **Step 1: Rewrite CodeDisplay.tsx**

Replace the entire content of `components/CodeDisplay.tsx` with:

```tsx
import React from "react";
import { View, Text } from "./tw";
import QRCode from "react-native-qrcode-svg";
import { Barcode } from "expo-barcode-generator";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useCSSVariable } from "./tw";

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
```

Key changes:
- Replaced `react-native` imports with `components/tw`
- Added placeholder UI when value is empty (instead of returning `null`)
- Replaced hardcoded color `#ef4444` with `useCSSVariable`
- Wrapped with `React.memo`

- [ ] **Step 2: Commit**

```bash
git add components/CodeDisplay.tsx
git commit -m "refactor: convert CodeDisplay to Tailwind className, add placeholder, add memo"
```

---

### Task 11: Convert CardEditor.tsx

**Files:**
- Modify: `components/CardEditor.tsx`

- [ ] **Step 1: Rewrite CardEditor.tsx**

Replace the entire content of `components/CardEditor.tsx` with:

```tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "./tw";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ColorPicker, { Panel1, HueSlider } from "reanimated-color-picker";
import { useSharedValue, runOnJS } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CodeDisplay from "./CodeDisplay";
import { useCSSVariable } from "./tw";

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
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const foreground = useCSSVariable("--color-foreground");
  const muted = useCSSVariable("--color-muted");

  const [name, setName] = useState(initialValues.name);
  const [color, setColor] = useState(initialValues.color);
  const [value, setValue] = useState(initialValues.value);
  const [format, setFormat] = useState<"qrcode" | "barcode">(
    initialValues.format,
  );

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [originalColor, setOriginalColor] = useState("");
  const pickerColor = useSharedValue(color || "#ffffff");

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
    setOriginalColor(currentColor);
    pickerColor.value = currentColor;
    setShowColorPicker(true);
  };

  const handleCancelColor = () => {
    setColor(originalColor);
    setShowColorPicker(false);
  };

  const handleConfirmColor = () => {
    setShowColorPicker(false);
  };

  const onColorChange = (hex: string) => {
    setColor(hex);
  };

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar style="dark" />
      <View className="px-4 py-4 flex-row items-center border-b border-border">
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
          <View
            className="items-center justify-center bg-white rounded-2xl py-10 shadow-lg"
            style={{
              borderColor: color,
              borderWidth: 4,
              borderTopWidth: 40,
            }}
          >
            <CodeDisplay value={value || "123456"} format={format} />
          </View>
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
                className="flex-1 p-4"
                value={name}
                selectTextOnFocus
                autoCorrect={false}
                spellCheck={false}
                onChangeText={(text) => {
                  setName(text);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder={t("edit.brand_placeholder")}
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
                className="flex-1 p-4"
                value={value}
                selectTextOnFocus
                autoCorrect={false}
                spellCheck={false}
                onChangeText={(text) => {
                  setValue(text);
                  if (errors.value) setErrors({ ...errors, value: undefined });
                }}
                placeholder={t("edit.value_placeholder")}
                accessibilityLabel={t("edit.value_label")}
              />
              <TouchableOpacity
                onPress={() =>
                  setFormat((prev) =>
                    prev === "barcode" ? "qrcode" : "barcode",
                  )
                }
                className="p-2 bg-background rounded-md ml-2"
                accessibilityLabel={t("edit.toggle_format")}
                accessibilityRole="button"
              >
                <Ionicons
                  name={
                    format === "barcode"
                      ? "barcode-outline"
                      : "qr-code-outline"
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

      <Modal visible={showColorPicker} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end">
          <View className="bg-white p-6 rounded-t-3xl shadow-xl">
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                onPress={handleCancelColor}
                className="px-4 py-2"
                accessibilityLabel={t("common.cancel")}
                accessibilityRole="button"
              >
                <Text className="text-destructive font-medium text-lg">
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <Text className="text-xl font-bold text-foreground">
                {t("edit.color_title")}
              </Text>

              <TouchableOpacity
                onPress={handleConfirmColor}
                className="bg-primary px-4 py-2 rounded-full"
                accessibilityLabel={t("common.confirm")}
                accessibilityRole="button"
              >
                <Text className="text-primary-foreground font-bold">
                  {t("common.confirm")}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 400 }}>
              <ColorPicker
                style={{ width: "100%", flex: 1, gap: 20 }}
                value={color || "#ffffff"}
                onChange={({ hex }) => {
                  "worklet";
                  pickerColor.value = hex;
                  runOnJS(onColorChange)(hex);
                }}
              >
                <Panel1 style={{ borderRadius: 16 }} />
                <HueSlider style={{ borderRadius: 16, height: 40 }} />
              </ColorPicker>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

Key changes:
- All imports from `components/tw` instead of `react-native`
- Replaced `color="#333"` / `color="#666"` with `useCSSVariable`
- Replaced `border-gray-100` with `border-border`, `text-gray-800` with `text-foreground`, etc.
- Replaced `space-y-6` with `gap-6`
- Removed `mt-4` on second field (gap handles spacing)
- Added `accessibilityLabel` on all interactive elements
- Added new i18n key `edit.toggle_format`

- [ ] **Step 2: Commit**

```bash
git add components/CardEditor.tsx
git commit -m "refactor: convert CardEditor to Tailwind className with CSS wrappers"
```

---

### Task 12: Convert SortableCard.tsx

**Files:**
- Modify: `components/SortableCard.tsx`
- Create: `constants.ts`

- [ ] **Step 1: Create constants.ts**

Create new file `constants.ts` at the project root:

```ts
import { Dimensions } from "react-native";

export const SCREEN_WIDTH = Dimensions.get("window").width;
export const PADDING = 16;
export const CONTAINER_WIDTH = SCREEN_WIDTH - PADDING * 2;
export const COLUMNS = 2;
export const CARD_WIDTH_PCT = 0.48;
export const CARD_WIDTH = CONTAINER_WIDTH * CARD_WIDTH_PCT;
export const COLUMN_GAP = CONTAINER_WIDTH * (1 - CARD_WIDTH_PCT * 2);
export const ROW_HEIGHT = 128 + 16; // h-32 (128px) + mb-4 (16px)
export const LONG_PRESS_DURATION = 250;
export const WOBBLE_DURATION = 100;
```

- [ ] **Step 2: Rewrite SortableCard.tsx**

Replace the entire content of `components/SortableCard.tsx` with:

```tsx
import React, { ReactNode } from "react";
import { LayoutChangeEvent } from "react-native";
import { TouchableOpacity } from "./tw";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
  useAnimatedReaction,
  LinearTransition,
  Easing,
} from "react-native-reanimated";
import {
  CONTAINER_WIDTH,
  CARD_WIDTH,
  COLUMNS,
  ROW_HEIGHT,
  LONG_PRESS_DURATION,
  WOBBLE_DURATION,
} from "../constants";
import { useCSSVariable } from "./tw";

interface SortableCardProps {
  id: string;
  index: number;
  children: ReactNode;
  isEditing: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDelete?: () => void;
  onLongPress: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isActive: boolean;
  cardsCount: number;
  onTap: () => void;
}

function SortableCardInner({
  id,
  index,
  children,
  isEditing,
  onReorder,
  onDelete,
  onLongPress,
  onDragStart,
  onDragEnd,
  isActive,
  cardsCount,
  onTap,
}: SortableCardProps) {
  const destructive = useCSSVariable("--color-destructive");

  const getPosition = (idx: number) => {
    "worklet";
    const row = Math.floor(idx / COLUMNS);
    const col = idx % COLUMNS;
    const x = col === 0 ? 0 : CONTAINER_WIDTH - CARD_WIDTH;
    const y = row * ROW_HEIGHT;
    return { x, y };
  };

  const pressed = useSharedValue(false);
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const initialPosition = getPosition(index);
  const slotX = useSharedValue(initialPosition.x);
  const slotY = useSharedValue(initialPosition.y);
  const activeBaseX = useSharedValue(initialPosition.x);
  const activeBaseY = useSharedValue(initialPosition.y);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const getIndexFromPoint = (x: number, y: number) => {
    "worklet";
    const clampedX = Math.max(0, Math.min(x, CONTAINER_WIDTH));
    const col = clampedX > CONTAINER_WIDTH / 2 ? 1 : 0;
    const safeY = Math.max(0, y);
    const row = Math.floor(safeY / ROW_HEIGHT);
    const idx = row * COLUMNS + col;
    return Math.max(0, Math.min(idx, cardsCount - 1));
  };

  useAnimatedReaction(
    () => {
      if (!pressed.value) return -1;
      const cx = activeBaseX.value + CARD_WIDTH / 2 + gestureX.value;
      const cy = activeBaseY.value + ROW_HEIGHT / 2 + gestureY.value;
      return getIndexFromPoint(cx, cy);
    },
    (targetIndex, prevTarget) => {
      if (
        targetIndex !== -1 &&
        targetIndex !== index &&
        targetIndex !== prevTarget
      ) {
        runOnJS(onReorder)(index, targetIndex);
      }
    },
  );

  React.useEffect(() => {
    if (isEditing && !isActive) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: WOBBLE_DURATION }),
          withTiming(2, { duration: WOBBLE_DURATION }),
          withTiming(-2, { duration: WOBBLE_DURATION }),
          withTiming(0, { duration: WOBBLE_DURATION }),
        ),
        -1,
        true,
      );
    } else {
      rotation.value = withTiming(0);
    }
  }, [isEditing, isActive]);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      if (!isEditing) {
        runOnJS(onLongPress)();
      }
      activeBaseX.value = slotX.value;
      activeBaseY.value = slotY.value;
      pressed.value = true;
      runOnJS(onDragStart)();
      scale.value = withSpring(1.05);
    })
    .onUpdate((event) => {
      gestureX.value = event.translationX;
      gestureY.value = event.translationY;
    })
    .onFinalize(() => {
      pressed.value = false;
      runOnJS(onDragEnd)();
      gestureX.value = withSpring(0);
      gestureY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  if (!isEditing) {
    pan.activateAfterLongPress(LONG_PRESS_DURATION);
  }

  const tap = Gesture.Tap()
    .maxDuration(200)
    .maxDistance(10)
    .onEnd((_event, success) => {
      if (success && !isEditing) {
        runOnJS(onTap)();
      }
    });

  const gesture = Gesture.Race(pan, tap);

  const placeholderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
      opacity: isActive ? 0 : 1,
    };
  }, [isActive]);

  const activeCardStyle = useAnimatedStyle(() => {
    return {
      left: activeBaseX.value,
      top: activeBaseY.value,
      transform: [
        { translateX: gestureX.value },
        { translateY: gestureY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { x, y } = event.nativeEvent.layout;
    slotX.value = x;
    slotY.value = y;
    if (!isActive) {
      activeBaseX.value = x;
      activeBaseY.value = y;
    }
  };

  return (
    <>
      <Animated.View
        onLayout={handleLayout}
        className="w-[48%] mb-4"
        style={placeholderStyle}
        layout={
          isActive
            ? undefined
            : LinearTransition.duration(250).easing(Easing.out(Easing.quad))
        }
      >
        <GestureDetector gesture={gesture}>
          <Animated.View className="flex-1">{children}</Animated.View>
        </GestureDetector>
        {isEditing && (
          <TouchableOpacity
            onPress={onDelete}
            className="absolute -top-2 -left-2 z-50 bg-white rounded-xl"
            activeOpacity={0.7}
            accessibilityLabel="Delete card"
            accessibilityRole="button"
          >
            <Ionicons name="remove-circle" size={28} color={destructive} />
          </TouchableOpacity>
        )}
      </Animated.View>
      {isActive && (
        <Animated.View
          pointerEvents="none"
          className="absolute w-[48%] mb-4 z-[9999]"
          style={activeCardStyle}
        >
          {children}
        </Animated.View>
      )}
    </>
  );
}

export const SortableCard = React.memo(SortableCardInner);
```

Key changes:
- Extracted constants to `constants.ts`
- Replaced inline styles with className where possible (`w-[48%] mb-4`, `flex-1`, `absolute -top-2 -left-2 z-50 bg-white rounded-xl`)
- Replaced hardcoded `#ef4444` with `useCSSVariable`
- Used `components/tw` TouchableOpacity
- Wrapped with `React.memo`
- Proper interface (no `& { onDelete?: () => void }` hack)

- [ ] **Step 3: Commit**

```bash
git add constants.ts components/SortableCard.tsx
git commit -m "refactor: convert SortableCard to Tailwind className, extract constants, add memo"
```

---

### Task 13: Convert edit/[id].tsx

**Files:**
- Modify: `app/edit/[id].tsx`

- [ ] **Step 1: Rewrite edit/[id].tsx**

Replace the entire content of `app/edit/[id].tsx` with:

```tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCardStore } from "../../store/useCardStore";
import CardEditor from "../../components/CardEditor";
import { View, Text } from "../../components/tw";
import { randomUUID } from "expo-crypto";

export default function EditCard() {
  const {
    id,
    value: paramValue,
    color: paramColor,
    format: paramFormat,
  } = useLocalSearchParams<{
    id: string;
    value?: string;
    color?: string;
    format?: "qrcode" | "barcode";
  }>();
  const router = useRouter();
  const { cards, updateCard, addCard } = useCardStore();

  const card = cards.find((c) => c.id === id) || {
    id: undefined,
    name: "",
    color: paramColor,
    value: paramValue,
    format: paramFormat,
  };

  const initialColor = card.color;
  const initialValue = card.value;
  const initialFormat = card.format;

  if (
    initialColor === undefined ||
    initialValue === undefined ||
    initialFormat === undefined
  ) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted">Card not found</Text>
      </View>
    );
  }

  const handleSave = (data: {
    name: string;
    color: string;
    value: string;
    format: "qrcode" | "barcode";
  }) => {
    if (card.id === undefined) {
      addCard({
        id: randomUUID(),
        ...data,
      });
    } else {
      updateCard(id, data);
    }
    router.back();
  };

  return (
    <CardEditor
      initialValues={{
        name: card.name,
        color: initialColor,
        value: initialValue,
        format: initialFormat,
      }}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
```

Key changes:
- Replaced `Date.now().toString()` with `randomUUID()` from `expo-crypto`
- Replaced `react-native` View/Text with `components/tw`
- Removed unused imports

- [ ] **Step 2: Commit**

```bash
git add app/edit/[id].tsx
git commit -m "refactor: convert edit screen to tw imports, use randomUUID for IDs"
```

---

## Phase 3: Code Quality

### Task 14: Add persistence to Zustand store

**Files:**
- Modify: `store/useCardStore.ts`

- [ ] **Step 1: Install AsyncStorage**

```bash
cd /home/jnoleau/repo/basic/fidcard
npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 2: Rewrite useCardStore.ts with persist middleware**

Replace the entire content of `store/useCardStore.ts` with:

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Card {
  id: string;
  name: string;
  color: string;
  value: string;
  format: "qrcode" | "barcode";
}

interface CardState {
  cards: Card[];
  addCard: (card: Card) => void;
  removeCard: (id: string) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  setCards: (cards: Card[]) => void;
}

const defaultCards: Card[] = [
  {
    id: "1",
    name: "Auchan",
    color: "#e10600",
    value: "123456789",
    format: "barcode",
  },
  {
    id: "2",
    name: "Carrefour",
    color: "#0058a9",
    value: "987654321",
    format: "barcode",
  },
  {
    id: "3",
    name: "Fnac",
    color: "#ffcc00",
    value: "456789123",
    format: "barcode",
  },
  {
    id: "4",
    name: "IKEA",
    color: "#0051ba",
    value: "321654987",
    format: "barcode",
  },
  {
    id: "5",
    name: "Decathlon",
    color: "#0082c3",
    value: "654321987",
    format: "barcode",
  },
  {
    id: "6",
    name: "Leroy Merlin",
    color: "#68a51c",
    value: "789123456",
    format: "barcode",
  },
];

export const useCardStore = create<CardState>()(
  persist(
    (set) => ({
      cards: defaultCards,
      addCard: (card) =>
        set((state) => ({ cards: [...state.cards, card] })),
      removeCard: (id) =>
        set((state) => ({ cards: state.cards.filter((c) => c.id !== id) })),
      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, ...updates } : c,
          ),
        })),
      setCards: (cards) => set({ cards }),
    }),
    {
      name: "card-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

- [ ] **Step 3: Commit**

```bash
git add store/useCardStore.ts package.json yarn.lock
git commit -m "feat: add AsyncStorage persistence to card store"
```

---

### Task 15: Add ErrorBoundary

**Files:**
- Create: `components/ErrorBoundary.tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Create components/ErrorBoundary.tsx**

```tsx
import React, { Component, ReactNode } from "react";
import { View, Text, TouchableOpacity } from "./tw";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background p-8">
          <Text className="text-xl font-bold text-foreground mb-4">
            Something went wrong
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-lg"
            onPress={() => this.setState({ hasError: false })}
          >
            <Text className="text-primary-foreground font-bold">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 2: Update _layout.tsx to include ErrorBoundary**

Replace the entire content of `app/_layout.tsx` with:

```tsx
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
```

- [ ] **Step 3: Commit**

```bash
git add components/ErrorBoundary.tsx app/_layout.tsx
git commit -m "feat: add ErrorBoundary component to root layout"
```

---

### Task 16: Add i18n keys for accessibility

**Files:**
- Modify: `i18n.ts`

- [ ] **Step 1: Add accessibility and missing i18n keys**

In `i18n.ts`, add the following keys to both `en` and `fr` objects:

In `en.common`, add:
```ts
delete: "Delete",
```

In `en.home`, add:
```ts
delete_card_title: "Delete Card",
delete_card_message: "Are you sure you want to delete {{name}}?",
```

In `en.edit`, add:
```ts
toggle_format: "Toggle format",
```

In `fr.common`, add:
```ts
delete: "Supprimer",
```

In `fr.home`, add:
```ts
delete_card_title: "Supprimer la carte",
delete_card_message: "Voulez-vous supprimer la carte {{name}} ?",
```

In `fr.edit`, add:
```ts
toggle_format: "Changer de format",
```

The full updated `en` object should be:

```ts
const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    delete: "Delete",
  },
  home: {
    title: "My Cards",
    scan_card: "Add Card",
    delete_card_title: "Delete Card",
    delete_card_message: "Are you sure you want to delete {{name}}?",
  },
  edit: {
    brand_label: "Brand Name",
    brand_placeholder: "Ex: Walmart, Target...",
    value_label: "Value (Barcode / QR Code)",
    value_placeholder: "Card number...",
    color_title: "Color",
    error_name: "Name is required",
    error_value: "Value is required",
    error_invalid_format:
      "This format does not support these characters. Switch to QR code.",
    toggle_format: "Toggle format",
  },
  scan: {
    title: "Scan Barcode",
    instruction: "Place barcode in the frame",
    permission_denied: "Camera permission denied",
    permission_request: "We need your permission to show the camera",
    grant_permission: "Grant Permission",
    manual_button: "Enter Manually",
  },
};

const fr = {
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Valider",
    close: "Fermer",
    delete: "Supprimer",
  },
  home: {
    title: "Mes Cartes",
    scan_card: "Ajouter",
    delete_card_title: "Supprimer la carte",
    delete_card_message: "Voulez-vous supprimer la carte {{name}} ?",
  },
  edit: {
    brand_label: "Enseigne",
    brand_placeholder: "Ex: Auchan, Fnac...",
    value_label: "Valeur (Code barre / QR Code)",
    value_placeholder: "Num\u00e9ro de la carte...",
    color_title: "Couleur",
    error_name: "Le nom est obligatoire",
    error_value: "La valeur est obligatoire",
    error_invalid_format:
      "Ce format ne supporte pas ces caract\u00e8res. Passez au QR code.",
    toggle_format: "Changer de format",
  },
  scan: {
    title: "Scanner un code-barres",
    instruction: "Placez le code-barres dans le cadre",
    permission_denied: "Permission cam\u00e9ra refus\u00e9e",
    permission_request:
      "Nous avons besoin de la permission pour utiliser la cam\u00e9ra",
    grant_permission: "Autoriser l'acc\u00e8s",
    manual_button: "Saisir manuellement",
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add i18n.ts
git commit -m "feat: add missing i18n keys for accessibility and delete flow"
```

---

### Task 17: Final verification

- [ ] **Step 1: Clear cache and build**

```bash
cd /home/jnoleau/repo/basic/fidcard
npx expo start --clear
```

Expected: App starts and renders correctly.

- [ ] **Step 2: Verify no StyleSheet.create remains**

```bash
cd /home/jnoleau/repo/basic/fidcard
grep -r "StyleSheet.create" app/ components/ --include="*.tsx" --include="*.ts"
```

Expected: No matches (CodeDisplay.tsx and scan.tsx no longer use StyleSheet).

- [ ] **Step 3: Verify no `as any` in routing**

```bash
cd /home/jnoleau/repo/basic/fidcard
grep -r "as any" app/ components/ --include="*.tsx" --include="*.ts"
```

Expected: No matches.

- [ ] **Step 4: Verify no hardcoded colors in components**

```bash
cd /home/jnoleau/repo/basic/fidcard
grep -rn 'color="#' app/ components/ --include="*.tsx" | grep -v "color={" | grep -v "//.*color"
```

Expected: No matches (all colors are via CSS variables or Tailwind classes). Note: `card.color` dynamic values are still used with `style={}` which is correct.
