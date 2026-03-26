# Card Reorder Animation — Design Spec

## Problem

The current `SortableCard` component has a broken drag-and-drop cycle. When a card is released and returns to its grid position, shared values (`pressed`, `gestureX/Y`, `activeBaseX/Y`, `slotX/Y`) become desynchronized. The card freezes and requires a new long-press to pick up again. The root cause is the dual-render architecture (placeholder + active overlay) combined with too many interdependent shared values that don't reset cleanly on drop.

## Goal

Rewrite `SortableCard.tsx` from scratch and update `index.tsx` to deliver an iOS-style home screen card editing experience: long-press to enter edit mode, wobble animation, drag to reorder, delete button, tap background or OK to exit.

## Scope

**Files to rewrite:**
- `components/SortableCard.tsx` — full rewrite
- `app/index.tsx` — remove cancel button, add background tap to exit, simplify state

**Files unchanged:**
- `constants.ts` — reuse existing layout constants
- `store/useCardStore.ts` — no changes
- `i18n.ts` — no new keys needed (removing cancel, keeping existing save/delete keys)

---

## Design

### 1. SortableCard — Shared Values (minimal state)

Each card instance holds exactly these shared values:

| Shared Value | Type | Rest | During Drag | Reset |
|---|---|---|---|---|
| `offsetX` | number | `0` | `event.translationX` | `withSpring(0)` on drop |
| `offsetY` | number | `0` | `event.translationY` | `withSpring(0)` on drop |
| `scale` | number | `1` | `1.05` (via `withSpring`) | `withTiming(1, 200ms)` on drop |
| `zIndex` | number | `1` | `100` | `1` after spring completes |
| `rotation` | number | `0` | `0` | wobble sequence in edit mode |
| `wobbleDelay` | number | random 0-200ms | — | per-instance, set once at mount |

No `slotX`, `slotY`, `activeBaseX`, `activeBaseY`. Grid position comes from `index` via `LinearTransition`.

### 2. SortableCard — Single Animated.View (no dual-render)

One `Animated.View` per card with an animated style combining:
```
transform: [
  { translateX: offsetX },
  { translateY: offsetY },
  { scale: scale },
  { rotate: `${rotation}deg` },
]
zIndex: zIndex
```

The `zIndex` elevates the card above siblings during drag. No separate overlay. No placeholder opacity toggle.

### 3. Gesture Setup

**Pan gesture:**
- In view mode: `activateAfterLongPress(250ms)`
- In edit mode: no delay — immediate activation
- This is the core fix: in edit mode, any card can be grabbed instantly

**Pan lifecycle:**
- `onStart`: haptic impact (light), `scale = withSpring(1.05)`, `zIndex = 100`, stop wobble (`rotation = 0`), call `onLongPress()` (if not editing) + `onDragStart()`
- `onUpdate`: `offsetX = translationX`, `offsetY = translationY`, hit-test for reorder target via `useAnimatedReaction`
- `onEnd`/`onFinalize`: haptic impact (light), `offsetX/Y = withSpring(0)`, `scale = withTiming(1, 200ms)`, after spring callback → `zIndex = 1`, restart wobble if still editing, call `onDragEnd()`

**Tap gesture:**
- In view mode: `onEnd` → call `onTap()` (navigate to edit screen)
- In edit mode: tap does nothing on the card itself (delete button handles its own press)

**Composition:** `Gesture.Race(pan, tap)`

### 4. Wobble Animation

- Sequence: `-2deg` → `+2deg` → `-2deg` → `0deg`, 100ms per phase, `withRepeat(-1, true)`
- Each card starts with a random delay (0-200ms) so wobbles are desynchronized across cards
- Active card (being dragged): wobble stopped, rotation = 0
- On drop (if still editing): wobble restarts after spring animation completes
- On exit edit mode: all rotations → `withTiming(0, 150ms)`

### 5. Reorder Detection (useAnimatedReaction)

Same approach as current, but simplified:
- Compute center of dragged card: `getPosition(index).x + CARD_WIDTH/2 + offsetX` and same for Y
- `getIndexFromPoint(cx, cy)` → target index
- If target differs from current index → `runOnJS(onReorder)(index, targetIndex)`

`getPosition` and `getIndexFromPoint` remain worklet functions using constants from `constants.ts`.

### 6. Shadow/Elevation During Drag

Add subtle elevation increase during drag for visual "lift" effect:
- Rest: default shadow (from existing `shadow-sm` class)
- Dragging: `elevation: 8` (Android) / `shadowOpacity: 0.3, shadowRadius: 8` (iOS) via animated style

### 7. Delete Button

- Position: top-left corner, `absolute -top-2 -left-2`
- Appearance: red circle with "×" icon (existing `remove-circle` Ionicons)
- Visibility: shown in edit mode, hidden during active drag of that card
- Press: triggers `Alert.alert` confirmation → removes card from store and local state
- Animation: fade in with `withTiming` opacity on edit mode enter

### 8. index.tsx Changes

**Remove:**
- `cancelOrder` function
- Cancel button (close-circle icon)
- `originalCards` concept (doesn't exist as separate state, but the cancel flow is removed)

**Add:**
- Background tap to exit: wrap the `ScrollView` content area. When `isEditing` and user taps empty space → `saveOrder()` (save + exit edit mode)
- Implementation: `Pressable` wrapping the scroll content, with `onPress` calling `saveOrder()`. Card gesture handlers prevent the event from bubbling, so only empty-space taps trigger it.

**Keep:**
- `localCards` state — temporary reorder state
- `isEditing` boolean
- `activeId` — tracks dragged card
- `handleReorder` — array splice logic
- `saveOrder` — persist to store + exit editing
- OK button (checkmark-circle) → calls `saveOrder()`
- `useEffect` syncing `localCards` from store when not editing

### 9. Haptic Feedback

Using `expo-haptics` (already in dependencies):
- `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on drag start
- `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` on drag end

---

## What This Does NOT Change

- Card visual design (colors, layout, rounded corners, QR icon)
- Card editing screen (`edit/[id].tsx`)
- Scanner screen
- Store structure or persistence
- Navigation
- i18n keys (we remove the cancel button but `common.cancel` is still used in delete alert)
- Constants
