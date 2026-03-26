import React, { ReactNode } from "react";
import { LayoutChangeEvent } from "react-native";
import { TouchableOpacity , useCSSVariable } from "./tw";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import {
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
import { Animated } from "./tw/animated";
import {
  CONTAINER_WIDTH,
  CARD_WIDTH,
  COLUMNS,
  ROW_HEIGHT,
  LONG_PRESS_DURATION,
  WOBBLE_DURATION,
} from "../constants";

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
  }, [isEditing, isActive, rotation]);

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
