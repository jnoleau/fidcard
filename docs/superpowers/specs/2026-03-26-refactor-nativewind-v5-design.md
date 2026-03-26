# Fidcard Refactor: NativeWind v5 + Tailwind 4 + Code Quality

**Date:** 2026-03-26
**Status:** Approved
**Scope:** Full refactor — migration, styling, quality

---

## Context

Fidcard is a basic loyalty card app built with Expo 54, React Native 0.81, React 19. The codebase was started by a less experienced AI and needs a senior-level refactor. Currently uses NativeWind v4 + Tailwind CSS v3 with inconsistent styling (mix of StyleSheet, inline styles, and className).

## Goals

1. Migrate from NativeWind v4 + Tailwind 3 to NativeWind v5 + Tailwind CSS 4
2. Convert all styling to Tailwind classes (zero StyleSheet.create, zero hardcoded colors)
3. Improve code quality: type safety, persistence, error handling, accessibility, performance

## Approach

Migration first, then styling conversion, then quality improvements. Each file touched once per phase.

---

## Phase 1: Migration NativeWind v5 + Tailwind 4

### Dependencies

**Install:**
- `nativewind@preview` (v5)
- `react-native-css` (peer dependency for NativeWind v5)
- `@tailwindcss/postcss` (PostCSS plugin for Tailwind v4)
- `tailwind-merge` + `clsx` (utility for className merging)

**Update:**
- `tailwindcss` → `^4`

**Remove:**
- `prettier-plugin-tailwindcss` (incompatible with Tailwind v4)

**Add override in package.json:**
- `lightningcss: 1.30.1`

**Delete:**
- `tailwind.config.js` (replaced by `@theme` in CSS)

### Configuration Changes

**`metro.config.js`** — Simplify:
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");
const config = getDefaultConfig(__dirname);
module.exports = withNativewind(config, {
  inlineVariables: false,
  globalClassNamePolyfill: false,
});
```

**`babel.config.js`** — Remove NativeWind presets:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"],
  };
};
```

**Create `postcss.config.mjs`:**
```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

**`global.css`** — Replace Tailwind v3 directives with v4 imports:
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

**`nativewind-env.d.ts`** — Update type reference:
```ts
/// <reference types="react-native-css/types" />
```

### CSS Component Wrappers

Create `components/tw/index.tsx` with wrapped components:
- `View`, `Text`, `Pressable`, `ScrollView`, `TextInput`, `TouchableHighlight`
- `Link` (expo-router Link wrapped)
- `useCSSVariable` hook

Create `components/tw/image.tsx`:
- `Image` wrapping `expo-image` with `useCssElement`

Create `components/tw/animated.tsx`:
- `Animated.View` etc. via `Animated.createAnimatedComponent`

### Utility

Create `lib/utils.ts`:
```ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Phase 2: Styling Conversion

### Principle

Zero `StyleSheet.create()`. Zero `style={{}}` except for dynamic runtime values (e.g., user-picked card color). All imports from `react-native` for UI components replaced by `@/components/tw`.

### Semantic Color Tokens

Define in `global.css` via `@theme`:
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
    --color-border: #e5e7eb;
  }
}
```

These replace all hardcoded color values (`#333`, `#ef4444`, `#22c55e`, etc.).

### Files to Convert

| File | Current State | Action |
|---|---|---|
| `scan.tsx` | 70+ StyleSheet rules | Full rewrite to className |
| `CodeDisplay.tsx` | Mixed inline + className | Convert to pure className |
| `index.tsx` | Mostly className, hardcoded colors, duplicate GestureHandlerRootView | Remove duplicate wrapper, use color tokens |
| `SortableCard.tsx` | Inline styles for layout | Convert to className where possible |
| `CardEditor.tsx` | Mostly className | Clean up remaining inline styles |
| `_layout.tsx` | Inline styles | Convert to className |
| `edit/[id].tsx` | Inline styles | Convert to className |

---

## Phase 3: Code Quality

### Type Safety

- Remove all `as any` from routing (`href={"/scan" as any}` etc.)
- Properly type route parameters using Expo Router typed routes
- Ensure `experiments.typedRoutes: true` in app.json is fully leveraged

### Persistence

- Install `@react-native-async-storage/async-storage`
- Add Zustand `persist` middleware to `useCardStore`:
  ```ts
  import AsyncStorage from "@react-native-async-storage/async-storage";
  import { persist, createJSONStorage } from "zustand/middleware";

  export const useCardStore = create<CardState>()(
    persist(
      (set) => ({
        // existing state and actions
      }),
      {
        name: "card-storage",
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
  ```
- Initial cards remain as default state (used on first launch when no persisted data)

### Error Boundaries

- Create `components/ErrorBoundary.tsx` (class component wrapping children)
- Integrate in `_layout.tsx` around the Stack
- `CodeDisplay`: render a placeholder instead of `null` when value is empty

### Accessibility

- Add `accessibilityLabel` on all icon buttons (scan, delete, edit, sort toggle)
- Add `accessibilityRole` on interactive elements
- Internationalize accessibility labels via `t()` (add keys to i18n for `en` and `fr`)

### Performance

- `React.memo` on `SortableCard` and `CodeDisplay`
- Extract magic numbers to `constants.ts`:
  - `ROW_HEIGHT`, `CARD_WIDTH_PCT`, animation durations
- Replace `map` in `ScrollView` with `FlatList` for card list (better for growing lists)

### ID Generation

- Replace `Date.now().toString()` with `expo-crypto` `randomUUID()` for card IDs

---

## Out of Scope

- Dark mode (can be added later using the `@theme` infrastructure)
- Analytics / error tracking
- Unit tests (separate effort)
- i18n refactor to external files (current inline approach works fine for 2 languages)

## Risks

- **NativeWind v5 is pre-release** (`preview.3`): API may change. Acceptable for this project.
- **`react-native-css` is nightly**: May have bugs. Pin version in package.json.
- **Tailwind v4 ecosystem**: Some plugins/tools not yet compatible (e.g., prettier plugin removed).
