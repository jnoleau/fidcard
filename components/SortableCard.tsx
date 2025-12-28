import React, { ReactNode } from "react";
import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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

// Screen dimensions and layout constants
const SCREEN_WIDTH = Dimensions.get("window").width;
const PADDING = 16;
const CONTAINER_WIDTH = SCREEN_WIDTH - 32; // px-4 = 16*2
const COLUMNS = 2;
// Logic from UI: w-[48%] + justify-between
const CARD_WIDTH_PCT = 0.48;
const CARD_WIDTH = CONTAINER_WIDTH * CARD_WIDTH_PCT;
const COLUMN_GAP = CONTAINER_WIDTH * (1 - CARD_WIDTH_PCT * 2); // remaining space
const ROW_HEIGHT = 128 + 16; // h-32 (128) + mb-4 (16)
const LONG_PRESS_DURATION = 250;

interface SortableCardProps {
  id: string;
  index: number;
  children: ReactNode;
  isEditing: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onLongPress: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isActive: boolean;
  cardsCount: number;
}

export const SortableCard = ({
  id,
  index,
  children,
  isEditing,
  onReorder,
  onLongPress,
  onDragStart,
  onDragEnd,
  isActive,
  cardsCount,
}: SortableCardProps) => {
  const pressed = useSharedValue(false);
  const gestureX = useSharedValue(0);
  const gestureY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Helper to get layout position for an index
  const getPosition = (idx: number) => {
    "worklet";
    const row = Math.floor(idx / COLUMNS);
    const col = idx % COLUMNS;
    const x = col === 0 ? 0 : CONTAINER_WIDTH - CARD_WIDTH;
    const y = row * ROW_HEIGHT;
    return { x, y };
  };

  // Helper to get index from point
  const getIndexFromPoint = (x: number, y: number) => {
    "worklet";
    const clampedX = Math.max(0, Math.min(x, CONTAINER_WIDTH));
    const col = clampedX > CONTAINER_WIDTH / 2 ? 1 : 0;

    // Clamp y
    const safeY = Math.max(0, y);
    const row = Math.floor(safeY / ROW_HEIGHT);

    const idx = row * COLUMNS + col;
    // Allow dragging to end of list
    return Math.max(0, Math.min(idx, cardsCount - 1));
  };

  // Layout Shift Compensation
  useAnimatedReaction(
    () => index,
    (current, previous) => {
      if (pressed.value && current !== previous && previous !== null) {
        const curPos = getPosition(current);
        const prevPos = getPosition(previous);
        const deltaX = curPos.x - prevPos.x;
        const deltaY = curPos.y - prevPos.y;

        offsetX.value -= deltaX;
        offsetY.value -= deltaY;
      }
    }
  );

  // Live Reorder Trigger
  useAnimatedReaction(
    () => {
      if (!pressed.value) return -1;

      const currentLayout = getPosition(index);
      const absX = currentLayout.x + gestureX.value + offsetX.value;
      const absY = currentLayout.y + gestureY.value + offsetY.value;

      const cx = absX + CARD_WIDTH / 2;
      const cy = absY + ROW_HEIGHT / 2;

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
    }
  );

  // Wobble animation
  React.useEffect(() => {
    if (isEditing && !isActive) {
      rotation.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 100 }),
          withTiming(2, { duration: 100 }),
          withTiming(-2, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        -1,
        true
      );
    } else {
      rotation.value = withTiming(0);
    }
  }, [isEditing, isActive]);

  const pan = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      if (!isEditing) {
        runOnJS(onLongPress)();
      }
      pressed.value = true;
      runOnJS(onDragStart)();
      scale.value = withSpring(1.05);
      offsetX.value = 0;
      offsetY.value = 0;
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
      offsetX.value = withSpring(0);
      offsetY.value = withSpring(0);
      scale.value = withSpring(1);
    });

  if (!isEditing) {
    pan.activateAfterLongPress(LONG_PRESS_DURATION);
  }

  const placeholderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
      opacity: isActive ? 0 : 1,
    };
  });

  const activeCardStyle = useAnimatedStyle(() => {
    const { x, y } = getPosition(index);
    return {
      left: x,
      top: y,
      transform: [
        { translateX: gestureX.value + offsetX.value },
        { translateY: gestureY.value + offsetY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <>
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[{ width: "48%", marginBottom: 16 }, placeholderStyle]}
          layout={
            isActive
              ? undefined
              : LinearTransition.duration(250).easing(Easing.out(Easing.quad))
          }
        >
          {children}
        </Animated.View>
      </GestureDetector>
      {isActive && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              width: "48%",
              marginBottom: 16,
              zIndex: 9999,
            },
            activeCardStyle,
          ]}
        >
          {children}
        </Animated.View>
      )}
    </>
  );
};
