import React, { ReactNode, useEffect, useRef } from "react";
import { TouchableOpacity, useCSSVariable } from "./tw";
import { Ionicons } from "@expo/vector-icons";
import {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  LinearTransition,
  Easing,
} from "react-native-reanimated";
import { Animated } from "./tw/animated";
import { WOBBLE_DURATION } from "../constants";

interface SortableCardProps {
  children: ReactNode;
  isEditing: boolean;
  isActive: boolean;
  onDelete?: () => void;
}

function startWobble(rotation: { value: number }, delay: number) {
  "worklet";
  rotation.value = withDelay(
    delay,
    withRepeat(
      withSequence(
        withTiming(-2, { duration: WOBBLE_DURATION }),
        withTiming(2, { duration: WOBBLE_DURATION }),
        withTiming(-2, { duration: WOBBLE_DURATION }),
        withTiming(0, { duration: WOBBLE_DURATION }),
      ),
      -1,
      true,
    ),
  );
}

function SortableCardInner({
  children,
  isEditing,
  isActive,
  onDelete,
}: SortableCardProps) {
  const destructive = useCSSVariable("--color-destructive");
  const rotation = useSharedValue(0);
  const wobbleDelay = useRef(Math.random() * 200).current;

  useEffect(() => {
    if (isEditing && !isActive) {
      startWobble(rotation, wobbleDelay);
    } else {
      rotation.value = withTiming(0, { duration: 150 });
    }
  }, [isEditing, isActive, rotation, wobbleDelay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
    opacity: isActive ? 0 : 1,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      layout={LinearTransition.duration(250).easing(Easing.out(Easing.quad))}
    >
      {children}
      {isEditing && !isActive && (
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
  );
}

export const SortableCard = React.memo(SortableCardInner);
